'use client'

import { useEffect, useState } from 'react'
import { useStatus } from '@/hooks/useStatus'
import { NodeCard } from '@/components/NodeCard'
import { Activity, Sparkles, Server, RefreshCw } from 'lucide-react'

const INSIGHT_CACHE_KEY = 'jarvis-pulse-insight-v2'
const CACHE_DURATION = 30 * 60 * 1000

export default function DashboardPage() {
  const { nodes, loading, stats } = useStatus()
  const [insight, setInsight] = useState<string>("Analyzing system status...")
  const [refreshing, setRefreshing] = useState(false)

  const fetchInsight = async (force = false) => {
    setRefreshing(true)
    
    if (!force) {
      const cached = localStorage.getItem(INSIGHT_CACHE_KEY)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_DURATION) {
          setInsight(data)
          setRefreshing(false)
          return
        }
      }
    }

    try {
      const res = await fetch('/api/insights')
      const result = await res.json()
      setInsight(result.insight)
      localStorage.setItem(INSIGHT_CACHE_KEY, JSON.stringify({ data: result.insight, timestamp: Date.now() }))
    } catch (e) {
      setInsight("Jarvis is currently processing data...")
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchInsight() }, [])

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">TT-Pulse.</h1>
              <p className="text-slate-500 font-medium tracking-wide uppercase text-[10px]">Multi-Node Home-lab Monitor</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-900/50 border border-slate-800 px-6 py-3 rounded-2xl flex flex-col backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Network Load</span>
              <span className="text-lg font-bold text-white">{stats.avgCpu}% CPU Avg</span>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 px-6 py-3 rounded-2xl flex flex-col backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Status</span>
              <span className="text-lg font-bold text-white">{stats.onlineCount}/{nodes.length} Online</span>
            </div>
          </div>
        </header>

        {/* AI Insight Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent border border-blue-500/20 p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-blue-400 font-bold uppercase tracking-widest text-xs">AI Butler Insights</h3>
                  <button onClick={() => fetchInsight(true)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="text-lg text-slate-100 leading-relaxed font-medium italic">&quot;{insight}&quot;</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-900/20 rounded-2xl border border-slate-800 animate-pulse" />)
          ) : (
            nodes.map(node => (
              <NodeCard 
                key={node.node_name} 
                node={{
                  ...node,
                  created_at: node.last_seen,
                  is_online: (Date.now() - new Date(node.last_seen).getTime()) < 600000
                }} 
              />
            ))
          )}
        </div>
      </div>
    </main>
  )
}
