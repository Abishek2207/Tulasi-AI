"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { intelligenceApi } from "@/lib/api";
import { Brain, Target, Calendar, Zap, Loader2, Sparkles, ChevronRight, TrendingUp } from "lucide-react";

interface StrategicPlan {
  master_goal: string;
  current_standing: string;
  six_month_roadmap: { month: string; focus: string; milestone: string }[];
  immediate_pivot: string;
}

export function NeuralStrategist({ token }: { token: string }) {
  const [plan, setPlan] = useState<StrategicPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(0);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await intelligenceApi.getStrategicPlan();
        setPlan(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPlan();
  }, [token]);

  if (loading) {
    return (
      <div style={{ height: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <Loader2 className="animate-spin" size={32} color="var(--brand-primary)" />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.5 }}>SYNCHRONIZING CAREER NEURONS...</span>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div style={{ padding: "32px", height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, rgba(139,92,246,0.05), transparent)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6" }}>
            <Brain size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, fontFamily: "var(--font-outfit)" }}>Neural Strategist</h3>
            <p style={{ fontSize: 11, color: "#8B5CF6", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>Mission Planning Layer</p>
          </div>
        </div>
        <div style={{ background: "rgba(16,185,129,0.1)", padding: "6px 14px", borderRadius: 30, display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={14} color="#10B981" />
          <span style={{ fontSize: 12, fontWeight: 800, color: "#10B981" }}>Velocity ++</span>
        </div>
      </div>

      <div className="glass-card" style={{ padding: "24px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(139,92,246,0.2)", marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Master Career Goal</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "white", lineHeight: 1.3 }}>{plan.master_goal}</div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {plan.six_month_roadmap.map((m, i) => (
            <button
              key={i}
              onClick={() => setActiveMonth(i)}
              style={{
                flexShrink: 0, padding: "8px 16px", borderRadius: 12, border: "none", cursor: "pointer",
                background: activeMonth === i ? "var(--brand-primary)" : "rgba(255,255,255,0.05)",
                color: activeMonth === i ? "black" : "var(--text-muted)",
                fontSize: 13, fontWeight: 800, transition: "0.2s all"
              }}
            >
              {m.month}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeMonth}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            style={{ padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid var(--border)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Target size={18} color="var(--brand-primary)" />
              <div style={{ fontSize: 15, fontWeight: 800, color: "white" }}>{plan.six_month_roadmap[activeMonth].focus}</div>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
              {plan.six_month_roadmap[activeMonth].milestone}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ marginTop: 24, padding: "20px", background: "rgba(244,63,94,0.05)", border: "1px dashed rgba(244,63,94,0.3)", borderRadius: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Zap size={18} color="#F43F5E" />
          <span style={{ fontSize: 13, fontWeight: 900, color: "#F43F5E", textTransform: "uppercase" }}>Immediate Strategic Pivot</span>
        </div>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, fontWeight: 500 }}>
          {plan.immediate_pivot}
        </p>
      </div>
    </div>
  );
}
