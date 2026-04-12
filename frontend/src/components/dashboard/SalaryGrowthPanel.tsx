"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";
import { DollarSign, TrendingUp, Zap, ArrowRight, Shield } from "lucide-react";

interface SalaryData {
  target_skill: string;
  salary_impact: {
    boost_pct: number;
    avg_hike: string;
    demand: string;
  };
  next_skill_prediction: {
    skill: string;
    reason: string;
    priority: string;
  };
  layoff_prevention: Array<{
    skill: string;
    reason: string;
    urgency: string;
  }>;
}

const PRIORITY_COLOR: Record<string, string> = {
  critical: "#F43F5E",
  high: "#F59E0B",
  medium: "#8B5CF6",
};

const URGENCY_COLOR: Record<string, string> = {
  critical: "#F43F5E",
  high: "#F59E0B",
  medium: "#10B981",
};

export function SalaryGrowthPanel({ role = "Software Engineer", experience = 2 }: { role?: string; experience?: number }) {
  const [data, setData] = useState<SalaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetSkill, setTargetSkill] = useState("AI");

  const skills = ["AI", "Cloud", "System Design", "Leadership"];

  const fetchData = async (skill: string) => {
    setLoading(true);
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch(`${API_URL}/api/roadmap/career/professional`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role, experience_years: experience, target_skill: skill, days: 5 }),
      });
      const d = await res.json();
      if (d.success) setData(d);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(targetSkill); }, [targetSkill]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 24,
        padding: "28px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient */}
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #10B981, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <DollarSign size={16} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "white", letterSpacing: 0.5 }}>Salary Growth Engine</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>AI Career Income Predictor</div>
        </div>
      </div>

      {/* Skill Selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {skills.map(s => (
          <button
            key={s}
            onClick={() => setTargetSkill(s)}
            style={{
              padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700,
              border: "none", cursor: "pointer", transition: "all 0.2s",
              background: targetSkill === s ? "linear-gradient(135deg, #10B981, #06B6D4)" : "rgba(255,255,255,0.05)",
              color: targetSkill === s ? "white" : "rgba(255,255,255,0.5)",
              boxShadow: targetSkill === s ? "0 4px 14px rgba(16,185,129,0.3)" : "none",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1, 2].map(i => (
            <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.15 }}
              style={{ height: 80, borderRadius: 16, background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Salary Impact */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Avg Salary Hike", value: data.salary_impact.avg_hike, color: "#10B981" },
              { label: "Boost Potential", value: `+${data.salary_impact.boost_pct}%`, color: "#8B5CF6" },
              { label: "Job Demand", value: data.salary_impact.demand, color: "#F59E0B" },
            ].map(item => (
              <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: item.color, marginBottom: 4 }}>{item.value}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Next Best Skill */}
          {data.next_skill_prediction && (
            <div style={{
              marginBottom: 20, padding: "14px 18px",
              background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.04))",
              border: "1px solid rgba(139,92,246,0.15)", borderRadius: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Zap size={14} color={PRIORITY_COLOR[data.next_skill_prediction.priority] || "#8B5CF6"} />
                <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>
                  Next Best Skill to Learn
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "white", marginBottom: 4 }}>
                {data.next_skill_prediction.skill}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                {data.next_skill_prediction.reason}
              </div>
            </div>
          )}

          {/* Layoff Prevention */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Shield size={14} color="#F43F5E" />
              <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>
                Layoff Shield — Top 3 Must-Learn
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(data.layoff_prevention || []).slice(0, 3).map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px", background: "rgba(255,255,255,0.03)",
                    borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: URGENCY_COLOR[item.urgency] + "20",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 900, color: URGENCY_COLOR[item.urgency],
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.skill}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600, marginTop: 2 }}>
                      {item.reason}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: URGENCY_COLOR[item.urgency] + "15", color: URGENCY_COLOR[item.urgency], flexShrink: 0 }}>
                    {item.urgency.toUpperCase()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "30px 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          Select a skill domain above to see your salary growth prediction.
        </div>
      )}
    </motion.div>
  );
}
