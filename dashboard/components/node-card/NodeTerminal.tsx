'use client';

import { Terminal as TerminalIcon, ExternalLink } from "lucide-react";

interface NodeTerminalProps {
  recentCommits?: string[];
  githubUsername?: string;
  repoName?: string;
  branchName?: string;
}

export function NodeTerminal({ recentCommits, githubUsername, repoName, branchName }: NodeTerminalProps) {
  const hasCommits = recentCommits && recentCommits.length > 0;

  const commitUrl =
    githubUsername && repoName
      ? `https://github.com/${githubUsername}/${repoName}/commits/${branchName ?? 'HEAD'}`
      : null;

  return (
    <div className="mt-3 relative z-10 group/terminal">
      <div className="absolute inset-0 bg-black/40 rounded-2xl border border-white/5 -m-2 z-0" />
      <div className="relative z-10 p-3 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-3 h-3 text-emerald-500/70" />
            <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.2em] font-mono">Terminal Output // Logs</span>
          </div>
          <div className="flex items-center gap-2">
            {commitUrl && (
              <a
                href={commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[8px] font-bold text-slate-600 hover:text-nebula-accent transition-colors"
                title="View commits on GitHub"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                GitHub
              </a>
            )}
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
            </div>
          </div>
        </div>

        {hasCommits ? (
          <div className="space-y-2.5 font-mono">
            {recentCommits.slice(0, 3).map((commit, idx) => (
              <div key={idx} className="flex items-start gap-3 group/line">
                <span className="text-[9px] text-slate-600 mt-0.5 shrink-0">$</span>
                {commitUrl ? (
                  <a
                    href={commitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-emerald-400/90 leading-relaxed line-clamp-1 hover:text-emerald-300 hover:underline underline-offset-2 transition-colors selection:bg-emerald-500/30 cursor-pointer"
                  >
                    {commit}
                    {idx === 0 && <span className="inline-block w-1.5 h-3 ml-1 bg-emerald-500/50 animate-pulse align-middle" />}
                  </a>
                ) : (
                  <p className="text-[10px] text-emerald-400/90 leading-relaxed line-clamp-1 selection:bg-emerald-500/30">
                    {commit}
                    {idx === 0 && <span className="inline-block w-1.5 h-3 ml-1 bg-emerald-500/50 animate-pulse align-middle" />}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 font-mono py-1">
            <span className="text-[9px] text-slate-600">$</span>
            <span className="text-[9px] text-slate-600 italic">no recent commits detected</span>
            <span className="inline-block w-1 h-3 bg-slate-700 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
