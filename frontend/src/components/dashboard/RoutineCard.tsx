"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { intelligenceApi } from "@/lib/api";
import { Clock, CheckCircle2, Zap, Sparkles } from "lucide-react";

export function RoutineCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await intelligenceApi.getDailyPlan();
        setData(res);
      } catch (e) {
        console.error("Daily Plan failed to load", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: 24, height: 440, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "rgba(139,92,246,0.03)" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 32, height: 32, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8B5CF6", borderRadius: "50%", marginBottom: 16 }} />
        <div style={{ fontSize: 13, color: "#A78BFA", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>Synthesizing Intelligence...</div>
      </div>
    );
  }

  const tasks = data?.tasks || [];

  return (
    <div className="glass-card-premium" style={{ 
      padding: "24px 28px", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column", 
      background: "linear-gradient(180deg, rgba(8,8,18,0.98), rgba(139,92,246,0.03))", 
      position: "relative", 
      overflow: "hidden",
      borderRadius: 32,
      border: "1px solid rgba(139,92,246,0.24)",
      boxSizing: "border-box"
    }}>
      <div className="neural-pulse" style={{ position: "absolute", top: -20, right: -20, width: 150, height: 150, background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)", filter: "blur(30px)", zIndex: 0 }} />
      
      <div style={{ marginBottom: 24, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.2)" }}>
            <Sparkles size={22} />
          </div>
          <div style={{ padding: "6px 12px", borderRadius: 30, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", fontSize: 10, fontWeight: 900, color: "#10B981", letterSpacing: 1 }}>
            DIRECTIVE ACTIVE
          </div>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: "white", fontFamily: "var(--font-outfit)", marginBottom: 4 }}>{data?.focus_theme || "Daily Strategic Sync"}</h3>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>Potential Earner: <span style={{ color: "#FBBF24", fontWeight: 800 }}>+{data?.xp_potential || 150} XP</span></p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 12 }} className="custom-scrollbar">
        {tasks.map((item: any, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ 
              display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 18, 
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
              borderLeft: item.priority === "high" ? "4px solid #F43F5E" : "4px solid rgba(139,92,246,0.4)"
            }}>
            <div style={{ width: 36, textAlign: "center" }}>
               <div style={{ fontSize: 12, fontWeight: 900, color: "white" }}>{item.duration_mins}</div>
               <div style={{ fontSize: 8, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>MIN</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "white", marginBottom: 2 }}>{item.task}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.type}</div>
            </div>
            {item.priority === "high" && <Zap size={14} color="#FBBF24" fill="#FBBF24" />}
          </motion.div>
        ))}
      </div>

      {data?.daily_quote && (
        <div style={{ marginTop: 20, padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic", lineHeight: 1.5, margin: 0, textAlign: "center" }}>
            {data.daily_quote}
          </p>
        </div>
      )}
    </div>
  );
}
