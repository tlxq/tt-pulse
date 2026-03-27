import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface NodeStatus {
  node_name: string
  cpu_usage: number
  ram_usage: number
  git_commits_24h: number
  last_seen: string
  latency_ms?: number
  disk_usage_percent?: number
}

export function useStatus() {
  const [nodes, setNodes] = useState<NodeStatus[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    const { data, error } = await supabase
      .from('node_status')
      .select('*')
      .order('node_name')

    if (!error && data) {
      setNodes(data)
      setLoading(false)
      return data
    }
    setLoading(false)
    return []
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000) // 30s UI Refresh

    return () => clearInterval(interval)
  }, [])

  return { nodes, loading, refresh: fetchStatus }
}
