'use client';

import { Cpu, HardDrive, Thermometer, Database } from "lucide-react";
import { HistoryPoint } from "@/types";

interface NodeMetricsProps {
  cpuUsage: number;
  ramUsage: number;
  cpuTemp?: number;
  diskUsagePercent?: number;
  onViewHistory: () => void;
  history?: HistoryPoint[];
}

function TrendArrow({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined || previous === null) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 1) return null;
  return diff > 0
    ? <span className="text-[8px] text-rose-400 font-bold leading-none">▲</span>
    : <span className="text-[8px] text-emerald-400 font-bold leading-none">▼</span>;
}

export function NodeMetrics({ cpuUsage, ramUsage, cpuTemp, diskUsagePercent, onViewHistory, history }: NodeMetricsProps) {
  const prev = history && history.length >= 2 ? history[history.length - 2] : undefined;

  return (
    <div className="mt-8 border-t border-white/5 pt-8 relative z-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-1 group/cpu cursor-pointer" onClick={onViewHistory}>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Cpu className="w-3 h-3 group-hover/cpu:text-nebula-accent transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-widest">CPU</span>
          </div>
          <div className={`flex items-center gap-1 text-sm font-black font-mono ${cpuUsage > 85 ? 'text-rose-500' : cpuUsage > 70 ? 'text-amber-400' : 'text-white'}`}>
            {cpuUsage}%
            <TrendArrow current={cpuUsage} previous={prev?.cpu_usage} />
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <HardDrive className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase tracking-widest">RAM</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-black text-white font-mono">
            {ramUsage}%
            <TrendArrow current={ramUsage} previous={prev?.ram_usage} />
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Thermometer className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase tracking-widest">TEMP</span>
          </div>
          <div className={`flex items-center gap-1 text-sm font-black font-mono ${(cpuTemp || 0) > 80 ? 'text-rose-500' : (cpuTemp || 0) > 70 ? 'text-amber-400' : 'text-white'}`}>
            {cpuTemp || 0}°C
            <TrendArrow current={cpuTemp || 0} previous={prev?.cpu_temp} />
          </div>
        </div>

        <div className="flex-1 space-y-1 text-right">
          <div className="flex items-center gap-1.5 text-slate-500 justify-end">
            <Database className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase tracking-widest">DISK</span>
          </div>
          <div className={`text-sm font-black font-mono ${(diskUsagePercent || 0) > 90 ? 'text-rose-500' : (diskUsagePercent || 0) > 75 ? 'text-amber-400' : 'text-white'}`}>
            {diskUsagePercent || 0}%
          </div>
        </div>
      </div>
    </div>
  );
}
