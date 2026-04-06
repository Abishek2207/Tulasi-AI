"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { intelligenceApi } from "@/lib/api";
import { Clock, CheckCircle2, Zap, Sparkles, WifiOff } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

// Static fallback tasks — shown when AI is down
const FALLBACK_TASKS = [
  { id: 1, task: "Solve 2 LeetCode Easy Problems", duration_mins: 30, priority: "high", type: "coding" },
  { id: 2, task: "Review System Design Notes", duration_mins: 20, priority: "medium", type: "review" },
  { id: 3, task: "Complete Daily Challenge", duration_mins: 15, priority: "high", type: "practice" },
  { id: 4, task: "Watch 1 Tech YouTube Video", duration_mins: 20, priority: "low", type: "learning" },
  { id: 5, task: "Update GitHub Profile README", duration_mins: 25, priority: "medium", type: "career" },
];

const FALLBACK_DATA = {
  greeting: "Good day, Champion! Ready to build something great?",
  focus_theme: "Consistent Progress",
  tasks: FALLBACK_TASKS,
  daily_quote: '"The best way to predict the future is to invent it." — Alan Kay',
  xp_potential: 150,
  streak_note: null,
};

export function RoutineCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await intelligenceApi.getDailyPlan();
        // If AI returned data but tasks array is empty, use fallback
        if (res && Array.isArray(res.tasks) && res.tasks.length > 0) {
          setData(res);
        } else {
          setData({ ...FALLBACK_DATA, greeting: res?.greeting || FALLBACK_DATA.greeting });
          setIsOffline(true);
        }
      } catch (e) {
        console.error("Daily Plan failed to load", e);
        setData(FALLBACK_DATA);
        setIsOffline(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  if (loading && !data) {
    return (
      <div className="glass-card-premium" style={{ padding: "32px", height: "100%", display: "flex", flexDirection: "column", gap: 20, borderRadius: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <Skeleton width={44} height={44} borderRadius={14} />
          <Skeleton width={80} height={20} borderRadius={30} />
        </div>
        <Skeleton width="60%" height={20} style={{ marginBottom: 4 }} />
        <Skeleton width="40%" height={12} style={{ marginBottom: 20 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} height={64} borderRadius={18} />
          ))}
        </div>
        <Skeleton height={60} borderRadius={16} style={{ marginTop: 20 }} />
      </div>
    );
  }

  const tasks = data?.tasks || FALLBACK_TASKS;

  return (
    <div
      className="glass-card-premium"
      style={{
        padding: "24px 28px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, rgba(8,8,18,0.98), rgba(139,92,246,0.03))",
        position: "relative",
        overflow: "hidden",
        borderRadius: 32,
        border: "1px solid rgba(139,92,246,0.24)",
        boxSizing: "border-box",
      }}
    >
      <div
        className="neural-pulse"
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 150,
          height: 150,
          background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
          filter: "blur(30px)",
          zIndex: 0,
        }}
      />

      <div style={{ marginBottom: 24, position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(139,92,246,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8B5CF6",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            {isOffline ? <WifiOff size={20} /> : <Sparkles size={22} />}
          </div>
          <div
            style={{
              padding: "6px 12px",
              borderRadius: 30,
              background: isOffline ? "rgba(251,191,36,0.1)" : "rgba(16,185,129,0.1)",
              border: `1px solid ${isOffline ? "rgba(251,191,36,0.3)" : "rgba(16,185,129,0.3)"}`,
              fontSize: 10,
              fontWeight: 900,
              color: isOffline ? "#FBBF24" : "#10B981",
              letterSpacing: 1,
            }}
          >
            {isOffline ? "OFFLINE MODE" : "DIRECTIVE ACTIVE"}
          </div>
        </div>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "white",
            fontFamily: "var(--font-outfit)",
            marginBottom: 4,
          }}
        >
          {data?.focus_theme || "Daily Strategic Sync"}
        </h3>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
          Potential Earner:{" "}
          <span style={{ color: "#FBBF24", fontWeight: 800 }}>+{data?.xp_potential || 150} XP</span>
        </p>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
        className="custom-scrollbar"
      >
        {tasks.map((item: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px",
              borderRadius: 18,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderLeft:
                item.priority === "high"
                  ? "4px solid #F43F5E"
                  : "4px solid rgba(139,92,246,0.4)",
            }}
          >
            <div style={{ width: 36, textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: "white" }}>
                {item.duration_mins}
              </div>
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}
              >
                MIN
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "white", marginBottom: 2 }}>
                {item.task}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {item.type}
              </div>
            </div>
            {item.priority === "high" && <Zap size={14} color="#FBBF24" fill="#FBBF24" />}
          </motion.div>
        ))}
      </div>

      {data?.daily_quote && (
        <div
          style={{
            marginTop: 20,
            padding: "16px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              fontStyle: "italic",
              lineHeight: 1.5,
              margin: 0,
              textAlign: "center",
            }}
          >
            {data.daily_quote}
          </p>
        </div>
      )}
    </div>
  );
}
