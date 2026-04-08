'use client';
import { NodeStatus } from "@/hooks/useStatus";
import { Card, AreaChart, Title, Text, Flex, Grid, Metric } from "@tremor/react";
import { Cpu, HardDrive, Wifi, Database, Info, Activity, Terminal, Monitor, Apple } from "lucide-react";
import { useEffect, useState, Fragment } from "react";
import { ProcessModal } from "./ProcessModal";
import { getRelativeTime } from "@/lib/utils";
import Image from "next/image";

const OSIcon = ({ platform, distro }: { platform?: string, distro?: string }) => {
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

const CustomTooltip = ({ payload, active, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-2xl ring-1 ring-white/10">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">{label}</p>
      <div className="space-y-1.5">
        {payload.map((category: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color === 'violet' ? '#8b5cf6' : '#ec4899' }} />
              <span className="text-[10px] font-bold text-slate-300">{category.name}</span>
            </div>
            <span className="text-[10px] font-black text-white font-mono">{category.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function NodeCard({ node }: { node: NodeStatus }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  useEffect(() => { 
    const checkOnline = () => {
      const lastSeenDate = new Date(node.last_seen);
      const diffMinutes = (Date.now() - lastSeenDate.getTime()) / 60000;
      // More lenient: 15 minutes before considering "Sleeping"
      setIsOnline(diffMinutes < 15);
    };

    setIsMounted(true); 
    checkOnline();
    const interval = setInterval(checkOnline, 30000); // Re-check every 30s
    return () => clearInterval(interval);
  }, [node.last_seen]);

  const chartData = (node.history || []).map(h => ({
    time: new Intl.DateTimeFormat('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(h.recorded_at)),
    "CPU Usage": h.cpu_usage,
    "RAM Usage": h.ram_usage,
  }));

  return (
    <Fragment>
      <Card className={`relative bg-white/[0.03] ring-1 transition-all duration-700 overflow-hidden rounded-[2.5rem] backdrop-blur-3xl shadow-2xl
        ${isOnline 
          ? 'ring-emerald-500/30 bg-emerald-500/[0.02] shadow-emerald-500/10 scale-[1.02]' 
          : 'ring-white/5 grayscale opacity-70 border-white/5'
        }`}>
        
        {/* Activity Pulse Glow */}
        {isOnline && (
          <>
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-nebula-accent/5 rounded-full blur-[60px] pointer-events-none" />
          </>
        )}
        
        <Flex alignItems="start" className="mb-6 relative z-10 p-2">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-2xl border transition-colors ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                <OSIcon platform={node.os_platform} distro={node.os_distro} />
              </div>
              <div className="flex flex-col">
                <Title className={`font-black tracking-tight font-sans text-2xl leading-none ${isOnline ? 'text-white' : 'text-slate-400'}`}>{node.node_name}</Title>
                <div className={`flex items-center gap-1.5 mt-2 ${isOnline ? 'text-emerald-400' : 'text-slate-600'}`}>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-black font-mono tracking-tighter italic">{node.latency_ms || 0}ms</span>
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
              
              {node.github_username && (
                <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-nebula-accent/10 border border-nebula-accent/20">
                  <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden border border-nebula-accent/30 bg-black/20">
                    <Image 
                      src={`https://github.com/${node.github_username}.png`}
                      alt={node.github_username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[8px] font-black text-nebula-accent uppercase italic">{node.github_username}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-500 hover:text-nebula-accent hover:border-nebula-accent/30 hover:bg-nebula-accent/5 transition-all active:scale-90"
              title="Open Process Monitor"
            >
              <Terminal className="w-4 h-4" />
            </button>
            {!isOnline && (
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight italic">
                Seen {getRelativeTime(node.last_seen)}
              </span>
            )}
          </div>
        </Flex>

        <div className="h-36 w-full mt-2 -mx-2 relative z-10">
          {isMounted ? (
            <AreaChart
              className="h-full"
              data={chartData}
              index="time"
              categories={["CPU Usage", "RAM Usage"]}
              colors={["violet", "pink"]}
              showLegend={false}
              showGridLines={false}
              showXAxis={false}
              showYAxis={false}
              startEndOnly={true}
              curveType="monotone"
              customTooltip={CustomTooltip}
            />
          ) : (
            <div className="h-full w-full bg-white/5 rounded-3xl animate-pulse flex items-center justify-center">
               <Activity className="w-5 h-5 text-slate-800" />
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-white/5 pt-8 relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1 group/cpu cursor-pointer" onClick={() => setIsOpen(true)}>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Cpu className="w-3 h-3 group-hover/cpu:text-nebula-accent transition-colors" />
                <span className="text-[9px] font-black uppercase tracking-widest">CPU</span>
              </div>
              <div className="text-sm font-black text-white font-mono">{node.cpu_usage}%</div>
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <HardDrive className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">RAM</span>
              </div>
              <div className="text-sm font-black text-white font-mono">{node.ram_usage}%</div>
            </div>
            
            <div className="flex-1 space-y-1 text-right">
              <div className="flex items-center gap-1.5 text-slate-500 justify-end">
                <Database className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">DISK</span>
              </div>
              <div className={`text-sm font-black font-mono ${(node.disk_usage_percent || 0) > 90 ? 'text-rose-500' : 'text-white'}`}>
                {node.disk_usage_percent || 0}%
              </div>
            </div>
          </div>
        </div>

        {node.recent_commits && node.recent_commits.length > 0 && (
          <div className="mt-8 relative z-10 group/terminal">
            <div className="absolute inset-0 bg-black/40 rounded-2xl border border-white/5 -m-2 z-0" />
            <div className="relative z-10 p-4 space-y-4">
              <Flex justifyContent="between" className="mb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3 h-3 text-emerald-500/70" />
                  <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.2em] font-mono">Terminal Output // Logs</span>
                </div>
                <div className="flex gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-rose-500/20" />
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20" />
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
                </div>
              </Flex>
              
              <div className="space-y-2.5 font-mono">
                {node.recent_commits.slice(0, 3).map((commit, idx) => (
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
        )}

        <div className="mt-8 border-t border-white/5 pt-6 text-[10px] font-bold text-slate-600 uppercase tracking-tighter italic relative z-10">
          Sync status: Verified
        </div>
      </Card>

      <ProcessModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        nodeName={node.node_name} 
        processes={node.top_processes || []} 
      />
    </Fragment>
  );
}
