export interface PADState {
  pleasure: number;   // -1.0 to 1.0
  arousal: number;    // -1.0 to 1.0
  dominance: number;  // -1.0 to 1.0
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  moodColor?: {
    r: number;
    g: number;
    b: number;
  };
  isMoodDynamic?: boolean;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  isPlaying: boolean;
}

export interface ApiResponse {
  response_text: string;
  pad_analysis: PADState;
  suggested_track: {
    id: string;
    title: string;
    artist: string;
    album_art: string;
    is_playing: boolean;
  } | null;
}
