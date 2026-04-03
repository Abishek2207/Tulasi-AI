"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  intensity?: number; // Kept for API compatibility, but unused
}

/** 
 * Optimized Card - Stripped heavy Tilt/Spring logic for massive performance gains.
 * Uses simple Framer Motion hovers instead of complex mouse-tracking.
 */
export const TiltCard = ({ children, className = "", style = {}, onClick }: TiltCardProps) => {
  return (
    <motion.div
      onClick={onClick}
      style={{
        ...style,
        position: "relative",
      }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`glass-card ${className}`}
    >
      <div style={{ position: "relative" }}>
        {children}
      </div>
    </motion.div>
  );
};
