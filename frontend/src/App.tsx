import { Bot, BarChart3 } from 'lucide-react';
import { useChat } from './hooks/useChat';
import { ChatArea } from './components/chat/ChatArea';
import { PADCube } from './components/visualizer/PADCube';
import { SpotifyCard } from './components/player/SpotifyCard';

const App = () => {
  const { messages, padState, currentTrack, isLoading, sendMessage } = useChat();

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-200 font-sans overflow-hidden selection:bg-green-500/30">
      
      {/* BAL OLDAL: CHAT FELÜLET */}
      <main className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black">
        <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-900/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Bot className="text-white w-5 h-5" />
             </div>
             <div>
               <h1 className="font-semibold text-white tracking-tight text-sm">AI Emotion <span className="text-zinc-500">Player</span></h1>
               <p className="text-[10px] text-zinc-500">Powered by Gemini & PAD Model</p>
             </div>
          </div>
        </header>

        <ChatArea 
          messages={messages} 
          isLoading={isLoading} 
          onSendMessage={sendMessage} 
        />
      </main>

      {/* JOBB OLDAL: VIZUALIZÁCIÓ ÉS LEJÁTSZÓ */}
      <aside className="hidden md:flex flex-col w-[380px] border-l border-zinc-900 bg-[#09090b] relative z-10">
         
         <div className="h-1/2 flex flex-col relative border-b border-zinc-900 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 to-transparent">
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
               <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-zinc-500">
                 <BarChart3 className="w-3 h-3" />
                 EMOTION ENGINE
               </div>
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
               <PADCube pad={padState} />
            </div>
         </div>
         
         <div className="h-1/2 p-6 flex flex-col bg-gradient-to-t from-black to-zinc-900/50">
            <SpotifyCard track={currentTrack} />
         </div>
      </aside>
    </div>
  );
};

export default App;