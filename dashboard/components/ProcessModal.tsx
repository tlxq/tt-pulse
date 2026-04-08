'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Terminal, Activity } from 'lucide-react';
import { 
  Flex, 
  Text, 
  Table, 
  TableHead, 
  TableRow, 
  TableHeaderCell, 
  TableBody, 
  TableCell, 
  Badge,
  ProgressBar
} from '@tremor/react';
import { formatProcessName } from '@/lib/utils';

interface Process {
  command: string;
  cpu: number;
  mem: number;
}

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeName: string;
  processes: Process[];
}

export function ProcessModal({ isOpen, onClose, nodeName, processes }: ProcessModalProps) {
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
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-3xl bg-nebula-900 border border-white/10 p-8 text-left align-middle shadow-[0_0_50px_rgba(139,92,246,0.1)] transition-all backdrop-blur-xl">
                <Flex className="mb-6">
                  <Dialog.Title as="h3" className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-nebula-accent" />
                    Process Monitor
                  </Dialog.Title>
                  <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </Flex>
                
                <Text className="text-slate-400 text-xs mb-8 font-bold tracking-wide">
                  Live resource consumption analysis for <span className="text-nebula-accent font-mono">{nodeName}</span>.
                </Text>

                <div className="overflow-hidden rounded-xl border border-white/5 bg-white/5">
                  <Table>
                    <TableHead className="bg-white/5">
                      <TableRow className="border-white/5">
                        <TableHeaderCell className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Process</TableHeaderCell>
                        <TableHeaderCell className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">CPU %</TableHeaderCell>
                        <TableHeaderCell className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">RAM %</TableHeaderCell>
                        <TableHeaderCell className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Status</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {processes.length > 0 ? (
                        processes.map((p, idx) => {
                          const cleanName = formatProcessName(p.command);
                          const isHighLoad = p.cpu > 50;
                          
                          return (
                            <TableRow key={idx} className="border-white/5 hover:bg-nebula-accent/5 transition-colors group">
                              <TableCell className="text-xs font-bold text-slate-300">
                                <div className="flex items-center gap-2">
                                  <Activity className={`w-3 h-3 ${isHighLoad ? 'text-nebula-secondary animate-pulse' : 'text-slate-600'}`} />
                                  <span className="font-mono">{cleanName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="min-w-[120px]">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between items-center text-[10px] font-mono">
                                    <span className={isHighLoad ? 'text-nebula-secondary' : 'text-nebula-accent'}>{p.cpu}%</span>
                                  </div>
                                  <ProgressBar value={p.cpu} color={isHighLoad ? "pink" : "violet"} className="h-1" />
                                </div>
                              </TableCell>
                              <TableCell className="text-xs font-mono text-nebula-cyan text-right">{p.mem}%</TableCell>
                              <TableCell className="text-right">
                                <Badge 
                                  size="xs" 
                                  color={isHighLoad ? "pink" : "emerald"}
                                  className="uppercase font-black text-[8px] tracking-tighter ring-0 px-2"
                                >
                                  {isHighLoad ? "High Load" : "Normal"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12">
                            <Text className="text-slate-600 italic">No process data available, sir.</Text>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
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
