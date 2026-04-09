import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { NodeStatus } from '@/types'
import { fetchNodeHistory } from '@/lib/history'

export function useStatus() {
  const [nodes, setNodes] = useState<NodeStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('node_status')
      .select('*')
      .order('node_name')

    if (!fetchError && data) {
      // Parallel fetch history for all nodes
      const nodesWithHistory = await Promise.all(
        data.map(async (node) => ({
          ...node,
          history: await fetchNodeHistory(node.node_name),
        }))
      )
      setNodes(nodesWithHistory)
      setError(null)
      setLoading(false)
      return nodesWithHistory
    }
    setError(fetchError?.message ?? 'Failed to connect to Supabase.')
    setLoading(false)
    return []
  }, [])

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
            const history = await fetchNodeHistory(newNode.node_name)
            
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
  }, [fetchStatus])

  return { nodes, loading, error, refresh: fetchStatus }
}
