"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");

  const STATS = [
    { label: "Highest ATS Score", value: "88%", icon: "📄", color: "#43E97B" },
    { label: "Completed Tracks", value: "3", icon: "🎓", color: "#FFD93D" },
    { label: "Coding Challenges", value: "42", icon: "💻", color: "#6C63FF" },
    { label: "Startup Ideas", value: "14", icon: "💡", color: "#FF6B6B" },
  ];

  const BADGES = [
    { name: "Top 10% Fast Coder", icon: "⚡", bg: "rgba(255,217,61,0.1)", color: "#FFD93D" },
    { name: "Early Adopter", icon: "🚀", bg: "rgba(108,99,255,0.1)", color: "#6C63FF" },
    { name: "Interview Ready", icon: "🎯", bg: "rgba(67,233,123,0.1)", color: "#43E97B" },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      
      {/* Profile Header Card */}
      <div className="dash-card" style={{ padding: 40, border: "1px solid var(--border)", display: "flex", gap: 32, alignItems: "center", marginBottom: 32, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 300, height: 300, background: "radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        
        <div style={{ width: 120, height: 120, borderRadius: 60, background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, fontWeight: 900, color: "white", boxShadow: "0 10px 30px rgba(108,99,255,0.3)", zIndex: 1 }}>
          {session?.user?.name?.charAt(0) || "U"}
        </div>
        
        <div style={{ zIndex: 1, flex: 1 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 4px 0" }}>{session?.user?.name || "Student User"}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: "0 0 16px 0" }}>{session?.user?.email || "student@example.com"}</p>
          
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {BADGES.map((b, i) => (
              <div key={i} style={{ padding: "6px 12px", background: b.bg, color: b.color, borderRadius: 20, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${b.color}40` }}>
                <span>{b.icon}</span> {b.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 32, borderBottom: "1px solid var(--border)", marginBottom: 32 }}>
        {(["overview", "settings"] as const).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              background: "transparent", border: "none", padding: "0 0 16px 0", fontSize: 15, fontWeight: 700, textTransform: "capitalize", cursor: "pointer",
              color: activeTab === tab ? "white" : "var(--text-secondary)",
              borderBottom: activeTab === tab ? "2px solid #6C63FF" : "2px solid transparent",
              transition: "all 0.2s"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
            {STATS.map((stat, i) => (
              <div key={i} className="dash-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 24 }}>{stat.icon}</span>
                  <span style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</span>
                </div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="dash-card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Platform Progress Map</h2>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 16, height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>
              Activity Heatmap coming strictly via live database aggregation soon.
            </div>
          </div>

        </motion.div>
      )}

      {activeTab === "settings" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dash-card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Account Settings</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 600 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Display Name</label>
              <input defaultValue={session?.user?.name || ""} className="input-field" style={{ width: "100%", padding: 12, fontSize: 14 }} />
            </div>
            
            <div>
               <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Email Preferences</label>
               <label style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, cursor: "pointer", color: "white" }}>
                 <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: "#6C63FF" }} />
                 Receive weekly AI Roadmap progress updates
               </label>
            </div>

            <button className="btn btn-primary" style={{ background: "#6C63FF", width: "fit-content", padding: "12px 32px", borderRadius: 12 }}>Save Changes</button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
