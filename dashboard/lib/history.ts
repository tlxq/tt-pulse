import { supabase } from './supabase';
import { HistoryPoint } from '@/types';
import { HISTORY_LIMIT } from './constants';

export async function fetchNodeHistory(nodeName: string): Promise<HistoryPoint[]> {
  const { data, error } = await supabase
    .from('node_history')
    .select('cpu_usage, ram_usage, cpu_temp, recorded_at')
    .eq('node_name', nodeName)
    .order('recorded_at', { ascending: false })
    .limit(HISTORY_LIMIT);

  if (error || !data) return [];
  return data.reverse();
}
