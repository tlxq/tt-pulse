'use client';

import { NodeStatus } from "@/types";
import { useEffect, useState, Fragment } from "react";
import { HistoryModal } from "./HistoryModal";
import { getRelativeTime } from "@/lib/utils";
import { Card } from "@tremor/react";
import { History } from "lucide-react";
import { NodeHeader } from "./node-card/NodeHeader";
import { NodeGraph } from "./node-card/NodeGraph";
import { NodeMetrics } from "./node-card/NodeMetrics";
import { NodeTerminal } from "./node-card/NodeTerminal";

export { NodeCardSkeleton } from "./node-card/NodeCardSkeleton";

export function NodeCard({ node }: { node: NodeStatus }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { 
    const checkOnline = () => {
      const lastSeenDate = new Date(node.last_seen);
      const diffMinutes = (Date.now() - lastSeenDate.getTime()) / 60000;
      setIsOnline(diffMinutes < 15);
    };

    checkOnline();
    const interval = setInterval(checkOnline, 30000);
    return () => clearInterval(interval);
  }, [node.last_seen]);

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
        
        <div className="flex justify-between items-start">
          <NodeHeader 
            nodeName={node.node_name}
            osPlatform={node.os_platform}
            osDistro={node.os_distro}
            latencyMs={node.latency_ms}
            isOnline={isOnline}
            githubUsername={node.github_username}
          />

          <div className="flex flex-col items-end gap-3 p-4">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-500 hover:text-nebula-accent hover:border-nebula-accent/30 hover:bg-nebula-accent/5 transition-all active:scale-90"
              title="View Historical Trends"
            >
              <History className="w-4 h-4" />
            </button>
            {!isOnline && (
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight italic">
                Seen {getRelativeTime(node.last_seen)}
              </span>
            )}
          </div>
        </div>

        <NodeGraph 
          history={node.history || []}
          isMounted={isMounted}
        />

        <NodeMetrics 
          cpuUsage={node.cpu_usage}
          ramUsage={node.ram_usage}
          cpuTemp={node.cpu_temp}
          diskUsagePercent={node.disk_usage_percent}
          onViewHistory={() => setIsOpen(true)}
        />

        <NodeTerminal 
          recentCommits={node.recent_commits}
        />

        <div className="mt-8 border-t border-white/5 pt-6 text-[10px] font-bold text-slate-600 uppercase tracking-tighter italic relative z-10">
          Sync status: Verified
        </div>
      </Card>

      <HistoryModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        nodeName={node.node_name} 
        history={node.history || []} 
      />
    </Fragment>
  );
}
