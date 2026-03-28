-- 20260328_cleanup_and_optimize.sql
-- Cleanup unused tables and consolidate schema for local Butler engine

-- 1. Remove legacy/unused tables
DROP TABLE IF EXISTS public.ai_insights CASCADE;

-- 2. Ensure node_status has all required SRE columns
-- (This is idempotent - won't fail if they already exist)
DO $$ 
BEGIN
    -- Add top_processes if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='node_status' AND column_name='top_processes') THEN
        ALTER TABLE public.node_status ADD COLUMN top_processes JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add recent_commits if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='node_status' AND column_name='recent_commits') THEN
        ALTER TABLE public.node_status ADD COLUMN recent_commits JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add caching columns (used for last message persistence)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='node_status' AND column_name='last_ai_insight') THEN
        ALTER TABLE public.node_status ADD COLUMN last_ai_insight TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='node_status' AND column_name='last_ai_timestamp') THEN
        ALTER TABLE public.node_status ADD COLUMN last_ai_timestamp TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Cleanup unused columns in node_status (if any were legacy)
-- Based on initial_schema, all other columns (cpu, ram, last_seen, etc.) are in use.

-- 4. Set up Row Level Security (Security Best Practice)
ALTER TABLE public.node_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_history ENABLE ROW LEVEL SECURITY;

-- 5. Policies: Allow anonymous ingestion (for agents) and public read (for dashboard)
DROP POLICY IF EXISTS "Public Read Access" ON public.node_status;
CREATE POLICY "Public Read Access" ON public.node_status FOR SELECT USING (true);

DROP POLICY IF EXISTS "Agent UPSERT Access" ON public.node_status;
CREATE POLICY "Agent UPSERT Access" ON public.node_status FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read History" ON public.node_history;
CREATE POLICY "Public Read History" ON public.node_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Agent Insert History" ON public.node_history;
CREATE POLICY "Agent Insert History" ON public.node_history FOR INSERT WITH CHECK (true);

-- 6. Optimization: Vacuum and Analyze (Maintenance)
ANALYZE public.node_status;
ANALYZE public.node_history;
