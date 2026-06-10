"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { activityApi } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import {
  TrendingUp, Target, Zap, CheckCircle, Circle,
  BarChart3, Activity, Lock,
} from "lucide-react";

const DAILY_MISSIONS = [
  { id: "dsa",       task: "Solve 2 DSA problems on LeetCode",       xp: 40, category: "Tech" },
  { id: "mock",      task: "Complete 1 AI Mock Interview session",    xp: 80, category: "Interview" },
  { id: "apply",     task: "Apply to 2 real internships/jobs",        xp: 30, category: "Career" },
  { id: "commit",    task: "Push at least 1 GitHub commit",           xp: 20, category: "Projects" },
  { id: "comm",      task: "Practice 1 communication prompt",         xp: 25, category: "Soft Skills" },
];

const GROWTH_DATA = [
  { week: "W1", score: null },
  { week: "W2", score: null },
  { week: "W3", score: null },
  { week: "W4", score: null },
  { week: "W5", score: null },
  { week: "W6", score: null },
  { week: "W7", score: null },
  { week: "W8", score: null },
];

export default function ProgressTrackerPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activityData, setActivityData] = useState<any | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const hasProfile = user?.is_onboarded;

  useEffect(() => {
    if (!hasProfile) { setLoadingActivity(false); return; }
    activityApi.get().then(res => {
      if (!res.error && res.data) setActivityData(res.data);
      setLoadingActivity(false);
    });
  }, [hasProfile]);

  const toggle = async (id: string) => {
    setCompleted(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); } else {
        n.add(id);
        activityApi.log({ type: "daily_mission", value: { mission_id: id, date: new Date().toISOString().split("T")[0] } });
      }
      return n;
    });
  };

  const todayXP = DAILY_MISSIONS.filter(m => completed.has(m.id)).reduce((a, m) => a + m.xp, 0);
  const maxXP   = DAILY_MISSIONS.reduce((a, m) => a + m.xp, 0);
  const pct     = Math.round((todayXP / maxXP) * 100) || 0;

  const hasRealData = activityData && (
    activityData.streak > 0 || activityData.xp > 0 || activityData.problems_solved > 0
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(139,92,246,0.4)" }}>
          <TrendingUp size={26} color="white" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "white" }}>Progress Tracker</h1>
            <AgentBadge variant="live" />
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Real-data only · No fake scores · Logged from actual activity</p>
        </div>
      </div>

      {!hasProfile ? (
        <EmptyState
          icon={Lock}
          title="Complete Your Profile First"
          description="The Progress Tracker shows scores only from your real activity. Complete your profile to start tracking."
          ctaLabel="Complete Profile →"
          ctaHref="/onboarding"
          accent="#8B5CF6"
        />
      ) : (
        <>
          {/* Stats — only shown with real data */}
          {!loadingActivity && (
            hasRealData ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
                {[
                  { label: "Current Streak",   val: `${activityData.streak ?? 0} days`, icon: <Zap size={18} color="#F59E0B" />,    accent: "#F59E0B" },
                  { label: "Total XP Earned",  val: `${activityData.xp ?? 0}`,          icon: <BarChart3 size={18} color="#8B5CF6" />, accent: "#8B5CF6" },
                  { label: "Problems Solved",  val: `${activityData.problems_solved ?? 0}`, icon: <Target size={18} color="#10B981" />,   accent: "#10B981" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: "20px 24px", borderRadius: 20, background: `${s.accent}08`, border: `1px solid ${s.accent}20`, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.accent}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "white" }}>{s.val}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "14px 20px", borderRadius: 14, marginBottom: 24, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
                <Activity size={15} color="#F59E0B" />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  No activity recorded yet. Complete your daily missions below to start tracking real progress.
                </span>
              </div>
            )
          )}

          {/* Career Growth Graph */}
          <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: 8 }}>
                <TrendingUp size={16} color="#8B5CF6" /> Career Readiness Growth
              </h3>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Last 8 Weeks</span>
            </div>

            {!hasRealData ? (
              <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.06)" }}>
                <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                  📊 Graph will populate as you complete missions and activities.
                </div>
              </div>
            ) : (
              <div style={{ height: 160, width: "100%", position: "relative" }}>
                <svg width="100%" height="100%" viewBox="0 0 400 140" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {[25, 50, 75, 100].map((v, i) => (
                    <line key={i} x1="0" y1={140 - v * 1.4} x2="400" y2={140 - v * 1.4} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  ))}
                </svg>
              </div>
            )}
          </div>

          {/* Daily XP */}
          <div style={{ padding: "14px 20px", borderRadius: 16, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
            <Zap size={18} color="#F59E0B" />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Today&apos;s XP</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#F59E0B" }}>{todayXP} / {maxXP}</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 6, overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
                  style={{ height: "100%", background: "linear-gradient(90deg, #F59E0B, #F97316)", borderRadius: 6 }} />
              </div>
            </div>
          </div>

          {/* Daily Missions */}
          <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: 8 }}>
                <Target size={16} color="#8B5CF6" /> Daily Missions
              </h3>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
                {completed.size} / {DAILY_MISSIONS.length} done
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {DAILY_MISSIONS.map(m => {
                const done = completed.has(m.id);
                return (
                  <div key={m.id} onClick={() => toggle(m.id)}
                    style={{
                      padding: "15px 20px", borderRadius: 16, cursor: "pointer", transition: "all 0.2s",
                      background: done ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${done ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)"}`,
                      display: "flex", alignItems: "center", gap: 14,
                    }}>
                    {done ? <CheckCircle size={20} color="#10B981" /> : <Circle size={20} color="rgba(255,255,255,0.15)" />}
                    <span style={{ flex: 1, fontSize: 14, color: done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)", fontWeight: 500, textDecoration: done ? "line-through" : "none" }}>
                      {m.task}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 6 }}>
                      {m.category}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: done ? "#10B981" : "#F59E0B" }}>
                      +{m.xp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
