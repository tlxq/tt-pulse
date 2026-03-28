'use client';

import { Zap, ShieldCheck } from 'lucide-react';
import { BengalMascot } from './BengalMascot';

interface SREInsightProps {
  insight: string;
  loading: boolean;
  fallback?: boolean;
  quotaExceeded?: boolean;
}

export function SREInsight({ insight, loading, fallback, quotaExceeded }: SREInsightProps) {
  const isDegraded = fallback || quotaExceeded || (insight && (insight.includes('Mrow?') || insight.includes('gap in the perimeter') || insight.includes('Hiss!')));
  const isHighLoad = insight && (insight.includes('Hiss!') || insight.includes('Grrr...'));

  return (
    <div className={`col-span-1 md:col-span-1 lg:col-span-1 bg-[#0f172a]/40 border ${isDegraded ? 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-slate-800/60 shadow-[0_0_15px_rgba(245,158,11,0.05)]'} rounded-3xl p-8 relative overflow-hidden group transition-all`}>
      {/* Background Studio Element */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <ShieldCheck className="w-24 h-24 text-amber-500 rotate-12" />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center text-center space-y-6">
        <div className="w-full flex items-center justify-between mb-2">
          <div className={`flex items-center gap-2 ${isDegraded ? 'text-amber-400' : 'text-amber-500'} font-black uppercase tracking-[0.2em] text-[10px]`}>
            Texas - Studio Guardian
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isDegraded ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'} text-[8px] font-black uppercase tracking-widest`}>
            {isDegraded ? 'DEGRADED' : 'OPERATIONAL'}
          </div>
        </div>

        {/* The Large Mascot */}
        <div className="py-2">
          <BengalMascot isHighLoad={!!isHighLoad} isDegraded={!!isDegraded} />
        </div>

        <div className="space-y-4 w-full">
          <div className={`text-slate-200 text-base font-medium leading-relaxed italic px-2 min-h-[80px] flex items-center justify-center ${isDegraded ? 'text-amber-100/90' : ''}`}>
            {loading ? (
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            ) : (
              `"${insight || 'The studio is calm, Human.'}"`
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/40 w-full flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-500">
              <Zap className="w-3 h-3 text-amber-500/50" />
              <span className="text-[9px] font-black uppercase tracking-widest">Dev Studio Oversight</span>
            </div>
            {isHighLoad && <span className="text-amber-600 text-[8px] font-bold animate-pulse uppercase tracking-tighter">Eyes Fixed</span>}
          </div>
        </div>
      </div>
      
      {/* Decorative Glow */}
      <div className={`absolute -right-10 -bottom-10 w-40 h-40 ${isDegraded ? 'bg-amber-600/10' : 'bg-amber-500/5'} rounded-full blur-3xl`} />
    </div>
  );
}
