'use client';

import { ShieldCheck } from 'lucide-react';
import { AiMetadata } from '@/types';

interface SREInsightProps extends AiMetadata {
  insight: string;
  loading: boolean;
  onGuardianChange?: () => void;
}

export function SREInsight({ insight, loading, fallback, quotaExceeded }: SREInsightProps) {
  const isDegraded = fallback || quotaExceeded || !!(insight && (
    insight.includes('Mrow?') || insight.includes('gap in the perimeter') || insight.includes('Hiss!')
  ));

  return (
    <div className={`
      h-full bg-white/5 border rounded-3xl p-6 relative overflow-hidden group transition-all backdrop-blur-sm
      ${isDegraded
        ? 'border-nebula-secondary/30 shadow-[0_0_20px_rgba(236,72,153,0.1)]'
        : 'border-white/5 shadow-[0_0_15px_rgba(139,92,246,0.05)]'
      }
    `}>
      {/* Decorative shield icon */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <ShieldCheck className={`w-16 h-16 ${isDegraded ? 'text-nebula-secondary' : 'text-nebula-accent'} rotate-12`} />
      </div>

      <div className="relative z-10 h-full flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${isDegraded ? 'text-nebula-secondary' : 'text-nebula-accent'} font-black uppercase tracking-[0.2em] text-[10px]`}>
            Studio Insights
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest
            ${isDegraded
              ? 'bg-nebula-secondary/10 border-nebula-secondary/20 text-nebula-secondary'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            }`}>
            {loading ? (
              <span className="animate-pulse">{isDegraded ? 'DEGRADED' : 'ANALYZING...'}</span>
            ) : (
              isDegraded ? 'DEGRADED' : 'OPERATIONAL'
            )}
          </div>
        </div>

        <div className="flex-grow flex flex-col justify-center px-2">
          <div
            key={insight}
            className={`
              relative rounded-2xl p-5 flex items-center justify-center text-center
              animate-[fadeSlideIn_0.5s_ease-out]
              ${isDegraded
                ? 'bg-pink-500/8 border border-pink-500/20'
                : 'bg-white/5 border border-white/10'
              }
            `}
          >
            {loading ? (
              <div className="flex items-center gap-2 py-4">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-nebula-accent rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            ) : (
              <p className={`text-base font-medium leading-relaxed italic ${isDegraded ? 'text-pink-100/90' : 'text-slate-200'}`}>
                &ldquo;{insight || 'The studio is calm, Human.'}&rdquo;
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 w-full flex justify-between items-center text-slate-500">
           <span className="text-[9px] font-black uppercase tracking-widest">AI Oversight Active</span>
           {isDegraded && <span className="text-[8px] font-bold text-nebula-secondary animate-pulse uppercase">Heuristic Fallback</span>}
        </div>
      </div>
    </div>
  );
}
