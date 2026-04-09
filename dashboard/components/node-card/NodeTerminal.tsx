'use client';

import { Terminal as TerminalIcon } from "lucide-react";

interface NodeTerminalProps {
  recentCommits?: string[];
}

export function NodeTerminal({ recentCommits }: NodeTerminalProps) {
  if (!recentCommits || recentCommits.length === 0) return null;

  return (
    <div className="mt-8 relative z-10 group/terminal">
      <div className="absolute inset-0 bg-black/40 rounded-2xl border border-white/5 -m-2 z-0" />
      <div className="relative z-10 p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-3 h-3 text-emerald-500/70" />
            <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.2em] font-mono">Terminal Output // Logs</span>
          </div>
          <div className="flex gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-rose-500/20" />
             <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20" />
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
          </div>
        </div>
        
        <div className="space-y-2.5 font-mono">
          {recentCommits.slice(0, 3).map((commit, idx) => (
            <div key={idx} className="flex items-start gap-3 group/line">
              <span className="text-[9px] text-slate-600 mt-0.5 shrink-0">$</span>
              <p className="text-[10px] text-emerald-400/90 leading-relaxed line-clamp-2 selection:bg-emerald-500/30">
                {commit}
                {idx === 0 && <span className="inline-block w-1.5 h-3 ml-1 bg-emerald-500/50 animate-pulse align-middle" />}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
