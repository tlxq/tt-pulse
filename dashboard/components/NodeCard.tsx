'use client'

import { Cpu, HardDrive, GitBranch, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface NodeCardProps {
  node: {
    node_name: string
    cpu_usage: number
    ram_usage: number
    git_commits: number
    created_at: string
    is_online: boolean
  }
}

export function NodeCard({ node }: NodeCardProps) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={cn(
              "w-4 h-4 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]",
              node.is_online ? "bg-emerald-500 shadow-emerald-500/20" : "bg-slate-700"
            )} />
            {node.is_online && (
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-emerald-500 animate-ping opacity-40" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-100 group-hover:text-blue-400 transition-colors">
              {node.node_name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(node.created_at), { addSuffix: true, locale: enUS })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              <span>CPU</span>
            </div>
            <div className="flex items-end justify-between gap-2">
              <span className="text-2xl font-mono font-bold text-slate-100">{node.cpu_usage}%</span>
              <div className="flex-1 h-1.5 bg-slate-800/50 rounded-full mb-2 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    node.cpu_usage > 85 ? "bg-rose-500" : node.cpu_usage > 60 ? "bg-amber-500" : "bg-blue-500"
                  )}
                  style={{ width: `${node.cpu_usage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <HardDrive className="w-3.5 h-3.5" />
              <span>RAM</span>
            </div>
            <div className="flex items-end justify-between gap-2">
              <span className="text-2xl font-mono font-bold text-slate-100">{node.ram_usage}%</span>
              <div className="flex-1 h-1.5 bg-slate-800/50 rounded-full mb-2 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    node.ram_usage > 85 ? "bg-rose-500" : node.ram_usage > 60 ? "bg-amber-500" : "bg-blue-500"
                  )}
                  style={{ width: `${node.ram_usage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-center justify-between group-hover:bg-blue-500/10 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <GitBranch className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-slate-300">Activity (24h)</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-blue-400">{node.git_commits}</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Commits</span>
          </div>
        </div>
      </div>
    </div>
  )
}
