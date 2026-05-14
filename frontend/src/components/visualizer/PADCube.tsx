import React, { useMemo } from 'react';
import type { PADState } from '../../types';
import { getMoodInfo } from '../../utils/mood';

interface Props {
  pad: PADState;
}

export const PADCube: React.FC<Props> = React.memo(({ pad }) => {
  
  // --- KONFIGURÁCIÓ (ITT ÁLLÍTSD A MÉRETEKET) ---
  const CONFIG = {
    containerHeight: 400, // A komponens teljes magassága (ÚJ)
    cubeSize: 140,       // A kocka élhossza pixelben (Nagyobb lett!)
    sceneSize: 220,      // A tároló konténer mérete
    perspective: 600,   // 3D mélységérzet
    dotSize: 16,         // A mozgó pont mérete
    rotationSpeed: 25,   // Forgási sebesség (másodperc / kör)
    borderWidth: 1,      // Keret vastagsága
  };

  // --- MATEMATIKA (Automatikus számolás a Config alapján) ---
  const halfSize = CONFIG.cubeSize / 2;
  // A pont mozgástere: Fél méretből kivonjuk a pont méretét és egy kis margót
  const maxRange = halfSize - CONFIG.dotSize; 
  
  const x = pad.pleasure * maxRange; 
  const y = -pad.arousal * maxRange; // Y tengely fordított a CSS-ben
  const z = pad.dominance * maxRange;

  const moodInfo = useMemo(() => getMoodInfo(pad), [pad]);
  const { r, g, b } = moodInfo.color;

  const { color, borderColor } = useMemo(() => ({
    color: `rgba(${r}, ${g}, ${b}, 0.1)`,
    borderColor: `rgba(${r}, ${g}, ${b}, 0.8)`
  }), [r, g, b]);

  return (
    <div 
      className="flex flex-col items-center justify-center relative"
      // A h-full helyett a konfigurálható magasságot használjuk
      style={{ height: `${CONFIG.containerHeight}px` }}
    >
      {/* Dinamikus stílusok a CONFIG változók alapján */}
      <style>{`
        .scene { 
          perspective: ${CONFIG.perspective}px; 
          width: ${CONFIG.sceneSize}px; 
          height: ${CONFIG.sceneSize}px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          position: relative; 
        }
        .cube { 
          width: ${CONFIG.cubeSize}px; 
          height: ${CONFIG.cubeSize}px; 
          position: relative; 
          transform-style: preserve-3d; 
          animation: rotate ${CONFIG.rotationSpeed}s infinite linear; 
        }
        .face { 
          position: absolute; 
          width: ${CONFIG.cubeSize}px; 
          height: ${CONFIG.cubeSize}px; 
          border: ${CONFIG.borderWidth}px solid ${borderColor}; 
          background: ${color}; 
          transition: all 0.8s ease; 
        }
        .mood-sphere-container { 
          position: absolute; 
          top: 50%; 
          left: 50%; 
          transform-style: preserve-3d; 
          /* A teljes gömb mozgatása a PAD értékek alapján */
          transform: translate3d(${x}px, ${y}px, ${z}px);
          transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .mood-sphere {
          position: relative;
          width: ${CONFIG.dotSize}px; 
          height: ${CONFIG.dotSize}px; 
          transform-style: preserve-3d;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sphere-face {
          position: absolute;
          width: 100%;
          height: 100%;
          background: white; 
          border-radius: 50%; 
          /* Volumetrikus fényhatás rétegzett árnyékokkal */
          box-shadow: 
            0 0 10px 2px white, 
            0 0 20px 5px ${borderColor},
            0 0 40px 10px rgba(${r}, ${g}, ${b}, 0.4);
        }
        /* A gömböt alkotó 3 merőleges sík */
        .sphere-face:nth-child(1) { transform: rotateY(0deg); }
        .sphere-face:nth-child(2) { transform: rotateY(90deg); }
        .sphere-face:nth-child(3) { transform: rotateX(90deg); }
        
        /* Arcok transzformációja a dinamikus méret alapján */
        .front  { transform: rotateY(0deg) translateZ(${halfSize}px); } 
        .back   { transform: rotateY(180deg) translateZ(${halfSize}px); }
        .right  { transform: rotateY(90deg) translateZ(${halfSize}px); } 
        .left   { transform: rotateY(-90deg) translateZ(${halfSize}px); }
        .top    { transform: rotateX(90deg) translateZ(${halfSize}px); } 
        .bottom { transform: rotateX(-90deg) translateZ(${halfSize}px); }
        
        @keyframes rotate { 
          from { transform: rotateX(15deg) rotateY(0deg); } 
          to { transform: rotateX(15deg) rotateY(360deg); } 
        }
      `}</style>
      
      <div className="mb-8 text-center animate-fade-in transition-all duration-500">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">Pszichológiai Állapot</h3>
        <div className="text-xl font-bold text-white tracking-wider drop-shadow-lg" style={{ color: `rgb(${r},${g},${b})` }}>
          {moodInfo.label}
        </div>
      </div>

      <div className="scene">
        <div className="cube">
          <div className="face front"></div><div className="face back"></div>
          <div className="face right"></div><div className="face left"></div>
          <div className="face top"></div><div className="face bottom"></div>
          <div className="mood-sphere-container">
            <div className="mood-sphere">
              <div className="sphere-face"></div>
              <div className="sphere-face"></div>
              <div className="sphere-face"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 w-full px-6 flex gap-6">
        {[{l: 'Pleasure', v: pad.pleasure, c: 'text-green-400', bg: 'bg-green-500'}, 
          {l: 'Arousal', v: pad.arousal, c: 'text-yellow-400', bg: 'bg-yellow-500'}, 
          {l: 'Dominance', v: pad.dominance, c: 'text-purple-400', bg: 'bg-purple-500'}].map((item) => (
          <div key={item.l} className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-col items-center text-[10px] text-zinc-500 uppercase font-bold tracking-wider text-center">
              <span className={`${item.c} truncate`}>{item.l}</span>
              <span className="text-zinc-300">{item.v.toFixed(2)}</span>
            </div>
            <div className="h-1 bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-800/50">
               <div className={`h-full ${item.bg} transition-all duration-1000`} style={{ width: `${(item.v + 1) * 50}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
