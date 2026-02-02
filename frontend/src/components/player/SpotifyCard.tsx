import React from 'react';
import { Play, Pause, Activity, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import type { Track } from '../../types';

interface Props {
  track: Track;
}

export const SpotifyCard: React.FC<Props> = ({ track }) => {
  // --- KONFIGURÁCIÓ (MÉRETEK PIXELBEN) ---
  const CONFIG = {
    cardHeight: 480,       // Kártya fix magassága (Megnövelve)
    cardPadding: 20,       // Kártya belső margója
    contentGap: 16,        // Elemek közötti távolság (ÚJ)
    borderRadius: 24,      // Kártya lekerekítése
    playButtonSize: 56,    // Lejátszás gomb mérete
    controlIconSize: 24,   // Vezérlő ikonok mérete
    overlayIconSize: 48,   // Borítón lévő ikon mérete
  };

  return (
    <div 
      className="mt-auto bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 flex flex-col shadow-2xl"
      style={{ 
        height: `${CONFIG.cardHeight}px`,
        padding: `${CONFIG.cardPadding}px`, 
        borderRadius: `${CONFIG.borderRadius}px`,
        gap: `${CONFIG.contentGap}px`
      }}
    >
       {/* Fejléc: Ikon + Cím */}
       <div className="flex items-center justify-between text-zinc-400 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             Most Szól
          </div>
          <Volume2 className="w-4 h-4" />
       </div>

       {/* Album Art - Nagyobb és szebb */}
       <div 
         className="relative group w-full flex-1 min-h-0 overflow-hidden shadow-lg border border-zinc-800"
         style={{ borderRadius: `${CONFIG.borderRadius - 8}px` }}
       >
          <img 
            src={track.albumArt} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt="Album Art" 
          />
          
          {/* Overlay a play/pause indikátorral */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${track.isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
             {track.isPlaying ? (
                <Activity style={{ width: CONFIG.overlayIconSize, height: CONFIG.overlayIconSize }} className="text-white animate-pulse" />
             ) : (
                <Play style={{ width: CONFIG.overlayIconSize, height: CONFIG.overlayIconSize }} className="text-white fill-current opacity-80" />
             )}
          </div>
       </div>

       {/* Track Info */}
       <div className="text-center space-y-1 shrink-0">
          <h3 className="text-lg font-bold text-white truncate px-2">{track.title}</h3>
          <p className="text-sm text-zinc-400 truncate px-4">{track.artist}</p>
       </div>

       {/* Fake Progress Bar */}
       <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden shrink-0">
         <div className={`h-full bg-green-500 rounded-full ${track.isPlaying ? 'w-1/3 animate-pulse' : 'w-0'}`}></div>
       </div>

       {/* Controls (Teljes vezérlősor) */}
       <div className="flex items-center justify-center gap-6 pt-2 shrink-0">
          <button className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
             <SkipBack style={{ width: CONFIG.controlIconSize, height: CONFIG.controlIconSize }} className="fill-current" />
          </button>
          
          <button 
            className="rounded-full bg-white text-black flex items-center justify-center hover:scale-105 hover:bg-green-400 transition-all shadow-lg shadow-green-500/20"
            style={{ width: CONFIG.playButtonSize, height: CONFIG.playButtonSize }}
          >
             {track.isPlaying ? (
                <Pause style={{ width: CONFIG.controlIconSize, height: CONFIG.controlIconSize }} className="fill-current" />
             ) : (
                <Play style={{ width: CONFIG.controlIconSize, height: CONFIG.controlIconSize }} className="fill-current ml-1" />
             )}
          </button>
          
          <button className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
             <SkipForward style={{ width: CONFIG.controlIconSize, height: CONFIG.controlIconSize }} className="fill-current" />
          </button>
       </div>
    </div>
  );
};
