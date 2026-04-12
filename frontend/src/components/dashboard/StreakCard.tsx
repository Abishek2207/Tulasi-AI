"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Zap, Trophy } from "lucide-react";

interface StreakData {
  streak: number;
  longest_streak: number;
  xp: number;
  level: number;
}

export function StreakCard() {
  const [data, setData] = useState<StreakData | null>(null);

  useEffect(() => {
    async function fetchStreak() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:10000"}/api/streak`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch (e) {}
    }
    fetchStreak();
  }, []);

  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 16, 
        padding: "8px 20px", 
        background: "rgba(255,255,255,0.03)", 
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)"
      }}
    >
      {/* Streak */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ 
          width: 32, height: 32, borderRadius: 10, 
          background: "linear-gradient(135deg, #F97316, #EF4444)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(249,115,22,0.3)"
        }}>
          <Flame size={18} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase" }}>Streak</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "white" }}>{data.streak} Days</div>
        </div>
      </div>

      <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />

      {/* Level */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ 
          width: 32, height: 32, borderRadius: 10, 
          background: "linear-gradient(135deg, #8B5CF6, #D946EF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(139,92,246,0.3)"
        }}>
          <Zap size={18} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase" }}>Level</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "white" }}>{data.level}</div>
        </div>
      </div>

      {/* XP Progress hint */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 60 }}>
         <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 900 }}>
            <span style={{ color: "var(--text-muted)" }}>XP</span>
            <span style={{ color: "white" }}>{data.xp}</span>
         </div>
         <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${(data.xp % 1000) / 10}%` }}
               style={{ height: "100%", background: "#8B5CF6" }}
            />
         </div>
      </div>
    </motion.div>
  );
}
