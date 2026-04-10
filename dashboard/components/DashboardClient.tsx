'use client';

import { useStatus } from '@/hooks/useStatus';
import { NodeStatus, AiMetadata } from '@/types';
import { getStats } from '@/lib/stats';
import { isNodeOnline } from '@/lib/utils';
import { NodeCard, NodeCardSkeleton } from '@/components/NodeCard';
import { GuardiansCard } from '@/components/GuardiansCard';
import { GitBranch, Zap, TrendingUp, Terminal, Globe } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { SystemBoot } from '@/components/SystemBoot';
import { motion, AnimatePresence } from 'framer-motion';
import { SortableWidget } from '@/components/SortableWidget';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useRef } from 'react';

const STORAGE_KEY_ORDER = 'tt-pulse-widget-order';
const OLD_IDS = ['texas', 'gosta', 'commits', 'momentum'];

interface InsightData {
  text: string;
  speaker: 'texas' | 'gosta';
}

export function DashboardClient({ initialNodes, initialInsight, initialAiMetadata }: { initialNodes: NodeStatus[], initialInsight: string, initialAiMetadata: AiMetadata }) {
  const { nodes: liveNodes, loading, error: statusError, refresh } = useStatus();

  const nodes = liveNodes.length > 0 ? liveNodes : initialNodes;

  const [insight, setInsight] = useState<InsightData>({
    text: initialInsight || '',
    speaker: 'texas'
  });
  const [loadingAI, setLoadingAI] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [aiMetadata, setAiMetadata] = useState<AiMetadata>(initialAiMetadata || {});
  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);

  const lastSpeakerRef = useRef<'texas' | 'gosta'>(insight.speaker);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const hasBooted = sessionStorage.getItem('tt_pulse_booted');
    if (hasBooted) setInitialLoading(false);

    const savedSpeaker = localStorage.getItem('tt-pulse-guardian');
    if (savedSpeaker === 'texas' || savedSpeaker === 'gosta') {
      setInsight(prev => ({ ...prev, speaker: savedSpeaker }));
      lastSpeakerRef.current = savedSpeaker;
    }

    const savedOrder = localStorage.getItem(STORAGE_KEY_ORDER);
    if (savedOrder) {
      try {
        const parsed: string[] = JSON.parse(savedOrder);
        // Migrate old widget IDs to new ones
        const migrated = parsed.filter(id => !OLD_IDS.includes(id));
        if (!migrated.includes('guardians')) migrated.unshift('guardians');
        if (!migrated.includes('activity')) {
          const idx = migrated.indexOf('guardians');
          migrated.splice(idx + 1, 0, 'activity');
        }
        setWidgetOrder(migrated);
      } catch (e) {
        console.error('Failed to parse widget order', e);
      }
    }
  }, []);

  const handleBootComplete = () => {
    sessionStorage.setItem('tt_pulse_booted', 'true');
    setInitialLoading(false);
  };

  const fetchAI = useCallback(
    async (currentNodes = nodes, force = false) => {
      if (currentNodes.length === 0) return;
      setLoadingAI(true);
      try {
        const allCommits = currentNodes.flatMap((n) => n.recent_commits || []);
        const nextSpeaker = lastSpeakerRef.current === 'texas' ? 'gosta' : 'texas';

        const res = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nodes: currentNodes,
            commits: allCommits.slice(0, 5),
            forceRefresh: force,
            guardian: nextSpeaker,
          }),
          cache: 'no-store',
        });
        const data = await res.json();

        setInsight({ text: data.insight, speaker: nextSpeaker });
        lastSpeakerRef.current = nextSpeaker;
        localStorage.setItem('tt-pulse-guardian', nextSpeaker);
        setAiMetadata({ fallback: data.fallback, quotaExceeded: data.quotaExceeded });
      } catch {
        setInsight(prev => ({
          ...prev,
          text: "Signal lost. Can't reach the insight layer right now.",
        }));
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
    if (nodes.length > 0 && !loadingAI && (!insight.text || insight.text === initialInsight)) {
      fetchAI();
    }
  }, [nodes.length, fetchAI, insight.text, initialInsight, loadingAI]);

  const stats = useMemo(() => getStats(nodes), [nodes]);

  // Derived state from actual node data (not text-matching)
  const isDegraded = !!(aiMetadata.fallback || aiMetadata.quotaExceeded ||
    nodes.some(n => !isNodeOnline(n.last_seen)));
  const isHighLoad = nodes.some(n =>
    n.cpu_usage > 75 || n.ram_usage > 80 || (n.cpu_temp ?? 0) > 80);

  // Sidebar IDs (non-node widgets)
  const sidebarBase = ['guardians', 'activity'];
  const nodeIds = useMemo(() => nodes.map(n => `node-${n.node_name}`), [nodes]);

  const allWidgetIds = useMemo(() => {
    const combined = [...widgetOrder];
    [...sidebarBase, ...nodeIds].forEach(id => {
      if (!combined.includes(id)) combined.push(id);
    });
    return combined.filter(id => sidebarBase.includes(id) || nodeIds.includes(id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, widgetOrder]);

  const sidebarIds = allWidgetIds.filter(id => sidebarBase.includes(id));
  const sortedNodeIds = allWidgetIds.filter(id => id.startsWith('node-'));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgetOrder(() => {
        const oldIndex = allWidgetIds.indexOf(active.id as string);
        const newIndex = allWidgetIds.indexOf(over.id as string);
        const newOrder = arrayMove(allWidgetIds, oldIndex, newIndex);
        localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(newOrder));
        return newOrder;
      });
    }
  };

  const renderSidebarWidget = (id: string) => {
    if (id === 'guardians') {
      return (
        <SortableWidget id="guardians" key="guardians">
          <GuardiansCard
            isDegraded={isDegraded}
            isHighLoad={isHighLoad}
            loading={loadingAI}
            insight={insight}
            onRefresh={handleManualRefresh}
            isRefreshing={isRefreshing || loadingAI}
          />
        </SortableWidget>
      );
    }
    if (id === 'activity') {
      return (
        <SortableWidget id="activity" key="activity">
          <div className="bg-white/5 border border-white/5 rounded-3xl p-4 relative overflow-hidden group shadow-[0_0_15px_rgba(139,92,246,0.05)] transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] backdrop-blur-sm flex flex-col h-full min-h-[220px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2 text-slate-500 font-black uppercase tracking-[0.2em] text-[9px]">
                <Zap className="w-3 h-3 text-nebula-accent fill-nebula-accent/20" />
                Activity
              </div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[7px] font-black uppercase tracking-widest ${stats.totalCommits > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-500/10 border-slate-500/20 text-slate-500'}`}>
                <TrendingUp className="w-2 h-2" />
                {stats.totalCommits > 0 ? 'Trending Up' : 'Steady'}
              </div>
            </div>

            {/* Primary metrics row */}
            <div className="flex items-baseline gap-4 mb-3 shrink-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-white tracking-tighter font-mono">{stats.totalCommits}</span>
                <div className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-nebula-accent" />
                  <span className="text-nebula-accent font-bold text-[9px] italic uppercase tracking-widest">Commits</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1 ml-auto">
                <span className="text-xl font-black text-white tracking-tighter font-mono">{stats.efficiency}</span>
                <span className="text-slate-500 font-bold text-[8px] uppercase tracking-widest">avg/station</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
              {/* Top contributor */}
              {stats.topContributor && (
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border border-nebula-accent/50 bg-black/20 shadow-[0_0_8px_rgba(139,92,246,0.3)] shrink-0">
                    <Image src={`https://github.com/${stats.topContributor}.png`} alt={stats.topContributor} fill sizes="24px" className="object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-white uppercase italic tracking-tight leading-none truncate">{stats.topContributor}</span>
                    <span className="text-[7px] font-bold text-nebula-accent uppercase tracking-widest mt-0.5">Top Contributor</span>
                  </div>
                </div>
              )}

              {/* Commit distribution */}
              {stats.commitDistribution.length > 0 && (
                <div className="flex flex-col gap-1.5 shrink-0">
                  {stats.commitDistribution.slice(0, 3).map((dist, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-nebula-accent shrink-0" />
                      <span className="text-[9px] font-bold text-slate-400 truncate">{dist.name}:</span>
                      <span className="text-[9px] font-black text-white font-mono ml-auto">{dist.commits}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Active branches */}
              {stats.activeBranches.length > 0 && (
                <div className="flex flex-wrap gap-1 shrink-0">
                  {stats.activeBranches.slice(0, 2).map((branchInfo, idx) => {
                    const [displayPart, remoteUrl] = branchInfo.split('|');
                    return (
                      <a key={idx} href={remoteUrl || '#'} target="_blank" rel="noopener noreferrer"
                        className="px-1.5 py-0.5 rounded-md font-bold tracking-tight bg-nebula-accent/10 border border-nebula-accent/20 text-nebula-accent text-[7px] font-mono truncate max-w-[120px]">
                        {displayPart}
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Latest commit */}
              {stats.latestCommit && (
                <p className="text-[9px] font-medium leading-relaxed italic line-clamp-1 text-slate-400 border-t border-white/5 pt-2 shrink-0">
                  &ldquo;{stats.latestCommit}&rdquo;
                </p>
              )}
            </div>

            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-nebula-accent/5 rounded-full blur-2xl group-hover:bg-nebula-accent/10 transition-colors pointer-events-none" />
          </div>
        </SortableWidget>
      );
    }
    return null;
  };

  return (
    <div className="h-screen overflow-hidden bg-nebula-950 text-slate-200 font-sans flex flex-col relative">
      <AnimatePresence mode="wait">
        {initialLoading ? (
          <SystemBoot key="boot" onComplete={handleBootComplete} />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full relative"
          >
            <div className="fixed inset-0 -z-20 nebula-gradient opacity-40" />
            <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-nebula-accent/10 blur-[140px] rounded-full -z-20" />

            {/* Compact header */}
            <header className="py-2 px-4 lg:px-6 flex justify-between items-center shrink-0 relative z-10 border-b border-white/5">
              {/* Left: logo + title */}
              <div className="flex items-center gap-2">
                <Image src="/pulse-icon.png" alt="Studio Icon" width={24} height={24} className="object-contain" />
                <h1 className="text-base font-black tracking-tight text-white uppercase italic">
                  tt family&apos;s <span className="text-nebula-accent font-light">Dev Studio</span>
                </h1>
              </div>

              {/* Right: attribution + status */}
              <div className="flex items-center gap-4">
                {statusError && (
                  <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-black uppercase tracking-widest animate-pulse">
                    Connection error
                  </div>
                )}

                <div className="hidden md:flex items-center gap-4">
                  <a href="https://github.com/thjox" target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-1.5 transition-all">
                    <Terminal className="w-3 h-3 text-slate-600 group-hover:text-nebula-accent transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-300">thjox</span>
                  </a>
                  <a href="https://github.com/tlxq" target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-1.5 transition-all">
                    <Terminal className="w-3 h-3 text-slate-600 group-hover:text-nebula-accent transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-300">tlxq</span>
                  </a>
                  <div className="h-3 w-px bg-white/10" />
                  <a href="https://ttdevs.com" target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-1.5 px-2.5 py-1 bg-nebula-accent/5 border border-nebula-accent/10 rounded-lg hover:bg-nebula-accent/10 hover:border-nebula-accent/30 transition-all active:scale-95">
                    <Globe className="w-3 h-3 text-nebula-accent" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-nebula-accent">ttdevs.com</span>
                  </a>
                  <div className="h-3 w-px bg-white/10" />
                  <span className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-700">v1.2</span>
                </div>
              </div>
            </header>

            {/* Main fullscreen area */}
            <main className="flex-1 min-h-0 px-4 lg:px-5 xl:px-6 pt-4 pb-0 relative z-10">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="flex gap-4 h-full">
                  {/* Left sidebar */}
                  <div className="w-[288px] xl:w-[308px] shrink-0 flex flex-col gap-4 overflow-y-auto pb-4 px-0.5 pt-0.5">
                    <SortableContext items={sidebarIds} strategy={rectSortingStrategy}>
                      {sidebarIds.map(id => renderSidebarWidget(id))}
                    </SortableContext>
                  </div>

                  {/* Node grid */}
                  <div className="flex-1 min-w-0 overflow-y-auto pb-4 px-0.5 pt-0.5">
                    <SortableContext items={sortedNodeIds} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 auto-rows-fr h-full">
                        {sortedNodeIds.map(id => {
                          const nodeName = id.replace('node-', '');
                          const node = nodes.find(n => n.node_name === nodeName);
                          if (!node) return null;
                          return (
                            <SortableWidget id={id} key={id}>
                              <NodeCard node={node} />
                            </SortableWidget>
                          );
                        })}
                        {loading && nodes.length === 0 && (
                          [1, 2, 3, 4].map(i => <NodeCardSkeleton key={`skeleton-${i}`} />)
                        )}
                      </div>
                    </SortableContext>
                  </div>
                </div>
              </DndContext>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
