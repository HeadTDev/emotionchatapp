import React, { useState, useEffect, useRef } from 'react';
import { Music, ChevronUp } from 'lucide-react';
import type { Track } from '../../types';

declare global {
  interface Window {
    Spotify?: {
      embed?: {
        resizeObserver?: {
          disconnect?: () => void;
        };
      };
      Player?: {
        prototype?: {
          constructor?: any;
        };
        createObserveHandler?: () => void;
      };
    };
  }
}

interface Props {
  track: Track;
}

export const SpotifyCard: React.FC<Props> = React.memo(({ track }) => {
  const [isEmbedReady, setIsEmbedReady] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showPlayPrompt, setShowPlayPrompt] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  // Load Spotify Embed script once on mount
  useEffect(() => {
    if (!window.Spotify && !document.querySelector('script[src*="spotify-player"]')) {
      const script = document.createElement('script');
      script.src = 'https://open.spotify.com/embed/iframe-api/v1';
      script.async = true;
      script.onload = () => {
        setIsEmbedReady(true);
        // Reload embeds after script loads
        if (window.Spotify?.Player?.prototype?.constructor) {
          window.Spotify.embed?.resizeObserver?.disconnect?.();
          setTimeout(() => {
            window.Spotify?.Player?.createObserveHandler?.();
          }, 100);
        }
      };
      document.body.appendChild(script);
    } else {
      setIsEmbedReady(true);
    }
  }, []);

  // Handle user interaction for autoplay
  useEffect(() => {
    if (!hasUserInteracted) {
      setShowPlayPrompt(true);
      const timer = setTimeout(() => {
        setShowPlayPrompt(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasUserInteracted, track.id]);

  const handlePlayClick = () => {
    setHasUserInteracted(true);
    setShowPlayPrompt(false);
  };

  if (!track.id) {
    return (
      <div 
        className="mt-auto bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center shadow-lg"
        style={{ height: '280px' }}
      >
        <Music className="w-10 h-10 text-zinc-600 mb-3" />
        <p className="text-zinc-400 text-center text-xs">Írj egy üzenetet</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="mt-auto bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl overflow-hidden shadow-lg group"
      style={{ 
        height: '400px'
      }}
    >
      {/* Minimal background */}
      <div className="h-full flex flex-col">
        
        {/* Album Art - Top Section */}
        <div className="h-52 overflow-hidden relative group/image">
          <img 
            src={track.albumArt}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105"
          />
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/30" />
        </div>

        {/* Track Info - Middle Section */}
        <div className="px-4 py-3 flex-shrink-0">
          <h3 className="text-sm font-semibold text-white truncate">{track.title}</h3>
          <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
        </div>

        {/* Spotify Embed Container - Bottom */}
        <div 
          ref={iframeContainerRef}
          className="relative flex-1 min-h-0 bg-zinc-800/30 border-t border-zinc-800 overflow-hidden"
        >
          {/* Embed iframe */}
          {isEmbedReady && track.id && (
            <iframe
              key={track.id}
              src={`https://open.spotify.com/embed/track/${track.id}?utm_source=emotionplayer&theme=0`}
              width="100%"
              height="100%"
              allowFullScreen={false}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="absolute inset-0"
              style={{
                border: 'none'
              }}
            />
          )}

          {/* User interaction overlay for autoplay */}
          {!hasUserInteracted && showPlayPrompt && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="text-center">
                <ChevronUp className="w-5 h-5 text-white animate-bounce mx-auto mb-1" />
                <p className="text-white font-medium text-xs">Kattints indításhoz</p>
              </div>
            </div>
          )}

          {/* Hover interaction prompt */}
          {!hasUserInteracted && !showPlayPrompt && (
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors opacity-0 hover:opacity-100"
            >
              <Music className="w-6 h-6 text-green-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

SpotifyCard.displayName = 'SpotifyCard';
