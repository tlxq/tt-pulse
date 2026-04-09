'use client';

import React from 'react';

interface BengalMascotProps {
  isHighLoad?: boolean;
  isDegraded?: boolean;
  className?: string;
}

export function BengalMascot({ isHighLoad, isDegraded, className }: BengalMascotProps) {
  const tailSpeed = isHighLoad ? '0.9s' : '3.5s';
  const breathingSpeed = isHighLoad ? '1.2s' : '3s';
  const earSpeed = isHighLoad ? '1.5s' : '5s';

  // Beach Bengal — warm sandy silver palette
  const base = '#d4c9b0';
  const light = '#ece6d8';
  const stripe = '#7a6a52';
  const outline = '#a89878';
  const eyeColor = isDegraded ? '#8090a0' : '#1a7a50';
  const noseRose = '#f9a8b8';
  const tongue = '#f472b6';

  return (
    <div className={`relative flex items-center justify-center ${className ?? 'w-40 h-40'}`}>
      {!isDegraded && (
        <div className="absolute inset-0 rounded-full border border-emerald-500/15 animate-[ping_5s_ease-in-out_infinite]" />
      )}

      <svg
        viewBox="0 0 100 110"
        className={`w-full h-full transition-all duration-700 ${isDegraded ? 'opacity-40 grayscale' : ''}`}
        style={!isDegraded ? { filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.22))' } : undefined}
      >
        <defs>
          <radialGradient id="txBodyGrad" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={light} />
            <stop offset="55%" stopColor={base} />
            <stop offset="100%" stopColor={outline} />
          </radialGradient>
          <radialGradient id="txHeadGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor={light} />
            <stop offset="65%" stopColor={base} />
            <stop offset="100%" stopColor={outline} />
          </radialGradient>
          <radialGradient id="txEyeGrad" cx="30%" cy="25%" r="65%">
            <stop offset="0%" stopColor="#50c090" />
            <stop offset="100%" stopColor={eyeColor} />
          </radialGradient>
        </defs>

        {/* TAIL */}
        <g style={{ transformOrigin: '32px 82px', animation: `txTail ${tailSpeed} ease-in-out infinite` }}>
          <path d="M32 82 Q 10 82 5 67 Q 0 52 10 46"
            fill="none" stroke={outline} strokeWidth="7" strokeLinecap="round" />
          <circle cx="10" cy="46" r="4.5" fill={stripe} />
        </g>

        {/* BODY */}
        <g style={{ transformOrigin: '50px 72px', animation: `txBreath ${breathingSpeed} ease-in-out infinite` }}>
          <ellipse cx="50" cy="72" rx="28" ry="22" fill="url(#txBodyGrad)" />
          {/* Belly */}
          <ellipse cx="51" cy="75" rx="16" ry="13" fill={light} opacity="0.5" />

          {/* Body stripes — horizontal tabby */}
          <g stroke={stripe} strokeWidth="1.2" fill="none" opacity="0.55" strokeLinecap="round">
            <path d="M26 62 Q34 60 38 63" />
            <path d="M26 67 Q35 65 40 68" />
            <path d="M26 73 Q35 71 39 74" />
            <path d="M62 61 Q68 59 74 62" />
            <path d="M61 67 Q68 65 74 68" />
            <path d="M62 73 Q68 71 74 74" />
          </g>

          {/* Rosette spots */}
          <ellipse cx="38" cy="63" rx="5" ry="3.5" fill={stripe} opacity="0.5" />
          <ellipse cx="38" cy="63" rx="2.8" ry="1.8" fill={base} opacity="0.85" />
          <ellipse cx="63" cy="62" rx="4.5" ry="3" fill={stripe} opacity="0.45" />
          <ellipse cx="63" cy="62" rx="2.5" ry="1.5" fill={base} opacity="0.85" />

          {/* Front paws */}
          <ellipse cx="38" cy="91" rx="10" ry="5.5" fill={base} />
          <ellipse cx="62" cy="91" rx="10" ry="5.5" fill={base} />
          <g stroke={outline} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.7">
            <line x1="33" y1="87" x2="32" y2="93" />
            <line x1="38" y1="86" x2="38" y2="93" />
            <line x1="43" y1="87" x2="44" y2="93" />
            <line x1="57" y1="87" x2="56" y2="93" />
            <line x1="62" y1="86" x2="62" y2="93" />
            <line x1="67" y1="87" x2="68" y2="93" />
          </g>
        </g>

        {/* EARS */}
        <g style={{ transformOrigin: '36px 37px', animation: `txEarL ${earSpeed} ease-in-out infinite` }}>
          <polygon points="28,47 24,22 46,36" fill={base} />
          <polygon points="30,45 27,27 44,36" fill={noseRose} opacity="0.5" />
        </g>
        <g style={{ transformOrigin: '64px 37px', animation: `txEarR ${earSpeed} ease-in-out infinite` }}>
          <polygon points="72,47 76,22 54,36" fill={base} />
          <polygon points="70,45 73,27 56,36" fill={noseRose} opacity="0.5" />
        </g>

        {/* HEAD */}
        <circle cx="50" cy="52" r="21" fill="url(#txHeadGrad)" />

        {/* Face stripes — tabby M-marking and cheek stripes */}
        <g stroke={stripe} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.65">
          {/* Forehead M */}
          <path d="M43 37 Q46 33 49 37" />
          <path d="M49 37 Q52 31 55 37" />
          <path d="M55 37 Q58 33 61 37" />
          <line x1="43" y1="37" x2="42" y2="43" />
          <line x1="50" y1="32" x2="50" y2="41" />
          <line x1="57" y1="37" x2="58" y2="43" />
          {/* Cheek stripes */}
          <path d="M31 51 Q29 55 31 59" />
          <path d="M33 53 Q31 57 33 61" />
          <path d="M69 51 Q71 55 69 59" />
          <path d="M67 53 Q69 57 67 61" />
        </g>

        {/* HUGE BUG EYES — defining Texas trait (ref image: massive dark round eyes) */}
        {/* Left eye */}
        <circle cx="42" cy="50" r="7" fill="url(#txEyeGrad)" />
        <circle cx="42" cy="50" r="5.2" fill="#060810" />
        <circle cx="39.5" cy="47.5" r="2" fill="white" opacity="0.85" />
        <circle cx="43.5" cy="47" r="1" fill="white" opacity="0.4" />
        {/* Blink lid */}
        <ellipse cx="42" cy="50" rx="7" ry="7" fill={base}
          style={{ animation: `txBlink ${isHighLoad ? '2s' : '5s'} ${isHighLoad ? '0s' : '2s'} ease-in-out infinite`, transformOrigin: '42px 44px' }} />

        {/* Right eye */}
        <circle cx="58" cy="50" r="7" fill="url(#txEyeGrad)" />
        <circle cx="58" cy="50" r="5.2" fill="#060810" />
        <circle cx="55.5" cy="47.5" r="2" fill="white" opacity="0.85" />
        <circle cx="59.5" cy="47" r="1" fill="white" opacity="0.4" />
        <ellipse cx="58" cy="50" rx="7" ry="7" fill={base}
          style={{ animation: `txBlink ${isHighLoad ? '2s' : '5s'} ${isHighLoad ? '0s' : '2s'} ease-in-out infinite`, transformOrigin: '58px 44px' }} />

        {/* Eye outline rings */}
        <circle cx="42" cy="50" r="7" fill="none" stroke={stripe} strokeWidth="0.6" opacity="0.5" />
        <circle cx="58" cy="50" r="7" fill="none" stroke={stripe} strokeWidth="0.6" opacity="0.5" />

        {/* NOSE — small triangle */}
        <path d="M47 59 L53 59 L50 62 Z" fill={noseRose} />

        {/* OPEN MOUTH WITH TONGUE — ref image shows mouth open + tongue out */}
        <path d="M44 62 Q50 68 56 62" fill="#100818" />
        <ellipse cx="50" cy="67" rx="5" ry="3.5" fill={tongue} />
        <line x1="50" y1="63" x2="50" y2="69" stroke="#e05090" strokeWidth="0.8" />

        {/* WHISKERS */}
        <g stroke={light} strokeWidth="0.7" opacity="0.8"
          style={isHighLoad ? { animation: 'txWhisk 1.5s ease-in-out infinite' } : undefined}>
          <line x1="38" y1="58" x2="16" y2="54" />
          <line x1="38" y1="61" x2="17" y2="62" />
          <line x1="62" y1="58" x2="84" y2="54" />
          <line x1="62" y1="61" x2="83" y2="62" />
        </g>

        <style jsx>{`
          @keyframes txTail {
            0%, 100% { transform: rotate(0deg); }
            40% { transform: rotate(-12deg); }
            70% { transform: rotate(6deg); }
          }
          @keyframes txBreath {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.04); }
          }
          @keyframes txEarL {
            0%, 85%, 100% { transform: rotate(0deg); }
            90% { transform: rotate(4deg); }
            95% { transform: rotate(-2deg); }
          }
          @keyframes txEarR {
            0%, 75%, 100% { transform: rotate(0deg); }
            80% { transform: rotate(-5deg); }
            88% { transform: rotate(2deg); }
          }
          @keyframes txBlink {
            0%, 88%, 100% { transform: scaleY(0); }
            92% { transform: scaleY(1); }
          }
          @keyframes txWhisk {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(3deg); }
          }
        `}</style>
      </svg>
    </div>
  );
}
