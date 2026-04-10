'use client';

import React from 'react';
import type { CatMood } from '@/types';

interface DevonRexMascotProps {
  mood?: CatMood;
  isDegraded?: boolean;
  eyeOffset?: { x: number; y: number };
  onClick?: () => void;
  className?: string;
}

export function DevonRexMascot({ mood = 'idle', isDegraded, eyeOffset, onClick, className }: DevonRexMascotProps) {
  const isAlert    = mood === 'alert';
  const isTired    = mood === 'tired' || !!isDegraded;
  const isYawn     = mood === 'yawn';
  const isStretch  = mood === 'stretch';
  const isStartled = mood === 'startled';
  const isPaw      = mood === 'paw';

  // Animation speeds
  const tailSpeed   = isAlert ? '1s'    : isTired ? '8s'   : '4.5s';
  const breathSpeed = isAlert ? '1.3s'  : isTired ? '7s'   : '3.5s';
  const earSpeed    = isAlert ? '1.2s'  : isTired ? '11s'  : '4.5s';

  // Grey Devon Rex palette
  const base     = '#7d8fa0';
  const light    = '#a8bbc8';
  const belly    = '#c2d0dc';
  const dark     = '#3d4e60';
  const earInner = '#c89aaa';
  const stripe   = '#4a5f70';
  const eyeColor = isDegraded ? '#5a6a7a' : '#b87820';
  const noseRose = '#dda0b8';

  // Cursor tracking — clamped ±2 SVG units (Devon Rex eyes are smaller)
  const ex = Math.max(-2, Math.min(2, eyeOffset?.x ?? 0));
  const ey = Math.max(-2, Math.min(2, eyeOffset?.y ?? 0));

  // Eyelid y-position: lower = more open, higher = more closed
  // Devon Rex normally squints; alert = open wide, tired = heavy squint
  const lidY  = isAlert ? 37.5 : isTired ? 42.5 : 40.5;
  const lidRY = isAlert ? 3    : isTired ? 5.5   : 4.5;

  // Pupil size
  const pupilRX = isAlert || isStartled ? 4   : isTired ? 1.5 : isYawn ? 0.8 : 3;
  const pupilRY = isAlert || isStartled ? 3.5 : isTired ? 1.2 : isYawn ? 0.6 : 2.5;

  // Glow
  const glowPx  = isAlert ? '18px' : '10px';
  const glowClr = isDegraded ? 'none' : isAlert ? 'rgba(239,68,68,0.3)' : 'rgba(180,120,32,0.22)';

  const svgAnim = isStartled
    ? 'grStartle 0.5s ease-out forwards'
    : isStretch
    ? 'catStretch 2s ease-in-out'
    : undefined;

  return (
    <div
      className={`relative flex items-center justify-center ${className ?? 'w-40 h-40'} ${onClick ? 'cursor-pointer select-none' : ''}`}
      onClick={onClick}
    >
      {!isDegraded && (
        <div
          className={`absolute inset-0 rounded-full border ${isAlert ? 'border-red-500/20' : 'border-amber-500/15'}`}
          style={{ animation: `ping ${isAlert ? '2s' : '5s'} 1s ease-in-out infinite` }}
        />
      )}

      <svg
        viewBox="0 0 100 115"
        className={`w-full h-full transition-all duration-700 ${isDegraded ? 'opacity-40 grayscale' : ''}`}
        style={{
          filter: isDegraded ? undefined : `drop-shadow(0 0 ${glowPx} ${glowClr})`,
          animation: svgAnim,
        }}
      >
        <defs>
          <radialGradient id="grBodyGrad" cx="50%" cy="50%" r="55%">
            <stop offset="0%"   stopColor={belly} />
            <stop offset="50%"  stopColor={light} />
            <stop offset="100%" stopColor={base}  />
          </radialGradient>
          <radialGradient id="grHeadGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%"   stopColor={light} />
            <stop offset="65%"  stopColor={base}  />
            <stop offset="100%" stopColor={dark}  />
          </radialGradient>
          <radialGradient id="grEyeGrad" cx="30%" cy="25%" r="65%">
            <stop offset="0%"   stopColor="#e8b040" />
            <stop offset="100%" stopColor={eyeColor} />
          </radialGradient>
        </defs>

        {/* WOODEN LEDGE */}
        <rect x="8"  y="96" width="84" height="8" rx="2"   fill="#4a3828" />
        <rect x="5"  y="101" width="90" height="5" rx="1.5" fill="#3a2a1e" />
        <g stroke="#3a2a1e" strokeWidth="0.5" opacity="0.4">
          <line x1="20" y1="97" x2="18" y2="104" />
          <line x1="40" y1="97" x2="38" y2="104" />
          <line x1="60" y1="97" x2="58" y2="104" />
          <line x1="80" y1="97" x2="78" y2="104" />
        </g>

        {/* ── TAIL ── */}
        <g style={{ transformOrigin: '68px 88px', animation: `grTail ${tailSpeed} ease-in-out infinite` }}>
          <path d="M68 88 Q 82 85 88 75 Q 94 65 88 55"
            fill="none" stroke={base} strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="88" cy="55" r="3.5" fill={dark} />
        </g>

        {/* ── BODY ── */}
        <g style={{ transformOrigin: '50px 73px', animation: `grBreath ${breathSpeed} ease-in-out infinite` }}>
          <ellipse cx="50" cy="73" rx="22" ry="24" fill="url(#grBodyGrad)" />
          <ellipse cx="50" cy="76" rx="12" ry="15" fill={belly} opacity="0.45" />

          {/* Tabby stripes */}
          <g stroke={stripe} strokeWidth="1.1" fill="none" opacity="0.45" strokeLinecap="round">
            <path d="M31 63 Q37 61 41 64" /><path d="M31 69 Q37 67 40 70" /><path d="M31 76 Q37 74 40 77" />
            <path d="M59 62 Q64 60 69 63" /><path d="M60 68 Q65 66 70 69" /><path d="M59 75 Q64 73 69 76" />
          </g>

          {/* Curly Devon Rex fur — body */}
          <g stroke={dark} strokeWidth="0.75" fill="none" opacity="0.38" strokeLinecap="round">
            <path d="M31 62 Q33 60 35 62 Q37 60 39 62" /><path d="M30 67 Q32 65 34 67 Q36 65 38 67" />
            <path d="M31 72 Q33 70 35 72 Q37 70 39 72" /><path d="M32 77 Q34 75 36 77" />
            <path d="M61 62 Q63 60 65 62 Q67 60 69 62" /><path d="M62 67 Q64 65 66 67 Q68 65 70 67" />
            <path d="M61 72 Q63 70 65 72 Q67 70 69 72" /><path d="M63 77 Q65 75 67 77" />
            <path d="M44 80 Q46 78 48 80 Q50 78 52 80" /><path d="M46 75 Q48 73 50 75" />
          </g>

          {/* LEFT PAW — raises on mood='paw' (left paw for variety vs Bengal) */}
          <g style={isPaw ? { transformOrigin: '39px 90px', animation: 'grPawRaise 1.6s ease-in-out forwards' } : undefined}>
            <ellipse cx="39" cy="93" rx="9" ry="4.5" fill={light} />
            <g stroke={base} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.65">
              <line x1="34" y1="90" x2="33" y2="95" />
              <line x1="39" y1="89" x2="39" y2="95" />
              <line x1="44" y1="90" x2="45" y2="95" />
            </g>
          </g>

          {/* RIGHT PAW */}
          <ellipse cx="61" cy="93" rx="9" ry="4.5" fill={light} />
          <g stroke={base} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.65">
            <line x1="56" y1="90" x2="55" y2="95" />
            <line x1="61" y1="89" x2="61" y2="95" />
            <line x1="66" y1="90" x2="67" y2="95" />
          </g>
        </g>

        {/* Neck */}
        <ellipse cx="50" cy="55" rx="9" ry="7" fill="url(#grHeadGrad)" />
        <g stroke={dark} strokeWidth="0.7" fill="none" opacity="0.35" strokeLinecap="round">
          <path d="M44 53 Q46 51 48 53" /><path d="M52 53 Q54 51 56 53" /><path d="M45 57 Q47 55 49 57" />
        </g>

        {/* ── EARS — wrapper rotates for mood ── */}
        <g style={{
          transformOrigin: '38px 44px',
          transform: isAlert ? 'rotate(-8deg)' : isTired ? 'rotate(4deg)' : undefined,
          transition: 'transform 0.6s ease',
        }}>
          <g style={{ transformOrigin: '38px 40px', animation: `grEarL ${earSpeed} ease-in-out infinite` }}>
            <polygon points="34,46 28,22 49,33" fill={base} />
            <polygon points="35,44 30,26 47,34" fill={earInner} opacity="0.65" />
            <circle cx="28" cy="22" r="2.5" fill={base} />
          </g>
        </g>
        <g style={{
          transformOrigin: '62px 44px',
          transform: isAlert ? 'rotate(8deg)' : isTired ? 'rotate(-4deg)' : undefined,
          transition: 'transform 0.6s ease',
        }}>
          <g style={{ transformOrigin: '62px 40px', animation: `grEarR ${earSpeed} ease-in-out infinite` }}>
            <polygon points="66,46 72,22 51,33" fill={base} />
            <polygon points="65,44 70,26 53,34" fill={earInner} opacity="0.65" />
            <circle cx="72" cy="22" r="2.5" fill={base} />
          </g>
        </g>

        {/* ── HEAD ── */}
        <circle cx="50" cy="43" r="18" fill="url(#grHeadGrad)" />

        {/* Cheekbones */}
        <ellipse cx="35" cy="47" rx="6" ry="4" fill={light} opacity="0.25" />
        <ellipse cx="65" cy="47" rx="6" ry="4" fill={light} opacity="0.25" />

        {/* Face markings */}
        <g stroke={stripe} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5">
          <path d="M44 30 Q47 27 50 30" /><path d="M50 30 Q53 26 56 30" />
          <line x1="44" y1="30" x2="43" y2="35" /><line x1="50" y1="27" x2="50" y2="34" /><line x1="56" y1="30" x2="57" y2="35" />
          <path d="M34 44 Q32 47 34 50" /><path d="M35 46 Q33 49 35 52" />
          <path d="M66 44 Q68 47 66 50" /><path d="M65 46 Q67 49 65 52" />
        </g>

        {/* Curly fur on head */}
        <g stroke={dark} strokeWidth="0.75" fill="none" opacity="0.38" strokeLinecap="round">
          <path d="M44 33 Q46 31 48 33 Q50 31 52 33" /><path d="M46 37 Q48 35 50 37 Q52 35 54 37" />
          <path d="M34 43 Q36 41 38 43" /><path d="M33 47 Q35 45 37 47" /><path d="M34 51 Q36 49 38 51" />
          <path d="M62 43 Q64 41 66 43" /><path d="M63 47 Q65 45 67 47" /><path d="M62 51 Q64 49 66 51" />
        </g>

        {/* ── LEFT EYE — squinting Devon Rex style ── */}
        <ellipse cx="42" cy="43" rx="5.5" ry="4"   fill="url(#grEyeGrad)" />
        <ellipse cx={42 + ex} cy={43 + ey} rx={pupilRX} ry={pupilRY} fill="#140c04" />
        <circle  cx={40.5 + ex * 0.5} cy={41.5 + ey * 0.5} r="1" fill="white" opacity="0.7" />
        {/* Heavy upper lid — position varies with mood */}
        {!isYawn ? (
          <ellipse cx="42" cy={lidY} rx="5.8" ry={lidRY} fill={base} />
        ) : (
          <ellipse cx="42" cy="43" rx="6" ry="6" fill={base} />
        )}
        <path d="M36 40 Q42 36.5 48 40" stroke={dark} strokeWidth={isAlert ? '1.2' : '2'} strokeLinecap="round" fill="none" />

        {/* ── RIGHT EYE ── */}
        <ellipse cx="58" cy="43" rx="5.5" ry="4"   fill="url(#grEyeGrad)" />
        <ellipse cx={58 + ex} cy={43 + ey} rx={pupilRX} ry={pupilRY} fill="#140c04" />
        <circle  cx={56.5 + ex * 0.5} cy={41.5 + ey * 0.5} r="1" fill="white" opacity="0.7" />
        {!isYawn ? (
          <ellipse cx="58" cy={lidY} rx="5.8" ry={lidRY} fill={base} />
        ) : (
          <ellipse cx="58" cy="43" rx="6" ry="6" fill={base} />
        )}
        <path d="M52 40 Q58 36.5 64 40" stroke={dark} strokeWidth={isAlert ? '1.2' : '2'} strokeLinecap="round" fill="none" />

        {/* ── NOSE ── */}
        <ellipse cx="50" cy="50" rx="3" ry="2.2" fill={noseRose} />

        {/* ── MOUTH — yawn = surprised O, tired = tight closed, normal = dignified ── */}
        {isYawn ? (
          <ellipse cx="50" cy="57" rx="4.5" ry="5.5" fill="#100818" />
        ) : isTired ? (
          <path d="M47 54 Q50 55 53 54" fill="none" stroke={dark} strokeWidth="0.7" strokeLinecap="round" opacity="0.5" />
        ) : (
          <g stroke={dark} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.6">
            <path d="M50 53 Q48 55 46 54" />
            <path d="M50 53 Q52 55 54 54" />
          </g>
        )}

        {/* SHORT CURLY WHISKERS */}
        <g stroke={belly} strokeWidth="0.6" opacity="0.7"
          style={isAlert ? { animation: 'grWhisk 1.2s ease-in-out infinite' } : undefined}>
          <line x1="38" y1="50" x2="20" y2="47" />
          <line x1="38" y1="52" x2="21" y2="55" />
          <line x1="62" y1="50" x2="80" y2="47" />
          <line x1="62" y1="52" x2="79" y2="55" />
        </g>

        <style jsx>{`
          @keyframes grTail {
            0%, 100% { transform: rotate(0deg); }
            35% { transform: rotate(10deg); }
            65% { transform: rotate(-5deg); }
          }
          @keyframes grBreath {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.04); }
          }
          @keyframes grEarL {
            0%, 80%, 100% { transform: rotate(0deg); }
            85% { transform: rotate(6deg); }
            92% { transform: rotate(-3deg); }
          }
          @keyframes grEarR {
            0%, 70%, 100% { transform: rotate(0deg); }
            76% { transform: rotate(-7deg); }
            84% { transform: rotate(3deg); }
          }
          @keyframes grWhisk {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-4deg); }
          }
          @keyframes grPawRaise {
            0%, 100% { transform: rotate(0deg)   translateY(0px);  }
            35%       { transform: rotate(-26deg) translateY(-9px); }
            65%       { transform: rotate(-20deg) translateY(-11px); }
          }
          @keyframes grStartle {
            0%   { transform: scale(1)    rotate(0deg);  }
            20%  { transform: scale(1.12) rotate(4deg);  }
            45%  { transform: scale(0.94) rotate(-3deg); }
            70%  { transform: scale(1.05) rotate(1deg);  }
            100% { transform: scale(1)    rotate(0deg);  }
          }
        `}</style>
      </svg>
    </div>
  );
}
