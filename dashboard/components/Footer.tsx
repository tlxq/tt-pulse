'use client';

import { Terminal, Globe, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-6">
        {/* Brand/Signature */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-[0.3em] text-[9px]">
            Forged in the <span className="text-nebula-secondary">Bengal Territory</span>
          </div>
          <p className="text-slate-600 text-[8px] font-medium italic flex items-center gap-1.5">
            Built with <Heart className="w-2.5 h-2.5 text-rose-500/50 fill-rose-500/10" /> by the tt family
          </p>
        </div>

        {/* Links Grid */}
        <div className="flex items-center gap-6">
          <a 
            href="https://github.com/thjox" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 transition-all"
          >
            <Terminal className="w-3 h-3 text-slate-500 group-hover:text-nebula-accent transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-200">thjox</span>
          </a>

          <a 
            href="https://github.com/tlxq" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 transition-all"
          >
            <Terminal className="w-3 h-3 text-slate-500 group-hover:text-nebula-accent transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-200">tlxq</span>
          </a>

          <div className="h-3 w-px bg-white/10 hidden md:block" />

          <a 
            href="https://ttdevs.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-3 py-1.5 bg-nebula-accent/5 border border-nebula-accent/10 rounded-lg hover:bg-nebula-accent/10 hover:border-nebula-accent/30 transition-all active:scale-95"
          >
            <Globe className="w-3 h-3 text-nebula-accent" />
            <span className="text-[9px] font-black uppercase tracking-widest text-nebula-accent">ttdevs.com</span>
          </a>
        </div>
      </div>

      {/* Subtle bottom line */}
      <div className="mt-4 text-center">
        <span className="text-[7px] font-black uppercase tracking-[0.5em] text-slate-800">
          Digital Sovereignty • TT-Pulse v1.2
        </span>
      </div>
    </footer>
  );
}
