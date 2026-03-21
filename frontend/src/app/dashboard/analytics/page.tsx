"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { activityApi } from "@/lib/api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ xp: 0, problems: 0, interviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
                const res = await activityApi.getAnalytics(token);
        // Format dates for display (e.g., "Mar 15")
        const formattedData = res.time_series.map((d: any) => {
          const dateObj = new Date(d.date);
          return {
            ...d,
            displayDate: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          };
        });
        setData(formattedData);
        setSummary({
          xp: res.total_period_xp,
          problems: res.total_period_problems,
          interviews: formattedData.reduce((acc: number, val: any) => acc + val.interviews, 0)
        });
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    if (session) {
      fetchAnalytics();
    }
  }, [session]);

  if (loading) return <div style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: 100 }}>Loading analytics...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: 12 }}>
          Your <span className="gradient-text">Analytics</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          Track your learning velocity and daily activity over the last 30 days.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 40 }}>
        <div className="glass-card" style={{ padding: 24, borderRadius: 20 }}>
          <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>30-Day XP Gain</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "var(--brand-primary)" }}>+{summary.xp}</div>
        </div>
        <div className="glass-card" style={{ padding: 24, borderRadius: 20 }}>
          <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Problems Solved</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#4ECDC4" }}>{summary.problems}</div>
        </div>
        <div className="glass-card" style={{ padding: 24, borderRadius: 20 }}>
          <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Mock Interviews</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#A78BFA" }}>{summary.interviews}</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="dash-card" style={{ padding: 32, marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>XP Velocity</h3>
        <div style={{ height: 350, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="displayDate" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}
                itemStyle={{ color: "var(--brand-primary)", fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="xp" name="XP Earned" stroke="var(--brand-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sub Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="dash-card" style={{ padding: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Coding Regimen</h3>
          <div style={{ height: 250, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="displayDate" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}
                />
                <Bar dataKey="problems" name="Problems Solved" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-card" style={{ padding: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Learning Modes</h3>
          <div style={{ height: 250, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="displayDate" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                <Bar dataKey="interviews" name="Interviews" stackId="a" fill="#A78BFA" />
                <Bar dataKey="videos" name="Videos watched" stackId="a" fill="#FFC107" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
