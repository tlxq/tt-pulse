'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, History } from 'lucide-react';
import { Flex, Text, AreaChart, type CustomTooltipProps } from '@tremor/react';
import { HistoryPoint } from '@/types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeName: string;
  history: HistoryPoint[];
}

const SERIES = [
  { name: 'CPU Usage',   color: 'bg-violet-500', unit: '%' },
  { name: 'RAM Usage',   color: 'bg-pink-500',   unit: '%' },
  { name: 'Temperature', color: 'bg-cyan-400',   unit: '°C' },
] as const;

type SeriesName = typeof SERIES[number]['name'];

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-nebula-900/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-[160px]">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      {payload.map((entry) => {
        const name = String(entry.name ?? '');
        const series = SERIES.find(s => s.name === name);
        const unit = series?.unit ?? '';
        return (
          <div key={name} className="flex items-center gap-2 py-0.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
            <span className="text-[11px] text-slate-400 flex-1">{name}</span>
            <span className="text-[11px] font-black text-white font-mono">{entry.value}{unit}</span>
          </div>
        );
      })}
    </div>
  );
}

export function HistoryModal({ isOpen, onClose, nodeName, history }: HistoryModalProps) {
  const chartData = (history || []).map(h => ({
    time: new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(h.recorded_at)),
    'CPU Usage':   h.cpu_usage,
    'RAM Usage':   h.ram_usage,
    'Temperature': h.cpu_temp || 0,
  }));

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-nebula-950/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto font-sans">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-nebula-900 border border-white/10 p-8 text-left align-middle shadow-[0_0_50px_rgba(139,92,246,0.1)] transition-all backdrop-blur-xl">
                <Flex className="mb-6">
                  <Dialog.Title as="h3" className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <History className="w-5 h-5 text-nebula-accent" />
                    Historical Trends (24h)
                  </Dialog.Title>
                  <button onClick={onClose} aria-label="Close" className="text-slate-500 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-accent rounded-md">
                    <X className="w-5 h-5" />
                  </button>
                </Flex>

                <div className="flex items-center justify-between mb-6">
                  <Text className="text-slate-400 text-xs font-bold tracking-wide">
                    Telemetry for <span className="text-nebula-accent font-mono">{nodeName}</span>
                  </Text>
                  {/* Custom legend — replaces Tremor's broken built-in legend */}
                  <div className="flex items-center gap-4">
                    {SERIES.map(s => (
                      <div key={s.name} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${s.color}`} />
                        <span className="text-[10px] font-bold text-slate-400">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-64 w-full">
                  {chartData.length > 0 ? (
                    <AreaChart
                      className="h-full"
                      data={chartData}
                      index="time"
                      categories={['CPU Usage', 'RAM Usage', 'Temperature'] as SeriesName[]}
                      colors={['violet', 'pink', 'cyan']}
                      showLegend={false}
                      showGridLines={true}
                      yAxisWidth={36}
                      curveType="monotone"
                      customTooltip={ChartTooltip}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center border border-white/5 rounded-xl bg-white/5">
                      <Text className="text-slate-500 italic">No historical data available.</Text>
                    </div>
                  )}
                </div>

                <div className="mt-8 border-t border-white/5 pt-6">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs font-black uppercase text-slate-400 hover:text-white hover:bg-nebula-accent/20 hover:border-nebula-accent/30 transition-all active:scale-95"
                    onClick={onClose}
                  >
                    Close Monitor
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
