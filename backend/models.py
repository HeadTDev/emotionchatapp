from typing import List, Optional, Any
from pydantic import BaseModel, Field

class PADState(BaseModel):
    """Mehrabian & Russell PAD modell (-1.0 tól +1.0-ig)"""
    pleasure: float = Field(..., description="Öröm szintje (-1: boldogtalan, +1: boldog)")
    arousal: float = Field(..., description="Izgatottság szintje (-1: álmos, +1: éber)")
    dominance: float = Field(..., description="Dominancia szintje (-1: kiszolgáltatott, +1: kontrolláló)")

class TrackInfo(BaseModel):
    """Zenei információk"""
    id: str
    title: str
    artist: str
    album_art: str
    preview_url: Optional[str] = None
    is_playing: bool = True

class ChatRequest(BaseModel):
    """Bejövő kérés a frontendtől"""
    message: str
    history: List[Any] = []

class ChatResponse(BaseModel):
    """Válasz a frontendnek"""
    response_text: str
    pad_analysis: PADState
    suggested_track: Optional[TrackInfo] = None