'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, History } from 'lucide-react';
import { 
  Flex, 
  Text, 
  AreaChart
} from '@tremor/react';
import { HistoryPoint } from '@/hooks/useStatus';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeName: string;
  history: HistoryPoint[];
}

export function HistoryModal({ isOpen, onClose, nodeName, history }: HistoryModalProps) {
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
                  <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </Flex>
                
                <Text className="text-slate-400 text-xs mb-8 font-bold tracking-wide">
                  Historical telemetry for <span className="text-nebula-accent font-mono">{nodeName}</span>.
                </Text>

                <div className="h-64 w-full mt-4">
                  {chartData.length > 0 ? (
                    <AreaChart
                      className="h-full"
                      data={chartData}
                      index="time"
                      categories={["CPU Usage", "RAM Usage", "Temperature"]}
                      colors={["violet", "pink", "cyan"]}
                      showLegend={true}
                      showGridLines={true}
                      yAxisWidth={40}
                      curveType="monotone"
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