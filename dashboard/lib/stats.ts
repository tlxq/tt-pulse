import { NodeStatus, DashboardStats } from "@/types";

export function getStats(currentNodes: NodeStatus[]): DashboardStats {
  if (currentNodes.length === 0) {
    return {
      totalCommits: 0,
      avgCpu: 0,
      efficiency: "0",
      activeNodes: 0,
      topContributor: null,
      activeBranch: null,
      activeBranches: [],
      latestCommit: null,
      commitDistribution: [],
    };
  }

  const totalCommits = currentNodes.reduce(
    (acc, n) => acc + (n.git_commits_24h || 0),
    0
  );
  const avgCpu = Math.round(
    currentNodes.reduce((acc, n) => acc + n.cpu_usage, 0) / currentNodes.length
  );
  const activeNodes = currentNodes.filter(
    (n) => Date.now() - new Date(n.last_seen).getTime() < 10 * 60 * 1000
  ).length;
  const efficiency =
    avgCpu > 0 ? (totalCommits / avgCpu).toFixed(2) : totalCommits.toString();

  // Top Contributor & Branch detection
  const topNode = [...currentNodes].sort(
    (a, b) => (b.git_commits_24h || 0) - (a.git_commits_24h || 0)
  )[0];
  const topContributor =
    topNode && (topNode.git_commits_24h || 0) > 0
      ? topNode.github_username || topNode.git_author || topNode.node_name
      : null;

  const activeBranch =
    topNode && topNode.branch_name ? topNode.branch_name : null;
  const latestCommit = topNode?.recent_commits?.[0] || null;

  // Parse active branches into an array for cleaner rendering
  const activeBranches = activeBranch
    ? activeBranch
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "unknown" && s !== "")
    : [];

  // Fallback for any legacy use - extract only the branch name (part before |)
  const cleanActiveBranch = activeBranch
    ? activeBranch.split(",")[0].split("|")[0]
    : null;

  // Commit Distribution
  const commitDistribution = currentNodes
    .filter((n) => (n.git_commits_24h || 0) > 0)
    .map((n) => ({ name: n.node_name, commits: n.git_commits_24h }))
    .sort((a, b) => b.commits - a.commits);

  return {
    totalCommits,
    avgCpu,
    efficiency,
    activeNodes,
    topContributor,
    activeBranch: cleanActiveBranch,
    activeBranches,
    latestCommit,
    commitDistribution,
  };
}
