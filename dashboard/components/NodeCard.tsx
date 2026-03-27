import { NodeStatus } from "@/hooks/useStatus";
import { Cpu, HardDrive, Clock, Activity } from "lucide-react";

export function NodeCard({ node }: { node: NodeStatus }) {
  const lastSeenDate = new Date(node.last_seen);
  const isOnline = Date.now() - lastSeenDate.getTime() < 10 * 60 * 1000;

  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-sm hover:border-blue-500/20 transition-all duration-300 shadow-xl shadow-black/20">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-100 tracking-tight">{node.node_name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-600'}`} />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              {isOnline ? 'System Online' : 'System Offline'}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${isOnline ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
          <Activity className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold tracking-wider">CPU Load</span>
            </div>
            <span className={`text-xs font-bold ${node.cpu_usage > 80 ? 'text-red-400' : 'text-slate-300'}`}>{node.cpu_usage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-1000" 
              style={{ width: `${node.cpu_usage}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-slate-500">
              <HardDrive className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold tracking-wider">RAM Usage</span>
            </div>
            <span className="text-xs font-bold text-slate-300">{node.ram_usage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-500 h-full transition-all duration-1000" 
              style={{ width: `${node.ram_usage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between text-slate-500 text-[10px] border-t border-slate-800/40 pt-4 font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>Last Heartbeat</span>
        </div>
        <span className="text-slate-400">{lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
}
