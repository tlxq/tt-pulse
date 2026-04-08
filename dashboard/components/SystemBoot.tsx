'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BengalMascot } from './BengalMascot';
import { Terminal } from 'lucide-react';

const BOOT_LOGS = [
  "> INITIALIZING NEBULA PROTOCOLS...",
  "> AUTHENTICATING BENGAL GUARDIAN...",
  "> CONNECTING TO ACTIVE STATIONS...",
  "> LOADING TELEMETRY ENGINE...",
  "> SYNCHRONIZING GIT REPOSITORIES...",
  "> BENGAL GUARDIAN ACTIVE: TEXAS ONLINE.",
  "> SYSTEM BOOT COMPLETE."
];

export function SystemBoot({ onComplete }: { onComplete: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress interval
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 1.5;
      });
    }, 40);

    // Log interval
    let logIndex = 0;
    const logTimer = setInterval(() => {
      if (logIndex < BOOT_LOGS.length) {
        setLogs(prev => [...prev, BOOT_LOGS[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logTimer);
        setTimeout(onComplete, 800); // Small delay after last log
      }
    }, 400);

    return () => {
      clearInterval(progressTimer);
      clearInterval(logTimer);
    };
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="fixed inset-0 z-[100] bg-nebula-950 flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
      
      {/* Ring Animation */}
      <div className="relative mb-12">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-40px] border border-nebula-accent/20 rounded-full border-dashed"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-20px] border border-nebula-accent/10 rounded-full"
        />
        
        <BengalMascot isHighLoad={progress < 90} />
      </div>

      {/* Boot Logs Terminal */}
      <div className="w-full max-w-md bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
          <Terminal className="w-4 h-4 text-nebula-accent" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Guardian Boot Sequence</span>
        </div>
        
        <div className="space-y-2 h-32 overflow-hidden font-mono">
          <AnimatePresence initial={false}>
            {logs.slice(-5).map((log, i) => (
              <motion.div
                key={`${log}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <span className="text-[10px] text-emerald-500/50 leading-none">[{Math.round(progress)}%]</span>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tight">{log}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="fixed bottom-12 left-12 right-12 max-w-4xl mx-auto space-y-3">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">System Status</span>
            <span className="text-xs font-black text-white uppercase italic tracking-tighter">
              {progress < 100 ? 'Initialising Bengal Protocols...' : 'Guardian Active'}
            </span>
          </div>
          <span className="text-xl font-black text-nebula-accent font-mono tracking-tighter italic">
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-nebula-accent via-nebula-accent to-white shadow-[0_0_15px_rgba(139,92,246,0.5)]"
          />
        </div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(18,16,33,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(139,92,246,0.02),transparent,rgba(139,92,246,0.02))] bg-[length:100%_4px,3px_100%] opacity-20 pointer-events-none" />
    </motion.div>
  );
}
