"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/hooks/useSession";
import { activityApi } from "@/lib/api";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { Zap, Code, Target, BrainCircuit, TrendingUp, Flame } from "lucide-react";

// Animated count-up hook
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    const steps = 40;
    const step = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(interval); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target, duration]);
  return count;
}

function StatCard({ label, value, color, icon, suffix = "" }: { label: string; value: number; color: string; icon: React.ReactNode; suffix?: string }) {
  const animated = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ padding: 28, borderRadius: 20, border: `1px solid ${color}20`, position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle, ${color}20 0%, transparent 70%)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5 }}>{label}</div>
        <div style={{ color, background: `${color}15`, padding: 8, borderRadius: 10 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 42, fontWeight: 900, color, fontFamily: "var(--font-outfit)", letterSpacing: "-1px" }}>
        {animated}{suffix}
      </div>
    </motion.div>
  );
}

// Skill radar data (static demo)
const SKILL_DATA = [
  { skill: "DS&A", value: 80 },
  { skill: "System Design", value: 65 },
  { skill: "Behavioral", value: 90 },
  { skill: "Coding", value: 75 },
  { skill: "Resume", value: 85 },
  { skill: "AI/ML", value: 70 },
];

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [chartData, setChartData] = useState<Record<string, unknown>[]>([]);
  const [summary, setSummary] = useState({ xp: 0, problems: 0, interviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
        const res = await activityApi.getAnalytics(token);
        const formatted = res.time_series.map((d: any) => ({
          ...d,
          displayDate: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        }));
        setChartData(formatted);
        setSummary({
          xp: res.total_period_xp,
          problems: res.total_period_problems,
          interviews: formatted.reduce((a: number, v: any) => a + v.interviews, 0)
        });
      } catch {
        // Use demo data on error
        setChartData(Array.from({ length: 14 }, (_, i) => ({
          displayDate: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          xp: Math.floor(Math.random() * 200 + 50),
          problems: Math.floor(Math.random() * 10),
          interviews: Math.floor(Math.random() * 3),
          videos: Math.floor(Math.random() * 5),
        })));
        setSummary({ xp: 1420, problems: 38, interviews: 7 });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [session]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, flexDirection: "column", gap: 16 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <Zap size={32} color="var(--brand-primary)" />
      </motion.div>
      <div style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}>Syncing Orbit Data...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Learning Sync</div>
        <h1 style={{ fontSize: 44, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 12, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
          Your <span className="gradient-text">Analytics</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 17, lineHeight: 1.6 }}>
          Tracking your velocity, skill profile, and engagement patterns over 30 days.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 32 }}>
        <StatCard label="30-Day XP Gain" value={summary.xp} color="#8B5CF6" icon={<Zap size={18} />} suffix=" xp" />
        <StatCard label="Problems Solved" value={summary.problems} color="#4ECDC4" icon={<Code size={18} />} />
        <StatCard label="Mock Interviews" value={summary.interviews} color="#A78BFA" icon={<Target size={18} />} />
      </div>

      {/* XP Area Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 32, marginBottom: 24, borderRadius: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <TrendingUp size={20} color="var(--brand-primary)" />
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>XP Velocity</h3>
        </div>
        <div style={{ height: 300, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="displayDate" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white" }} />
              <Area type="monotone" dataKey="xp" name="XP Earned" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bottom Row: Bar Chart + Radar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Coding Regimen */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 32, borderRadius: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <Code size={18} color="#4ECDC4" />
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Coding Regimen</h3>
          </div>
          <div style={{ height: 220, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="displayDate" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={8} minTickGap={30} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={{ background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white" }} />
                <Bar dataKey="problems" name="Problems" fill="#4ECDC4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Skill Radar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: 32, borderRadius: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <BrainCircuit size={18} color="#A78BFA" />
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Skill Radar</h3>
          </div>
          <div style={{ height: 240, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={SKILL_DATA} outerRadius="80%">
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 700 }} />
                <Radar name="Skills" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
