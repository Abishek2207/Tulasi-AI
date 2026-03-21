"use client";
import React from 'react';
import { motion } from 'framer-motion';

export const TulasiLogo = ({ size = 40, className = "", style = {} }: { size?: number | string, className?: string, style?: React.CSSProperties }) => {
  return (
    <div style={{ width: size, height: size, position: 'relative', ...style }} className={className}>
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        animate="visible"
      >
        <defs>
          <linearGradient id="tulasi-primary" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="tulasi-secondary" x1="100" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <filter id="tulasi-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Lotus / Brain Envelope */}
        <motion.path
          d="M50 10 C 25 10, 5 35, 10 65 C 20 85, 50 85, 50 85 C 50 85, 80 85, 90 65 C 95 35, 75 10, 50 10 Z"
          fill="url(#tulasi-primary)"
          opacity="0.85"
          filter="url(#tulasi-glow)"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Inner Tech Core */}
        <motion.path
          d="M50 25 C 35 25, 20 45, 25 65 C 35 75, 50 75, 50 75 C 50 75, 65 75, 75 65 C 80 45, 65 25, 50 25 Z"
          fill="url(#tulasi-secondary)"
          opacity="0.95"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.95 }}
          transition={{ duration: 1.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* AI Circuit Pulse */}
        <motion.circle
          cx="50"
          cy="52"
          r="8"
          fill="#FFFFFF"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Node connections */}
        <motion.path
          d="M50 10 L50 25 M30 35 L40 45 M70 35 L60 45 M35 60 L44 54 M65 60 L56 54"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
};
