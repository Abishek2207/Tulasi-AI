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
    <div className="glass-card-premium" style={{ 
      padding: "28px", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column", 
      background: "linear-gradient(180deg, rgba(8,8,18,0.95), rgba(139,92,246,0.02))", 
      position: "relative", 
      overflow: "hidden",
      borderRadius: 32,
      border: "1px solid rgba(139,92,246,0.2)",
      boxSizing: "border-box"
    }}>
      <div className="neural-pulse" style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)", filter: "blur(20px)", zIndex: 0 }} />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, position: "relative", zIndex: 1 }}>
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 }}>📅 Daily Routine</h3>
          <p style={{ fontSize: 11, color: "#A78BFA", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>Neural Schedule</p>
        </div>
        <div className="animate-pulse-slow" style={{ padding: "6px 12px", borderRadius: 30, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", fontSize: 10, fontWeight: 900, color: "#A78BFA", letterSpacing: 1 }}>
          SYNCED
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingRight: 8, position: "relative", zIndex: 1 }} className="custom-scrollbar">
        {routine.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            style={{ display: "flex", gap: 20, marginBottom: 20, position: "relative" }}>
            
            {i < routine.length - 1 && (
              <div style={{ position: "absolute", left: 51, top: 24, bottom: -24, width: 2, background: "linear-gradient(to bottom, rgba(139,92,246,0.3), transparent)" }} />
            )}

            <div style={{ minWidth: 44, textAlign: "right", marginTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text-primary)" }}>{item.time}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: item.intensity === "Deep Work" ? "#F43F5E" : item.intensity === "Focus" ? "#A78BFA" : "#10B981", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.intensity}</div>
            </div>

            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#8B5CF6", marginTop: 8, zIndex: 1, boxShadow: "0 0 12px #8B5CF6", border: "2px solid rgba(255,255,255,0.1)" }} />

            <div style={{ flex: 1, padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "white", marginBottom: 4, letterSpacing: "-0.3px" }}>{item.task}</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, fontWeight: 500 }}>{item.topic}</div>
            </div>

          </motion.div>
        ))}
      </div>

      {generatedAt && (
        <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16, fontWeight: 600, letterSpacing: 0.5 }}>
          LAST OPTIMIZED: {new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()}
        </div>
      )}
    </div>
  );
}
