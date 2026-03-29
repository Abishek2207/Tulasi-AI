"use client";

import { motion } from "framer-motion";
import Image from "next/image";

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
          scale: [1, 1.8, 0.9, 1.4, 1],
          opacity: [0.08, 0.25, 0.1, 0.2, 0.08],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        whileHover={{ scale: 1.08, filter: "brightness(1.1)" }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative z-10"
        style={{ width: size, height: size }}
      >
        <Image
          src="/images/logo.png"
          alt="Tulasi AI Logo"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
      </motion.div>
    </div>
  );
}
