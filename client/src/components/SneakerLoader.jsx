import React from 'react';

export default function SneakerLoader({ size = 48, className = '', center = false }) {
  const sneakerSvg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible"
    >
      <defs>
        {/* Soft yellow-brown mix gradient fill */}
        <linearGradient id="sneakerFillGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#4e2c0e" /> {/* Rich dark brown */}
          <stop offset="40%" stopColor="#8b5a2b" /> {/* Medium brown */}
          <stop offset="75%" stopColor="#d4af37" /> {/* Sneaker Gold */}
          <stop offset="100%" stopColor="#f3e5ab" /> {/* Light cream/yellow highlights */}
        </linearGradient>
        <clipPath id="sneakerClip">
          <path d="M54,41.5 C52.5,41.5 50.8,40.8 49.5,39 C46.5,35 42,28.5 39.5,26.5 C38.5,25.7 37.2,25.3 36,25.5 L29.5,27 C28.5,27.2 27.5,26.8 26.8,26 C26,25 24,22 22,21.5 C20.5,21.2 19,22.2 18.5,23.5 C17.8,25 16,33 14,40 C12.5,45 10,48.5 8,49.5 C7.2,50 7,51 7.5,51.8 C7.8,52.4 8.5,52.8 9.2,52.8 L53.8,52.8 C54.8,52.8 55.5,51.8 55.2,50.8 C54.8,49.2 54,44 54,41.5 Z" />
        </clipPath>
      </defs>

      {/* Sneaker shadow below sole */}
      <ellipse cx="31" cy="56" rx="20" ry="2.5" fill="rgba(212, 175, 55, 0.08)" className="sneaker-shadow" />

      {/* Subtle outer outline glow */}
      <path
        d="M54,41.5 C52.5,41.5 50.8,40.8 49.5,39 C46.5,35 42,28.5 39.5,26.5 C38.5,25.7 37.2,25.3 36,25.5 L29.5,27 C28.5,27.2 27.5,26.8 26.8,26 C26,25 24,22 22,21.5 C20.5,21.2 19,22.2 18.5,23.5 C17.8,25 16,33 14,40 C12.5,45 10,48.5 8,49.5 C7.2,50 7,51 7.5,51.8 C7.8,52.4 8.5,52.8 9.2,52.8 L53.8,52.8 C54.8,52.8 55.5,51.8 55.2,50.8 C54.8,49.2 54,44 54,41.5 Z"
        stroke="rgba(212, 175, 55, 0.15)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="sneaker-glow"
      />

      {/* Background / Transparent Fill */}
      <path
        d="M54,41.5 C52.5,41.5 50.8,40.8 49.5,39 C46.5,35 42,28.5 39.5,26.5 C38.5,25.7 37.2,25.3 36,25.5 L29.5,27 C28.5,27.2 27.5,26.8 26.8,26 C26,25 24,22 22,21.5 C20.5,21.2 19,22.2 18.5,23.5 C17.8,25 16,33 14,40 C12.5,45 10,48.5 8,49.5 C7.2,50 7,51 7.5,51.8 C7.8,52.4 8.5,52.8 9.2,52.8 L53.8,52.8 C54.8,52.8 55.5,51.8 55.2,50.8 C54.8,49.2 54,44 54,41.5 Z"
        fill="transparent"
      />

      {/* Rising liquid fill clip */}
      <g clipPath="url(#sneakerClip)">
        <rect
          x="0"
          y="0"
          width="64"
          height="64"
          fill="url(#sneakerFillGrad)"
          className="sneaker-fill-liquid"
        />
      </g>

      {/* Main Crisp White Outline */}
      <path
        d="M54,41.5 C52.5,41.5 50.8,40.8 49.5,39 C46.5,35 42,28.5 39.5,26.5 C38.5,25.7 37.2,25.3 36,25.5 L29.5,27 C28.5,27.2 27.5,26.8 26.8,26 C26,25 24,22 22,21.5 C20.5,21.2 19,22.2 18.5,23.5 C17.8,25 16,33 14,40 C12.5,45 10,48.5 8,49.5 C7.2,50 7,51 7.5,51.8 C7.8,52.4 8.5,52.8 9.2,52.8 L53.8,52.8 C54.8,52.8 55.5,51.8 55.2,50.8 C54.8,49.2 54,44 54,41.5 Z"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Accent design lines (laces, panels, midsole) */}
      {/* Laces */}
      <path d="M29,32 L33,36 M26.5,35 L30.5,39 M24,38 L28,42" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
      {/* Dynamic Swoosh outline */}
      <path d="M26,46 C32,46 44,43 47,37" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" strokeLinecap="round" />
      {/* Heel panel accent */}
      <path d="M18,25 C19,30 20.5,42 22,50" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" />
      {/* Sole divider line */}
      <path d="M8,49.5 L54,49.5" stroke="#ffffff" strokeWidth="1.5" />

      <style>{`
        @keyframes sneakerBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes sneakerShadowScale {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.85); opacity: 0.6; }
        }
        @keyframes sneakerLiquidRise {
          0% { transform: translateY(46px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(46px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        .sneaker-fill-liquid {
          animation: sneakerLiquidRise 2s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite;
        }
        .sneaker-glow {
          animation: glowPulse 2s ease-in-out infinite;
          transform-origin: center;
        }
        .sneaker-shadow {
          animation: sneakerShadowScale 2s ease-in-out infinite;
          transform-origin: 31px 56px;
        }
        .sneaker-svg-container {
          animation: sneakerBounce 2s ease-in-out infinite;
        }
      `}</style>
    </svg>
  );

  const container = (
    <div className={`sneaker-svg-container inline-flex items-center justify-center select-none ${className}`}>
      {sneakerSvg}
    </div>
  );

  if (center) {
    return (
      <div className="flex items-center justify-center py-16 w-full">
        {container}
      </div>
    );
  }

  return container;
}
