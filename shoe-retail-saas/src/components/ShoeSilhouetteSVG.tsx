import React from 'react';
import { ShoeColorway } from '../types';

interface ShoeSilhouetteSVGProps {
  colorway: ShoeColorway;
  className?: string;
}

export const ShoeSilhouetteSVG: React.FC<ShoeSilhouetteSVGProps> = ({
  colorway,
  className = 'w-full h-48',
}) => {
  return (
    <div className={`relative flex items-center justify-center p-4 overflow-hidden group ${className}`}>
      {/* Dynamic Background Glow */}
      <div 
        className="absolute inset-0 opacity-20 group-hover:opacity-40 blur-2xl transition-all duration-700 pointer-events-none rounded-full scale-75 group-hover:scale-100"
        style={{ background: `radial-gradient(circle, ${colorway.hex} 0%, ${colorway.accentHex} 70%, transparent 100%)` }}
      />

      {/* High-Tech Vector Shoe Silhouette */}
      <svg 
        viewBox="0 0 500 280" 
        className="w-full h-full drop-shadow-xl transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`upperGrad-${colorway.hex}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorway.hex} />
            <stop offset="100%" stopColor={colorway.secondaryHex} />
          </linearGradient>

          <linearGradient id={`soleGrad-${colorway.soleHex}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colorway.soleHex} />
            <stop offset="100%" stopColor="#09090b" stopOpacity="0.8" />
          </linearGradient>

          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Sneaker Shadow */}
        <ellipse cx="250" cy="245" rx="190" ry="14" fill="#000000" fillOpacity="0.45" />

        {/* Midsole / Outsole Sculpted Rocker Base */}
        <path
          d="M 65 205 C 75 228 110 238 180 238 C 280 238 340 230 435 220 C 455 218 465 198 440 185 C 400 190 350 195 270 195 C 190 195 130 190 85 185 Z"
          fill={`url(#soleGrad-${colorway.soleHex})`}
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Nitrogen Air Cushion / Zoom Capsule */}
        <path
          d="M 90 205 C 100 202 145 202 165 205 C 160 222 105 222 90 205 Z"
          fill={colorway.accentHex}
          fillOpacity="0.85"
          filter="url(#glowFilter)"
        />

        {/* Treads Bottom Rim */}
        <path
          d="M 80 232 L 105 236 M 125 236 L 155 238 M 180 238 L 220 238 M 250 237 L 300 235 M 330 232 L 380 228 M 405 224 L 435 218"
          stroke={colorway.accentHex}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Carbon Propulsion Midfoot Bridge */}
        <path
          d="M 210 200 L 290 200 L 280 215 L 220 215 Z"
          fill="#18181b"
          stroke="#475569"
          strokeWidth="1"
        />

        {/* Main Upper Knit Body */}
        <path
          d="M 80 185 C 80 135 110 95 160 85 C 185 80 220 115 255 125 C 310 138 390 150 440 185 C 370 192 250 192 120 185 Z"
          fill={`url(#upperGrad-${colorway.hex})`}
          stroke="#1e293b"
          strokeWidth="1.5"
        />

        {/* Ankle Collar & Heel Cushion */}
        <path
          d="M 120 100 C 130 70 170 65 195 85 C 180 110 150 115 120 100 Z"
          fill={colorway.secondaryHex}
          stroke={colorway.accentHex}
          strokeWidth="1.5"
        />

        {/* Heel Pull Tab */}
        <path
          d="M 100 95 L 90 70 L 105 75 L 115 98 Z"
          fill={colorway.accentHex}
        />

        {/* Padded Tongue */}
        <path
          d="M 185 80 C 205 60 235 65 245 95 C 220 105 200 95 185 80 Z"
          fill={colorway.hex}
        />

        {/* Dynamic Lacing Loops */}
        <line x1="205" y1="92" x2="228" y2="118" stroke={colorway.lacesHex} strokeWidth="3" strokeLinecap="round" />
        <line x1="225" y1="102" x2="248" y2="128" stroke={colorway.lacesHex} strokeWidth="3" strokeLinecap="round" />
        <line x1="245" y1="112" x2="270" y2="138" stroke={colorway.lacesHex} strokeWidth="3" strokeLinecap="round" />
        <line x1="268" y1="124" x2="295" y2="148" stroke={colorway.lacesHex} strokeWidth="3" strokeLinecap="round" />

        {/* Iconic STRIDE Lightning Swoosh Accent Stripe */}
        <path
          d="M 170 155 Q 260 160 360 140 Q 300 175 220 178 Z"
          fill={colorway.accentHex}
          filter="url(#glowFilter)"
        />

        {/* Toe Bumper Overlay */}
        <path
          d="M 405 178 C 430 182 445 192 442 205 C 415 200 395 190 405 178 Z"
          fill={colorway.secondaryHex}
          fillOpacity="0.7"
        />
      </svg>
    </div>
  );
};
