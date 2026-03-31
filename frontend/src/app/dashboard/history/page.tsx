"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/hooks/useSession";

const BACKEND = "";

const TYPE_FILTERS = [
  { id: "all", label: "All", icon: "🕐" },
  { id: "code_solved", label: "Code Solved", icon: "💻" },
  { id: "video_watched", label: "Videos", icon: "▶️" },
  { id: "interview_completed", label: "Interviews", icon: "🎯" },
  { id: "roadmap_step", label: "Roadmap", icon: "🗺️" },
  { id: "hackathon_joined", label: "Hackathons", icon: "🏆" },
];

interface HistoryItem {
  id: number;
  action_type: string;
  icon: string;
  title: string;
  xp_earned: number;
  created_at: string;
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState("all");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) fetchHistory();
  }, [filter, page, session]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      

      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filter !== "all") params.set("action_type", filter);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activity/history?${params}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors"
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      setError("Could not load activity history. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const ACTION_COLORS: Record<string, string> = {
    code_solved: "#4ECDC4", video_watched: "#6C63FF", reel_watched: "#FF6B9D",
    interview_completed: "#FFD93D", roadmap_step: "#43E97B", hackathon_joined: "#FF8E53",
    roadmap_completed: "#A78BFA", course_completed: "#06B6D4",
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "Outfit", marginBottom: 8 }}>📊 Activity History</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Track everything you&apos;ve done — every problem solved, video watched, and interview completed.</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {TYPE_FILTERS.map(f => (
          <button key={f.id} onClick={() => { setFilter(f.id); setPage(1); }}
            style={{
              padding: "7px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: filter === f.id ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.04)",
              color: filter === f.id ? "#9B95FF" : "var(--text-muted)",
              border: filter === f.id ? "1px solid rgba(108,99,255,0.3)" : "1px solid rgba(255,255,255,0.06)",
              transition: "all 0.2s",
            }}>
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Total count */}
      {!loading && !error && (
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
          Showing {history.length} of {total} activities
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 12, padding: 20, color: "#FF6B6B", textAlign: "center", marginBottom: 24 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: 72, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No activity yet</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Start learning! Solve problems, watch videos, or do a mock interview.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {history.map((item, i) => {
            const color = ACTION_COLORS[item.action_type] || "#6C63FF";
            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
                  background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `3px solid ${color}`, borderRadius: 12, transition: "border-color 0.2s",
                }}
                whileHover={{ borderColor: "rgba(255,255,255,0.12)" }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{formatDate(item.created_at)}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>+{item.xp_earned} XP</div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 32 }}>
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            style={{ padding: "8px 20px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.4 : 1 }}>
            ← Prev
          </button>
          <span style={{ padding: "8px 16px", color: "var(--text-secondary)", fontSize: 13 }}>Page {page} of {Math.ceil(total / 20)}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(total / 20)}
            style={{ padding: "8px 20px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", cursor: "pointer", opacity: page >= Math.ceil(total / 20) ? 0.4 : 1 }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
