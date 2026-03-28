'use client';
import { NodeStatus } from "@/hooks/useStatus";
import { Card, AreaChart, Title, Text, Badge, Flex, Grid, Metric, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from "@tremor/react";
import { Cpu, HardDrive, Wifi, Database, Info, Activity, X } from "lucide-react";
import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export function NodeCard({ node }: { node: NodeStatus }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => { setIsMounted(true); }, []);

  const lastSeenDate = new Date(node.last_seen);
  const isOnline = (Date.now() - lastSeenDate.getTime()) / 60000 < 10;
  
  const chartData = (node.history || []).map(h => ({
    time: new Date(h.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    "CPU Usage": h.cpu_usage,
    "RAM Usage": h.ram_usage,
  }));

  return (
    <Fragment>
      <Card className="bg-[#0f172a]/60 border-slate-800 ring-0 shadow-2xl backdrop-blur-xl group transition-all hover:bg-[#0f172a]/80">
        <Flex alignItems="start" className="mb-4">
          <div className="space-y-1">
            <Title className="text-white font-black tracking-tight">{node.node_name}</Title>
            <Text className="text-slate-500 uppercase text-[9px] font-black tracking-[0.2em]">SRE Pulse Node</Text>
          </div>
          <Badge color={isOnline ? "emerald" : "rose"} className="font-black uppercase tracking-widest text-[8px] px-3 py-1 ring-0">
            {isOnline ? "Active" : "Offline"}
          </Badge>
        </Flex>

        <div className="h-44 w-full mt-6 -mx-2 relative">
          {isMounted ? (
            <AreaChart
              className="h-full"
              data={chartData}
              index="time"
              categories={["CPU Usage", "RAM Usage"]}
              colors={["blue", "indigo"]}
              showLegend={false}
              showGridLines={false}
              showXAxis={false}
              showYAxis={false}
              startEndOnly={true}
              curveType="monotone"
            />
          ) : (
            <div className="h-full w-full bg-slate-900/20 rounded-xl animate-pulse flex items-center justify-center">
               <Activity className="w-5 h-5 text-slate-800" />
            </div>
          )}
        </div>

        <Grid numItems={3} className="mt-8 border-t border-slate-800/60 pt-6 gap-4">
          <div className="space-y-1 group/cpu cursor-pointer" onClick={() => setIsOpen(true)}>
            <Flex justifyContent="start" className="gap-2 text-slate-500">
              <Cpu className="w-3 h-3 group-hover/cpu:text-blue-400 transition-colors" />
              <Text className="text-[9px] font-black uppercase">CPU</Text>
              <Info className="w-2.5 h-2.5 opacity-0 group-hover/cpu:opacity-100 transition-all text-blue-500" />
            </Flex>
            <Metric className="text-sm font-black text-slate-200">{node.cpu_usage}%</Metric>
          </div>
          <div className="space-y-1">
            <Flex justifyContent="start" className="gap-2 text-slate-500">
              <HardDrive className="w-3 h-3" />
              <Text className="text-[9px] font-black uppercase">RAM</Text>
            </Flex>
            <Metric className="text-sm font-black text-slate-200">{node.ram_usage}%</Metric>
          </div>
          <div className="space-y-1">
            <Flex justifyContent="start" className="gap-2 text-slate-500">
              <Database className="w-3 h-3" />
              <Text className="text-[9px] font-black uppercase">Disk</Text>
            </Flex>
            <Metric className={`text-sm font-black ${(node.disk_usage_percent || 0) > 90 ? 'text-rose-500' : 'text-slate-200'}`}>
              {node.disk_usage_percent || 0}%
            </Metric>
          </div>
        </Grid>

        <Flex className="mt-6 border-t border-slate-800/30 pt-4 opacity-50">
          <Flex justifyContent="start" className="gap-2 text-slate-500">
            <Wifi className="w-3 h-3" />
            <Text className="text-[9px] font-bold">{node.latency_ms || 0}ms</Text>
          </Flex>
          <Text className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">SRE Pulse Verified</Text>
        </Flex>
      </Card>

      {/* Process Monitor Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-[#0f172a] border border-slate-800 p-8 text-left align-middle shadow-2xl transition-all">
                  <Flex className="mb-6">
                    <Dialog.Title as="h3" className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-blue-500" />
                      Process Monitor
                    </Dialog.Title>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </Flex>
                  
                  <Text className="text-slate-400 text-xs mb-6 font-bold tracking-wide">
                    Live CPU consumption analysis for <span className="text-blue-400">{node.node_name}</span>.
                  </Text>

                  <Table className="mt-4">
                    <TableHead>
                      <TableRow className="border-slate-800">
                        <TableHeaderCell className="text-[10px] font-black text-slate-600 uppercase">Process</TableHeaderCell>
                        <TableHeaderCell className="text-[10px] font-black text-slate-600 uppercase text-right">CPU%</TableHeaderCell>
                        <TableHeaderCell className="text-[10px] font-black text-slate-600 uppercase text-right">RAM%</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(node.top_processes || []).map((p, idx) => (
                        <TableRow key={idx} className="border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                          <TableCell className="text-xs font-bold text-slate-300">{p.command}</TableCell>
                          <TableCell className="text-xs font-mono text-blue-400 text-right">{p.cpu}%</TableCell>
                          <TableCell className="text-xs font-mono text-indigo-400 text-right">{p.mem}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-8 border-t border-slate-800/60 pt-6">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs font-black uppercase text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
                      onClick={() => setIsOpen(false)}
                    >
                      Acknowledge Report
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Fragment>
  );
}
