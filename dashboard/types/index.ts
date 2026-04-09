export interface HistoryPoint {
  cpu_usage: number;
  ram_usage: number;
  cpu_temp?: number;
  recorded_at: string;
}

export interface ProcessInfo {
  command: string;
  cpu: number;
  mem: number;
  user?: string;
  pid?: string;
}

export interface NodeStatus {
  node_name: string;
  cpu_usage: number;
  ram_usage: number;
  cpu_temp?: number;
  git_commits_24h: number;
  last_seen: string;
  latency_ms?: number;
  disk_usage_percent?: number;
  history?: HistoryPoint[];
  last_ai_insight?: string;
  last_ai_timestamp?: string;
  recent_commits?: string[];
  branch_name?: string;
  repo_name?: string;
  git_author?: string;
  github_username?: string;
  os_platform?: string;
  os_distro?: string;
  top_processes?: ProcessInfo[];
  pending_updates?: number;
}

export interface DashboardStats {
  totalCommits: number;
  avgCpu: number;
  efficiency: string;
  activeNodes: number;
  topContributor: string | null;
  activeBranch: string | null;
  activeBranches: string[];
  latestCommit: string | null;
  commitDistribution: { name: string; commits: number }[];
}

export interface AiMetadata {
  fallback?: boolean;
  quotaExceeded?: boolean;
}
