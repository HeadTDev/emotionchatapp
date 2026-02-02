import { useState } from 'react';
import type { Message, PADState, Track } from '../types';
import { chatService } from '../services/api';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'assistant', content: 'Szia! A Gemini API-val működöm. Írj valamit, és elemzem a hangulatod!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [padState, setPadState] = useState<PADState>({ pleasure: 0.1, arousal: 0.1, dominance: 0.1 });
  const [currentTrack, setCurrentTrack] = useState<Track>({
    title: "Várakozás...", artist: "Spotify API", albumArt: "[https://placehold.co/100/222/fff?text=Music](https://placehold.co/100/222/fff?text=Music)", isPlaying: false
  });

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // 1. User üzenet hozzáadása
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. API hívás
      const data = await chatService.sendMessage(content);

      // 3. Állapotok frissítése a válasz alapján
      setPadState(data.pad_analysis);
      
      if (data.suggested_track) {
        setCurrentTrack({
          title: data.suggested_track.title,
          artist: data.suggested_track.artist,
          albumArt: data.suggested_track.album_art,
          isPlaying: true
        });
      }

      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: data.response_text 
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: 'Hiba történt a szerver elérésekor.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, padState, currentTrack, isLoading, sendMessage };
};