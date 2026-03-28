'use client';

import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Text } from '@tremor/react';

interface SREInsightProps {
  insight: string;
  loading: boolean;
  fallback?: boolean;
  quotaExceeded?: boolean;
}

export function SREInsight({ insight, loading, fallback, quotaExceeded }: SREInsightProps) {
  const isDegraded = fallback || quotaExceeded;

  return (
    <div className={`bg-gradient-to-br ${isDegraded ? 'from-amber-900/20 to-[#0f172a]/40 border-amber-500/30' : 'from-[#1e293b]/60 to-[#0f172a]/40 border-blue-500/20'} border rounded-3xl p-8 relative overflow-hidden group shadow-[0_0_15px_rgba(59,130,246,0.05)] transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]`}>
      <div className="relative z-10 space-y-4 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isDegraded ? 'text-amber-400' : 'text-blue-400'} font-black uppercase tracking-[0.2em] text-[10px]`}>
            <Sparkles className={`w-4 h-4 ${isDegraded ? 'animate-pulse' : ''}`} /> Texas - The Butler
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isDegraded ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'} text-[8px] font-black uppercase tracking-widest`}>
            {isDegraded ? (
              <>
                <AlertTriangle className="w-2.5 h-2.5" />
                SRE STATUS: DEGRADED (RATE LIMITED)
              </>
            ) : (
              <>
                <CheckCircle2 className="w-2.5 h-2.5" />
                SRE STATUS: OPERATIONAL
              </>
            )}
          </div>
        </div>

        <div className={`text-slate-300 text-sm font-medium leading-relaxed italic tracking-wide py-2 min-h-[60px] ${isDegraded ? 'text-amber-100/80 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]' : ''}`}>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 ${isDegraded ? 'bg-amber-500' : 'bg-blue-500'} rounded-full animate-bounce`} />
              <div className={`w-1.5 h-1.5 ${isDegraded ? 'bg-amber-500' : 'bg-blue-500'} rounded-full animate-bounce [animation-delay:0.2s]`} />
              <div className={`w-1.5 h-1.5 ${isDegraded ? 'bg-amber-500' : 'bg-blue-500'} rounded-full animate-bounce [animation-delay:0.4s]`} />
            </div>
          ) : (
            `"${insight || 'Waiting for signal, sir.'}"`
          )}
        </div>

        <div className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] border-t border-slate-800/60 pt-4 mt-auto flex justify-between items-center">
          <span>Autonomous Insight Engine</span>
          {isDegraded && <span className="text-amber-600/50 italic animate-pulse">Retrying...</span>}
        </div>
      </div>
      
      {/* Glow effects */}
      <div className={`absolute -right-4 -bottom-4 w-32 h-32 ${isDegraded ? 'bg-amber-600/5 group-hover:bg-amber-600/10' : 'bg-blue-600/5 group-hover:bg-blue-600/10'} rounded-full blur-3xl transition-colors`} />
    </div>
  );
}
