"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

// XP Toast with animated progress bar
export function showXPGain(xp: number, reason: string) {
  toast.custom(
    (t) => (
      <AnimatePresence>
        {t.visible && (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 20px",
              background: "rgba(15,15,25,0.95)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(139,92,246,0.2)",
              backdropFilter: "blur(20px)",
              minWidth: 260,
              cursor: "pointer",
            }}
            onClick={() => toast.dismiss(t.id)}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
              boxShadow: "0 0 16px rgba(139,92,246,0.5)"
            }}>⚡</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "white", marginBottom: 2 }}>
                +{xp} XP Earned
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{reason}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ),
    { duration: 3500, position: "bottom-right" }
  );

  // Subtle confetti on XP gain
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { x: 0.85, y: 0.85 },
    colors: ["#8B5CF6", "#06B6D4", "#ffffff"],
    scalar: 0.8,
  });
}

// Streak Fire Toast
export function showStreakAchieved(days: number) {
  toast.custom(
    (t) => (
      <AnimatePresence>
        {t.visible && (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 20px",
              background: "rgba(15,15,25,0.95)",
              border: "1px solid rgba(244, 63, 94, 0.4)",
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(244,63,94,0.2)",
              backdropFilter: "blur(20px)",
              minWidth: 260,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ fontSize: 32 }}
            >
              🔥
            </motion.div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "white", marginBottom: 2 }}>
                {days}-Day Streak!
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Keep going — consistency compounds.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ),
    { duration: 4000, position: "bottom-right" }
  );
}

// Auto-hook component to inject into layout
export function XPNotificationSystem() {
  useEffect(() => {
    // Fire a welcome notification on mount for demo
    const timer = setTimeout(() => {
      showXPGain(25, "Daily Login Bonus");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
