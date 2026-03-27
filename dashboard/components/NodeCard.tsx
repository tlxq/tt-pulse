import { NodeStatus } from "@/hooks/useStatus";
import { Cpu, HardDrive, GitCommit, Clock } from "lucide-react";

export function NodeCard({ node }: { node: NodeStatus }) {
  const lastSeenDate = new Date(node.last_seen);
  // Online if heartbeated in the last 10 minutes
  const isOnline = Date.now() - lastSeenDate.getTime() < 10 * 60 * 1000;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-100">{node.node_name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-600'}`} />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700">
          <Cpu className="w-5 h-5 text-blue-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">CPU Load</span>
          <div className="text-2xl font-bold text-slate-100">{node.cpu_usage}%</div>
        </div>

        <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">RAM Usage</span>
          <div className="text-2xl font-bold text-slate-100">{node.ram_usage}%</div>
        </div>
      </div>

      <div className="mt-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800/50 flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-400">
          <GitCommit className="w-4 h-4" />
          <span className="text-[10px] uppercase font-bold">Git Commits (24h)</span>
        </div>
        <span className="text-sm font-bold text-blue-400">{node.git_commits_24h}</span>
      </div>

      <div className="mt-6 flex items-center justify-between text-slate-500 text-[10px] border-t border-slate-800/50 pt-4 font-medium uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span>Last Pulse</span>
        </div>
        <span>{lastSeenDate.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
