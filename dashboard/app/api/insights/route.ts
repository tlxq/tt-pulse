import { NextResponse } from 'next/server';
import { getInsight, NodeData } from '@/lib/insights';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nodes, commits } = body as { nodes: { node_name?: string, name?: string, cpu_usage?: number, ram_usage?: number, cpu_temp?: number, last_seen?: string, online?: boolean, git_commits_24h?: number }[], commits: string[] };

    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return NextResponse.json({ insight: "The studio is silent. Waiting for the first station to report for duty." });
    }

    const mappedNodes: NodeData[] = nodes.map((n) => {
      const lastSeen = n.last_seen ? new Date(n.last_seen).getTime() : 0;
      const isOnline = lastSeen ? (Date.now() - lastSeen) / 60000 < 10 : false;
      return {
        name: n.node_name || n.name || 'unknown',
        cpu: n.cpu_usage ?? 0,
        ram: n.ram_usage ?? 0,
        temp: n.cpu_temp ?? 0,
        online: typeof n.online === 'boolean' ? n.online : isOnline,
        git_commits_24h: n.git_commits_24h ?? 0
      };
    });

    const insight = getInsight(mappedNodes, commits || []);

    return NextResponse.json({
      insight,
      local: true,
      mascot: 'Bengal'
    });
  } catch (error) {
    console.error('[API Error] Insights failed:', error);
    return NextResponse.json({
      insight: "My whiskers are tingling... something's not right with the studio data."
    });
  }
}
