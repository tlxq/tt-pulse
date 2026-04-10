'use client';

import { useState, useEffect, useRef } from 'react';
import { BengalMascot } from './BengalMascot';
import { DevonRexMascot } from './DevonRexMascot';
import { CatMood } from '@/types';
import { Eye, RefreshCcw } from 'lucide-react';

type IdleAction = 'none' | 'yawn' | 'paw' | 'stretch' | 'drink';
const MRRP_PHRASES = ['Mrrp!', 'Purrrr~', '*bap*', 'Mrow!', 'Miaou!', '...zzz', 'Brrr~'] as const;

interface GuardiansCardProps {
  isDegraded: boolean;
  isHighLoad: boolean;
  loading: boolean;
  insight: { text: string; speaker: 'texas' | 'gosta' };
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function GuardiansCard({ isDegraded, isHighLoad, loading, insight, onRefresh, isRefreshing }: GuardiansCardProps) {
  const [mounted, setMounted] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [idleAction, setIdleAction] = useState<IdleAction>('none');
  const [idleCat, setIdleCat] = useState<'texas' | 'gosta'>('texas');
  const [texasMrrp, setTexasMrrp] = useState<string | null>(null);
  const [gostaMrrp, setGostaMrrp] = useState<string | null>(null);
  const [texasStartled, setTexasStartled] = useState(false);
  const [gostaStartled, setGostaStartled] = useState(false);
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
        if (loading || isDegraded) { scheduleIdle(); return; }
        const cat = Math.random() > 0.5 ? 'texas' : 'gosta';
        const pool: IdleAction[] = cat === 'gosta'
          ? ['yawn', 'paw', 'stretch', 'drink', 'drink']
          : ['yawn', 'paw', 'stretch', 'yawn', 'paw'];
        const action = pool[Math.floor(Math.random() * pool.length)];
        setIdleAction(action);
        setIdleCat(cat);
        const dur = action === 'stretch' ? 2100 : action === 'drink' ? 3200 : 1900;
        setTimeout(() => {
          setIdleAction('none');
          scheduleIdle();
        }, dur);
      }, 12000 + Math.random() * 18000);
      return timeout;
    };
    const t = scheduleIdle();
    return () => clearTimeout(t);
  }, [mounted, loading, isDegraded]);

  const handleTexasClick = () => {
    const phrase = MRRP_PHRASES[Math.floor(Math.random() * MRRP_PHRASES.length)];
    setTexasMrrp(phrase);
    setTexasStartled(true);
    setTimeout(() => { setTexasMrrp(null); setTexasStartled(false); }, 1600);
  };

  const handleGostaClick = () => {
    const phrase = MRRP_PHRASES[Math.floor(Math.random() * MRRP_PHRASES.length)];
    setGostaMrrp(phrase);
    setGostaStartled(true);
    setTimeout(() => { setGostaMrrp(null); setGostaStartled(false); }, 1600);
  };

  const getBaseMood = (): CatMood => {
    if (!mounted) return 'idle';
    if (loading) return 'alert';
    if (isDegraded) return 'tired';
    if (isHighLoad) return 'alert';
    return 'happy';
  };

  const baseMood = getBaseMood();

  const texasMood: CatMood = texasStartled
    ? 'startled'
    : (idleAction !== 'none' && idleCat === 'texas')
      ? (idleAction as CatMood)
      : baseMood;

  const gostaMood: CatMood = gostaStartled
    ? 'startled'
    : (idleAction !== 'none' && idleCat === 'gosta')
      ? (idleAction as CatMood)
      : baseMood;

  const statusLabel = isHighLoad ? 'Alert' : 'Nominal';
  const statusStyle = isHighLoad
    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';

  const activeMrrp = texasMrrp || gostaMrrp;
  const mrrpSpeaker = texasMrrp ? 'texas' : 'gosta';
  const displaySpeaker = activeMrrp ? mrrpSpeaker : insight.speaker;
  const displayText = activeMrrp || insight.text;

  return (
    <div
      ref={containerRef}
      className="bg-white/5 border border-white/5 rounded-3xl p-4 relative overflow-hidden group shadow-[0_0_15px_rgba(139,92,246,0.05)] transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] backdrop-blur-sm flex flex-col h-full min-h-[280px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2 text-slate-500 font-black uppercase tracking-[0.2em] text-[9px]">
          <Eye className="w-3 h-3 text-nebula-accent" />
          Guardians
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusStyle}`}>
            {statusLabel}
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh insight"
            className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-nebula-accent/30 transition-all active:scale-90 disabled:opacity-40 group/refresh"
          >
            <RefreshCcw className={`w-3 h-3 text-slate-500 group-hover/refresh:text-nebula-accent ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cats side by side */}
      <div className="flex items-end justify-center gap-2 flex-1 min-h-0">
        {/* Texas */}
        <div className={`flex flex-col items-center transition-all duration-300 ${insight.speaker === 'texas' && !activeMrrp ? 'scale-105' : activeMrrp && mrrpSpeaker === 'texas' ? 'scale-105' : 'scale-95 opacity-60'}`}>
          <BengalMascot
            mood={texasMood}
            eyeOffset={eyeOffset}
            onClick={handleTexasClick}
            className="w-36 h-36"
          />
          <span className="text-[8px] font-black uppercase tracking-widest mt-1 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full bg-black/40">
            Texas
          </span>
        </div>

        {/* Gösta */}
        <div className={`flex flex-col items-center transition-all duration-300 ${insight.speaker === 'gosta' && !activeMrrp ? 'scale-105' : activeMrrp && mrrpSpeaker === 'gosta' ? 'scale-105' : 'scale-95 opacity-60'}`}>
          <DevonRexMascot
            mood={gostaMood}
            eyeOffset={eyeOffset}
            onClick={handleGostaClick}
            className="w-36 h-36"
          />
          <span className="text-[8px] font-black uppercase tracking-widest mt-1 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full bg-black/40">
            Gösta
          </span>
        </div>
      </div>

      {/* Speech bubble */}
      {displayText && (
        <div className={`mt-3 px-3 py-2.5 rounded-2xl text-[10px] font-medium leading-relaxed backdrop-blur-2xl border shadow-xl relative shrink-0
          ${activeMrrp
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            : 'bg-black/70 border-white/10 text-slate-200 animate-[fadeSlideIn_0.5s_ease-out]'
          }`}
        >
          {!activeMrrp && (
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 mb-0.5 align-middle shrink-0
              ${displaySpeaker === 'texas' ? 'bg-emerald-500' : 'bg-amber-400'}`}
            />
          )}
          {displayText}
        </div>
      )}

      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-nebula-accent/5 rounded-full blur-2xl group-hover:bg-nebula-accent/10 transition-colors pointer-events-none" />
    </div>
  );
}
