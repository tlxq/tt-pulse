-- 20260328_final_refactor.sql
-- TT Family's Household - Technical Refactor

-- 1. Cleanup: Drop old AI insights table
DROP TABLE IF EXISTS public.ai_insights;

-- 2. Update Node Status: Add AI caching and commit logs
ALTER TABLE public.node_status 
ADD COLUMN IF NOT EXISTS last_ai_insight TEXT,
ADD COLUMN IF NOT EXISTS last_ai_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS recent_commits JSONB DEFAULT '[]'::jsonb;

-- 3. Verify Constraints: Ensure node_history has proper foreign key
-- If it already exists, this is just a safety check
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_node' AND conrelid = 'public.node_history'::regclass
    ) THEN
        ALTER TABLE public.node_history 
        ADD CONSTRAINT fk_node 
        FOREIGN KEY (node_name) REFERENCES public.node_status(node_name) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Optimize Indexes
CREATE INDEX IF NOT EXISTS idx_node_history_recorded_at ON public.node_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_node_status_last_seen ON public.node_status(last_seen DESC);
