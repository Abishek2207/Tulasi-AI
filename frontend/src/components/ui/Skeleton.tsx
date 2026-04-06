import React from "react";
import { motion } from "framer-motion";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width, height, borderRadius = 12, className, style }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: 0.6 }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1.2,
        ease: "easeInOut"
      }}
      className={className}
      style={{
        width: width || "100%",
        height: height || "1em",
        borderRadius: borderRadius,
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        ...style
      }}
    />
  );
}

export function BentoSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      <Skeleton height={24} width="60%" />
      <Skeleton height={100} />
      <div style={{ display: "flex", gap: 12 }}>
        <Skeleton height={32} width="40%" borderRadius={20} />
        <Skeleton height={32} width="30%" borderRadius={20} />
      </div>
    </div>
  );
}
