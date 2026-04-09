'use client';

import React from 'react';

interface DevonRexMascotProps {
  isHighLoad?: boolean;
  isDegraded?: boolean;
  className?: string;
}

export function DevonRexMascot({ isHighLoad, isDegraded, className }: DevonRexMascotProps) {
  const tailSpeed = isHighLoad ? '1s' : '4.5s';
  const breathingSpeed = isHighLoad ? '1.3s' : '3.5s';
  const earSpeed = isHighLoad ? '1.2s' : '4.5s';

  // Grey Devon Rex palette
  const base = '#7d8fa0';
  const light = '#a8bbc8';
  const belly = '#c2d0dc';
  const dark = '#3d4e60';
  const earInner = '#c89aaa';
  const stripe = '#4a5f70';
  const eyeColor = isDegraded ? '#5a6a7a' : '#b87820';
  const noseRose = '#dda0b8';

  return (
    <div className={`relative flex items-center justify-center ${className ?? 'w-40 h-40'}`}>
      {!isDegraded && (
        <div className="absolute inset-0 rounded-full border border-amber-500/15 animate-[ping_5s_1s_ease-in-out_infinite]" />
      )}

      <svg
        viewBox="0 0 100 115"
        className={`w-full h-full transition-all duration-700 ${isDegraded ? 'opacity-40 grayscale' : ''}`}
        style={!isDegraded ? { filter: 'drop-shadow(0 0 10px rgba(180,120,32,0.22))' } : undefined}
      >
        <defs>
          <radialGradient id="grBodyGrad" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={belly} />
            <stop offset="50%" stopColor={light} />
            <stop offset="100%" stopColor={base} />
          </radialGradient>
          <radialGradient id="grHeadGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor={light} />
            <stop offset="65%" stopColor={base} />
            <stop offset="100%" stopColor={dark} />
          </radialGradient>
          <radialGradient id="grEyeGrad" cx="30%" cy="25%" r="65%">
            <stop offset="0%" stopColor="#e8b040" />
            <stop offset="100%" stopColor={eyeColor} />
          </radialGradient>
        </defs>

        {/* WOODEN LEDGE / FENCE — ref image: cat sits on fence top */}
        <rect x="8" y="96" width="84" height="8" rx="2" fill="#4a3828" />
        <rect x="5" y="101" width="90" height="5" rx="1.5" fill="#3a2a1e" />
        {/* Wood grain */}
        <g stroke="#3a2a1e" strokeWidth="0.5" opacity="0.4">
          <line x1="20" y1="97" x2="18" y2="104" />
          <line x1="40" y1="97" x2="38" y2="104" />
          <line x1="60" y1="97" x2="58" y2="104" />
          <line x1="80" y1="97" x2="78" y2="104" />
        </g>

        {/* TAIL — wrapping around body, tip on ledge */}
        <g style={{ transformOrigin: '68px 88px', animation: `grTail ${tailSpeed} ease-in-out infinite` }}>
          <path d="M68 88 Q 82 85 88 75 Q 94 65 88 55"
            fill="none" stroke={base} strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="88" cy="55" r="3.5" fill={dark} />
        </g>

        {/* BODY — upright sitting pose, sits ON ledge */}
        <g style={{ transformOrigin: '50px 73px', animation: `grBreath ${breathingSpeed} ease-in-out infinite` }}>
          {/* Main body — taller/upright for sitting pose */}
          <ellipse cx="50" cy="73" rx="22" ry="24" fill="url(#grBodyGrad)" />
          {/* Belly */}
          <ellipse cx="50" cy="76" rx="12" ry="15" fill={belly} opacity="0.45" />

          {/* Tabby stripes on body */}
          <g stroke={stripe} strokeWidth="1.1" fill="none" opacity="0.45" strokeLinecap="round">
            <path d="M31 63 Q37 61 41 64" />
            <path d="M31 69 Q37 67 40 70" />
            <path d="M31 76 Q37 74 40 77" />
            <path d="M59 62 Q64 60 69 63" />
            <path d="M60 68 Q65 66 70 69" />
            <path d="M59 75 Q64 73 69 76" />
          </g>

          {/* Devon Rex curly fur texture — dense, all over body */}
          <g stroke={dark} strokeWidth="0.75" fill="none" opacity="0.38" strokeLinecap="round">
            {/* Left side */}
            <path d="M31 62 Q33 60 35 62 Q37 60 39 62" />
            <path d="M30 67 Q32 65 34 67 Q36 65 38 67" />
            <path d="M31 72 Q33 70 35 72 Q37 70 39 72" />
            <path d="M32 77 Q34 75 36 77" />
            {/* Right side */}
            <path d="M61 62 Q63 60 65 62 Q67 60 69 62" />
            <path d="M62 67 Q64 65 66 67 Q68 65 70 67" />
            <path d="M61 72 Q63 70 65 72 Q67 70 69 72" />
            <path d="M63 77 Q65 75 67 77" />
            {/* Center / belly edge */}
            <path d="M44 80 Q46 78 48 80 Q50 78 52 80" />
            <path d="M46 75 Q48 73 50 75" />
          </g>

          {/* Front paws resting on ledge */}
          <ellipse cx="39" cy="93" rx="9" ry="4.5" fill={light} />
          <ellipse cx="61" cy="93" rx="9" ry="4.5" fill={light} />
          <g stroke={base} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.65">
            <line x1="34" y1="90" x2="33" y2="95" />
            <line x1="39" y1="89" x2="39" y2="95" />
            <line x1="44" y1="90" x2="45" y2="95" />
            <line x1="56" y1="90" x2="55" y2="95" />
            <line x1="61" y1="89" x2="61" y2="95" />
            <line x1="66" y1="90" x2="67" y2="95" />
          </g>
        </g>

        {/* LONG NECK connector */}
        <ellipse cx="50" cy="55" rx="9" ry="7" fill="url(#grHeadGrad)" />

        {/* Devon Rex curly fur on neck */}
        <g stroke={dark} strokeWidth="0.7" fill="none" opacity="0.35" strokeLinecap="round">
          <path d="M44 53 Q46 51 48 53" />
          <path d="M52 53 Q54 51 56 53" />
          <path d="M45 57 Q47 55 49 57" />
        </g>

        {/* EARS — upright Devon Rex ears, sit ON the head (not splayed wide) */}
        <g style={{ transformOrigin: '38px 40px', animation: `grEarL ${earSpeed} ease-in-out infinite` }}>
          {/* Outer ear: base at head edge, tip pointing up-slightly-out */}
          <polygon points="34,46 28,22 49,33" fill={base} />
          {/* Inner ear (pink) */}
          <polygon points="35,44 30,26 47,34" fill={earInner} opacity="0.65" />
          {/* Rounded tip */}
          <circle cx="28" cy="22" r="2.5" fill={base} />
        </g>
        <g style={{ transformOrigin: '62px 40px', animation: `grEarR ${earSpeed} ease-in-out infinite` }}>
          <polygon points="66,46 72,22 51,33" fill={base} />
          <polygon points="65,44 70,26 53,34" fill={earInner} opacity="0.65" />
          <circle cx="72" cy="22" r="2.5" fill={base} />
        </g>

        {/* HEAD — small, round, high forehead */}
        <circle cx="50" cy="43" r="18" fill="url(#grHeadGrad)" />

        {/* Prominent cheekbones */}
        <ellipse cx="35" cy="47" rx="6" ry="4" fill={light} opacity="0.25" />
        <ellipse cx="65" cy="47" rx="6" ry="4" fill={light} opacity="0.25" />

        {/* Tabby markings on face */}
        <g stroke={stripe} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5">
          <path d="M44 30 Q47 27 50 30" />
          <path d="M50 30 Q53 26 56 30" />
          <line x1="44" y1="30" x2="43" y2="35" />
          <line x1="50" y1="27" x2="50" y2="34" />
          <line x1="56" y1="30" x2="57" y2="35" />
          {/* Cheek stripes */}
          <path d="M34 44 Q32 47 34 50" />
          <path d="M35 46 Q33 49 35 52" />
          <path d="M66 44 Q68 47 66 50" />
          <path d="M65 46 Q67 49 65 52" />
        </g>

        {/* Devon Rex curly fur on head — dense wavy strokes */}
        <g stroke={dark} strokeWidth="0.75" fill="none" opacity="0.38" strokeLinecap="round">
          {/* Forehead curls */}
          <path d="M44 33 Q46 31 48 33 Q50 31 52 33" />
          <path d="M46 37 Q48 35 50 37 Q52 35 54 37" />
          {/* Left cheek curls */}
          <path d="M34 43 Q36 41 38 43" />
          <path d="M33 47 Q35 45 37 47" />
          <path d="M34 51 Q36 49 38 51" />
          {/* Right cheek curls */}
          <path d="M62 43 Q64 41 66 43" />
          <path d="M63 47 Q65 45 67 47" />
          <path d="M62 51 Q64 49 66 51" />
        </g>

        {/* SQUINTING EYES — ref image: Devon Rex half-closed dignified look */}
        {/* Left eye */}
        <g>
          {/* Iris — visible only as thin strip */}
          <ellipse cx="42" cy="43" rx="5.5" ry="4" fill="url(#grEyeGrad)" />
          <ellipse cx="42" cy="43" rx="3" ry="2.5" fill="#140c04" />
          <circle cx="40.5" cy="41.5" r="1" fill="white" opacity="0.7" />
          {/* Heavy upper eyelid covering top 60% of eye — creates squint */}
          <ellipse cx="42" cy="40.5" rx="5.5" ry="4.5" fill={base} />
          {/* Brow / eyelid line */}
          <path d="M36 40 Q42 36.5 48 40" stroke={dark} strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>

        {/* Right eye */}
        <g>
          <ellipse cx="58" cy="43" rx="5.5" ry="4" fill="url(#grEyeGrad)" />
          <ellipse cx="58" cy="43" rx="3" ry="2.5" fill="#140c04" />
          <circle cx="56.5" cy="41.5" r="1" fill="white" opacity="0.7" />
          <ellipse cx="58" cy="40.5" rx="5.5" ry="4.5" fill={base} />
          <path d="M52 40 Q58 36.5 64 40" stroke={dark} strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>

        {/* NOSE — small, delicate */}
        <ellipse cx="50" cy="50" rx="3" ry="2.2" fill={noseRose} />
        {/* Tiny closed mouth — dignified expression */}
        <g stroke={dark} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.6">
          <path d="M50 53 Q48 55 46 54" />
          <path d="M50 53 Q52 55 54 54" />
        </g>

        {/* SHORT CURLY WHISKERS */}
        <g stroke={belly} strokeWidth="0.6" opacity="0.7"
          style={isHighLoad ? { animation: 'grWhisk 1.2s ease-in-out infinite' } : undefined}>
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
        `}</style>
      </svg>
    </div>
  );
}
