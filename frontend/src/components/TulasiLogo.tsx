"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function TulasiLogo({ className = "", size = 40, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      {/* Dynamic Lotus Glow (Vibrant multi-color pulse) */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background: "radial-gradient(circle at center, #22D3EE 0%, #A855F7 30%, #EC4899 60%, #10B981 90%, transparent 100%)",
          opacity: 0.15
        }}
        animate={{
          scale: [1, 1.4, 1.1, 1.6, 1],
          opacity: [0.12, 0.25, 0.15, 0.2, 0.12],
          rotate: [0, 45, -45, 90, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        whileHover={{ scale: 1.1, filter: "brightness(1.2) drop-shadow(0 0 15px rgba(168, 85, 247, 0.4))" }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="relative z-10 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Image
          src="/images/logo.png"
          alt="Tulasi AI Lotus Logo"
          width={size}
          height={size}
          className="object-contain"
          style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))" }}
          priority
        />
      </motion.div>
    </div>
  );
}
