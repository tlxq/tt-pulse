'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, ShieldCheck } from 'lucide-react';
import { BengalMascot } from './BengalMascot';
import { DevonRexMascot } from './DevonRexMascot';
import { AiMetadata, CatMood } from '@/types';

// ── Types ────────────────────────────────────────────────────────────────────

type Guardian = 'texas' | 'gosta';
type IdleAction = 'none' | 'yawn' | 'paw' | 'stretch';

const STORAGE_KEY = 'tt-pulse-guardian';

interface SREInsightProps extends AiMetadata {
  insight: string;
  loading: boolean;
  onGuardianChange?: () => void;
}

// ── Static particle config — fixed to avoid hydration mismatch ───────────────

const PARTICLES = [
  { x: 12, y: 30, delay: 0,    dur: 3.2, size: 2   },
  { x: 83, y: 22, delay: 0.9,  dur: 2.7, size: 1.5 },
  { x: 91, y: 60, delay: 1.6,  dur: 3.7, size: 1.8 },
  { x: 7,  y: 68, delay: 0.4,  dur: 2.9, size: 1.6 },
  { x: 68, y: 84, delay: 1.9,  dur: 3.4, size: 2.2 },
  { x: 20, y: 80, delay: 0.7,  dur: 2.5, size: 1.4 },
  { x: 94, y: 75, delay: 2.2,  dur: 3.0, size: 1.5 },
  { x: 46, y: 10, delay: 1.1,  dur: 2.8, size: 2.0 },
] as const;

