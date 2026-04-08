'use client';

import { useStatus, NodeStatus } from '@/hooks/useStatus';
import { NodeCard } from '@/components/NodeCard';
import { SREInsight } from '@/components/SREInsight';
import { Footer } from '@/components/Footer';
import { RefreshCcw, GitBranch, Zap, LayoutGrid, TrendingUp, Crown } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { SystemBoot } from '@/components/SystemBoot';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardStats {
  totalCommits: number;
  avgCpu: number;
  efficiency: string;
  activeNodes: number;
  topContributor: string | null;
  activeBranch: string | null;
  latestCommit: string | null;
  commitDistribution: { name: string; commits: number }[];
}

export default function Dashboard() {
  const { nodes, loading, refresh } = useStatus();
  const [insight, setInsight] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [aiMetadata, setAiMetadata] = useState<{
    fallback?: boolean;
    quotaExceeded?: boolean;
  }>({});

  const getStats = useCallback((currentNodes: NodeStatus[]): DashboardStats => {
    if (currentNodes.length === 0)
      return { totalCommits: 0, avgCpu: 0, efficiency: '0', activeNodes: 0, topContributor: null, activeBranch: null, latestCommit: null, commitDistribution: [] };
    
    const totalCommits = currentNodes.reduce((acc, n) => acc + (n.git_commits_24h || 0), 0);
    const avgCpu = Math.round(
      currentNodes.reduce((acc, n) => acc + n.cpu_usage, 0) /
        currentNodes.length,
    );
    const activeNodes = currentNodes.filter(
      (n) => Date.now() - new Date(n.last_seen).getTime() < 10 * 60 * 1000,
    ).length;
    const efficiency =
      avgCpu > 0 ? (totalCommits / avgCpu).toFixed(2) : totalCommits.toString();

    // Top Contributor & Branch detection
    const topNode = [...currentNodes].sort((a, b) => (b.git_commits_24h || 0) - (a.git_commits_24h || 0))[0];
    const topContributor = topNode && (topNode.git_commits_24h || 0) > 0 
        ? (topNode.github_username || topNode.git_author || topNode.node_name) 
        : null;
        
    const activeBranch = topNode && topNode.branch_name ? `${topNode.repo_name || 'project'} / ${topNode.branch_name}` : null;
    const latestCommit = topNode?.recent_commits?.[0] || null;

    // Commit Distribution
    const commitDistribution = currentNodes
        .filter(n => (n.git_commits_24h || 0) > 0)
        .map(n => ({ name: n.node_name, commits: n.git_commits_24h }))
        .sort((a, b) => b.commits - a.commits);

    return { totalCommits, avgCpu, efficiency, activeNodes, topContributor, activeBranch, latestCommit, commitDistribution };
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
      } catch {
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
    <div className="min-h-screen bg-nebula-950 text-slate-200 font-sans flex flex-col relative overflow-hidden">
      <AnimatePresence mode="wait">
        {initialLoading ? (
          <SystemBoot key="boot" onComplete={() => setInitialLoading(false)} />
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col min-h-screen"
          >
            {/* Background Ambient Glows */}
            <div className="fixed inset-0 -z-10 nebula-gradient opacity-40" />
            <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-nebula-accent/20 blur-[140px] rounded-full -z-10 animate-pulse-glow" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-nebula-secondary/10 blur-[120px] rounded-full -z-10" />
            
            {/* Scanline / Grid Effect */}
            <div className="fixed inset-0 -z-5 bg-[linear-gradient(rgba(18,16,33,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />

            <main className="p-6 md:p-12 max-w-7xl mx-auto space-y-10 flex-grow w-full relative z-10">
              {/* Global Header */}
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="bg-nebula-accent/20 p-2 rounded-xl border border-nebula-accent/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                      <Image
                        src="/pulse-icon.png"
                        alt="Studio Icon"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">
                      tt family&apos;s{' '}
                      <span className="text-nebula-accent font-light">Dev Studio</span>
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
                    className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95 group disabled:opacity-50 backdrop-blur-md"
                  >
                    <RefreshCcw
                      className={`w-4 h-4 text-slate-500 group-hover:text-nebula-accent ${isRefreshing || loadingAI ? 'animate-spin' : ''}`}
                    />
                  </button>
                </div>
              </header>

              {/* Global Stats Grid */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 relative overflow-hidden group shadow-[0_0_15px_rgba(139,92,246,0.05)] transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] backdrop-blur-sm flex flex-col min-h-[240px]">
                  <div className="relative z-10 space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                      <GitBranch className="w-4 h-4 text-nebula-accent" /> Daily Commits
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white tracking-tighter font-mono">
                        {stats.totalCommits}
                      </span>
                      <span className="text-nebula-accent font-bold text-sm italic uppercase tracking-widest">
                        Logs
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative z-10 pt-4 border-t border-white/5 mt-auto space-y-4">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-black uppercase tracking-widest text-slate-500">Active Branch</span>
                      <span className={`px-2 py-0.5 rounded-md font-black uppercase tracking-tighter ${stats.activeBranch ? 'bg-nebula-accent/10 border border-nebula-accent/20 text-nebula-accent' : 'bg-white/5 text-slate-600'}`}>
                        {stats.activeBranch || 'waiting...'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Latest Activity</span>
                      <p className={`text-[10px] font-medium leading-relaxed italic line-clamp-1 ${stats.latestCommit ? 'text-slate-300' : 'text-slate-600'}`}>
                        {stats.latestCommit ? `"${stats.latestCommit}"` : 'No recent logs detected in this session.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5">
                       <div className="flex flex-wrap gap-4">
                         {stats.commitDistribution.length > 0 ? (
                           stats.commitDistribution.map((dist, idx) => (
                             <div key={idx} className="flex items-center gap-1.5">
                               <div className="w-1 h-1 rounded-full bg-nebula-accent" />
                               <span className="text-[10px] font-bold text-slate-400">{dist.name}:</span>
                               <span className="text-[10px] font-black text-white font-mono">{dist.commits}</span>
                             </div>
                           ))
                         ) : (
                           <span className="text-[10px] font-bold text-slate-600 italic">Distribution pending...</span>
                         )}
                       </div>
                    </div>
                  </div>
                  
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-nebula-accent/5 rounded-full blur-2xl group-hover:bg-nebula-accent/10 transition-colors" />
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 relative overflow-hidden group shadow-[0_0_15px_rgba(139,92,246,0.05)] transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] backdrop-blur-sm flex flex-col min-h-[240px]">
                  <div className="relative z-10 space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                        <Zap className="w-4 h-4 text-nebula-accent fill-nebula-accent/20" /> Dev Momentum
                      </div>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${stats.totalCommits > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-500/10 border-slate-500/20 text-slate-500'}`}>
                         <TrendingUp className="w-2.5 h-2.5" />
                         {stats.totalCommits > 0 ? 'Trending Up' : 'Steady'}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white tracking-tighter font-mono">
                        {stats.efficiency}
                      </span>
                      <span className="text-nebula-accent font-bold text-sm italic uppercase tracking-widest">
                        Score
                      </span>
                    </div>
                  </div>

                    <div className="pt-4 border-t border-white/5 mt-auto space-y-4">
                    <div className="flex items-center justify-between group/contributor">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Top Contributor</span>
                        <div className="flex items-center gap-3">
                          {stats.topContributor ? (
                            <>
                              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-nebula-accent/50 shadow-[0_0_10px_rgba(139,92,246,0.3)] bg-black/20">
                                <Image 
                                  src={`https://github.com/${stats.topContributor}.png`}
                                  alt={stats.topContributor}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-white uppercase italic tracking-tight leading-none">{stats.topContributor}</span>
                                <span className="text-[8px] font-bold text-nebula-accent uppercase tracking-widest mt-0.5">Leading Sector</span>
                              </div>
                            </>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-600">Awaiting active hunting...</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Momentum Trend</span>
                       <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div 
                              key={i} 
                              className={`w-1.5 h-3 rounded-sm transition-all ${i <= (parseFloat(stats.efficiency) * 10) ? 'bg-nebula-accent shadow-[0_0_5px_rgba(139,92,246,0.5)]' : 'bg-white/5'}`} 
                            />
                          ))}
                       </div>
                    </div>
                  </div>

                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-nebula-accent/5 rounded-full blur-2xl group-hover:bg-nebula-accent/10 transition-colors" />
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
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-4 h-4 text-nebula-accent" />
                    <h2 className="text-xs font-black text-white uppercase tracking-[0.4em]">
                      Active Workstations
                    </h2>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-64 bg-white/5 rounded-3xl border border-white/5 animate-pulse"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
