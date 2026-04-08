import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface HistoryPoint {
  cpu_usage: number
  ram_usage: number
  recorded_at: string
}

export interface ProcessInfo {
  command: string
  cpu: number
  mem: number
  user?: string
  pid?: string
}

export interface NodeStatus {
  node_name: string
  cpu_usage: number
  ram_usage: number
  git_commits_24h: number
  last_seen: string
  latency_ms?: number
  disk_usage_percent?: number
  history?: HistoryPoint[]
  last_ai_insight?: string
  last_ai_timestamp?: string
  recent_commits?: string[]
  branch_name?: string
  repo_name?: string
  git_author?: string
  github_username?: string
  os_platform?: string
  os_distro?: string
  top_processes?: ProcessInfo[]
  pending_updates?: number
}

export function useStatus() {
  const [nodes, setNodes] = useState<NodeStatus[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async (nodeName: string): Promise<HistoryPoint[]> => {
    const { data, error } = await supabase
      .from('node_history')
      .select('cpu_usage, ram_usage, recorded_at')
      .eq('node_name', nodeName)
      .order('recorded_at', { ascending: false })
      .limit(20)

    if (error || !data) return []
    return data.reverse()
  }, [])

  const fetchStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from('node_status')
      .select('*')
      .order('node_name')

    if (!error && data) {
      // Parallel fetch history for all nodes
      const nodesWithHistory = await Promise.all(
        data.map(async (node) => ({
          ...node,
          history: await fetchHistory(node.node_name)
        }))
      )
      setNodes(nodesWithHistory)
      setLoading(false)
      return nodesWithHistory
    }
    setLoading(false)
    return []
  }, [fetchHistory])

  useEffect(() => {
    const init = async () => {
      await fetchStatus()
    }
    init()

    // Realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'node_status'
        },
        async (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newNode = payload.new as NodeStatus
            const history = await fetchHistory(newNode.node_name)
            
            setNodes(prev => prev.map(n => 
              n.node_name === newNode.node_name ? { ...newNode, history } : n
            ))
          } else {
            fetchStatus()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchStatus, fetchHistory])

  return { nodes, loading, refresh: fetchStatus }
}
