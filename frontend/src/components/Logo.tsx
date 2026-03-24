"use client";

import { motion } from "framer-motion";

export function Logo({ size = 48, showText = true }: { size?: number, showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        whileHover={{ scale: 1.05, rotateZ: 5 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: size,
          height: size,
          position: "relative",
          background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.1))",
          borderRadius: size * 0.3,
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 4px 20px rgba(124, 58, 237, 0.2)",
          overflow: "hidden"
        }}
      >
        {/* Glowing Background Pulse */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, rgba(124,58,237,0.4) 0%, transparent 70%)",
            filter: "blur(10px)",
          }}
        />

        {/* SVG Icon: Lotus + Circuit + Brain abstract */}
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 1, color: "white" }}>
          {/* Circuit nodes */}
          <circle cx="12" cy="12" r="2" fill="#06B6D4" stroke="none" />
          <circle cx="6" cy="6" r="1.5" fill="#7C3AED" stroke="none" />
          <circle cx="18" cy="6" r="1.5" fill="#7C3AED" stroke="none" />
          <circle cx="6" cy="18" r="1.5" fill="#F43F5E" stroke="none" />
          <circle cx="18" cy="18" r="1.5" fill="#F43F5E" stroke="none" />
          
          {/* Circuit lines connecting to center (brain/lotus base) */}
          <path d="M7 7l3.5 3.5" stroke="url(#circuit-grad)" />
          <path d="M17 7l-3.5 3.5" stroke="url(#circuit-grad)" />
          <path d="M7 17l3.5-3.5" stroke="url(#circuit-grad)" />
          <path d="M17 17l-3.5-3.5" stroke="url(#circuit-grad)" />
          <path d="M12 2v8" stroke="url(#circuit-grad)" />
          <path d="M12 22v-8" stroke="url(#circuit-grad)" />

          {/* Lotus leaves overlay */}
          <path d="M12 12C12 12 10 7 12 4C14 7 12 12 12 12Z" fill="rgba(124, 58, 237, 0.8)" stroke="none" />
          <path d="M12 12C12 12 6 10 4 12C6 14 12 12 12 12Z" fill="rgba(6, 182, 212, 0.8)" stroke="none" />
          <path d="M12 12C12 12 18 10 20 12C18 14 12 12 12 12Z" fill="rgba(244, 63, 94, 0.8)" stroke="none" />

          {/* Defs for gradients */}
          <defs>
            <linearGradient id="circuit-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7C3AED" />
              <stop offset="0.5" stopColor="#06B6D4" />
              <stop offset="1" stopColor="#F43F5E" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {showText && (
        <div className="flex flex-col">
          <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 900, fontSize: size * 0.45, lineHeight: 1, letterSpacing: "-0.03em" }}>
            Tulasi<span style={{ color: "var(--brand-primary)" }}>.</span>AI
          </span>
          <span style={{ fontSize: size * 0.2, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            SaaS Platform
          </span>
        </div>
      )}
    </div>
  );
}
