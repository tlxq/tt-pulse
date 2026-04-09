-- Add latency_ms to node_status and node_history
-- The ping collector sends this field on every heartbeat. The column was missing from
-- node_status (causing every heartbeat to fail) and was previously dropped from
-- node_history while the trigger still referenced it (causing a second failure).
ALTER TABLE public.node_status
  ADD COLUMN IF NOT EXISTS latency_ms integer DEFAULT 0;

ALTER TABLE public.node_history
  ADD COLUMN IF NOT EXISTS latency_ms integer;

-- disk_usage_percent was also dropped from node_history while the trigger still referenced it
ALTER TABLE public.node_history
  ADD COLUMN IF NOT EXISTS disk_usage_percent smallint;
