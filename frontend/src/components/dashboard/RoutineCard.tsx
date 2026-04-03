"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { intelligenceApi } from "@/lib/api";

export function RoutineCard() {
  const [loading, setLoading] = useState(true);
  const [routine, setRoutine] = useState<{ time: string; task: string; topic: string; intensity: string }[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const res = await intelligenceApi.getDailyRoutine();
        setRoutine(res.routine);
        setGeneratedAt(res.generated_at);
      } catch (e) {
        console.error("Routine failed to load", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutine();
  }, []);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: 24, height: 400, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "rgba(139,92,246,0.03)" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 32, height: 32, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8B5CF6", borderRadius: "50%", marginBottom: 16 }} />
        <div style={{ fontSize: 13, color: "#A78BFA", fontWeight: 800 }}>Synthesizing Neural Schedule...</div>
      </div>
    );
  }

  return (
    <div className="glass-card premium-glow" style={{ padding: 24, height: 400, display: "flex", flexDirection: "column", border: "1px solid rgba(139,92,246,0.2)", background: "linear-gradient(180deg, rgba(8,8,18,0.95), rgba(139,92,246,0.02))" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: "white", marginBottom: 2 }}>📅 Daily Routine</h3>
          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>AI-Optimized Learning Blocks</p>
        </div>
        <div style={{ padding: "4px 8px", borderRadius: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", fontSize: 9, fontWeight: 800, color: "#A78BFA" }}>
          LIVE FEED
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }} className="custom-scrollbar">
        {routine.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            style={{ display: "flex", gap: 16, marginBottom: 16, position: "relative" }}>
            
            {/* Timeline Line */}
            {i < routine.length - 1 && (
              <div style={{ position: "absolute", left: 19, top: 40, bottom: -16, width: 2, background: "rgba(139,92,246,0.1)" }} />
            )}

            <div style={{ minWidth: 40, textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)" }}>{item.time}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: item.intensity === "Deep Work" ? "#F43F5E" : item.intensity === "Focus" ? "#A78BFA" : "#10B981", marginTop: 2 }}>{item.intensity}</div>
            </div>

            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8B5CF6", marginTop: 4, zIndex: 1, boxShadow: "0 0 10px #8B5CF6" }} />

            <div style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "white", marginBottom: 2 }}>{item.task}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{item.topic}</div>
            </div>

          </motion.div>
        ))}
      </div>

      {generatedAt && (
        <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
          Last Synced: {new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
}
