'use client';

import { Cpu, HardDrive, Thermometer, Database } from "lucide-react";

interface NodeMetricsProps {
  cpuUsage: number;
  ramUsage: number;
  cpuTemp?: number;
  diskUsagePercent?: number;
  onViewHistory: () => void;
}

export function NodeMetrics({ cpuUsage, ramUsage, cpuTemp, diskUsagePercent, onViewHistory }: NodeMetricsProps) {
  return (
    <div className="mt-8 border-t border-white/5 pt-8 relative z-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-1 group/cpu cursor-pointer" onClick={onViewHistory}>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Cpu className="w-3 h-3 group-hover/cpu:text-nebula-accent transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-widest">CPU</span>
          </div>
          <div className="text-sm font-black text-white font-mono">{cpuUsage}%</div>
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <HardDrive className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase tracking-widest">RAM</span>
          </div>
          <div className="text-sm font-black text-white font-mono">{ramUsage}%</div>
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Thermometer className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase tracking-widest">TEMP</span>
          </div>
          <div className={`text-sm font-black font-mono ${(cpuTemp || 0) > 80 ? 'text-rose-500' : 'text-white'}`}>
            {cpuTemp || 0}°C
          </div>
        </div>
        
        <div className="flex-1 space-y-1 text-right">
          <div className="flex items-center gap-1.5 text-slate-500 justify-end">
            <Database className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase tracking-widest">DISK</span>
          </div>
          <div className={`text-sm font-black font-mono ${(diskUsagePercent || 0) > 90 ? 'text-rose-500' : 'text-white'}`}>
            {diskUsagePercent || 0}%
          </div>
        </div>
      </div>
    </div>
  );
}
