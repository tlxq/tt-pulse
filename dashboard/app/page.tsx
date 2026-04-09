import { supabase } from '@/lib/supabase';
import { NodeStatus, AiMetadata } from '@/types';
import { DashboardClient } from '@/components/DashboardClient';
import { getInsight, NodeData } from '@/lib/insights';
import { isNodeOnline } from '@/lib/utils';
import { RECENT_COMMITS_LIMIT } from '@/lib/constants';
import { fetchNodeHistory } from '@/lib/history';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      history: await fetchNodeHistory(node.node_name),
    }))
  );

  // Generate initial insight
  const allCommits = nodesWithHistory.flatMap((n) => n.recent_commits || []);
  const mappedNodes: NodeData[] = nodesWithHistory.map((n) => ({
    name: n.node_name,
    cpu: n.cpu_usage ?? 0,
    ram: n.ram_usage ?? 0,
    temp: n.cpu_temp ?? 0,
    online: n.last_seen ? isNodeOnline(n.last_seen) : false,
    git_commits_24h: n.git_commits_24h ?? 0,
  }));

  const insight = getInsight(mappedNodes, allCommits.slice(0, RECENT_COMMITS_LIMIT));

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
