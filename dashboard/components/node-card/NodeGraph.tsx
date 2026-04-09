'use client';

import { AreaChart, CustomTooltipProps } from "@tremor/react";
import { Activity } from "lucide-react";
import { HistoryPoint } from "@/types";

const CustomTooltip = ({ payload, active, label }: CustomTooltipProps) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-2xl ring-1 ring-white/10">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">{label}</p>
      <div className="space-y-1.5">
        {payload.map((category, idx: number) => {
          const isTemp = category.name === "Temperature";
          const unit = isTemp ? "°C" : "%";
          
          // Map Tremor colors to our Nebula palette
          let color = '#8b5cf6'; // violet (default)
          if (category.color === 'pink') color = '#ec4899';
          if (category.color === 'cyan') color = '#06b6d4';
          if (category.color === 'rose') color = '#f43f5e';

          return (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] font-bold text-slate-300">{category.name}</span>
              </div>
              <span className="text-[10px] font-black text-white font-mono">{category.value}{unit}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface NodeGraphProps {
  history: HistoryPoint[];
  isMounted: boolean;
}

export function NodeGraph({ history, isMounted }: NodeGraphProps) {
  const chartData = (history || []).map(h => ({
    time: new Intl.DateTimeFormat('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(h.recorded_at)),
    "CPU Usage": h.cpu_usage,
    "RAM Usage": h.ram_usage,
    "Temperature": h.cpu_temp || 0,
  }));

  return (
    <div className="h-36 w-full mt-2 -mx-2 relative z-10">
      {isMounted ? (
        <AreaChart
          className="h-full"
          data={chartData}
          index="time"
          categories={["CPU Usage", "RAM Usage", "Temperature"]}
          colors={["violet", "pink", "cyan"]}
          showLegend={false}
          showGridLines={false}
          showXAxis={false}
          showYAxis={false}
          startEndOnly={true}
          curveType="monotone"
          customTooltip={CustomTooltip}
        />
      ) : (
        <div className="h-full w-full bg-white/5 rounded-3xl animate-pulse flex items-center justify-center">
           <Activity className="w-5 h-5 text-slate-800" />
        </div>
      )}
    </div>
  );
}
