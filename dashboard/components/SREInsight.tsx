'use client';

import { useState, useEffect } from 'react';
import { Zap, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { BengalMascot } from './BengalMascot';
import { DevonRexMascot } from './DevonRexMascot';
import { AiMetadata } from '@/types';

type Guardian = 'texas' | 'gosta';

const STORAGE_KEY = 'tt-pulse-guardian';

interface SREInsightProps extends AiMetadata {
  insight: string;
  loading: boolean;
  onGuardianChange?: () => void;
}

export function SREInsight({ insight, loading, fallback, quotaExceeded, onGuardianChange }: SREInsightProps) {
  const isDegraded = fallback || quotaExceeded || (insight && (insight.includes('Mrow?') || insight.includes('gap in the perimeter') || insight.includes('Hiss!')));
  const isHighLoad = insight && (insight.includes('Hiss!') || insight.includes('Grrr...'));

  const [active, setActive] = useState<Guardian>('texas');
  const [mounted, setMounted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    /* eslint-disable react-hooks/set-state-in-effect */
    if (saved === 'texas' || saved === 'gosta') setActive(saved);
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const switchTo = (g: Guardian) => {
    if (g === active) return;
    setTransitioning(true);
    setTimeout(() => {
      setActive(g);
      setTransitioning(false);
      localStorage.setItem(STORAGE_KEY, g);
      onGuardianChange?.();
    }, 200);
  };

  const toggle = () => switchTo(active === 'texas' ? 'gosta' : 'texas');

  const guardianLabel = active === 'texas' ? 'Texas · Bengal' : 'Gösta · Devon Rex';

  return (
    <div className={`col-span-1 md:col-span-1 lg:col-span-1 bg-white/5 border ${isDegraded ? 'border-nebula-secondary/30 shadow-[0_0_20px_rgba(236,72,153,0.1)]' : 'border-white/5 shadow-[0_0_15px_rgba(139,92,246,0.05)]'} rounded-3xl p-8 relative overflow-hidden group transition-all backdrop-blur-sm`}>
      {/* Background Studio Element */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <ShieldCheck className={`w-24 h-24 ${isDegraded ? 'text-nebula-secondary' : 'text-nebula-accent'} rotate-12`} />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center text-center space-y-4">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-2">
          <div className={`flex items-center gap-2 ${isDegraded ? 'text-nebula-secondary' : 'text-nebula-accent'} font-black uppercase tracking-[0.2em] text-[10px]`}>
            Studio Guardian
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isDegraded ? 'bg-nebula-secondary/10 border-nebula-secondary/20 text-nebula-secondary' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'} text-[8px] font-black uppercase tracking-widest`}>
            {isDegraded ? 'DEGRADED' : 'OPERATIONAL'}
          </div>
        </div>

        {/* Guardian toggle tabs */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 w-full">
          <button
            onClick={() => switchTo('texas')}
            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${
              active === 'texas'
                ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Texas
          </button>
          <button
            onClick={() => switchTo('gosta')}
            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${
              active === 'gosta'
                ? 'bg-amber-500/20 text-amber-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Gösta
          </button>
        </div>

        {/* Mascot — single, with fade-swap transition */}
        <div
          className="relative flex flex-col items-center gap-2 py-1 transition-opacity duration-200"
          style={{ opacity: transitioning ? 0 : 1 }}
        >
          {/* Arrow switcher */}
          <button
            onClick={toggle}
            className="absolute -left-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
            aria-label="Previous guardian"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {(!mounted || active === 'texas') ? (
            <BengalMascot isHighLoad={!!isHighLoad} isDegraded={!!isDegraded} className="w-44 h-44" />
          ) : (
            <DevonRexMascot isHighLoad={!!isHighLoad} isDegraded={!!isDegraded} className="w-44 h-44" />
          )}

          <span className={`text-[8px] font-black uppercase tracking-widest ${active === 'texas' ? 'text-emerald-500/60' : 'text-amber-500/60'}`}>
            {guardianLabel}
          </span>

          <button
            onClick={toggle}
            className="absolute -right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
            aria-label="Next guardian"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => switchTo('texas')}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${active === 'texas' ? 'bg-emerald-500 w-3' : 'bg-white/20'}`}
          />
          <button
            onClick={() => switchTo('gosta')}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${active === 'gosta' ? 'bg-amber-500 w-3' : 'bg-white/20'}`}
          />
        </div>

        {/* Insight text */}
        <div className="space-y-4 w-full">
          <div className={`text-slate-200 text-base font-medium leading-relaxed italic px-2 min-h-[80px] flex items-center justify-center ${isDegraded ? 'text-pink-100/90' : ''}`}>
            {loading ? (
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-nebula-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            ) : (
              `"${insight || 'The studio is calm, Human.'}"`
            )}
          </div>

          <div className="pt-4 border-t border-white/5 w-full flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-500">
              <Zap className="w-3 h-3 text-nebula-accent/50" />
              <span className="text-[9px] font-black uppercase tracking-widest">Dev Studio Oversight</span>
            </div>
            {isHighLoad && <span className="text-nebula-secondary text-[8px] font-bold animate-pulse uppercase tracking-tighter">Eyes Fixed</span>}
          </div>
        </div>
      </div>

      {/* Decorative Glow */}
      <div className={`absolute -right-10 -bottom-10 w-40 h-40 ${isDegraded ? 'bg-nebula-secondary/10' : active === 'texas' ? 'bg-emerald-500/5' : 'bg-amber-500/5'} rounded-full blur-3xl transition-colors duration-500`} />
    </div>
  );
}
