"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronRight } from "lucide-react";
import { socketService } from "@/lib/socket";

export function AIManagerInsightOverlay() {
  const [insight, setInsight] = useState<{ id: number, insight_text: string, context_type: string } | null>(null);

  useEffect(() => {
    const handleInsight = (data: any) => {
      setInsight(data);
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setInsight(null);
      }, 10000);
    };

    socketService.on("mentor_insight", handleInsight);
    return () => socketService.off("mentor_insight", handleInsight);
  }, []);

  return (
    <AnimatePresence>
      {insight && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            width: 340,
            background: "linear-gradient(135deg, rgba(13,13,22,0.95), rgba(20,15,35,0.95))",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(139,92,246,0.3)",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)",
            zIndex: 9999,
            overflow: "hidden"
          }}
        >
          {/* Animated glow background */}
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none"
            }}
          />

          <button 
            onClick={() => setInsight(null)}
            style={{
              position: "absolute", top: 12, right: 12,
              background: "none", border: "none", color: "rgba(255,255,255,0.4)",
              cursor: "pointer", display: "flex"
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", position: "relative" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: "0 4px 10px rgba(139,92,246,0.4)"
            }}>
              <Sparkles size={16} color="white" />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#8B5CF6", marginBottom: 4, letterSpacing: 1 }}>
                AGI MENTOR
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.5, marginBottom: 12 }}>
                {insight.text}
              </p>
              
              <button style={{
                background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                color: "#8B5CF6", padding: "6px 12px", borderRadius: 8, fontSize: 12,
                fontWeight: 600, display: "flex", alignItems: "center", gap: 4, cursor: "pointer"
              }}>
                Take Action <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
