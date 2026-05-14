# AI Emotion Player

Az **AI Emotion Player** egy intelligens chat alkalmazás, amely a mesterséges intelligencia segítségével elemzi a felhasználó érzelmi állapotát a PAD (Pleasure, Arousal, Dominance) modell alapján, és ehhez illeszkedő zenei javaslatokat kínál a Spotify integrációján keresztül.

## Főbb funkciók

*   **Intelligens Chat:** Valós idejű beszélgetés a Google Gemini mesterséges intelligenciával.
*   **Érzelmi Vizualizáció:** A PAD modell értékeinek 3D-s vizualizációja.
*   **Zenei Javaslatok:** A beszélgetés hangulatához passzoló dalok keresése és megjelenítése a Spotify-ról.
*   **Modern Felület:** Letisztult, reszponzív felhasználói élmény React és Tailwind CSS segítségével.

## Előfeltételek

A projekt futtatásához az alábbi környezeti elemekre van szükség:
*   **Node.js** (v18+)
*   **Python** (3.9+)
*   **API Kulcsok:**
    *   [Google AI Studio](https://aistudio.google.com/) - Gemini API kulcs
    *   [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) - Client ID és Client Secret

## Telepítés és Futtatás

### 1. Backend (FastAPI) beállítása

Lépj be a backend könyvtárba:
```bash
cd backend
```

Telepítsd a szükséges Python csomagokat:
```bash
pip install -r requirements.txt
```

Hozz létre egy `.env` fájlt a `backend` mappában, és add meg az API kulcsaidat:
```env
GEMINI_API_KEY=a_te_gemini_kulcsod
SPOTIFY_CLIENT_ID=a_te_spotify_client_id
SPOTIFY_CLIENT_SECRET=a_te_spotify_client_secret
```

Indítsd el a szervert:
```bash
python main.py
```
A backend alapértelmezetten a `http://localhost:8000` címen fog futni.

### 2. Frontend (React + Vite) beállítása

Nyiss egy új terminált a projekt gyökerében, és lépj be a frontend könyvtárba:
```bash
cd frontend
```

Telepítsd a függőségeket:
```bash
npm install
```

Indítsd el a fejlesztői szervert:
```bash
npm run dev
```
Az alkalmazást a `http://localhost:5173` címen érheted el a böngésződben.

## Használat

1.  Győződj meg róla, hogy mind a **backend**, mind a **frontend** fut.
2.  Nyisd meg a frontend URL-jét.
3.  Írj egy üzenetet a chat mezőbe (pl. "Nagyon vidám napom van!").
4.  Az AI elemzi az üzenetedet, válaszol, és a PAD kocka vizualizálja az érzelmi állapotodat.
5.  Ha a hangulatod indokolja, az alkalmazás automatikusan ajánl egy dalt, amelyet megtekinthetsz a Spotify kártyán.

## Technológiai Stukkusz

*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React
*   **Backend:** FastAPI, Python, Uvicorn, Spotipy
*   **AI:** Google Gemini API
*   **Modell:** PAD Emotional Model
