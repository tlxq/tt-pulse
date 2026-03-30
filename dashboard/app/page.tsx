'use client';

import { useStatus } from '@/hooks/useStatus';
import { NodeCard } from '@/components/NodeCard';
import { SREInsight } from '@/components/SREInsight';
import { Footer } from '@/components/Footer';
import { RefreshCcw, GitBranch, Zap, LayoutGrid } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';

export default function Dashboard() {
  const { nodes, loading, refresh } = useStatus();
  const [insight, setInsight] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [aiMetadata, setAiMetadata] = useState<{
    fallback?: boolean;
    quotaExceeded?: boolean;
  }>({});

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
      avgCpu > 0 ? (totalCommits / avgCpu).toFixed(2) : totalCommits.toString();
    return { totalCommits, avgCpu, efficiency, activeNodes };
  }, []);

  const fetchAI = useCallback(
    async (currentNodes = nodes, force = false) => {
      if (currentNodes.length === 0) return;

      const firstWithInsight = currentNodes.find((n) => n.last_ai_insight);
      if (!force && firstWithInsight?.last_ai_insight) {
        setInsight(firstWithInsight.last_ai_insight);
        return;
      }

      setLoadingAI(true);
      try {
        const allCommits = currentNodes.flatMap((n) => n.recent_commits || []);
        const res = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nodes: currentNodes,
            commits: allCommits.slice(0, 5),
            forceRefresh: force,
          }),
          cache: 'no-store',
        });
        const data = await res.json();

        setInsight(data.insight);
        setAiMetadata({
          fallback: data.fallback,
          quotaExceeded: data.quotaExceeded,
        });
      } catch (e) {
        setInsight(
          "My whiskers are tingling... something's not right with the studio data.",
        );
      } finally {
        setLoadingAI(false);
      }
    },
    [nodes],
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
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex flex-col">
      <main className="p-6 md:p-12 max-w-7xl mx-auto space-y-10 flex-grow w-full">
        {/* Global Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-amber-600/20 p-2 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <img
                  src="/pulse-icon.png"
                  alt="Studio Icon"
                  className="w-9 h-9 object-contain"
                />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">
                tt family's{' '}
                <span className="text-amber-500 font-light">Dev Studio</span>
              </h1>
            </div>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] ml-12">
              Professional Development • Family Owned
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing || loadingAI}
              className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all active:scale-95 group disabled:opacity-50"
            >
              <RefreshCcw
                className={`w-4 h-4 text-slate-500 group-hover:text-amber-400 ${isRefreshing || loadingAI ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </header>

        {/* Global Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#0f172a]/40 border border-slate-800/60 rounded-3xl p-8 relative overflow-hidden group shadow-[0_0_15px_rgba(245,158,11,0.05)] transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                <GitBranch className="w-4 h-4 text-amber-500" /> Daily Commits
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tracking-tighter font-mono">
                  {stats.totalCommits}
                </span>
                <span className="text-amber-500 font-bold text-sm italic">
                  Logs
                </span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-600/5 rounded-full blur-2xl group-hover:bg-amber-600/10 transition-colors" />
          </div>

          <div className="bg-[#0f172a]/40 border border-slate-800/60 rounded-3xl p-8 relative overflow-hidden group shadow-[0_0_15px_rgba(245,158,11,0.05)] transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" /> Dev
                Momentum
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tracking-tighter font-mono">
                  {stats.efficiency}
                </span>
                <span className="text-amber-500 font-bold text-sm italic">
                  Score
                </span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-600/5 rounded-full blur-2xl group-hover:bg-amber-600/10 transition-colors" />
          </div>

          <SREInsight
            insight={insight}
            loading={loadingAI}
            fallback={aiMetadata.fallback}
            quotaExceeded={aiMetadata.quotaExceeded}
          />
        </section>

        {/* Monitored Stations */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800/40 pb-6">
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-black text-white uppercase tracking-[0.4em]">
                Active Workstations
              </h2>
            </div>
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">
              {nodes.length} Stations Online
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
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
      <Footer />
    </div>
  );
}
