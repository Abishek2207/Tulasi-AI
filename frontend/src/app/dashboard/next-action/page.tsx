"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { ArrowRight, Zap, Target, TrendingUp, AlertCircle, CheckCircle2, Calendar, BarChart3 } from "lucide-react";
import { API_URL } from "@/lib/api";

interface Action {
  title: string; desc: string; link: string; xp: number; icon: string; urgent?: boolean;
}
interface NextActionData {
  user_type: string; xp: number; streak: number;
  actions: Action[]; weak_areas: string[]; strong_areas: string[];
  activity_last_7d: Record<string, number>;
}

const USER_TYPE_LABELS: Record<string, string> = {
  "1st_year": "1st Year Student", "2nd_year": "2nd Year Student",
  "3rd_year": "3rd Year Student", "4th_year": "4th Year Student",
  "professional": "Working Professional", "professor": "Professor", "student": "Student",
};

export default function NextActionPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<NextActionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    fetch(`${API_URL}/api/next-action`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{ width: 40, height: 40, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8B5CF6", borderRadius: "50%" }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 className="hero-title" style={{ fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-1.5px", marginBottom: 12 }}>
          What to Do <span className="gradient-text">Next</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          Personalised recommendations based on your activity and learning profile.
        </p>
      </div>

      {/* Stats row */}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "User Type", value: USER_TYPE_LABELS[data.user_type] || data.user_type, color: "#8B5CF6", icon: "🎓" },
            { label: "Total XP", value: `${data.xp} XP`, color: "#F59E0B", icon: "⚡" },
            { label: "Current Streak", value: `${data.streak} days 🔥`, color: "#F43F5E", icon: "🔥" },
            { label: "Active Areas", value: `${data.strong_areas.length} features`, color: "#10B981", icon: "✅" },
          ].map(stat => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 0.5 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Weak area alerts */}
      {data?.weak_areas && data.weak_areas.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.2)", marginBottom: 28, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <AlertCircle size={18} color="#F43F5E" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, color: "#F43F5E", fontSize: 13, marginBottom: 4 }}>Weak Areas Detected</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              You haven't used these features this week: <strong style={{ color: "white" }}>{data.weak_areas.join(", ")}</strong>. Focus on these first!
            </div>
          </div>
        </motion.div>
      )}

      {/* Action cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px,100%), 1fr))", gap: 16, marginBottom: 40 }}>
        <AnimatePresence>
          {data?.actions.map((action, i) => (
            <motion.a key={action.title} href={action.link}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ textDecoration: "none" }}
              whileHover={{ y: -3 }}>
              <div className="glass-card" style={{
                padding: 24, height: "100%", display: "flex", flexDirection: "column", gap: 12, cursor: "pointer",
                border: action.urgent ? "1px solid rgba(244,63,94,0.3)" : "1px solid var(--border)",
                background: action.urgent ? "rgba(244,63,94,0.05)" : "rgba(255,255,255,0.02)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 28 }}>{action.icon}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
                    background: "rgba(139,92,246,0.15)", color: "#A78BFA"
                  }}>+{action.xp} XP</span>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "white", marginBottom: 6 }}>{action.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{action.desc}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#8B5CF6", fontSize: 12, fontWeight: 700, marginTop: "auto" }}>
                  Start Now <ArrowRight size={12} />
                </div>
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
      </div>

      {/* Activity breakdown */}
      {data?.activity_last_7d && Object.keys(data.activity_last_7d).length > 0 && (
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <BarChart3 size={18} color="var(--brand-primary)" />
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>Last 7 Days Activity</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(data.activity_last_7d).map(([area, count]) => {
              const max = Math.max(...Object.values(data.activity_last_7d));
              const pct = (count / max) * 100;
              return (
                <div key={area}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--text-secondary)" }}>{area}</span>
                    <span style={{ color: "#8B5CF6", fontWeight: 700 }}>{count} sessions</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)" }}>
                    <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                      style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #8B5CF6, #06B6D4)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
