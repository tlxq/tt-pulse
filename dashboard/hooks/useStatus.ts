'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface NodeStatus {
  id: number
  node_name: string
  cpu_usage: number
  ram_usage: number
  git_commits: number
  last_seen: string
}

export function useStatus() {
  const [nodes, setNodes] = useState<NodeStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('node_status')
        .select('*')
        .order('node_name', { ascending: true })

      if (error) throw error
      setNodes(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Realtime Pipeline
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'node_status' }, 
          () => fetchData())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const stats = {
    totalCommits: nodes.reduce((sum, n) => sum + (n.git_commits || 0), 0),
    avgCpu: nodes.length > 0 
      ? Math.round(nodes.reduce((sum, n) => sum + (n.cpu_usage || 0), 0) / nodes.length) 
      : 0,
    onlineCount: nodes.filter(n => (Date.now() - new Date(n.last_seen).getTime()) < 600000).length
  }

  return { nodes, loading, error, stats, refresh: fetchData }
}