const MRRP_PHRASES = ['Mrrp!', 'Purrrr~', '*bap*', 'Mrow!', 'Miaou!', '...zzz', 'Brrr~'] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export function SREInsight({ insight, loading, fallback, quotaExceeded, onGuardianChange }: SREInsightProps) {
  const isDegraded = fallback || quotaExceeded || !!(insight && (
    insight.includes('Mrow?') || insight.includes('gap in the perimeter') || insight.includes('Hiss!')
  ));
  const isHighLoad = !!(insight && (insight.includes('Hiss!') || insight.includes('Grrr...')));

  // ── Guardian selection ─────────────────────────────────────────────────────
  const [active, setActive]       = useState<Guardian>('texas');
  const [mounted, setMounted]     = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    /* eslint-disable react-hooks/set-state-in-effect */
    if (saved === 'texas' || saved === 'gosta') setActive(saved);
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const switchTo = (g: Guardian) => {
    if (g === active) return;
    setTransitioning(true);
    setTimeout(() => {
      setActive(g);
      setTransitioning(false);
      localStorage.setItem(STORAGE_KEY, g);
      onGuardianChange?.();
    }, 200);
  };

  // ── Cursor eye-tracking ────────────────────────────────────────────────────
  const mascotRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!mascotRef.current) return;
      const r = mascotRef.current.getBoundingClientRect();
      const cx = r.left + r.width  * 0.5;
      const cy = r.top  + r.height * 0.44; // ~where the eyes sit
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 6) { setEyeOffset({ x: 0, y: 0 }); return; }
      const scale = Math.min(dist / 90, 1) * 2.5 / dist;
      setEyeOffset({ x: dx * scale, y: dy * scale });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // ── Mood: base ─────────────────────────────────────────────────────────────
  const getBaseMood = (): CatMood => {
    if (!mounted) return 'idle';
    if (loading)      return 'alert';
    if (isDegraded)   return 'tired';
    if (isHighLoad)   return 'alert';
    const h = new Date().getHours();
    if (h >= 23 || h < 5) return 'tired';
    return 'happy';
  };

  // ── Mood: idle actions (random) ────────────────────────────────────────────
  const [idleAction, setIdleAction] = useState<IdleAction>('none');
  const idleTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleResetRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleIdleRef = useRef<() => void>(() => {});
  const loadingRef      = useRef(loading);
  const degradedRef     = useRef(isDegraded);

  // Keep refs in sync so the scheduler closure always sees current values
  useEffect(() => { loadingRef.current   = loading;    }, [loading]);
  useEffect(() => { degradedRef.current  = isDegraded; }, [isDegraded]);

  useEffect(() => {
    scheduleIdleRef.current = () => {
      idleTimerRef.current = setTimeout(() => {
        if (loadingRef.current || degradedRef.current) {
          scheduleIdleRef.current();
          return;
        }
        const pool: IdleAction[] = ['yawn', 'paw', 'stretch', 'yawn', 'paw'];
        const action = pool[Math.floor(Math.random() * pool.length)];
        setIdleAction(action);
        const dur = action === 'stretch' ? 2100 : 1900;
        idleResetRef.current = setTimeout(() => {
          setIdleAction('none');
          scheduleIdleRef.current();
        }, dur);
      }, 9000 + Math.random() * 14000);
    };
  });

  useEffect(() => {
    if (!mounted) return;
    scheduleIdleRef.current();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (idleResetRef.current) clearTimeout(idleResetRef.current);
    };
  }, [mounted]);

  // ── Mood: startled + mrrp bubble on click ─────────────────────────────────
  const [mrrpText, setMrrpText]     = useState<string | null>(null);
  const [isStartled, setIsStartled] = useState(false);
  const mrrpRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCatClick = useCallback(() => {
    if (mrrpRef.current) return; // debounce
    const phrase = MRRP_PHRASES[Math.floor(Math.random() * MRRP_PHRASES.length)];
    setMrrpText(phrase);
    setIsStartled(true);
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
    if (idleResetRef.current) { clearTimeout(idleResetRef.current); idleResetRef.current = null; }
    setIdleAction('none');
    mrrpRef.current = setTimeout(() => {
      setMrrpText(null);
      setIsStartled(false);
      mrrpRef.current = null;
      scheduleIdleRef.current();
    }, 1600);
  }, []);

  useEffect(() => () => { if (mrrpRef.current) clearTimeout(mrrpRef.current); }, []);

  // ── Effective mood ─────────────────────────────────────────────────────────
  const effectiveMood: CatMood = isStartled
    ? 'startled'
    : idleAction !== 'none'
    ? (idleAction as CatMood)
    : getBaseMood();

  // ── Accent colours per guardian ───────────────────────────────────────────
  const accentCls   = active === 'texas' ? 'text-emerald-500'     : 'text-amber-400';
  const particleClr = isDegraded
    ? 'rgba(236,72,153,0.7)'
    : active === 'texas'
    ? 'rgba(16,185,129,0.7)'
    : 'rgba(251,191,36,0.7)';
  const glowBg = isDegraded
    ? 'bg-nebula-secondary/10'
    : active === 'texas'
    ? 'bg-emerald-500/5'
    : 'bg-amber-500/5';

  const guardianLabel = active === 'texas' ? 'Texas · Bengal' : 'Gösta · Devon Rex';

  return (
    <div className={`
      col-span-1 bg-white/5 border rounded-3xl p-8 relative overflow-hidden group transition-all backdrop-blur-sm
      ${isDegraded
        ? 'border-nebula-secondary/30 shadow-[0_0_20px_rgba(236,72,153,0.1)]'
        : 'border-white/5 shadow-[0_0_15px_rgba(139,92,246,0.05)]'
      }
    `}>
      {/* Decorative shield icon */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <ShieldCheck className={`w-24 h-24 ${isDegraded ? 'text-nebula-secondary' : 'text-nebula-accent'} rotate-12`} />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center text-center space-y-3">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="w-full flex items-center justify-between mb-1">
          <div className={`flex items-center gap-2 ${isDegraded ? 'text-nebula-secondary' : 'text-nebula-accent'} font-black uppercase tracking-[0.2em] text-[10px]`}>
            Studio Guardian
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest
            ${isDegraded
              ? 'bg-nebula-secondary/10 border-nebula-secondary/20 text-nebula-secondary'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            }`}>
            {loading ? (
              <span className="animate-pulse">{isDegraded ? 'DEGRADED' : 'READING...'}</span>
            ) : (
              isDegraded ? 'DEGRADED' : 'OPERATIONAL'
            )}
          </div>
        </div>

        {/* ── Speech Bubble ───────────────────────────────────────────────── */}
        <div className="relative w-full px-1">
          <div
            key={insight}
            className={`
              relative rounded-2xl p-3.5 min-h-[68px] flex items-center justify-center
              animate-[fadeSlideIn_0.5s_ease-out]
              ${isDegraded
                ? 'bg-pink-500/8 border border-pink-500/20'
                : effectiveMood === 'alert'
                ? 'bg-red-500/5 border border-red-500/15'
                : 'bg-white/5 border border-white/10'
              }
            `}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-nebula-accent rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            ) : (
              <p className={`text-sm font-medium leading-relaxed italic ${isDegraded ? 'text-pink-100/90' : 'text-slate-200'}`}>
                &ldquo;{insight || 'The studio is calm, Human.'}&rdquo;
              </p>
            )}
          </div>
          {/* Bubble tail pointing down to cat */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-[8px] w-0 h-0
            border-l-[8px] border-l-transparent
            border-r-[8px] border-r-transparent
            border-t-[8px] border-t-white/10" />
        </div>

        {/* ── Mascot with particles + mrrp bubble ─────────────────────────── */}
        <div
          ref={mascotRef}
          className="relative flex flex-col items-center gap-1 pt-2"
          style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.2s' }}
        >
          {/* Floating particles */}
          {mounted && (
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              {PARTICLES.map((p, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left:       `${p.x}%`,
                    top:        `${p.y}%`,
                    width:      `${p.size}px`,
                    height:     `${p.size}px`,
                    background: particleClr,
                    boxShadow:  `0 0 ${p.size * 3}px ${particleClr}`,
                    animation:  `particleFloat ${p.dur}s ${p.delay}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Mrrp bubble */}
          {mrrpText && (
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
              style={{ animation: 'mrrpPop 1.6s ease-out forwards' }}
            >
              <div className={`
                px-3 py-1.5 rounded-2xl rounded-bl-sm text-xs font-black uppercase tracking-widest whitespace-nowrap
                ${active === 'texas'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/20  border border-amber-500/40  text-amber-300'
                }
              `}>
                {mrrpText}
              </div>
            </div>
          )}

          {/* Status-reactive glow ring behind mascot */}
          {mounted && effectiveMood === 'alert' && (
            <div className="absolute inset-0 rounded-full bg-red-500/5 blur-xl animate-pulse pointer-events-none" />
          )}

          {/* Cat mascot */}
          {(!mounted || active === 'texas') ? (
            <BengalMascot
              mood={effectiveMood}
              isDegraded={isDegraded}
              eyeOffset={eyeOffset}
              onClick={handleCatClick}
              className="w-44 h-44"
            />
          ) : (
            <DevonRexMascot
              mood={effectiveMood}
              isDegraded={isDegraded}
              eyeOffset={eyeOffset}
              onClick={handleCatClick}
              className="w-44 h-44"
            />
          )}

          {/* Guardian name */}
          <span className={`text-[8px] font-black uppercase tracking-widest ${accentCls} opacity-60`}>
            {guardianLabel}
          </span>
        </div>

        {/* ── Dot switchers ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => switchTo('texas')}
            aria-label="Switch to Texas"
            className={`rounded-full transition-all duration-300 ${
              active === 'texas'
                ? 'bg-emerald-500 w-4 h-2 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                : 'bg-white/20 w-2 h-2 hover:bg-white/40'
            }`}
          />
          <button
            onClick={() => switchTo('gosta')}
            aria-label="Switch to Gösta"
            className={`rounded-full transition-all duration-300 ${
              active === 'gosta'
                ? 'bg-amber-400 w-4 h-2 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                : 'bg-white/20 w-2 h-2 hover:bg-white/40'
            }`}
          />
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="pt-3 border-t border-white/5 w-full flex justify-between items-center mt-auto">
          <div className="flex items-center gap-2 text-slate-500">
            <Zap className="w-3 h-3 text-nebula-accent/50" />
            <span className="text-[9px] font-black uppercase tracking-widest">Dev Studio Oversight</span>
          </div>
          {isHighLoad && (
            <span className="text-nebula-secondary text-[8px] font-bold animate-pulse uppercase tracking-tighter">
              Eyes Fixed
            </span>
          )}
        </div>
      </div>

      {/* Decorative glow */}
      <div className={`absolute -right-10 -bottom-10 w-40 h-40 ${glowBg} rounded-full blur-3xl transition-colors duration-500`} />
    </div>
  );
}
