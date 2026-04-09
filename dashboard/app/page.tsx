import { supabase } from '@/lib/supabase';
import { NodeStatus, HistoryPoint, AiMetadata } from '@/types';
import { DashboardClient } from '@/components/DashboardClient';
import { getInsight, NodeData } from '@/lib/insights';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchHistory(nodeName: string): Promise<HistoryPoint[]> {
  const { data, error } = await supabase
    .from('node_history')
    .select('cpu_usage, ram_usage, cpu_temp, recorded_at')
    .eq('node_name', nodeName)
    .order('recorded_at', { ascending: false })
    .limit(20);

  if (error || !data) return [];
  return data.reverse();
}

async function getInitialData() {
  const { data: nodes, error } = await supabase
    .from('node_status')
    .select('*')
    .order('node_name');

  if (error || !nodes) return { nodes: [], insight: '', aiMetadata: {} };

  // Fetch history for all nodes in parallel
  const nodesWithHistory: NodeStatus[] = await Promise.all(
    nodes.map(async (node) => ({
      ...node,
      history: await fetchHistory(node.node_name)
    }))
  );

  // Generate initial insight
  const allCommits = nodesWithHistory.flatMap((n) => n.recent_commits || []);
  const mappedNodes: NodeData[] = nodesWithHistory.map((n) => {
    const lastSeen = n.last_seen ? new Date(n.last_seen).getTime() : 0;
    const isOnline = lastSeen ? (Date.now() - lastSeen) / 60000 < 10 : false;
    return {
      name: n.node_name,
      cpu: n.cpu_usage ?? 0,
      ram: n.ram_usage ?? 0,
      temp: n.cpu_temp ?? 0,
      online: isOnline,
      git_commits_24h: n.git_commits_24h ?? 0
    };
  });

  const insight = getInsight(mappedNodes, allCommits.slice(0, 5));

  return { 
    nodes: nodesWithHistory, 
    insight, 
    aiMetadata: { fallback: false } as AiMetadata 
  };
}

export default async function Page() {
  const { nodes, insight, aiMetadata } = await getInitialData();

  return (
    <DashboardClient 
      initialNodes={nodes} 
      initialInsight={insight} 
      initialAiMetadata={aiMetadata} 
    />
  );
}
