import os
import json
import asyncio
from datetime import datetime
from google import genai
from google.genai import types
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from models import PADState, TrackInfo
import aiofiles
from cachetools import TTLCache

HISTORY_FILE = "emotion_history.json"

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("FIGYELEM: A GEMINI_API_KEY hiányzik a környezeti változókból!")
        
        self.client = genai.Client(api_key=self.api_key)
        self.model_id = "gemini-3-flash-preview"

    async def _get_history(self) -> list:
        """Betölti az utolsó 5 interakciót a JSON fájlból (async)."""
        if os.path.exists(HISTORY_FILE):
            try:
                async with aiofiles.open(HISTORY_FILE, "r", encoding="utf-8") as f:
                    content = await f.read()
                    return json.loads(content)
            except Exception:
                return []
        return []

    async def _save_to_history(self, user_msg: str, ai_data: dict):
        """Elmenti az aktuális interakciót és limitálja a hosszt 5-re (async)."""
        history = await self._get_history()
        new_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_message": user_msg,
            "ai_response": ai_data.get("response_text"),
            "pad": ai_data.get("pad")
        }
        history.append(new_entry)
        # Csak az utolsó 5-öt tartjuk meg
        async with aiofiles.open(HISTORY_FILE, "w", encoding="utf-8") as f:
            await f.write(json.dumps(history[-5:], ensure_ascii=False, indent=2))

    async def analyze_sentiment_and_respond(self, message: str) -> dict: 
        history = await self._get_history()
        history_context = json.dumps(history, ensure_ascii=False)

        prompt = f"""
        Role: Expert Psycholinguist and Music Therapist specializing in the Mehrabian-Russell PAD (Pleasure-Arousal-Dominance) emotion model.
        
        Context (Last 5 interactions):
        {history_context}

        Current User Input: "{message}"

        Task:
        1. Perform a deep emotional analysis of the input. Look for linguistic intensity, punctuation, and implicit sentiment.
        2. Maintain emotional continuity: Use the provided context to ensure the PAD values do not jump erratically. 
           If the user was in deep grief, a single positive sentence should only slightly nudge the PAD values towards neutral, not jump to extreme joy.
        3. Respond in Hungarian as a supportive, professional therapist. Keep the response concise and chat-like (max 3-4 sentences). Avoid long explanations or over-analyzing in the text.
        4. Map the detected emotional state to the PAD model using high-precision floats (-1.00 to 1.00).
        5. Suggest a specific song (Artist - Title) as a therapeutic intervention.

        PAD Dimension Guidelines:
        - Pleasure (Valence): -1.0 (extreme distress/pain) to 1.0 (extreme joy/ecstasy).
        - Arousal (Energy): -1.0 (sleepy/lethargic/bored) to 1.0 (frantic/highly excited/alert).
        - Dominance (Control): -1.0 (vulnerable/overwhelmed/out of control) to 1.0 (powerful/influential/in control).

        Precision Requirements:
        - Use the full continuous range (e.g., 0.12, -0.67). Avoid rounding to 0.5 or 0.0 unless truly neutral.
        - Example: "I am a bit tired" -> P: 0.0, A: -0.4, D: -0.1
        - Example: "I am furious!" -> P: -0.8, A: 0.9, D: 0.4
        - Example: "I feel helpless and scared" -> P: -0.7, A: 0.6, D: -0.8

        Music Logic:
        - If the user is over-aroused (stressed), suggest calming music.
        - If the user is low-pleasure (sad), suggest empathetic or gradually uplifting music.

        Output JSON Format:
        {{
            "response_text": "string (HU)",
            "pad": {{"pleasure": float, "arousal": float, "dominance": float}},
            "suggest_music": bool,
            "music_query": "Artist - Title" (optional)
        }}
        """

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )

            if response.text:
                data = json.loads(response.text)
                if isinstance(data, dict):
                    # Mentés az előzményekbe a sikeres válasz után (async, nem blokkoljuk a választ)
                    asyncio.create_task(self._save_to_history(message, data))
                    return data
                else:
                    raise Exception("Az AI válasza nem érvényes JSON objektum.")
            else:
                raise Exception("Üres választ kaptunk az AI-tól.")

        except Exception as e:
            print(f"Gemini API Error: {e}")
            return {
                "response_text": f"Sajnos hiba történt az AI kapcsolatban: {str(e)}", 
                "pad": {"pleasure": 0.0, "arousal": 0.0, "dominance": 0.0},
                "suggest_music": False
            }

class SpotifyService:
    def __init__(self):
        self.client_id = os.getenv("SPOTIFY_CLIENT_ID")
        self.client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
        self.sp = None
        # In-memory cache: 100 items, 1 hour TTL
        self._cache = TTLCache(maxsize=100, ttl=3600)
        
        if self.client_id and self.client_secret:
            try:
                # A SpotifyClientCredentials automatikusan kezeli a token lekérést és frissítést
                auth_manager = SpotifyClientCredentials(
                    client_id=self.client_id, 
                    client_secret=self.client_secret
                )
                self.sp = spotipy.Spotify(auth_manager=auth_manager)
            except Exception as e:
                print(f"Spotify Auth Error: {e}")

    def search_track(self, query: str) -> TrackInfo:
        # Check cache first
        if query in self._cache:
            print(f"Spotify Cache HIT for: {query}")
            return self._cache[query]
        
        print(f"Spotify Cache MISS, searching for: {query}")
        
        if self.sp and query:
            try:
                # Keresés indítása a Spotify adatbázisában
                results = self.sp.search(q=query, limit=1, type='track')
                if results:
                    items = results.get('tracks', {}).get('items', [])
                    
                    if items:
                        track = items[0]
                        track_info = TrackInfo(
                            id=track['id'],
                            title=track['name'],
                            artist=track['artists'][0]['name'],
                            album_art=track['album']['images'][0]['url'] if track['album']['images'] else ""
                        )
                        # Cache the result
                        self._cache[query] = track_info
                        return track_info
            except Exception as e:
                print(f"Spotify API hiba a keresés során: {e}")

        # Alapértelmezett fallback, ha nincs találat vagy nincs konfigurálva az API
        fallback = TrackInfo(id="0", title="Lo-Fi Beats", artist="Chill Cow", album_art="https://placehold.co/300/4444ff/fff?text=Music")
        self._cache[query] = fallback
        return fallback