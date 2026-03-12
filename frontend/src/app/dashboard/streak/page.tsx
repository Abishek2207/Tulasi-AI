"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const streakData = Array.from({ length: 52 }, (_, week) =>
  Array.from({ length: 7 }, (_, day) => {
    const val = week * 7 + day;
    if (val > 364) return 0;
    if (val > 357) return Math.floor(Math.random() * 4) + 1;
    if (val > 350) return Math.floor(Math.random() * 3) + 1;
    return Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0;
  })
);

const rewards = [
  { icon: "🔥", title: "7-Day Streak", desc: "Keep learning 7 days in a row", xp: 100, achieved: true },
  { icon: "⚡", title: "Speed Learner", desc: "Complete 5 sessions in a day", xp: 150, achieved: true },
  { icon: "🏆", title: "Interview Master", desc: "Score 90%+ in 3 interviews", xp: 300, achieved: false },
  { icon: "📚", title: "Book Worm", desc: "Upload and read 10 PDFs", xp: 200, achieved: false },
  { icon: "💻", title: "Code Ninja", desc: "Solve 50 coding challenges", xp: 500, achieved: false },
  { icon: "🌟", title: "30-Day Legend", desc: "Maintain a 30-day streak", xp: 1000, achieved: false },
];

export default function StreakPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (session) fetchStats();
  }, [session]);

  const fetchStats = async () => {
    const token = (session?.user as any)?.accessToken;
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activity/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (e) { /* silent */ }
  };
  const getColor = (val: number) => {
    if (val === 0) return "rgba(255,255,255,0.05)";
    if (val === 1) return "rgba(108,99,255,0.3)";
    if (val === 2) return "rgba(108,99,255,0.5)";
    if (val === 3) return "rgba(108,99,255,0.7)";
    return "#6C63FF";
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "Outfit" }}>🔥 Streak & Rewards</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>Your daily learning progress and achievement rewards</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Current Streak", value: `${stats?.streak || 0} 🔥`, color: "#FFD93D" },
          { label: "Longest Streak", value: `${stats?.streak || 0} 💪`, color: "#43E97B" },
          { label: "Total XP", value: `${stats?.xp || 0} ⚡`, color: "#6C63FF" },
          { label: "Rank", value: stats?.xp > 2000 ? "Gold 🥇" : stats?.xp > 500 ? "Silver 🥈" : "Bronze 🥉", color: "#FF6B9D" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "Outfit" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Activity Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card" style={{ marginBottom: 28, overflowX: "auto" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Activity This Year</h3>
        <div style={{ display: "flex", gap: 3 }}>
          {streakData.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {week.map((val, di) => (
                <div key={di} title={`Week ${wi + 1}, Day ${di + 1}`} style={{ width: 12, height: 12, borderRadius: 3, background: getColor(val), transition: "all 0.2s", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 12 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Less</span>
          {[0, 1, 2, 3, 4].map(v => <div key={v} style={{ width: 12, height: 12, borderRadius: 3, background: getColor(v) }} />)}
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>More</span>
        </div>
      </motion.div>

      {/* Rewards */}
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🏆 Achievements</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {rewards.map((r, i) => (
          <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
            style={{ background: r.achieved ? "rgba(108,99,255,0.1)" : "var(--bg-card)", border: `1px solid ${r.achieved ? "rgba(108,99,255,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: 20, opacity: r.achieved ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 36 }}>{r.icon}</span>
              {r.achieved && <span className="badge badge-green" style={{ fontSize: 10 }}>✓ Earned</span>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 10 }}>{r.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{r.desc}</div>
            <div style={{ fontSize: 12, color: "#6C63FF", marginTop: 10, fontWeight: 600 }}>⚡ {r.xp} XP</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
