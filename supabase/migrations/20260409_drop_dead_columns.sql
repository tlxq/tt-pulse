-- Drop dead columns from node_status
-- git_commits: removed from agent, superseded by git_commits_24h
-- last_ai_insight / last_ai_timestamp: orphaned from old Gemini integration, nothing writes to them
-- os_kernel: collected by agent but not in TypeScript type and never displayed
ALTER TABLE public.node_status
  DROP COLUMN IF EXISTS git_commits,
  DROP COLUMN IF EXISTS last_ai_insight,
  DROP COLUMN IF EXISTS last_ai_timestamp,
  DROP COLUMN IF EXISTS os_kernel;

-- Drop never-read columns from node_history
-- latency_ms, disk_usage_percent, branch_name: written by trigger but dashboard
-- only fetches cpu_usage, ram_usage, cpu_temp, recorded_at
ALTER TABLE public.node_history
  DROP COLUMN IF EXISTS latency_ms,
  DROP COLUMN IF EXISTS disk_usage_percent,
  DROP COLUMN IF EXISTS branch_name;
