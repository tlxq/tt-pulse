-- Migration: Add Temperature to Node Metrics
-- Date: 2026-04-09
-- Purpose: Support hardware telemetry for SRE dashboard

ALTER TABLE public.node_status ADD COLUMN IF NOT EXISTS cpu_temp smallint DEFAULT 0;
ALTER TABLE public.node_history ADD COLUMN IF NOT EXISTS cpu_temp smallint;

-- IMPORTANT: You must update the log_node_history trigger function in Supabase
-- to include the new cpu_temp column when moving data from node_status to node_history.
-- E.g.:
-- CREATE OR REPLACE FUNCTION public.log_node_history()
--  RETURNS trigger
--  LANGUAGE plpgsql
-- AS $function$
-- BEGIN
--   INSERT INTO node_history (
--     node_name, cpu_usage, ram_usage, latency_ms, disk_usage_percent, cpu_temp, recorded_at
--   ) VALUES (
--     NEW.node_name, NEW.cpu_usage, NEW.ram_usage, NEW.latency_ms, NEW.disk_usage_percent, NEW.cpu_temp, now()
--   );
--   RETURN NEW;
-- END;
-- $function$;
