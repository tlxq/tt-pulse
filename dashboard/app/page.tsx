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
  LayoutGrid,
} from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';

export default function Dashboard() {
  const { nodes, loading, refresh } = useStatus();
  const [insight, setInsight] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStats = useCallback((currentNodes: any[]) => {
    if (currentNodes.length === 0)
      return { totalCommits: 0, avgCpu: 0, efficiency: 0, activeNodes: 0 };
    const totalCommits = Math.max(
      ...currentNodes.map((n) => n.git_commits_24h || 0),
    );
    const avgCpu = Math.round(
      currentNodes.reduce((acc, n) => acc + n.cpu_usage, 0) /
        currentNodes.length,
    );
    const activeNodes = currentNodes.filter(
      (n) => Date.now() - new Date(n.last_seen).getTime() < 10 * 60 * 1000,
    ).length;
    const efficiency =
      avgCpu > 0 ? (totalCommits / avgCpu).toFixed(2) : totalCommits;
    return { totalCommits, avgCpu, efficiency, activeNodes };
  }, []);

  const fetchAI = useCallback(
  async (currentNodes = nodes, force = false) => {
    if (currentNodes.length === 0) return;

    // If we have a fresh cache and not forcing, don't show loading spinner
    const firstWithInsight = currentNodes.find(n => n.last_ai_insight);
    if (!force && firstWithInsight) {
      setInsight(firstWithInsight.last_ai_insight);
      return;
    }

    setLoadingAI(true);
    const stats = getStats(currentNodes);

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalCommits: stats.totalCommits,
          avgCpu: stats.avgCpu,
          efficiency: stats.efficiency,
          forceRefresh: force,
          nodes: currentNodes.map((n) => ({
            name: n.node_name,
            cpu: n.cpu_usage,
            ram: n.ram_usage,
            latency: n.latency_ms,
            storage: n.disk_usage_percent,
            recent_commits: n.recent_commits,
            last_ai_insight: n.last_ai_insight,
            last_ai_timestamp: n.last_ai_timestamp,
            online:
              Date.now() - new Date(n.last_seen).getTime() < 10 * 60 * 1000,
          })),
        }),
        cache: 'no-store',
      });
      const data = await res.json();
      setInsight(data.insight);
    } catch (e) {
      setInsight(
        "The technical circuits are humming, but my analytical synthesis is momentarily offline, sir.",
      );
    } finally {
      setLoadingAI(false);
    }
  },
  [nodes.length, getStats],
  );

  const handleManualRefresh = async () => {
  setIsRefreshing(true);
  const freshNodes = await refresh();
  await fetchAI(freshNodes, true);
  setTimeout(() => setIsRefreshing(false), 500);
  };
  useEffect(() => {
    if (nodes.length > 0 && !insight && !loadingAI) {
      fetchAI();
    }
  }, [nodes.length, insight, loadingAI, fetchAI]);

  const stats = useMemo(() => getStats(nodes), [nodes, getStats]);

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto space-y-10 bg-[#020617] text-slate-200">
      {/* Global Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-xl border border-blue-500/20">
              <LayoutDashboard className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase italic italic-style">
              tt family's Household{' '}
              <span className="text-blue-500 font-light">Digital Pulse</span>
            </h1>
          </div>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] ml-12">
            Global Monitoring Unified
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing || loadingAI}
            className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all active:scale-95 group disabled:opacity-50"
          >
            <RefreshCcw
              className={`w-4 h-4 text-slate-500 group-hover:text-blue-400 ${isRefreshing || loadingAI ? 'animate-spin' : ''}`}
            />
          </button>
          <div className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl">
            <Settings className="w-4 h-4 text-slate-600" />
          </div>
        </div>
      </header>

      {/* Global Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0f172a]/40 border border-slate-800/60 rounded-3xl p-8 relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
              <GitBranch className="w-4 h-4 text-blue-500" /> Collective Commits
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tighter">
                {stats.totalCommits}
              </span>
              <span className="text-blue-500 font-bold text-sm italic italic-style">
                24h
              </span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-colors" />
        </div>

        <div className="bg-[#0f172a]/40 border border-slate-800/60 rounded-3xl p-8 relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
              <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />{' '}
              Household Efficiency
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tighter">
                {stats.efficiency}
              </span>
              <span className="text-yellow-500 font-bold text-sm italic italic-style">
                Score
              </span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-yellow-600/5 rounded-full blur-2xl group-hover:bg-yellow-600/10 transition-colors" />
        </div>

        <div className="bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/40 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden group">
          <div className="relative z-10 space-y-4 h-full flex flex-col justify-between">
            <div className="flex items-center gap-3 text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]">
              <Sparkles className="w-4 h-4" /> Texas - The Butler
            </div>
            <div className="text-slate-300 text-sm font-medium leading-relaxed italic italic-style tracking-wide py-2 min-h-[60px]">
              {loadingAI ? (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              ) : (
                `"${insight || 'Waiting for signal, sir.'}"`
              )}
            </div>
            <div className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] border-t border-slate-800/60 pt-4 mt-auto">
              Autonomous Insight Engine
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure Topology */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-6">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-4 h-4 text-blue-500" />
            <h2 className="text-xs font-black text-white uppercase tracking-[0.4em]">
              Infrastructure Topology
            </h2>
          </div>
          <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {nodes.length} Connected Nodes
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-64 bg-slate-900/40 rounded-3xl border border-slate-800/60 animate-pulse"
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
