"use client";

import { motion } from "framer-motion";

export function TulasiLogo({ size = 40, className = "", style = {} }: { size?: number; className?: string; style?: React.CSSProperties }) {
  const leafTransition = {
    duration: 3,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut" as const,
  };

  return (
    <motion.div 
      className={className}
      style={{ width: size, height: size, filter: "drop-shadow(0px 0px 8px rgba(124, 58, 237, 0.4))", ...style }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.05, filter: "drop-shadow(0px 0px 12px rgba(6, 182, 212, 0.6))" }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id="leafGreen" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="50%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>
          <linearGradient id="leafCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#164E63" />
          </linearGradient>
          <linearGradient id="leafPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          <linearGradient id="leafBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* --- CIRCUIT ROOTS (Animated Paths) --- */}
        <g stroke="url(#circuitGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Main Trunk */}
          <motion.path d="M50 95 L50 60" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} />
          <circle cx="50" cy="96" r="2.5" fill="url(#circuitGrad)" />
          
          {/* Inner Left Branches */}
          <motion.path d="M48 85 L35 85 L25 70" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.1 }} />
          <circle cx="24" cy="69" r="2" fill="#818CF8" />
          <motion.path d="M35 85 L35 75 L28 65" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.2 }} />
          <circle cx="28" cy="63" r="1.5" fill="#F472B6" />
          
          {/* Outer Left Branches */}
          <motion.path d="M48 90 L20 90 L10 75" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.3 }} />
          <circle cx="9" cy="74" r="2" fill="#F472B6" />
          <motion.path d="M20 90 L20 80 L15 70" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.4 }} />
          <circle cx="15" cy="68" r="1.5" fill="#818CF8" />

          {/* Inner Right Branches */}
          <motion.path d="M52 85 L65 85 L75 70" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.1 }} />
          <circle cx="76" cy="69" r="2" fill="#818CF8" />
          <motion.path d="M65 85 L65 75 L72 65" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.2 }} />
          <circle cx="72" cy="63" r="1.5" fill="#22D3EE" />

          {/* Outer Right Branches */}
          <motion.path d="M52 90 L80 90 L90 75" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.3 }} />
          <circle cx="91" cy="74" r="2" fill="#F472B6" />
          <motion.path d="M80 90 L80 80 L85 70" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.4 }} />
          <circle cx="85" cy="68" r="1.5" fill="#22D3EE" />
        </g>

        {/* --- LOTUS LEAVES --- */}
        {/* The lotus sits on top of the circuit roots around Y=55 */}
        <g stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" filter="url(#glow)">
          
          {/* Far Outer Left Leaf (Light Purple/Pink) */}
          <motion.path 
            d="M48 55 C20 65, 0 45, 5 30 C15 25, 30 40, 48 55 Z" 
            fill="url(#leafPurple)" 
            animate={{ rotate: [-2, 2, -2], originX: "48px", originY: "55px" }} 
            transition={{ ...leafTransition, delay: 0.4 }} 
          />
          {/* Far Outer Right Leaf (Light Purple/Pink) */}
          <motion.path 
            d="M52 55 C80 65, 100 45, 95 30 C85 25, 70 40, 52 55 Z" 
            fill="url(#leafPurple)" 
            animate={{ rotate: [2, -2, 2], originX: "52px", originY: "55px" }} 
            transition={{ ...leafTransition, delay: 0.4 }} 
          />
          
          {/* Inner Left Leaf (Blue/Cyan) */}
          <motion.path 
            d="M49 55 C25 50, 15 25, 25 10 C35 15, 45 35, 49 55 Z" 
            fill="url(#leafBlue)" 
            animate={{ rotate: [-1, 1, -1], originX: "49px", originY: "55px" }} 
            transition={{ ...leafTransition, delay: 0.2 }} 
          />
          {/* Inner Right Leaf (Blue/Cyan) */}
          <motion.path 
            d="M51 55 C75 50, 85 25, 75 10 C65 15, 55 35, 51 55 Z" 
            fill="url(#leafBlue)" 
            animate={{ rotate: [1, -1, 1], originX: "51px", originY: "55px" }} 
            transition={{ ...leafTransition, delay: 0.2 }} 
          />
          
          {/* Center Leaf (Green gradient) */}
          <motion.path 
            d="M50 55 C40 40, 35 15, 50 5 C65 15, 60 40, 50 55 Z" 
            fill="url(#leafGreen)" 
            animate={{ scaleY: [0.96, 1.04, 0.96], originX: "50px", originY: "55px" }} 
            transition={leafTransition as any} 
          />

          {/* Leaf Central Veins (Dark lines giving depth) */}
          <path d="M50 55 C50 35, 50 15, 50 5" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" fill="none" />
          <path d="M49 55 C42 40, 32 25, 25 10" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" fill="none" />
          <path d="M51 55 C58 40, 68 25, 75 10" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" fill="none" />
          <path d="M48 55 C35 48, 20 38, 5 30" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" fill="none" />
          <path d="M52 55 C65 48, 80 38, 95 30" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" fill="none" />

          {/* Brain / Core Neural Node glowing at the base of the Lotus */}
          <motion.circle 
            cx="50" cy="55" r="3.5" 
            fill="#FFFFFF" 
            filter="drop-shadow(0px 0px 4px #06B6D4)"
            animate={{ filter: ["drop-shadow(0px 0px 4px #06B6D4)", "drop-shadow(0px 0px 10px #7C3AED)", "drop-shadow(0px 0px 4px #06B6D4)"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>

        {/* --- DYNAMIC GLOW PULSES ALONG CIRCUITS --- */}
        <g fill="#FFFFFF">
          <motion.circle cx="50" cy="95" r="1.5" animate={{ cy: [95, 60], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
          <motion.circle r="1.2" animate={{ cx: [48, 35, 25], cy: [85, 85, 70], opacity: [0, 1, 0] }} transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, ease: "linear" }} />
          <motion.circle r="1.2" animate={{ cx: [52, 65, 75], cy: [85, 85, 70], opacity: [0, 1, 0] }} transition={{ duration: 1.5, delay: 0.8, repeat: Infinity, ease: "linear" }} />
          <motion.circle r="1.5" animate={{ cx: [48, 20, 10], cy: [90, 90, 75], opacity: [0, 1, 0] }} transition={{ duration: 1.5, delay: 1.2, repeat: Infinity, ease: "linear" }} />
          <motion.circle r="1.5" animate={{ cx: [52, 80, 90], cy: [90, 90, 75], opacity: [0, 1, 0] }} transition={{ duration: 1.5, delay: 0.3, repeat: Infinity, ease: "linear" }} />
        </g>
      </svg>
    </motion.div>
  );
}
