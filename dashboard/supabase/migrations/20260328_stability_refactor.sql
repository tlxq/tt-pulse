-- 20260328_stability_refactor.sql
-- Ensure caching columns exist in node_status for AI Resilience

ALTER TABLE public.node_status 
ADD COLUMN IF NOT EXISTS last_ai_insight TEXT,
ADD COLUMN IF NOT EXISTS last_ai_timestamp TIMESTAMPTZ;

-- Cleanup old table if it still exists
DROP TABLE IF EXISTS public.ai_insights;
