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
          background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.1), rgba(16,185,129,0.05))",
          borderRadius: size * 0.3,
          border: "1px solid rgba(255,255,255,0.08)",
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
            background: "radial-gradient(circle at center, rgba(124,58,237,0.4) 0%, rgba(6,182,212,0.2) 40%, rgba(16,185,129,0.1) 70%, transparent 100%)",
            filter: "blur(12px)",
          }}
        />

        {/* User's Custom Image */}
        <Image 
          src="/images/logo-transparent.png" 
          alt="Tulasi AI Custom Logo" 
          width={size * 0.75} 
          height={size * 0.75} 
          style={{ position: "relative", zIndex: 1, objectFit: "contain" }}
          priority
        />
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
