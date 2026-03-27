import { NodeStatus } from "@/hooks/useStatus";
import { Cpu, HardDrive, Clock, Activity, Wifi, Database } from "lucide-react";

export function NodeCard({ node }: { node: any }) {
  const lastSeenDate = new Date(node.last_seen);
  const isOnline = Date.now() - lastSeenDate.getTime() < 10 * 60 * 1000;
  const isDiskCritical = (node.disk_usage_percent || 0) > 90;

  // Enkel latens-indikator: Grön < 30ms, Gul < 100ms, Röd > 100ms
  const getLatencyColor = (ms: number) => {
    if (ms < 30) return 'text-green-400';
    if (ms < 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-sm hover:border-blue-500/20 transition-all duration-300 shadow-xl shadow-black/20">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-100 tracking-tight">{node.node_name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              {isOnline ? 'System Online' : 'System Offline'}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950/50 border border-slate-800/50 ${getLatencyColor(node.latency_ms || 0)}`}>
            <Wifi className="w-3 h-3" />
            <span className="text-[10px] font-bold">{node.latency_ms || 0}ms</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* CPU & RAM Sections */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
            <div className="flex justify-between items-center mb-2 text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5"><Cpu className="w-3 h-3"/> CPU</span>
              <span className="text-xs font-bold text-slate-300">{node.cpu_usage}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1">
              <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${node.cpu_usage}%` }} />
            </div>
          </div>
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
            <div className="flex justify-between items-center mb-2 text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5"><HardDrive className="w-3 h-3"/> RAM</span>
              <span className="text-xs font-bold text-slate-300">{node.ram_usage}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1">
              <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${node.ram_usage}%` }} />
            </div>
          </div>
        </div>

        {/* Storage Usage Section */}
        <div className={`bg-slate-950/40 p-4 rounded-xl border ${isDiskCritical ? 'border-red-500/30 animate-pulse' : 'border-slate-800/40'}`}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Database className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold tracking-wider italic italic-style">Storage Capacity</span>
            </div>
            <span className={`text-xs font-bold ${isDiskCritical ? 'text-red-400' : 'text-slate-300'}`}>{node.disk_usage_percent || 0}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${isDiskCritical ? 'bg-red-500' : 'bg-slate-400'}`} 
              style={{ width: `${node.disk_usage_percent || 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between text-slate-500 text-[10px] border-t border-slate-800/40 pt-4 font-bold uppercase tracking-widest italic italic-style">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>Last Pulse</span>
        </div>
        <span className="text-slate-400 tracking-tight">{lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
}
