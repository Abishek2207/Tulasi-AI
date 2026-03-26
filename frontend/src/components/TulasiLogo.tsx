"use client";

import { motion } from "framer-motion";

export function TulasiLogo({ className = "", size = 40, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      {/* Background Pulse Glow (Apple Soft Light) */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl opacity-10"
        style={{
          background: "radial-gradient(circle, #06B6D4 0%, #7C3AED 40%, #10B981 80%, transparent 100%)",
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.05, 0.2, 0.05],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 350"
        width={size * 1.2}
        height={size * 1.05}
        whileHover={{ scale: 1.08, filter: "brightness(1.2)" }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
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
          
          {/* Advanced Neural Pulse Gradients */}
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Shimmer Effect Pattern */}
          <pattern id="shimmer" x="0" y="0" width="200%" height="100%" patternUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="url(#leafPurple)" />
            <motion.rect 
              width="20%" height="100%" fill="white" opacity="0.1" 
              animate={{ x: ["-100%", "200%"] }} 
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }} 
            />
          </pattern>
        </defs>

        {/* --- Organic Leaves Structure (Apple-style Unfurl) --- */}
        <motion.g style={{ transformOrigin: "200px 180px" }}>
          {/* Far Left Petal */}
          <motion.path
            d="M200 180 C150 180, 80 150, 40 100 C80 60, 150 140, 200 180"
            fill="url(#leafPurple)"
            initial={{ rotate: -20, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
          />
          {/* Inner Left Petal */}
          <motion.path
            d="M200 180 C170 180, 110 130, 90 60 C130 30, 180 120, 200 180"
            fill="url(#leafCyanPurple)"
            initial={{ rotate: -10, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
          />
          {/* Center Petal (Core Intelligence) */}
          <motion.path
            d="M200 180 C185 180, 150 100, 200 10 C250 100, 215 180, 200 180"
            fill="url(#leafGreen)"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.2 }}
          />
          {/* Inner Right Petal */}
          <motion.path
            d="M200 180 C230 180, 290 130, 310 60 C270 30, 220 120, 200 180"
            fill="url(#leafCyanPurple)"
            initial={{ rotate: 10, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
          />
          {/* Far Right Petal */}
          <motion.path
            d="M200 180 C250 180, 320 150, 360 100 C320 60, 250 140, 200 180"
            fill="url(#leafPurple)"
            initial={{ rotate: 20, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
          />
        </motion.g>

        {/* --- Digital Circuit Roots (Neural Pulse) --- */}
        <g transform="translate(0, 185)" stroke="url(#rootGrad)" strokeWidth="4" fill="none" strokeLinecap="round">
          {/* Base Trunk */}
          <line x1="200" y1="0" x2="200" y2="40" />
          
          {/* Animated Pulse Overlay (Data Flowing) */}
          <g stroke="white" strokeWidth="2" opacity="0.4" strokeDasharray="10 100">
             <motion.path d="M200 20 L160 20 L160 60 L120 60 L120 100" animate={{ strokeDashoffset: [-110, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
             <motion.path d="M200 20 L240 20 L240 60 L280 60 L280 100" animate={{ strokeDashoffset: [110, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
             <motion.path d="M200 40 L100 40 L100 140" animate={{ strokeDashoffset: [-140, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
             <motion.path d="M200 40 L300 40 L300 140" animate={{ strokeDashoffset: [140, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
          </g>

          {/* Static Circuit Lines */}
          <g opacity="0.8">
            <path d="M200 20 L160 20 L160 60 L120 60 L120 100" />
            <path d="M160 40 L130 40 L130 80" />
            <path d="M180 20 L180 120 L140 120" />
            <path d="M200 40 L100 40 L100 140" />
            <path d="M200 20 L240 20 L240 60 L280 60 L280 100" />
            <path d="M240 40 L270 40 L270 80" />
            <path d="M220 20 L220 120 L260 120" />
            <path d="M200 40 L300 40 L300 140" />
          </g>

          {/* Neural Nodes (Twinkling) */}
          <g fill="white" stroke="none">
             {[
               {cx:120, cy:100, r:4, d:2}, {cx:130, cy:80, r:3, d:2.5}, {cx:140, cy:120, r:4, d:1.8}, {cx:100, cy:140, r:5, d:3},
               {cx:280, cy:100, r:4, d:2.2}, {cx:270, cy:80, r:3, d:2.7}, {cx:260, cy:120, r:4, d:1.5}, {cx:300, cy:140, r:5, d:2.8}
             ].map((n, i) => (
               <motion.circle 
                 key={i} cx={n.cx} cy={n.cy} r={n.r} 
                 animate={{ 
                   opacity: [0.3, 1, 0.3],
                   scale: [1, 1.2, 1],
                   fill: ["#FFF", "#22D3EE", "#FFF"]
                 }} 
                 transition={{ repeat: Infinity, duration: n.d, ease: "easeInOut" }} 
               />
             ))}
             <circle cx="200" cy="40" r="3" opacity="0.8" />
          </g>
        </g>
      </motion.svg>
    </div>
  );
}
