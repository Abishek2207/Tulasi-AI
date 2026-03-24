"use client";

import { motion } from "framer-motion";

export function TulasiLogo({ className = "", size = 40, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      {/* Glow Layer */}
      <motion.div
        className="absolute inset-0 rounded-full blur-md opacity-40 mix-blend-screen"
        style={{
          background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main SVG */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width={size}
        height={size}
        whileHover={{
          rotate: 15,
          scale: 1.1,
          filter: "drop-shadow(0px 0px 8px rgba(6,182,212,0.8))",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="relative z-10"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="circuitGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>

        {/* Central Brain/Circuit Core */}
        <motion.circle
          cx="50"
          cy="50"
          r="12"
          fill="none"
          stroke="url(#circuitGrad)"
          strokeWidth="3"
          strokeDasharray="4 4"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 15, ease: "linear", repeat: Infinity }}
        />
        
        <circle cx="50" cy="50" r="6" fill="url(#logoGrad)" />

        {/* Lotus Petals Formed by Nodes and Paths */}
        <path
          d="M50 20 C60 5, 80 15, 75 35 C70 55, 55 50, 50 65"
          fill="none"
          stroke="url(#logoGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M50 20 C40 5, 20 15, 25 35 C30 55, 45 50, 50 65"
          fill="none"
          stroke="url(#logoGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Lower Petals */}
        <path
          d="M50 80 C70 95, 90 80, 80 60 C75 45, 60 55, 50 45"
          fill="none"
          stroke="url(#circuitGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M50 80 C30 95, 10 80, 20 60 C25 45, 40 55, 50 45"
          fill="none"
          stroke="url(#circuitGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Neural Nodes */}
        <circle cx="50" cy="20" r="3" fill="#FFF" />
        <circle cx="75" cy="35" r="2.5" fill="#06B6D4" />
        <circle cx="25" cy="35" r="2.5" fill="#06B6D4" />
        <circle cx="50" cy="80" r="3" fill="#FFF" />
        <circle cx="80" cy="60" r="2" fill="#7C3AED" />
        <circle cx="20" cy="60" r="2" fill="#7C3AED" />
      </motion.svg>
    </div>
  );
}
