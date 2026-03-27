'use client';

import { useStatus } from '@/hooks/useStatus';
import { NodeCard } from '@/components/NodeCard';
import {
  Sparkles,
  RefreshCcw,
  GitBranch,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';

export default function Dashboard() {
  const { nodes, loading, refresh } = useStatus();
  const [insight, setInsight] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Calculate Aggregated Household Stats
  const householdStats = useMemo(() => {
    if (nodes.length === 0)
      return { totalCommits: 0, avgCpu: 0, activeNodes: 0 };

    // Global commits: Take the MAX value from all reporting nodes (to avoid double counting same user)
    const totalCommits = Math.max(...nodes.map((n) => n.git_commits_24h || 0));

    // Average Hardware Load
    const avgCpu = Math.round(
      nodes.reduce((acc, n) => acc + n.cpu_usage, 0) / nodes.length,
    );

    // Active nodes (last 10 min)
    const activeNodes = nodes.filter(
      (n) => Date.now() - new Date(n.last_seen).getTime() < 10 * 60 * 1000,
    ).length;

    return { totalCommits, avgCpu, activeNodes };
  }, [nodes]);

  const fetchAI = useCallback(async () => {
    if (nodes.length === 0) return;
    setLoadingAI(true);
    try {
      // Send aggregated household context to the AI
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalCommits: householdStats.totalCommits,
          avgCpu: householdStats.avgCpu,
          nodeCount: nodes.length,
          activeNodes: householdStats.activeNodes,
        }),
        cache: 'no-store',
      });
      const data = await res.json();
      setInsight(data.insight);
    } catch (e) {
      setInsight(
        "I'm sorry, I couldn't reach the global analysis center. Standing by.",
      );
    } finally {
      setLoadingAI(false);
    }
  }, [nodes.length, householdStats]);

  useEffect(() => {
    if (nodes.length > 0 && !insight && !loadingAI) {
      fetchAI();
    }
  }, [nodes.length, insight, loadingAI, fetchAI]);

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto space-y-12 bg-[#020617] text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-500" />
            TT FAMILY'S{' '}
            <span className="text-blue-500 font-light">DIGITAL PULSE</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] ml-11">
            Unified Monitoring System
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              refresh();
              fetchAI();
            }}
            className="p-3 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all active:scale-95"
          >
            <RefreshCcw
              className={`w-5 h-5 text-slate-400 ${loadingAI ? 'animate-spin' : ''}`}
            />
          </button>
          <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Settings className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </header>

      {/* Hero Section: Global Productivity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-10 shadow-2xl shadow-blue-500/10 relative overflow-hidden group">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 text-blue-100/80 font-bold uppercase tracking-widest text-[10px]">
              <GitBranch className="w-4 h-4" />
              Global Household Productivity
            </div>
            <div>
              <div className="text-7xl font-black tracking-tighter mb-2">
                {householdStats.totalCommits}
              </div>
              <p className="text-blue-100/60 text-sm font-medium">
                Commits pushed today across all devices
              </p>
            </div>
            <div className="pt-6 border-t border-white/10 flex gap-12">
              <div>
                <span className="text-[10px] uppercase font-black text-blue-200/50 block mb-1">
                  Average Load
                </span>
                <span className="text-xl font-bold">
                  {householdStats.avgCpu}%
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-blue-200/50 block mb-1">
                  Active Hubs
                </span>
                <span className="text-xl font-bold">
                  {householdStats.activeNodes} / {nodes.length}
                </span>
              </div>
            </div>
          </div>
          {/* Abstract BG Pattern */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute right-10 top-10 w-20 h-20 border border-white/10 rounded-full animate-ping [animation-duration:3s]" />
        </div>

        {/* AI Insight Box (The Butler) */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-8 flex flex-col justify-between backdrop-blur-md">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                TEXAS - The Butler:
              </span>
            </div>
            <div className="text-slate-200 text-lg font-medium leading-relaxed italic italic-style">
              {loadingAI ? (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
              ) : (
                `"${insight || 'Waiting for nodes to report their status, sir.'}"`
              )}
            </div>
          </div>
          <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest pt-6 border-t border-slate-800/40">
            Real-time Autonomous Analysis
          </div>
        </div>
      </section>

      {/* Node Topology */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-6">
          <h2 className="text-xs font-black text-slate-100 uppercase tracking-[0.3em]">
            Device Topology
          </h2>
          <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {nodes.length} Synchronized Nodes
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-64 bg-slate-900/40 rounded-2xl border border-slate-800/60"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nodes.map((node) => (
              <NodeCard key={node.node_name} node={node} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
