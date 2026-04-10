'use client';

import { useState, useEffect, useRef } from 'react';
import { BengalMascot } from './BengalMascot';
import { DevonRexMascot } from './DevonRexMascot';
import { CatMood } from '@/types';

type IdleAction = 'none' | 'yawn' | 'paw' | 'stretch';
const MRRP_PHRASES = ['Mrrp!', 'Purrrr~', '*bap*', 'Mrow!', 'Miaou!', '...zzz', 'Brrr~'] as const;

interface DraggableCatProps {
  type: 'texas' | 'gosta';
  isDegraded: boolean;
  isHighLoad: boolean;
  insight: string | null;
  loading: boolean;
}

export function DraggableCat({ type, isDegraded, isHighLoad, insight, loading }: DraggableCatProps) {
  const [mounted, setMounted] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [idleAction, setIdleAction] = useState<IdleAction>('none');
  const [mrrpText, setMrrpText] = useState<string | null>(null);
  const [isStartled, setIsStartled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10) { setEyeOffset({ x: 0, y: 0 }); return; }
      const scale = Math.min(dist / 150, 1) * 3 / dist;
      setEyeOffset({ x: dx * scale, y: dy * scale });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const scheduleIdle = () => {
      const timeout = setTimeout(() => {
        if (loading || isDegraded) {
          scheduleIdle();
          return;
        }
        const pool: IdleAction[] = ['yawn', 'paw', 'stretch', 'yawn', 'paw'];
        const action = pool[Math.floor(Math.random() * pool.length)];
        setIdleAction(action);
        setTimeout(() => {
          setIdleAction('none');
          scheduleIdle();
        }, action === 'stretch' ? 2100 : 1900);
      }, 12000 + Math.random() * 18000);
      return timeout;
    };
    const t = scheduleIdle();
    return () => clearTimeout(t);
  }, [mounted, loading, isDegraded]);

  const handleCatClick = () => {
    const phrase = MRRP_PHRASES[Math.floor(Math.random() * MRRP_PHRASES.length)];
    setMrrpText(phrase);
    setIsStartled(true);
    setTimeout(() => { setMrrpText(null); setIsStartled(false); }, 1600);
  };

  const getBaseMood = (): CatMood => {
    if (!mounted) return 'idle';
    if (loading) return 'alert';
    if (isDegraded) return 'tired';
    if (isHighLoad) return 'alert';
    return 'happy';
  };

  const mood: CatMood = isStartled ? 'startled' : idleAction !== 'none' ? (idleAction as CatMood) : getBaseMood();

  return (
    <div ref={containerRef} className="relative group flex flex-col items-center justify-end h-full min-h-[260px] transition-all overflow-hidden p-4">
      <div className="relative w-full h-full flex flex-col items-center justify-end">
        {/* Speech Bubble - Now inside the card flow */}
        {(mrrpText || insight) && (
          <div 
            className={`mb-4 px-5 py-3 rounded-3xl text-[11px] font-bold uppercase tracking-tight shadow-2xl backdrop-blur-2xl border whitespace-normal w-full max-w-[240px] text-center z-50
              ${mrrpText 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-bounce' 
                : 'bg-black/80 border-white/10 text-slate-200 animate-[fadeSlideIn_0.5s_ease-out]'
              }`}
          >
            {mrrpText || insight}
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] ${mrrpText ? 'border-t-emerald-500/40' : 'border-t-white/10'}`} />
          </div>
        )}

        <div className="relative">
          {type === 'texas' ? (
            <BengalMascot
              mood={mood}
              isDegraded={isDegraded}
              eyeOffset={eyeOffset}
              onClick={handleCatClick}
              className="w-40 h-40 md:w-48 md:h-48"
            />
          ) : (
            <DevonRexMascot
              mood={mood}
              isDegraded={isDegraded}
              eyeOffset={eyeOffset}
              onClick={handleCatClick}
              className="w-40 h-40 md:w-48 md:h-48"
            />
          )}
        </div>

        <div className="mt-2 shrink-0">
          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-black/40 backdrop-blur-md
            ${type === 'texas' ? 'text-emerald-500 border-emerald-500/20' : 'text-amber-400 border-amber-400/20'}`}>
            {type === 'texas' ? 'Texas · Bengal' : 'Gösta · Devon Rex'}
          </span>
        </div>
      </div>
    </div>
  );
}
