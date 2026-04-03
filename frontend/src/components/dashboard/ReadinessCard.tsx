import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, TrendingUp, Sparkles } from "lucide-react";

import { intelligenceApi, ReadinessStats } from "@/lib/api";

export function ReadinessCard({ token }: { token: string }) {
  const [stats, setStats] = useState<ReadinessStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await intelligenceApi.getReadiness();
        setStats(result);
      } catch (e) {
        console.error("Failed to fetch readiness stats", e);
      }
    };
    if (token) fetchData();
  }, [token]);

  if (!stats) return null;

  return (
    <div style={{ padding: "28px", height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, rgba(139,92,246,0.05), rgba(6,182,212,0.05))", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", filter: "blur(30px)" }} />
      
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
          <Award size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>Career Mobility</h3>
          <p style={{ fontSize: 11, color: "#10B981", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Readiness Quotient</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 44, fontWeight: 900, fontFamily: "var(--font-outfit)", lineHeight: 1, letterSpacing: "-2px" }}>{stats.readiness_score}</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 4, letterSpacing: 1 }}>/ 100</div>
      </div>

      <div style={{ padding: "10px 16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start", marginBottom: 20 }}>
        <TrendingUp size={14} color="#10B981" />
        <span style={{ fontSize: 13, fontWeight: 800, color: "#10B981" }}>{stats.label}</span>
      </div>

      <div style={{ marginTop: "auto", background: "rgba(0,0,0,0.2)", borderRadius: 16, padding: "16px", border: "1px dashed rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={12} color="#8B5CF6" /> Strategic Node: {stats.target_role || "Engineering"}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10, fontWeight: 600 }}>
          Consistency Factor: <span style={{ color: "var(--brand-primary)" }}>{stats.consistency}%</span>
        </div>
        {stats.gaps && stats.gaps.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {stats.gaps.map((gap, idx) => (
              <span key={idx} style={{ padding: "4px 8px", background: "rgba(239,68,68,0.15)", color: "#EF4444", fontSize: 10, fontWeight: 800, borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)" }}>
                GAP: {gap}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
