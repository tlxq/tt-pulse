-- 20260328_initial_schema.sql
-- TT Family's Household - Core Database Schema

-- 1. AI Insights Table
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    insight_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Node Status (Realtime Source)
CREATE TABLE IF NOT EXISTS public.node_status (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    node_name text NOT NULL UNIQUE,
    cpu_usage smallint DEFAULT 0,
    ram_usage smallint DEFAULT 0,
    git_commits_24h integer DEFAULT 0,
    last_seen timestamp with time zone DEFAULT now() NOT NULL,
    latency_ms integer DEFAULT 0,
    disk_usage_percent integer DEFAULT 0
);

-- 3. Node History (Time Series)
CREATE TABLE IF NOT EXISTS public.node_history (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    node_name text NOT NULL,
    cpu_usage integer,
    ram_usage integer,
    latency_ms integer,
    disk_usage_percent integer,
    recorded_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT fk_node FOREIGN KEY (node_name) REFERENCES public.node_status(node_name) ON DELETE CASCADE
);

-- 4. History Logging Trigger
CREATE OR REPLACE FUNCTION log_node_history() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.node_history (node_name, cpu_usage, ram_usage, latency_ms, disk_usage_percent)
  VALUES (NEW.node_name, NEW.cpu_usage, NEW.ram_usage, NEW.latency_ms, NEW.disk_usage_percent);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_history ON public.node_status;
CREATE TRIGGER trigger_log_history
AFTER INSERT OR UPDATE ON public.node_status
FOR EACH ROW EXECUTE FUNCTION log_node_history();

-- 5. Enable Realtime for node_status
ALTER PUBLICATION supabase_realtime ADD TABLE public.node_status;
