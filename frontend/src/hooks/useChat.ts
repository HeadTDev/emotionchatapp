import { useReducer, useCallback } from 'react';
import type { Message, PADState, Track } from '../types';
import { chatService } from '../services/api';

// State type definition
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  padState: PADState;
  currentTrack: Track;
}

// Action types
type ChatAction =
  | { type: 'ADD_USER_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_AI_RESPONSE'; payload: { message: Message; padState: PADState; track?: Track } }
  | { type: 'ADD_ERROR_MESSAGE'; payload: string };

// Initial state
const initialState: ChatState = {
  messages: [
    { id: 'init', role: 'assistant', content: 'Szia! A Gemini API-val működöm. Írj valamit, és elemzem a hangulatod!' }
  ],
  isLoading: false,
  padState: { pleasure: 0.1, arousal: 0.1, dominance: 0.1 },
  currentTrack: {
    title: "Várakozás...",
    artist: "Spotify API",
    albumArt: "https://placehold.co/100/222/fff?text=Music",
    isPlaying: false
  }
};

// Reducer function - handles all state updates in one place
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        isLoading: true
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'UPDATE_AI_RESPONSE':
      return {
        ...state,
        messages: [...state.messages, action.payload.message],
        padState: action.payload.padState,
        currentTrack: action.payload.track || state.currentTrack,
        isLoading: false
      };
    case 'ADD_ERROR_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { id: 'err-' + Date.now(), role: 'assistant', content: action.payload }],
        isLoading: false
      };
    default:
      return state;
  }
};

export const useChat = () => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Single dispatch for user message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    dispatch({ type: 'ADD_USER_MESSAGE', payload: userMsg });

    try {
      // API call
      const data = await chatService.sendMessage(content);

      // Prepare AI response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response_text
      };

      const track = data.suggested_track ? {
        title: data.suggested_track.title,
        artist: data.suggested_track.artist,
        albumArt: data.suggested_track.album_art,
        isPlaying: true
      } : undefined;

      // Single dispatch for entire AI response (batched state update)
      dispatch({
        type: 'UPDATE_AI_RESPONSE',
        payload: { message: aiMsg, padState: data.pad_analysis, track }
      });

    } catch (error) {
      console.error("Chat Error:", error);
      dispatch({ type: 'ADD_ERROR_MESSAGE', payload: 'Hiba történt a szerver elérésekor.' });
    }
  }, []);

  return {
    messages: state.messages,
    padState: state.padState,
    currentTrack: state.currentTrack,
    isLoading: state.isLoading,
    sendMessage
  };
};