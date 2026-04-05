"use client";

import { useSession } from "@/hooks/useSession";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { activityApi, profileApi, usersApi, certificateApi, Certificate } from "@/lib/api";
import { Zap, Flame, Code, Target, Trophy, Award, Edit3, Check, X, Camera, Image as ImageIcon, Sparkles, Loader2, FileDown } from "lucide-react";

interface UserStats {
  xp?: number; level?: number; problems_solved?: number;
  interviews_completed?: number; streak?: number;
  badges?: Array<{ name: string; icon?: string }>;
  progress?: { coding?: number; interview?: number; videos?: number; roadmap?: number };
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ padding: "22px 24px", borderRadius: 20, border: `1px solid ${color}18`, position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", top: -16, right: -16, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${color}20 0%, transparent 70%)` }} />
      <div style={{ color, background: `${color}15`, width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 30, fontWeight: 900, color, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [formData, setFormData] = useState({ name: "", bio: "", skills: "" });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [removingBg, setRemovingBg] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  useEffect(() => {
    if (session) activityApi.getStats(token).then(setStats).catch(() => {});
    if (session?.user) {
      const u = session.user as { name?: string; bio?: string; skills?: string; avatar?: string; image?: string };
      setFormData({ name: u.name || "", bio: u.bio || "", skills: u.skills || "" });
      // Google OAuth photo or custom uploaded avatar
      if (u.avatar) setAvatarUrl(u.avatar);
      else if (u.image) setAvatarUrl(u.image);
      
      // Fetch certificates
      certificateApi.list(token).then((res) => {
        setCertificates(res.certificates || []);
      }).catch(err => console.error(err));
    }
  }, [session]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarUrl(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Auto-remove BG if it's a new upload
    try {
      setRemovingBg(true);
      const blob = await usersApi.removeBg(file, token);
      const url = URL.createObjectURL(blob);
      setAvatarUrl(url);
    } catch (err) {
      console.error("BG Removal failed:", err);
    } finally {
      setRemovingBg(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.update({ ...formData, avatar: avatarUrl || undefined }, token);
      // Refresh session
      await update(); 
      setSaveStatus("success");
    } catch { setSaveStatus("error"); }
    setSaving(false);
    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  const user = session?.user;
  const initials = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  const STAT_CARDS = [
    { icon: <Zap size={18} />, label: "Total XP", value: `${stats?.xp || 0} xp`, color: "#8B5CF6" },
    { icon: <Trophy size={18} />, label: "Power Level", value: stats?.level || 1, color: "#FFD93D" },
    { icon: <Code size={18} />, label: "Problems Solved", value: stats?.problems_solved || 0, color: "#4ECDC4" },
    { icon: <Target size={18} />, label: "Interviews Done", value: stats?.interviews_completed || 0, color: "#06B6D4" },
    { icon: <Flame size={18} />, label: "Day Streak", value: `${stats?.streak || 0}🔥`, color: "#F43F5E" },
    { icon: <Award size={18} />, label: "Badges Earned", value: stats?.badges?.length || 1, color: "#EC4899" },
  ];

  const PROGRESS_BARS = [
    { label: "Coding Progress", pct: stats?.progress?.coding || 0, color: "#06B6D4" },
    { label: "Interview Readiness", pct: stats?.progress?.interview || 0, color: "#FBBF24" },
    { label: "Videos Watched", pct: stats?.progress?.videos || 0, color: "#A78BFA" },
    { label: "Roadmap Completion", pct: stats?.progress?.roadmap || 0, color: "#34D399" },
  ];

  const skillsList = formData.skills.split(",").map(s => s.trim()).filter(Boolean);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 80 }}>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          padding: "48px 48px", marginBottom: 32, borderRadius: 28,
          background: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(6,182,212,0.06) 100%)",
          border: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden"
        }}
      >
        {/* BG glows */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 32, position: "relative", zIndex: 1 }}>
          {/* Animated Avatar Ring */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              style={{
                position: "absolute", inset: -4, borderRadius: "50%",
                background: "conic-gradient(from 0deg, #8B5CF6, #06B6D4, #F43F5E, #8B5CF6)",
                zIndex: 0
              }}
            />
            <div style={{
              width: 110, height: 110, borderRadius: "50%",
              background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 44, fontWeight: 900, color: "white",
              position: "relative", zIndex: 1,
              border: "3px solid #05070D",
              overflow: "hidden"
            }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                  onError={() => setAvatarUrl(null)}
                />
              ) : (
                <span style={{ fontSize: 44, fontWeight: 900 }}>{initials}</span>
              )}
              {removingBg && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <Loader2 size={24} className="animate-spin" />
                </div>
              )}
            </div>

            <label htmlFor="avatar-upload" style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: 32, height: 32, borderRadius: "50%", background: "#1E293B", border: "2px solid #05070D", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
              <Camera size={14} color="#A78BFA" />
            </label>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
            {/* Online indicator */}
            <div style={{
              position: "absolute", bottom: 4, right: 4, width: 18, height: 18,
              borderRadius: "50%", background: "#43E97B",
              border: "3px solid #05070D", zIndex: 2,
              boxShadow: "0 0 12px #43E97B"
            }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
              Orbit Profile
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4, letterSpacing: "-1px" }}>
              {user?.name || "Student User"}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>{user?.email}</p>

            {/* Skill Chips */}
            {skillsList.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {skillsList.map((skill, i) => (
                  <span key={i} style={{ padding: "4px 12px", background: "rgba(6,182,212,0.1)", color: "#06B6D4", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(6,182,212,0.2)" }}>
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Badges */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span style={{ padding: "5px 12px", background: "rgba(139,92,246,0.1)", color: "#8B5CF6", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(139,92,246,0.2)" }}>🚀 Early Adopter</span>
              {(stats?.level ?? 0) >= 2 && <span style={{ padding: "5px 12px", background: "rgba(255,215,0,0.08)", color: "#FFD700", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(255,215,0,0.2)" }}>⭐ Level {stats?.level}</span>}
              {(stats?.streak ?? 0) >= 3 && <span style={{ padding: "5px 12px", background: "rgba(244,63,94,0.1)", color: "#F43F5E", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(244,63,94,0.2)" }}>🔥 On Fire</span>}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 32, background: "rgba(255,255,255,0.02)", borderRadius: 14, padding: 4, width: "fit-content", border: "1px solid rgba(255,255,255,0.05)" }}>
        {(["overview", "settings"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none",
            background: activeTab === tab ? "rgba(139,92,246,0.15)" : "transparent",
            color: activeTab === tab ? "#8B5CF6" : "var(--text-secondary)",
            outline: activeTab === tab ? "1px solid rgba(139,92,246,0.3)" : "none",
            transition: "all 0.2s",
          }}>
            {tab === "overview" ? "📊 Overview" : "⚙️ Settings"}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
            {STAT_CARDS.map((s, i) => <StatCard key={i} {...s} />)}
          </div>

          <div className="glass-card" style={{ padding: 32, borderRadius: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={16} color="#8B5CF6" /> Activity Progress
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {PROGRESS_BARS.map((p, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{p.label}</span>
                    <span style={{ fontWeight: 800, color: p.color }}>{p.pct}%</span>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 8, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                      style={{ height: "100%", background: `linear-gradient(90deg, ${p.color}80, ${p.color})`, borderRadius: 8, boxShadow: `0 0 8px ${p.color}40` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Certificates Row */}
          {certificates.length > 0 && (
            <div className="glass-card" style={{ padding: 32, borderRadius: 24, marginTop: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={16} color="#06B6D4" /> Earned Certificates
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {certificates.map(cert => (
                  <div key={cert.id} style={{ padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 12 }}>
                     <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(6,182,212,0.15)", color: "#06B6D4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Trophy size={20} />
                     </div>
                     <div style={{ fontSize: 14, fontWeight: 700 }}>{cert.title}</div>
                     <a href={cert.file_path} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#06B6D4", marginTop: "auto", padding: "6px 0", cursor: "pointer" }}>
                       <FileDown size={14} /> Download PDF
                     </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 40, borderRadius: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 28, display: "flex", alignItems: "center", gap: 8 }}><Edit3 size={18} color="#8B5CF6" /> Edit Profile</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 560 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Display Name</label>
              <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="input-field" style={{ width: "100%", padding: "13px 16px", fontSize: 15, borderRadius: 12 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Bio</label>
              <textarea value={formData.bio} onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Tell others about yourself..." className="input-field" style={{ width: "100%", padding: "13px 16px", fontSize: 14, borderRadius: 12, resize: "vertical" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Skills <span style={{ fontSize: 10, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(comma-separated)</span></label>
              <input value={formData.skills} onChange={e => setFormData(p => ({ ...p, skills: e.target.value }))} placeholder="React, Python, Machine Learning..." className="input-field" style={{ width: "100%", padding: "13px 16px", fontSize: 14, borderRadius: 12 }} />
              {skillsList.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  {skillsList.map((s, i) => <span key={i} style={{ padding: "3px 10px", background: "rgba(6,182,212,0.1)", color: "#06B6D4", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s}</span>)}
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: "14px 28px", borderRadius: 14, fontSize: 14, fontWeight: 800 }}>
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>
              {saveStatus === "success" && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "#43E97B", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <Check size={14} /> Profile Updated
                </motion.span>
              )}
              {saveStatus === "error" && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "#F43F5E", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <X size={14} /> Save failed.
                </motion.span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
