-- 20260328_sre_core.sql
-- TT Family's Household - SRE Infrastructure Core

-- 1. Cleanup: Remove legacy tracking
DROP TABLE IF EXISTS public.ai_insights;

-- 2. Schema Evolution: Update node_status with SRE telemetry and caching
ALTER TABLE public.node_status 
ADD COLUMN IF NOT EXISTS top_processes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_ai_insight TEXT,
ADD COLUMN IF NOT EXISTS last_ai_timestamp TIMESTAMPTZ;

-- 3. Performance Optimization: High-performance index for time-series lookups
CREATE INDEX IF NOT EXISTS idx_node_history_node_name_recorded_at 
ON public.node_history (node_name, recorded_at DESC);

-- 4. Enable Realtime for optimized columns (Optional but recommended)
-- Commented out as it might already be enabled at table level
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.node_status;
