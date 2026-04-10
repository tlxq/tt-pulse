'use client';

import { useStatus } from '@/hooks/useStatus';
import { NodeStatus, AiMetadata } from '@/types';
import { getStats } from '@/lib/stats';
import { NodeCard, NodeCardSkeleton } from '@/components/NodeCard';
import { Footer } from '@/components/Footer';
import { RefreshCcw, GitBranch, Zap, TrendingUp } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { SystemBoot } from '@/components/SystemBoot';
import { motion, AnimatePresence } from 'framer-motion';
import { SortableWidget } from '@/components/SortableWidget';
import { DraggableCat } from '@/components/DraggableCat';
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

const STORAGE_KEY_ORDER = 'tt-pulse-widget-order';

interface InsightData {
  text: string;
  speaker: 'texas' | 'gosta';
}

export function DashboardClient({ initialNodes, initialInsight, initialAiMetadata }: { initialNodes: NodeStatus[], initialInsight: string, initialAiMetadata: AiMetadata }) {
  const { nodes: liveNodes, loading, error: statusError, refresh } = useStatus();
  
  // Use initial data if live data is still loading
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

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const hasBooted = sessionStorage.getItem('tt_pulse_booted');
    if (hasBooted) {
      setInitialLoading(false);
    }
    
    // Hydrate from localStorage safely in browser
    const savedSpeaker = localStorage.getItem('tt-pulse-guardian');
    if (savedSpeaker === 'texas' || savedSpeaker === 'gosta') {
      setInsight(prev => ({ ...prev, speaker: savedSpeaker }));
      lastSpeakerRef.current = savedSpeaker;
    }

    const savedOrder = localStorage.getItem(STORAGE_KEY_ORDER);
    if (savedOrder) {
      try {
        setWidgetOrder(JSON.parse(savedOrder));
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
        
        // Alternate speaker
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

        setAiMetadata({
          fallback: data.fallback,
          quotaExceeded: data.quotaExceeded,
        });
      } catch {
        setInsight(prev => ({
          ...prev,
          text: "My whiskers are tingling... something's not right with the studio data.",
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

  // Manage Widget Order
  const allWidgetIds = useMemo(() => {
    const base = ['texas', 'commits', 'momentum', 'gosta'];
    const nodeIds = nodes.map(n => `node-${n.node_name}`);
    
    const combined = [...widgetOrder];
    [...base, ...nodeIds].forEach(id => {
      if (!combined.includes(id)) combined.push(id);
    });
    
    return combined.filter(id => base.includes(id) || nodeIds.includes(id));
  }, [nodes, widgetOrder]);

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

  const isDegraded = aiMetadata.fallback || aiMetadata.quotaExceeded || !!(insight.text && (
    insight.text.includes('Mrow?') || insight.text.includes('gap in the perimeter') || insight.text.includes('Hiss!')
  ));
  const isHighLoad = !!(insight.text && (insight.text.includes('Hiss!') || insight.text.includes('Grrr...')));

  const renderWidget = (id: string) => {
    if (id === 'texas' || id === 'gosta') {
      return (
        <SortableWidget id={id} key={id}>
          <DraggableCat 
            type={id as 'texas' | 'gosta'}
            isDegraded={isDegraded}
            isHighLoad={isHighLoad}
            loading={loadingAI}
            insight={insight.speaker === id ? insight.text : null}
          />
        </SortableWidget>
      );
    }
    if (id === 'commits') {
      return (
        <SortableWidget id="commits" key="commits">
          <div className="bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-[0_0_15px_rgba(139,92,246,0.05)] transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] backdrop-blur-sm flex flex-col h-full min-h-[260px]">
            <div className="relative z-10 space-y-4 mb-4">
              <div className="flex items-center gap-3 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                <GitBranch className="w-4 h-4 text-nebula-accent" /> Daily Commits
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tighter font-mono">
                  {stats.totalCommits}
                </span>
                <span className="text-nebula-accent font-bold text-xs italic uppercase tracking-widest">
                  Logs
                </span>
              </div>
            </div>
            
            <div className="relative z-10 pt-4 border-t border-white/5 mt-auto space-y-4">
              <div className="flex items-start justify-between gap-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1.5">Active</span>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {stats.activeBranches.slice(0, 3).map((branchInfo, idx) => {
                    const [displayPart, remoteUrl] = branchInfo.split('|');
                    return (
                      <a key={idx} href={remoteUrl || '#'} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded-md font-bold tracking-tight bg-nebula-accent/10 border border-nebula-accent/20 text-nebula-accent text-[8px] font-mono">
                        {displayPart}
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Latest Activity</span>
                <p className={`text-[9px] font-medium leading-relaxed italic line-clamp-1 ${stats.latestCommit ? 'text-slate-300' : 'text-slate-600'}`}>
                  {stats.latestCommit ? `"${stats.latestCommit}"` : 'No recent logs detected.'}
                </p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-nebula-accent/5 rounded-full blur-2xl group-hover:bg-nebula-accent/10 transition-colors" />
          </div>
        </SortableWidget>
      );
    }
    if (id === 'momentum') {
      return (
        <SortableWidget id="momentum" key="momentum">
          <div className="bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-[0_0_15px_rgba(139,92,246,0.05)] transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] backdrop-blur-sm flex flex-col h-full min-h-[260px]">
            <div className="relative z-10 space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                  <Zap className="w-4 h-4 text-nebula-accent fill-nebula-accent/20" /> Dev Momentum
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[7px] font-black uppercase tracking-widest ${stats.totalCommits > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-500/10 border-slate-500/20 text-slate-500'}`}>
                   <TrendingUp className="w-2.5 h-2.5" />
                   {stats.totalCommits > 0 ? 'Trending Up' : 'Steady'}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tighter font-mono">
                  {stats.efficiency}
                </span>
                <span className="text-nebula-accent font-bold text-xs italic uppercase tracking-widest">
                  avg/station
                </span>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/5 mt-auto flex flex-col gap-4">
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Top Contributor</span>
                {stats.topContributor ? (
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-nebula-accent/50 bg-black/20 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                      <Image src={`https://github.com/${stats.topContributor}.png`} alt={stats.topContributor} fill sizes="32px" className="object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white uppercase italic tracking-tight leading-none">{stats.topContributor}</span>
                      <span className="text-[8px] font-bold text-nebula-accent uppercase tracking-widest mt-0.5">Leading Sector</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-slate-600">Awaiting active hunting...</span>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                {stats.commitDistribution.length > 0 ? (
                  stats.commitDistribution.slice(0, 3).map((dist, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-nebula-accent" />
                      <span className="text-[10px] font-bold text-slate-400">{dist.name}:</span>
                      <span className="text-[10px] font-black text-white font-mono">{dist.commits}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[9px] font-bold text-slate-600 italic">Distribution pending...</span>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Momentum Trend</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-3 rounded-sm transition-all ${i <= Math.ceil(parseInt(stats.efficiency) / 2) ? 'bg-nebula-accent shadow-[0_0_5px_rgba(139,92,246,0.5)]' : 'bg-white/5'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-nebula-accent/5 rounded-full blur-2xl group-hover:bg-nebula-accent/10 transition-colors pointer-events-none" />
          </div>
        </SortableWidget>
      );
    }
    const nodeName = id.replace('node-', '');
    const node = nodes.find(n => n.node_name === nodeName);
    if (node) {
      return (
        <SortableWidget id={id} key={id}>
          <NodeCard node={node} />
        </SortableWidget>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-nebula-950 text-slate-200 font-sans flex flex-col relative overflow-x-hidden">
      <AnimatePresence mode="wait">
        {initialLoading ? (
          <SystemBoot key="boot" onComplete={handleBootComplete} />
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen relative"
          >
            <div className="fixed inset-0 -z-20 nebula-gradient opacity-40" />
            <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-nebula-accent/10 blur-[140px] rounded-full -z-20" />
            
            <div className="flex flex-col flex-grow relative z-10 w-full px-4 lg:px-8 xl:px-12">
              <header className="py-8 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <Image src="/pulse-icon.png" alt="Studio Icon" width={32} height={32} className="object-contain" />
                  <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">
                    tt family&apos;s <span className="text-nebula-accent font-light">Dev Studio</span>
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  {statusError && (
                    <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-black uppercase tracking-widest animate-pulse">
                      Connection error
                    </div>
                  )}
                  <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing || loadingAI}
                    className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95 group disabled:opacity-50"
                  >
                    <RefreshCcw className={`w-4 h-4 text-slate-500 group-hover:text-nebula-accent ${isRefreshing || loadingAI ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </header>

              <main className="flex-grow pb-12 relative">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={allWidgetIds}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-fr">
                      {allWidgetIds.map(id => renderWidget(id))}
                      
                      {loading && nodes.length === 0 && (
                        [1, 2, 3, 4].map(i => <NodeCardSkeleton key={`skeleton-${i}`} />)
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </main>

              <div className="py-12 shrink-0 relative z-20 border-t border-white/5">
                <Footer />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
