"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { activityApi, profileApi } from "@/lib/api";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
  const [stats, setStats] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [formData, setFormData] = useState({ name: "", bio: "", skills: "" });

  const token = (session?.user as any)?.accessToken;

  useEffect(() => {
    if (session) fetchStats();
  }, [session]);

  const fetchStats = async () => {
    if (!token) return;
    try {
      const data = await activityApi.getStats(token);
      setStats(data);
    } catch (e) {}
  };

  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      setFormData({
        name: u.name || "",
        bio: u.bio || "",
        skills: u.skills || "",
      });
    }
  }, [session]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setSaveStatus("idle");
    try {
      await profileApi.update(formData, token);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (e) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
    setSaving(false);
  };

  const UI_STATS = [
    { label: "XP Points", value: stats?.xp || 0, icon: "⚡", color: "#6C63FF" },
    { label: "Current Level", value: stats?.level || 1, icon: "🏆", color: "#FFD93D" },
    { label: "Coding Challenges", value: stats?.problems_solved || 0, icon: "💻", color: "#43E97B" },
    { label: "Interviews Done", value: stats?.interviews_completed || 0, icon: "🎯", color: "#FF6B6B" },
    { label: "🔥 Streak", value: `${stats?.streak || 0} days`, icon: "🔥", color: "#F97316" },
    { label: "Badges Earned", value: stats?.badges?.length || 0, icon: "🎖️", color: "#EC4899" },
  ];

  const BADGES = stats?.badges?.length > 0
    ? stats.badges.map((b: any) => ({ name: b.name, icon: b.icon || "✨", bg: "rgba(108,99,255,0.1)", color: "#6C63FF" }))
    : [
        { name: "Early Adopter", icon: "🚀", bg: "rgba(108,99,255,0.1)", color: "#6C63FF" },
      ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      
      {/* Profile Header */}
      <div className="dash-card" style={{ padding: 40, border: "1px solid var(--border)", display: "flex", gap: 32, alignItems: "center", marginBottom: 32, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 300, height: 300, background: "radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        
        <div style={{ width: 120, height: 120, borderRadius: 60, background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, fontWeight: 900, color: "white", boxShadow: "0 10px 30px rgba(108,99,255,0.3)", zIndex: 1, flexShrink: 0 }}>
          {session?.user?.name?.charAt(0) || "U"}
        </div>
        
        <div style={{ zIndex: 1, flex: 1 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 4px 0" }}>{session?.user?.name || "Student User"}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: "0 0 8px 0" }}>{session?.user?.email}</p>
          {(session?.user as any)?.bio && (
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 12px 0", fontStyle: "italic" }}>{(session?.user as any).bio}</p>
          )}
          {(session?.user as any)?.skills && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {((session?.user as any).skills as string).split(",").filter(Boolean).map((skill: string, i: number) => (
                <span key={i} style={{ padding: "3px 10px", background: "rgba(78,205,196,0.1)", color: "#4ECDC4", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid rgba(78,205,196,0.2)" }}>
                  {skill.trim()}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {BADGES.slice(0, 4).map((b: any, i: number) => (
              <div key={i} style={{ padding: "5px 12px", background: b.bg, color: b.color, borderRadius: 20, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${b.color}40` }}>
                <span>{b.icon}</span> {b.name}
              </div>
            ))}
            {stats?.level > 1 && (
              <div style={{ padding: "5px 12px", background: "rgba(108,99,255,0.1)", color: "#6C63FF", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid #6C63FF40" }}>
                ⭐ Level {stats.level} Achiever
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 32, borderBottom: "1px solid var(--border)", marginBottom: 32 }}>
        {(["overview", "settings"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ background: "transparent", border: "none", padding: "0 0 16px 0", fontSize: 15, fontWeight: 700, textTransform: "capitalize", cursor: "pointer",
              color: activeTab === tab ? "white" : "var(--text-secondary)",
              borderBottom: activeTab === tab ? "2px solid #6C63FF" : "2px solid transparent",
              transition: "all 0.2s",
            }}>
            {tab === "overview" ? "📊 Overview" : "⚙️ Settings"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
            {UI_STATS.map((stat, i) => (
              <div key={i} className="dash-card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 22 }}>{stat.icon}</span>
                  <span style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="dash-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Activity Progress</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Coding Progress", pct: stats?.progress?.coding || 0, color: "#06B6D4" },
                { label: "Interview Progress", pct: stats?.progress?.interview || 0, color: "#FBBF24" },
                { label: "Videos Watched", pct: stats?.progress?.videos || 0, color: "#A78BFA" },
                { label: "Roadmap Progress", pct: stats?.progress?.roadmap || 0, color: "#34D399" },
              ].map((prog, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{prog.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: prog.color }}>{prog.pct}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prog.pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                      style={{ height: "100%", background: prog.color, borderRadius: 6 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "settings" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dash-card" style={{ padding: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 28 }}>Edit Profile</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 560 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Display Name</label>
              <input
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="input-field" style={{ width: "100%", padding: "12px 14px", fontSize: 15 }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Bio</label>
              <textarea
                value={formData.bio}
                onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                rows={3}
                placeholder="Tell others about yourself..."
                className="input-field"
                style={{ width: "100%", padding: "12px 14px", fontSize: 14, resize: "vertical" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                Skills <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(comma-separated)</span>
              </label>
              <input
                value={formData.skills}
                onChange={e => setFormData(p => ({ ...p, skills: e.target.value }))}
                placeholder="e.g. React, Python, Machine Learning"
                className="input-field" style={{ width: "100%", padding: "12px 14px", fontSize: 14 }} />
              {formData.skills && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  {formData.skills.split(",").filter(s => s.trim()).map((skill, i) => (
                    <span key={i} style={{ padding: "3px 10px", background: "rgba(78,205,196,0.1)", color: "#4ECDC4", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
                style={{ padding: "13px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>

              {saveStatus === "success" && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  style={{ color: "#43E97B", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  ✓ Profile saved successfully!
                </motion.div>
              )}
              {saveStatus === "error" && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  style={{ color: "#FF6B6B", fontSize: 14, fontWeight: 600 }}>
                  ✕ Save failed. Please try again.
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
