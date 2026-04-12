"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";
import { Target, TrendingUp, Zap, Award } from "lucide-react";

interface PlacementScore {
  score: number;
  grade: string;
  probability: string;
  breakdown: {
    skill_coverage: number;
    skill_coverage_max: number;
    streak_consistency: number;
    streak_consistency_max: number;
    profile_completeness: number;
    profile_completeness_max: number;
  };
  top_action: string;
  current_streak: number;
  skills_tracked: number;
}

function CircularGauge({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? "#10B981" :
    score >= 60 ? "#8B5CF6" :
    score >= 40 ? "#F59E0B" : "#F43F5E";

  return (
    <div style={{ position: "relative", width: 136, height: 136, flexShrink: 0 }}>
      <svg width="136" height="136" style={{ transform: "rotate(-90deg)" }}>
        {/* Background ring */}
        <circle cx="68" cy="68" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        {/* Progress ring */}
        <motion.circle
          cx="68" cy="68" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      {/* Center score */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontSize: 30, fontWeight: 900, color: "white", lineHeight: 1 }}
        >
          {score}
        </motion.span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>/ 100</span>
      </div>
    </div>
  );
}

function SubBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
        <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>{label}</span>
        <span style={{ color, fontWeight: 800 }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          style={{ height: "100%", background: color, borderRadius: 6, boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
    </div>
  );
}

export function PlacementScoreCard() {
  const [data, setData] = useState<PlacementScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    if (!token) { setLoading(false); return; }

    fetch(`${API_URL}/api/roadmap/career/placement-score`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const gradeColor =
    data?.grade?.startsWith("A") ? "#10B981" :
    data?.grade?.startsWith("B") ? "#8B5CF6" :
    "#F59E0B";

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
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: -60, right: -60, width: 200, height: 200,
        background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Target size={16} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "white", letterSpacing: 0.5 }}>Placement Readiness</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>AI Placement Score™</div>
        </div>
        {data && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.6 }}
            style={{
              marginLeft: "auto",
              background: gradeColor + "20",
              color: gradeColor,
              fontSize: 18,
              fontWeight: 900,
              padding: "4px 14px",
              borderRadius: 10,
              border: `1px solid ${gradeColor}40`,
            }}
          >
            {data.grade}
          </motion.span>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ width: 136, height: 136, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => (
              <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                style={{ height: 16, borderRadius: 8, background: "rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        </div>
      ) : data ? (
        <>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            <CircularGauge score={data.score} />

            <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#F59E0B" }}>{data.current_streak}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>Day Streak 🔥</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#06B6D4" }}>{data.skills_tracked}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>Skills Tracked</div>
                </div>
              </div>

              <SubBar
                label="Skill Coverage"
                value={data.breakdown.skill_coverage}
                max={data.breakdown.skill_coverage_max}
                color="#8B5CF6"
              />
              <SubBar
                label="Streak Consistency"
                value={data.breakdown.streak_consistency}
                max={data.breakdown.streak_consistency_max}
                color="#F59E0B"
              />
              <SubBar
                label="Profile Completeness"
                value={data.breakdown.profile_completeness}
                max={data.breakdown.profile_completeness_max}
                color="#10B981"
              />
            </div>
          </div>

          {/* Top Action CTA */}
          <div style={{
            marginTop: 20, padding: "14px 18px",
            background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.05))",
            border: "1px solid rgba(139,92,246,0.15)",
            borderRadius: 14, display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <Zap size={16} color="#8B5CF6" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 600, lineHeight: 1.5 }}>
              {data.top_action}
            </span>
          </div>

          {/* Probability */}
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={14} color={gradeColor} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
              Placement Probability: <span style={{ color: gradeColor, fontWeight: 800 }}>{data.probability}</span>
            </span>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          Could not load placement score. Complete your profile to get your score.
        </div>
      )}
    </motion.div>
  );
}
