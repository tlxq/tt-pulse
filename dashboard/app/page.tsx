'use client';

import { useStatus } from '@/hooks/useStatus';
import { NodeCard } from '@/components/NodeCard';
import {
  Sparkles,
  RefreshCcw,
  GitBranch,
  LayoutDashboard,
  Settings,
  Zap,
} from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';

export default function Dashboard() {
  const { nodes, loading, refresh } = useStatus();
  const [insight, setInsight] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  const stats = useMemo(() => {
    if (nodes.length === 0)
      return { totalCommits: 0, avgCpu: 0, efficiency: 0, activeNodes: 0 };

    const totalCommits = Math.max(...nodes.map((n) => n.git_commits_24h || 0));
    const avgCpu = Math.round(
      nodes.reduce((acc, n) => acc + n.cpu_usage, 0) / nodes.length,
    );
    const activeNodes = nodes.filter(
      (n) => Date.now() - new Date(n.last_seen).getTime() < 10 * 60 * 1000,
    ).length;

    // Efficiency: Commits / Avg CPU Load (higher is better)
    const efficiency =
      avgCpu > 0 ? (totalCommits / avgCpu).toFixed(2) : totalCommits;

    return { totalCommits, avgCpu, efficiency, activeNodes };
  }, [nodes]);

  const fetchAI = useCallback(async () => {
    if (nodes.length === 0) return;
    setLoadingAI(true);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalCommits: stats.totalCommits,
          avgCpu: stats.avgCpu,
          efficiency: stats.efficiency,
          nodes: nodes.map((n) => ({
            name: n.node_name,
            latency: n.latency_ms,
            storage: n.disk_usage_percent,
          })),
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
  }, [nodes, stats]);

  useEffect(() => {
    if (nodes.length > 0 && !insight && !loadingAI) {
      fetchAI();
    }
  }, [nodes.length, insight, loadingAI, fetchAI]);

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto space-y-12 bg-[#020617] text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 italic italic-style">
            <LayoutDashboard className="w-8 h-8 text-blue-500" />
            TT FAMILY HOUSEHOLD{' '}
            <span className="text-blue-500 font-light">DIGITAL PULSE</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] ml-11">
            Advanced Distributed Monitoring
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

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-10 shadow-2xl shadow-blue-500/10 relative overflow-hidden group">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 text-blue-100/80 font-bold uppercase tracking-widest text-[10px]">
              <GitBranch className="w-4 h-4" /> Global Household Productivity
            </div>
            <div className="flex items-end gap-6">
              <div className="text-8xl font-black tracking-tighter mb-2">
                {stats.totalCommits}
              </div>
              <div className="mb-4 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                <span className="text-[10px] uppercase font-black text-blue-200 block mb-1">
                  Efficiency Score
                </span>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-xl font-bold tracking-tight">
                    {stats.efficiency}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-blue-100/60 text-sm font-medium">
              Commits per CPU-load across {stats.activeNodes} active hubs
            </p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
        </div>

        <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-8 flex flex-col justify-between backdrop-blur-md">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Texas - The Butler
              </span>
            </div>
            <div className="text-slate-200 text-lg font-medium leading-relaxed italic italic-style tracking-tight">
              {loadingAI
                ? 'Analyzing telemetry, sir...'
                : `"${insight || 'Waiting for signal, sir...'}"`}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-6">
          <h2 className="text-xs font-black text-slate-100 uppercase tracking-[0.3em] italic italic-style">
            Infrastructure Topology
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {nodes.map((node) => (
            <NodeCard key={node.node_name} node={node} />
          ))}
        </div>
      </section>
    </main>
  );
}
