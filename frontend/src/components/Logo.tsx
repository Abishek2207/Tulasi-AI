"use client";

import { motion } from "framer-motion";
import Image from "next/image";

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
          background: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(34,211,238,0.1), rgba(16,185,129,0.05))",
          borderRadius: size * 0.3,
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 4px 25px rgba(168, 85, 247, 0.25)",
          overflow: "hidden"
        }}
      >
        {/* Glowing Background Pulse */}
        <motion.div
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, rgba(168,85,247,0.45) 0%, rgba(34,211,238,0.25) 45%, rgba(16,185,129,0.15) 75%, transparent 100%)",
            filter: "blur(14px)",
          }}
        />

        {/* User's Custom Image */}
        <Image 
          src="/images/logo-transparent.png" 
          alt="Tulasi AI Lotus Branding" 
          width={size * 0.85} 
          height={size * 0.85} 
          style={{ position: "relative", zIndex: 1, objectFit: "contain", filter: "brightness(1.1)" }}
          priority
        />
      </motion.div>

      {showText && (
        <div className="flex flex-col">
          <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 900, fontSize: size * 0.45, lineHeight: 1, letterSpacing: "-0.03em" }}>
            Tulasi<span style={{ color: "var(--brand-primary)" }}>.</span>AI
          </span>
          <span style={{ fontSize: size * 0.2, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Quantum Career AI
          </span>
        </div>
      )}
    </div>
  );
}
