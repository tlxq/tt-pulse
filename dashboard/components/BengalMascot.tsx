'use client';

import React from 'react';

interface BengalMascotProps {
  isHighLoad?: boolean;
  isDegraded?: boolean;
}

export function BengalMascot({ isHighLoad, isDegraded }: BengalMascotProps) {
  // Animation speeds based on state
  const tailSpeed = isHighLoad ? '1s' : '4s';
  const breathingSpeed = isHighLoad ? '1.5s' : '3s';

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Background Pulse/Purr */}
      <div 
        className={`absolute inset-0 rounded-full border-2 border-amber-500/10 animate-[ping_4s_ease-in-out_infinite] ${isDegraded ? 'hidden' : ''}`} 
      />
      
      <svg 
        viewBox="0 0 100 100" 
        className={`w-full h-full fill-amber-500 transition-all duration-700 ${isDegraded ? 'grayscale opacity-40' : 'drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]'}`}
      >
        {/* Tail - Animated */}
        <path 
          d="M30 75 Q 15 75 10 60 Q 5 45 15 40" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="6" 
          strokeLinecap="round"
          className="origin-[30px_75px]"
          style={{ animation: `tailTwitch ${tailSpeed} ease-in-out infinite` }}
        />
        
        {/* Body - Breathing Animation */}
        <ellipse 
          cx="50" cy="65" rx="25" ry="20" 
          style={{ animation: `breathing ${breathingSpeed} ease-in-out infinite` }}
        />
        
        {/* Head */}
        <path d="M35 45 L30 25 L45 35 L55 35 L70 25 L65 45 Z" /> {/* Ears + Head Top */}
        <circle cx="50" cy="50" r="18" /> {/* Main Head */}
        
        {/* Eyes */}
        <g className={isHighLoad ? 'animate-pulse' : ''}>
          <circle cx="43" cy="48" r="2.5" fill="#0f172a" />
          <circle cx="57" cy="48" r="2.5" fill="#0f172a" />
        </g>
        
        {/* Whiskers */}
        <g stroke="currentColor" strokeWidth="0.5" opacity="0.6">
          <line x1="35" y1="52" x2="20" y2="50" />
          <line x1="35" y1="55" x2="20" y2="58" />
          <line x1="65" y1="52" x2="80" y2="50" />
          <line x1="65" y1="55" x2="80" y2="58" />
        </g>

        {/* Nose */}
        <path d="M48 53 L52 53 L50 56 Z" fill="#0f172a" />

        <style jsx>{`
          @keyframes tailTwitch {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-15deg); }
          }
          @keyframes breathing {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.03); }
          }
        `}</style>
      </svg>
    </div>
  );
}
