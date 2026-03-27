'use client'

import { useStatus } from '@/hooks/useStatus'
import { NodeCard } from '@/components/NodeCard'
import { Activity, LayoutGrid, Terminal } from 'lucide-react'

export default function Dashboard() {
  const { nodes, loading } = useStatus()

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto space-y-12">
      {/* Global Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              TT-Pulse <span className="text-blue-500">Global</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium tracking-wide">DISTRIBUTED NETWORK MONITORING</p>
        </div>
        
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Commits 24h</span>
              <span className="text-xl font-black text-blue-400">
                {nodes.reduce((acc, curr) => acc + curr.git_commits_24h, 0)}
              </span>
            </div>
          </div>
          <div className="px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Active Nodes</span>
              <span className="text-xl font-black text-green-400">
                {nodes.filter(n => (Date.now() - new Date(n.last_seen).getTime() < 10 * 60 * 1000)).length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Node Grid */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-800/50 pb-6">
          <LayoutGrid className="w-5 h-5 text-blue-500" />
          <h2 className="text-sm font-black text-slate-100 uppercase tracking-[0.2em]">Network Nodes</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-900/50 rounded-xl border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nodes.map((node) => (
              <NodeCard key={node.node_name} node={node} />
            ))}
            
            {nodes.length === 0 && (
              <div className="col-span-full py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-4">
                <Terminal className="w-12 h-12 text-slate-700" />
                <p className="text-slate-500 font-bold uppercase tracking-widest">No nodes detected in network</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
