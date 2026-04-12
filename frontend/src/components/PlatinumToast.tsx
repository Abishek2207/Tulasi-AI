"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function PlatinumToast({
  message = "Awakening Neural Core...",
  subtext = "Establishing high-performance link with cloud servers. Please hold.",
  show = false,
}: {
  message?: string;
  subtext?: string;
  show: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{
            position: "fixed",
            bottom: 30,
            right: 30,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "rgba(10, 10, 20, 0.9)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(139, 92, 246, 0.15)",
              borderRadius: 24,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              maxWidth: 400,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Animated Glow Backdrops */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              style={{
                position: "absolute",
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              style={{
                position: "absolute",
                bottom: -50,
                left: -50,
                width: 150,
                height: 150,
                background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))",
                  border: "2px solid rgba(139, 92, 246, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  style={{
                    position: "absolute",
                    inset: -2,
                    borderRadius: "50%",
                    border: "2px solid transparent",
                    borderTopColor: "#8B5CF6",
                    borderRightColor: "#06B6D4",
                  }}
                />
                <Zap size={20} color="#8B5CF6" />
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <h4
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "white",
                  margin: 0,
                  marginBottom: 6,
                  letterSpacing: "-0.5px",
                }}
              >
                {message}
              </h4>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.4 }}>
                {subtext}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
