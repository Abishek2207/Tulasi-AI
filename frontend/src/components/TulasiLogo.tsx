"use client";

import { motion } from "framer-motion";

export function TulasiLogo({ className = "", size = 40, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      {/* Background Pulse Glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl opacity-20"
        style={{
          background: "radial-gradient(circle, #06B6D4 0%, #7C3AED 50%, transparent 100%)",
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 350"
        width={size * 1.2}
        height={size * 1.05}
        whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
        className="relative z-10"
      >
        <defs>
          <linearGradient id="leafGreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
          <linearGradient id="leafCyanPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="leafPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="rootGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- Organic Leaves Structure --- */}
        <g transform="translate(0, 0)">
          {/* Far Left Petal (Purple) */}
          <motion.path
            d="M200 180 C150 180, 80 150, 40 100 C80 60, 150 140, 200 180"
            fill="url(#leafPurple)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          />
          {/* Inner Left Petal (Cyan-Purple) */}
          <motion.path
            d="M200 180 C170 180, 110 130, 90 60 C130 30, 180 120, 200 180"
            fill="url(#leafCyanPurple)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          />
          {/* Center Petal (Green) */}
          <motion.path
            d="M200 180 C185 180, 150 100, 200 10 C250 100, 215 180, 200 180"
            fill="url(#leafGreen)"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          />
          {/* Inner Right Petal (Cyan-Purple) */}
          <motion.path
            d="M200 180 C230 180, 290 130, 310 60 C270 30, 220 120, 200 180"
            fill="url(#leafCyanPurple)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          />
          {/* Far Right Petal (Purple) */}
          <motion.path
            d="M200 180 C250 180, 320 150, 360 100 C320 60, 250 140, 200 180"
            fill="url(#leafPurple)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          />
        </g>

        {/* --- Digital Circuit Roots --- */}
        <g transform="translate(0, 185)" stroke="url(#rootGrad)" strokeWidth="4" fill="none" strokeLinecap="round">
          {/* Main Trunk */}
          <line x1="200" y1="0" x2="200" y2="40" />
          
          {/* Left Branch Roots */}
          <path d="M200 20 L160 20 L160 60 L120 60 L120 100" />
          <path d="M160 40 L130 40 L130 80" />
          <path d="M180 20 L180 120 L140 120" />
          <path d="M200 40 L100 40 L100 140" />
          
          {/* Right Branch Roots */}
          <path d="M200 20 L240 20 L240 60 L280 60 L280 100" />
          <path d="M240 40 L270 40 L270 80" />
          <path d="M220 20 L220 120 L260 120" />
          <path d="M200 40 L300 40 L300 140" />

          {/* Neural Nodes (Circles at ends) */}
          <g fill="white" stroke="none">
             <motion.circle cx="120" cy="100" r="4" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} />
             <motion.circle cx="130" cy="80" r="3" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2.5 }} />
             <motion.circle cx="140" cy="120" r="4" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.8 }} />
             <motion.circle cx="100" cy="140" r="5" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3 }} />
             
             <motion.circle cx="280" cy="100" r="4" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2.2 }} />
             <motion.circle cx="270" cy="80" r="3" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2.7 }} />
             <motion.circle cx="260" cy="120" r="4" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} />
             <motion.circle cx="300" cy="140" r="5" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2.8 }} />
             
             {/* Base Connection Node */}
             <circle cx="200" cy="40" r="3" opacity="0.8" />
          </g>
        </g>
      </motion.svg>
    </div>
  );
}
