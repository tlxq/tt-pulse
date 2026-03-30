'use client';
import { NodeStatus } from "@/hooks/useStatus";
import { Card, AreaChart, Title, Text, Flex, Grid, Metric } from "@tremor/react";
import { Cpu, HardDrive, Wifi, Database, Info, Activity, Terminal } from "lucide-react";
import { useEffect, useState, Fragment } from "react";
import { ProcessModal } from "./ProcessModal";
import { getRelativeTime } from "@/lib/utils";

export function NodeCard({ node }: { node: NodeStatus }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  useEffect(() => { 
    const t = setTimeout(() => {
      setIsMounted(true); 
      const lastSeenDate = new Date(node.last_seen);
      setIsOnline((Date.now() - lastSeenDate.getTime()) / 60000 < 10);
    }, 0);
    return () => clearTimeout(t);
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
      <Card className={`bg-white/5 border-white/5 ring-0 shadow-[0_0_15px_rgba(139,92,246,0.05)] backdrop-blur-xl group transition-all hover:bg-white/10 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] hover:border-white/10 ${!isOnline ? 'grayscale-[0.5] opacity-80' : ''}`}>
        <Flex alignItems="start" className="mb-4">
          <div className="space-y-1">
            <Title className="text-white font-black tracking-tight font-sans">{node.node_name}</Title>
            <Text className="text-slate-500 uppercase text-[9px] font-black tracking-[0.2em] font-sans">Station Health</Text>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsOpen(true)}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-nebula-accent hover:border-nebula-accent/30 transition-all active:scale-90"
                title="Open Process Monitor"
              >
                <Terminal className="w-3.5 h-3.5" />
              </button>
              {isOnline ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-nebula-accent/10 border border-nebula-accent/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-nebula-accent animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-nebula-accent">Grinding</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Sleeping</span>
                </div>
              )}
            </div>
            {!isOnline && (
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter italic">
                Last seen: {getRelativeTime(node.last_seen)}
              </span>
            )}
          </div>
        </Flex>

        <div className="h-32 w-full mt-4 -mx-2 relative">
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
            />
          ) : (
            <div className="h-full w-full bg-white/5 rounded-xl animate-pulse flex items-center justify-center">
               <Activity className="w-5 h-5 text-slate-800" />
            </div>
          )}
        </div>

        <Grid numItems={3} className="mt-6 border-t border-white/5 pt-6 gap-4 font-sans">
          <div className="space-y-1 group/cpu cursor-pointer" onClick={() => setIsOpen(true)}>
            <Flex justifyContent="start" className="gap-2 text-slate-500">
              <Cpu className="w-3 h-3 group-hover/cpu:text-nebula-accent transition-colors" />
              <Text className="text-[9px] font-black uppercase tracking-tighter">CPU</Text>
              <Info className="w-2.5 h-2.5 opacity-0 group-hover/cpu:opacity-100 transition-all text-nebula-accent" />
            </Flex>
            <Metric className="text-sm font-black text-slate-200 font-mono">{node.cpu_usage}%</Metric>
          </div>
          <div className="space-y-1">
            <Flex justifyContent="start" className="gap-2 text-slate-500">
              <HardDrive className="w-3 h-3" />
              <Text className="text-[9px] font-black uppercase tracking-tighter">RAM</Text>
            </Flex>
            <Metric className="text-sm font-black text-slate-200 font-mono">{node.ram_usage}%</Metric>
          </div>
          <div className="space-y-1">
            <Flex justifyContent="start" className="gap-2 text-slate-500">
              <Database className="w-3 h-3" />
              <Text className="text-[9px] font-black uppercase tracking-tighter">Disk</Text>
            </Flex>
            <Metric className={`text-sm font-black font-mono ${(node.disk_usage_percent || 0) > 90 ? 'text-rose-500' : 'text-slate-200'}`}>
              {node.disk_usage_percent || 0}%
            </Metric>
          </div>
        </Grid>

        <Flex className="mt-6 border-t border-slate-800/30 pt-4 font-sans">
          <Flex justifyContent="start" className={`gap-2 ${isOnline ? 'text-emerald-500' : 'text-slate-500 opacity-50'}`}>
            <Wifi className="w-3 h-3" />
            <Text className={`text-[9px] font-bold font-mono ${isOnline ? 'text-emerald-500' : 'text-slate-500'}`}>{node.latency_ms || 0}ms</Text>
          </Flex>
        </Flex>
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
