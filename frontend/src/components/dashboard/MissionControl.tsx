"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Target, Sparkles, ArrowRight, BrainCircuit, Zap, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { intelligenceApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

const STATIC_MISSIONS = [
  {
    action: "Solve 2 LeetCode Medium Problems",
    href: "/dashboard/code",
    reason: "Consistent DSA practice is the fastest way to improve your technical interview performance.",
    xp: 60,
    icon: "💻",
  },
  {
    action: "Run a Mock Interview Session",
    href: "/dashboard/interview",
    reason: "Simulating real interviews builds confidence and helps identify weak spots before the real thing.",
    xp: 100,
    icon: "🎤",
  },
  {
    action: "Design a System Architecture",
    href: "/dashboard/system-design",
    reason: "System design is the final boss of senior engineering interviews. Start practicing now.",
    xp: 75,
    icon: "🏗️",
  },
  {
    action: "Complete Today's Daily Challenge",
    href: "/dashboard/daily-challenge",
    reason: "Daily challenges keep your problem-solving instincts sharp and earn bonus XP.",
    xp: 50,
    icon: "⚡",
  },
];

export function MissionControl({ token }: { token: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNextTask = async () => {
      try {
        const res = await intelligenceApi.getNextTask();
        setData(res);
      } catch (e) {
        console.error("Next Task failed to load", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchNextTask();
    else setLoading(false);
  }, [token]);

  const handleAccept = () => {
    setAccepted(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8B5CF6", "#06B6D4", "#F43F5E"],
    });
  };

  if (loading && !data) {
    return (
      <div className="glass-card-premium" style={{ padding: "32px", height: "100%", display: "flex", flexDirection: "column", gap: 20, borderRadius: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <Skeleton width={56} height={56} borderRadius={18} />
          <div style={{ flex: 1 }}>
            <Skeleton width="40%" height={12} style={{ marginBottom: 6 }} />
            <Skeleton width="30%" height={10} />
          </div>
        </div>
        <Skeleton width="90%" height={32} style={{ marginBottom: 12 }} />
        <Skeleton width="100%" height={80} borderRadius={20} />
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between" }}>
          <Skeleton width={80} height={32} borderRadius={30} />
          <Skeleton width={160} height={48} borderRadius={16} />
        </div>
      </div>
    );
  }

  // Fallback to static mission if API failed or returned no task
  const task = data?.next_task || STATIC_MISSIONS[Math.floor(Math.random() * STATIC_MISSIONS.length)];

  return (
    <div
      className="glass-card-premium"
      style={{
        padding: "32px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.05))",
        position: "relative",
        overflow: "hidden",
        borderRadius: 32,
        border: "1px solid rgba(139,92,246,0.25)",
        boxSizing: "border-box",
      }}
    >
      <div
        className="neural-pulse"
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 140,
          height: 140,
          background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
          filter: "blur(30px)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: "rgba(139,92,246,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8B5CF6",
            boxShadow: "0 8px 16px rgba(139,92,246,0.15)",
          }}
        >
          <BrainCircuit size={28} className={accepted ? "animate-pulse" : ""} />
        </div>
        <div>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 4,
            }}
          >
            Neural Strategist
          </h3>
          <p
            style={{
              fontSize: 11,
              color: "#8B5CF6",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            {error ? "Offline Mode — Static Mission" : "Next Optimal Action"}
          </p>
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
        <h2
          style={{
            fontSize: "clamp(20px, 3vw, 28px)",
            fontWeight: 900,
            marginBottom: 16,
            color: "white",
            fontFamily: "var(--font-outfit)",
            letterSpacing: "-1px",
            lineHeight: 1.1,
          }}
        >
          {task.action}
        </h2>
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 20,
            background: "rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.05)",
            marginBottom: 28,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              fontWeight: 500,
              margin: 0,
            }}
          >
            <span style={{ color: "#8B5CF6", fontWeight: 900 }}>AI ANALYSIS: </span>
            {task.reason}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginTop: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            padding: "8px 16px",
            borderRadius: 30,
            background: "rgba(251,191,36,0.15)",
            color: "#FBBF24",
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 1,
            border: "1px solid rgba(251,191,36,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Zap size={14} fill="#FBBF24" /> +{task.xp} XP
        </div>

        {!accepted ? (
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAccept}
            style={{
              padding: "14px 28px",
              borderRadius: 16,
              border: "none",
              background: "white",
              color: "black",
              fontWeight: 900,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 10px 30px rgba(255,255,255,0.15)",
            }}
          >
            ENGAGE SEQUENCE <Sparkles size={16} />
          </motion.button>
        ) : (
          <Link href={task.href} style={{ textDecoration: "none" }}>
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              style={{
                padding: "14px 28px",
                borderRadius: 16,
                border: "none",
                background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                color: "white",
                fontWeight: 900,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 10px 30px rgba(139,92,246,0.3)",
              }}
            >
              INITIALIZE NOW <ArrowRight size={16} />
            </motion.button>
          </Link>
        )}
      </div>
    </div>
  );
}
