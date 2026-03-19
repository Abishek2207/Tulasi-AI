"use client";
import React, { useState } from 'react';
import Image from 'next/image';

export const TulasiLogo = ({ size = 100, className = "", style = {} }: { size?: number | string, className?: string, style?: React.CSSProperties }) => {
  const [error, setError] = useState(false);

  if (!error) {
    return (
      <div style={{ width: size, height: size, position: 'relative', overflow: 'hidden', ...style }} className={className}>
        <Image 
          src="/logo.png" 
          alt="Tulasi AI Logo" 
          fill
          sizes={`${size}px`}
          style={{ objectFit: "contain" }}
          onError={() => setError(true)}
          priority
        />
      </div>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="leafGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <linearGradient id="leafBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="leafPurple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
        <linearGradient id="leafPink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
        <linearGradient id="circuitGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
        
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* CIRCUIT ROOTS */}
      <g stroke="url(#circuitGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)">
        <path d="M 100 115 L 100 185" />
        <path d="M 100 135 L 115 150 L 115 175" />
        <circle cx="115" cy="175" r="3" fill="#D946EF" stroke="none" />
        <path d="M 100 125 L 130 155 L 140 155 L 140 165" />
        <circle cx="140" cy="165" r="3" fill="#D946EF" stroke="none" />
        <path d="M 115 150 L 135 130 L 155 130 L 155 145" />
        <circle cx="155" cy="145" r="3" fill="#C084FC" stroke="none" />
        <path d="M 135 130 L 145 120 L 175 120 L 175 130" />
        <circle cx="175" cy="130" r="3" fill="#C084FC" stroke="none" />
        <path d="M 145 120 L 155 110 L 185 110 L 185 115" />
        <circle cx="185" cy="115" r="3" fill="#C084FC" stroke="none" />

        <path d="M 100 135 L 85 150 L 85 175" />
        <circle cx="85" cy="175" r="3" fill="#38BDF8" stroke="none" />
        <path d="M 100 125 L 70 155 L 60 155 L 60 165" />
        <circle cx="60" cy="165" r="3" fill="#38BDF8" stroke="none" />
        <path d="M 85 150 L 65 130 L 45 130 L 45 145" />
        <circle cx="45" cy="145" r="3" fill="#38BDF8" stroke="none" />
        <path d="M 65 130 L 55 120 L 25 120 L 25 130" />
        <circle cx="25" cy="130" r="3" fill="#6366F1" stroke="none" />
        <path d="M 55 120 L 45 110 L 15 110 L 15 115" />
        <circle cx="15" cy="115" r="3" fill="#6366F1" stroke="none" />
      </g>

      {/* LEAVES */}
      <g filter="url(#glow)">
        <path d="M 90 100 C 40 100, 10 50, 20 60 C 20 85, 40 115, 95 110 Z" fill="url(#leafPink)" opacity="0.95" />
        <path d="M 110 100 C 160 100, 190 50, 180 60 C 180 85, 160 115, 105 110 Z" fill="url(#leafPink)" opacity="0.95" />
        <path d="M 95 105 C 50 90, 40 30, 50 35 C 65 30, 85 60, 100 105 Z" fill="url(#leafBlue)" />
        <path d="M 105 105 C 150 90, 160 30, 150 35 C 135 30, 115 60, 100 105 Z" fill="url(#leafPurple)" />
        <path d="M 100 110 C 75 80, 75 15, 100 15 C 125 15, 125 80, 100 110 Z" fill="url(#leafGreen)" />
      </g>
    </svg>
  );
};
