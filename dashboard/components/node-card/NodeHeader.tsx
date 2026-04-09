'use client';

import { Apple, Monitor, Wifi } from "lucide-react";
import { Title } from "@tremor/react";
import Image from "next/image";
import { useState } from "react";

export const OSIcon = ({ platform, distro }: { platform?: string, distro?: string }) => {
  const p = platform?.toLowerCase() || '';
  const d = distro?.toLowerCase() || '';

  if (p.includes('darwin')) return <Apple className="w-4 h-4 text-white/70" />;
  if (p.includes('win')) return <Monitor className="w-4 h-4 text-sky-400" />;
  if (d.includes('arch')) return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-sky-400" xmlns="http://www.w3.org/2000/svg">
       <path d="M12 2L2 19.77h1.53c.12 0 .23-.07.28-.18L12 4.45l8.19 15.14c.05.11.16.18.28.18H22L12 2z"/>
    </svg>
  );
  return <Monitor className="w-4 h-4 text-slate-500" />;
};

interface NodeHeaderProps {
  nodeName: string;
  osPlatform?: string;
  osDistro?: string;
  latencyMs?: number;
  isOnline: boolean;
  githubUsername?: string;
}

export function NodeHeader({ nodeName, osPlatform, osDistro, latencyMs, isOnline, githubUsername }: NodeHeaderProps) {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <div className="flex items-start justify-between mb-6 relative z-10 p-2">
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-2xl border transition-colors ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500'}`}>
            <OSIcon platform={osPlatform} distro={osDistro} />
          </div>
          <div className="flex flex-col">
            <Title className={`font-black tracking-tight font-sans text-2xl leading-none truncate max-w-[150px] ${isOnline ? 'text-white' : 'text-slate-400'}`}>{nodeName}</Title>
            <div className={`flex items-center gap-1.5 mt-2 ${isOnline
                ? (latencyMs || 0) > 100 ? 'text-rose-400'
                  : (latencyMs || 0) > 20 ? 'text-amber-400'
                  : 'text-emerald-400'
                : 'text-slate-600'}`}>
              <Wifi className="w-3.5 h-3.5" />
              <span className="text-[11px] font-black font-mono tracking-tighter italic">{latencyMs || 0}ms</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${isOnline ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-600'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-600'}`} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">
              {isOnline ? 'Grinding' : 'Sleeping'}
            </span>
          </div>
          
          {githubUsername && (
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-nebula-accent/10 border border-nebula-accent/20">
              {!avatarError && (
                <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden border border-nebula-accent/30 bg-black/20">
                  <Image
                    src={`https://github.com/${githubUsername}.png`}
                    alt={githubUsername}
                    fill
                    sizes="14px"
                    className="object-cover"
                    onError={() => setAvatarError(true)}
                  />
                </div>
              )}
              <span className="text-[8px] font-black text-nebula-accent uppercase italic">{githubUsername}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
