'use client';

import { useState, useEffect } from 'react';
import { BengalMascot } from './BengalMascot';
import { DevonRexMascot } from './DevonRexMascot';
import { CatMood } from '@/types';

type IdleAction = 'none' | 'yawn' | 'paw' | 'stretch';
const MRRP_PHRASES = ['Mrrp!', 'Purrrr~', '*bap*', 'Mrow!', 'Miaou!', '...zzz', 'Brrr~'] as const;

interface GuardiansProps {
  loading: boolean;
  isDegraded: boolean;
  isHighLoad: boolean;
  insight: { text: string; speaker: 'texas' | 'gosta' } | null;
}

export function Guardians({ loading, isDegraded, isHighLoad, insight }: GuardiansProps) {
  const [mounted, setMounted] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  
  // Shared mood logic
  const getBaseMood = (): CatMood => {
    if (!mounted) return 'idle';
    if (loading) return 'alert';
    if (isDegraded) return 'tired';
    if (isHighLoad) return 'alert';
    const h = new Date().getHours();
    if (h >= 23 || h < 5) return 'tired';
    return 'happy';
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10) { setEyeOffset({ x: 0, y: 0 }); return; }
      const scale = Math.min(dist / 200, 1) * 3 / dist;
      setEyeOffset({ x: dx * scale, y: dy * scale });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Idle actions
  const [idleTexas, setIdleTexas] = useState<IdleAction>('none');
  const [mrrpTexas, setMrrpTexas] = useState<string | null>(null);
  const [startledTexas, setStartledTexas] = useState(false);

  const [idleGosta, setIdleGosta] = useState<IdleAction>('none');
  const [mrrpGosta, setMrrpGosta] = useState<string | null>(null);
  const [startledGosta, setStartledGosta] = useState(false);

  useEffect(() => {
    if (!mounted) return;

    const schedule = (setter: (a: IdleAction) => void) => {
      const timeout = setTimeout(() => {
        if (loading || isDegraded) {
          schedule(setter);
          return;
        }
        const pool: IdleAction[] = ['yawn', 'paw', 'stretch', 'yawn', 'paw'];
        const action = pool[Math.floor(Math.random() * pool.length)];
        setter(action);
        setTimeout(() => {
          setter('none');
          schedule(setter);
        }, action === 'stretch' ? 2100 : 1900);
      }, 10000 + Math.random() * 20000);
      return timeout;
    };

    const t1 = schedule(setIdleTexas);
    const t2 = schedule(setIdleGosta);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mounted, loading, isDegraded]);

  const handleCatClick = (who: 'texas' | 'gosta') => {
    const phrase = MRRP_PHRASES[Math.floor(Math.random() * MRRP_PHRASES.length)];
    if (who === 'texas') {
      setMrrpTexas(phrase);
      setStartledTexas(true);
      setTimeout(() => { setMrrpTexas(null); setStartledTexas(false); }, 1600);
    } else {
      setMrrpGosta(phrase);
      setStartledGosta(true);
      setTimeout(() => { setMrrpGosta(null); setStartledGosta(false); }, 1600);
    }
  };

  const moodTexas: CatMood = startledTexas ? 'startled' : idleTexas !== 'none' ? (idleTexas as CatMood) : getBaseMood();
  const moodGosta: CatMood = startledGosta ? 'startled' : idleGosta !== 'none' ? (idleGosta as CatMood) : getBaseMood();

  if (!mounted) return null;

  return (
    <>
      {/* Texas - Bottom Left (Beside Grid) */}
      <div className="fixed bottom-12 left-4 2xl:left-12 p-4 z-50 pointer-events-auto group">
        <div className="relative">
          {(mrrpTexas || (insight?.speaker === 'texas' && insight.text)) && (
            <div 
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-5 py-3 rounded-3xl text-[11px] font-bold uppercase tracking-tight shadow-2xl backdrop-blur-2xl border whitespace-normal min-w-[220px] max-w-[280px] text-center
                ${mrrpTexas 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-bounce' 
                  : 'bg-black/80 border-white/10 text-slate-200 animate-[fadeSlideIn_0.5s_ease-out]'
                }`}
            >
              {mrrpTexas || insight?.text}
              {/* Tail pointing DOWN to Texas */}
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] ${mrrpTexas ? 'border-t-emerald-500/40' : 'border-t-white/10'}`} />
            </div>
          )}
          <BengalMascot
            mood={moodTexas}
            eyeOffset={eyeOffset}
            onClick={() => handleCatClick('texas')}
            className="w-44 h-44 md:w-56 md:h-56 opacity-90 hover:opacity-100 transition-all hover:scale-105"
          />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md border border-emerald-500/20 shadow-lg">Texas</span>
          </div>
        </div>
      </div>

      {/* Gösta - Bottom Right (Standard Spot) */}
      <div className="fixed bottom-12 right-4 2xl:right-12 p-4 z-50 pointer-events-auto group">
        <div className="relative">
          {(mrrpGosta || (insight?.speaker === 'gosta' && insight.text)) && (
            <div 
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-5 py-3 rounded-3xl text-[11px] font-bold uppercase tracking-tight shadow-2xl backdrop-blur-2xl border whitespace-normal min-w-[220px] max-w-[280px] text-center
                ${mrrpGosta 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-bounce' 
                  : 'bg-black/80 border-white/10 text-slate-200 animate-[fadeSlideIn_0.5s_ease-out]'
                }`}
            >
              {mrrpGosta || insight?.text}
              {/* Tail pointing DOWN to Gösta */}
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] ${mrrpGosta ? 'border-t-amber-500/40' : 'border-t-white/10'}`} />
            </div>
          )}
          <DevonRexMascot
            mood={moodGosta}
            eyeOffset={eyeOffset}
            onClick={() => handleCatClick('gosta')}
            className="w-44 h-44 md:w-56 md:h-56 opacity-90 hover:opacity-100 transition-all hover:scale-105"
          />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md border border-amber-400/20 shadow-lg">Gösta</span>
          </div>
        </div>
      </div>
    </>
  );
}
