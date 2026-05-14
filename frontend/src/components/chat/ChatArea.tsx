import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Send, User, Activity } from 'lucide-react';
import type { Message, PADState } from '../../types';
import { getMoodInfo } from '../../utils/mood';

interface Props {
  messages: Message[];
  isLoading: boolean;
  padState: PADState;
  onSendMessage: (msg: string) => void;
}

export const ChatArea: React.FC<Props> = ({ messages, isLoading, padState, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dynamicMoodColor = getMoodInfo(padState).color;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = useCallback(() => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  }, [input, onSendMessage]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.map(msg => {
          const moodColor = msg.isMoodDynamic ? dynamicMoodColor : msg.moodColor;
          const userBubbleStyle = moodColor
            ? {
                backgroundColor: `rgb(${moodColor.r}, ${moodColor.g}, ${moodColor.b})`,
                color: '#0a0a0a'
              }
            : undefined;

          return (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/10">
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
            )}
            <div className={`max-w-xl p-4 rounded-2xl text-sm leading-6 shadow-md transition-all ${
              msg.role === 'user' 
              ? 'rounded-tr-none shadow-white/5' 
              : 'bg-zinc-900/80 border border-zinc-800 text-zinc-300 rounded-tl-none shadow-black/20'
            }`} style={msg.role === 'user' ? userBubbleStyle : undefined}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-white/20">
                <User className="w-4 h-4 text-black" />
              </div>
            )}
          </div>
        )})}
        {isLoading && (
          <div className="flex items-center gap-2 ml-14">
             <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
             <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-75"></div>
             <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-150"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 pt-2">
         <div className="relative flex items-center gap-2 p-2 bg-zinc-900/80 border border-zinc-800 rounded-xl focus-within:ring-1 focus-within:ring-purple-500/50 transition-all shadow-2xl">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Írd le, mi jár a fejedben..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500 px-3 h-10"
              autoFocus
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-lg bg-white hover:bg-zinc-200 text-black flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
               <Send className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
};
