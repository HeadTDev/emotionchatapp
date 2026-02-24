from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from models import ChatRequest, ChatResponse, PADState, TrackInfo
from services import AIService, SpotifyService

load_dotenv()

app = FastAPI(title="AI Emotion Player API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_service = AIService()
spotify_service = SpotifyService()

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    result = await ai_service.analyze_sentiment_and_respond(request.message)
    
    track = None
    if result.get("suggest_music") and result.get("music_query"):
        track = spotify_service.search_track(result["music_query"])
    
    return ChatResponse(
        response_text=result["response_text"],
        pad_analysis=PADState(**result["pad"]),
        suggested_track=track
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)