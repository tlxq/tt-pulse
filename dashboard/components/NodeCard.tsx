import { NodeStatus } from "@/hooks/useStatus";
import { Cpu, HardDrive, Clock, Wifi, Database } from "lucide-react";

export function NodeCard({ node }: { node: NodeStatus }) {
  const lastSeenDate = new Date(node.last_seen);
  const diffMinutes = Math.floor((Date.now() - lastSeenDate.getTime()) / 60000);
  const isOnline = diffMinutes < 10;
  
  const timeDisplay = diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`;
  const isDiskCritical = (node.disk_usage_percent || 0) > 90;

  return (
    <div className="bg-[#0f172a]/40 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-md shadow-2xl hover:border-blue-500/30 transition-all duration-300 group">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-100 tracking-tight group-hover:text-blue-400 transition-colors">
            {node.node_name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500/50'}`} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {isOnline ? 'Active' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/50">
          <Wifi className={`w-3 h-3 ${node.latency_ms && node.latency_ms < 50 ? 'text-green-400' : 'text-yellow-400'}`} />
          <span className="text-[10px] font-black text-slate-300">{node.latency_ms || 0}ms</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-4">
        {/* CPU */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3 h-3" />
              <span>Process Load</span>
            </div>
            <span className="text-slate-300">{node.cpu_usage}%</span>
          </div>
          <div className="w-full bg-slate-800/40 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all duration-1000" 
              style={{ width: `${node.cpu_usage}%` }}
            />
          </div>
        </div>

        {/* RAM */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3 h-3" />
              <span>Memory Usage</span>
            </div>
            <span className="text-slate-300">{node.ram_usage}%</span>
          </div>
          <div className="w-full bg-slate-800/40 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-purple-500 h-full transition-all duration-1000" 
              style={{ width: `${node.ram_usage}%` }}
            />
          </div>
        </div>

        {/* Storage */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3" />
              <span>Storage</span>
            </div>
            <span className={isDiskCritical ? 'text-red-400' : 'text-slate-300'}>{node.disk_usage_percent || 0}%</span>
          </div>
          <div className="w-full bg-slate-800/40 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${isDiskCritical ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} 
              style={{ width: `${node.disk_usage_percent || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest italic italic-style">Status</span>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-blue-400' : 'text-slate-600'}`}>
          {isOnline ? timeDisplay : 'Offline'}
        </span>
      </div>
    </div>
  );
}
