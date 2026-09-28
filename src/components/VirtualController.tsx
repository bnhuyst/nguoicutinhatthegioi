import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Crosshair, Shield } from 'lucide-react';

interface Props {
  onPress: (action: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'SHOOT' | 'SKILL') => void;
  onRelease: (action: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'SHOOT' | 'SKILL') => void;
  mana: number;
}

export const VirtualController: React.FC<Props> = ({ onPress, onRelease, mana }) => {
  const handleTouch = (action: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'SHOOT' | 'SKILL') => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        onPress(action);
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        onRelease(action);
      },
      onMouseDown: () => onPress(action),
      onMouseUp: () => onRelease(action),
    };
  };

  return (
    <div className="md:hidden fixed bottom-2 inset-x-2 z-30 flex items-end justify-between pointer-events-none select-none">
      {/* D-Pad on the left */}
      <div className="grid grid-cols-3 gap-1 bg-slate-950/70 p-2 rounded-2xl border border-slate-700/80 backdrop-blur-sm pointer-events-auto shadow-2xl">
        <div />
        <button
          {...handleTouch('UP')}
          className="w-12 h-12 flex items-center justify-center bg-slate-800 active:bg-yellow-500 active:text-slate-950 text-slate-200 rounded-xl border border-slate-600 shadow"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div />

        <button
          {...handleTouch('LEFT')}
          className="w-12 h-12 flex items-center justify-center bg-slate-800 active:bg-yellow-500 active:text-slate-950 text-slate-200 rounded-xl border border-slate-600 shadow"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div />
        <button
          {...handleTouch('RIGHT')}
          className="w-12 h-12 flex items-center justify-center bg-slate-800 active:bg-yellow-500 active:text-slate-950 text-slate-200 rounded-xl border border-slate-600 shadow"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        <div />
        <button
          {...handleTouch('DOWN')}
          className="w-12 h-12 flex items-center justify-center bg-slate-800 active:bg-yellow-500 active:text-slate-950 text-slate-200 rounded-xl border border-slate-600 shadow"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <div />
      </div>

      {/* Action buttons on the right */}
      <div className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-2xl border border-slate-700/80 backdrop-blur-sm pointer-events-auto shadow-2xl">
        {/* Mana Skill Button (K) */}
        <button
          {...handleTouch('SKILL')}
          disabled={mana < 40}
          className={`w-14 h-14 flex flex-col items-center justify-center rounded-2xl border text-xs font-arcade font-bold transition-all shadow ${
            mana >= 40 
              ? 'bg-cyan-600/90 active:bg-cyan-400 text-white border-cyan-400 shadow-cyan-500/40 animate-pulse' 
              : 'bg-slate-800/60 text-slate-500 border-slate-700'
          }`}
        >
          <Shield className="w-5 h-5 mb-0.5" />
          <span>K</span>
        </button>

        {/* Jump Button (W) */}
        <button
          {...handleTouch('UP')}
          className="w-14 h-14 flex flex-col items-center justify-center bg-amber-600/90 active:bg-amber-400 text-white rounded-2xl border border-amber-400 font-arcade text-xs font-bold shadow-lg"
        >
          <span>▲</span>
          <span className="text-[10px]">NHẢY</span>
        </button>

        {/* Shoot Button (J) */}
        <button
          {...handleTouch('SHOOT')}
          className="w-16 h-16 flex flex-col items-center justify-center bg-red-600 active:bg-red-400 text-white rounded-2xl border-2 border-red-400 font-arcade text-xs font-black shadow-lg shadow-red-600/50"
        >
          <Crosshair className="w-6 h-6 mb-0.5" />
          <span>BẮN</span>
        </button>
      </div>
    </div>
  );
};
