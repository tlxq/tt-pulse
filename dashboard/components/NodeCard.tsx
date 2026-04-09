'use client';

import { NodeStatus } from "@/types";
import { useEffect, useState, Fragment } from "react";
import { HistoryModal } from "./HistoryModal";
import { getRelativeTime, isNodeOnline } from "@/lib/utils";
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
    const checkOnline = () => setIsOnline(isNodeOnline(node.last_seen));
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
              aria-label="View historical trends"
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-500 hover:text-nebula-accent hover:border-nebula-accent/30 hover:bg-nebula-accent/5 transition-all active:scale-90"
            >
              <History className="w-4 h-4" />
            </button>
            {!isOnline && (
              <time
                dateTime={node.last_seen}
                title={new Date(node.last_seen).toLocaleString()}
                className="text-[9px] font-bold text-slate-500 uppercase tracking-tight italic cursor-default"
              >
                Seen {getRelativeTime(node.last_seen)}
              </time>
            )}
          </div>
        </div>

        {isOnline && (
          <NodeGraph
            history={node.history || []}
            isMounted={isMounted}
          />
        )}

        <NodeMetrics
          cpuUsage={node.cpu_usage}
          ramUsage={node.ram_usage}
          cpuTemp={node.cpu_temp}
          diskUsagePercent={node.disk_usage_percent}
          onViewHistory={() => setIsOpen(true)}
          history={node.history}
        />

        <NodeTerminal 
          recentCommits={node.recent_commits}
        />

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
