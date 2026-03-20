"use client";
import React from 'react';
import { motion } from 'framer-motion';

export const TulasiLogo = ({ size = 100, className = "", style = {} }: { size?: number | string, className?: string, style?: React.CSSProperties }) => {
  return (
    <div style={{ width: size, height: size, position: 'relative', ...style }} className={className}>
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        animate="visible"
      >
        <defs>
          <linearGradient id="brainGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="lotusGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>

          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur1" />
            <feGaussianBlur stdDeviation="12" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* CIRCUIT BRAIN NODES */}
        <motion.g
          stroke="url(#brainGrad)"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#neonGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          {/* Left Hemisphere Circuits */}
          <path d="M 100 80 Q 70 60 50 80 T 50 120" />
          <path d="M 75 90 L 60 100" />
          <path d="M 85 70 L 65 65" />
          <circle cx="50" cy="120" r="4" fill="#06B6D4" />
          <circle cx="60" cy="100" r="3" fill="#6366F1" />
          <circle cx="65" cy="65" r="3" fill="#A855F7" />

          {/* Right Hemisphere Circuits */}
          <path d="M 100 80 Q 130 60 150 80 T 150 120" />
          <path d="M 125 90 L 140 100" />
          <path d="M 115 70 L 135 65" />
          <circle cx="150" cy="120" r="4" fill="#06B6D4" />
          <circle cx="140" cy="100" r="3" fill="#6366F1" />
          <circle cx="135" cy="65" r="3" fill="#A855F7" />

          {/* Brain Stem Connection */}
          <path d="M 100 80 L 100 130" />
          <circle cx="100" cy="130" r="5" fill="#8B5CF6" />
        </motion.g>

        {/* LOTUS PETALS */}
        <motion.g
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          style={{ transformOrigin: "100px 140px" } as any}
        >
          {/* Center Petal */}
          <path d="M 100 130 C 70 80, 85 40, 100 30 C 115 40, 130 80, 100 130 Z" fill="url(#lotusGrad)" opacity="0.9" />
          
          {/* Left Petal */}
          <path d="M 100 130 C 50 100, 40 60, 60 45 C 75 40, 90 70, 100 130 Z" fill="url(#lotusGrad)" opacity="0.7" />
          
          {/* Right Petal */}
          <path d="M 100 130 C 150 100, 160 60, 140 45 C 125 40, 110 70, 100 130 Z" fill="url(#lotusGrad)" opacity="0.7" />
          
          {/* Far Left Petal */}
          <path d="M 100 130 C 40 130, 10 90, 25 75 C 40 65, 70 90, 100 130 Z" fill="url(#brainGrad)" opacity="0.5" />
          
          {/* Far Right Petal */}
          <path d="M 100 130 C 160 130, 190 90, 175 75 C 160 65, 130 90, 100 130 Z" fill="url(#brainGrad)" opacity="0.5" />
        </motion.g>

        {/* PULSING NEON ORB CORE */}
        <motion.circle
          cx="100"
          cy="115"
          r="8"
          fill="#06B6D4"
          filter="url(#neonGlow)"
          animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
};
