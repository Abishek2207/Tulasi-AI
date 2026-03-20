"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { roadmapApi } from "@/lib/api";
import { useSession } from "next-auth/react";

interface Milestone {
  id: string;
  name: string;
  duration: string;
}

interface Roadmap {
  id: string;
  title: string;
  icon: string;
  color: string;
  desc: string;
  skills: string[];
  projects: string[];
  coding: string[];
  interview_tips: string[];
  milestones: Milestone[];
}

export default function CareerRoadmapsPage() {
  const { data: session } = useSession();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState("swe");
  const [activeSection, setActiveSection] = useState("milestones");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const token = "";
      if (!token) return;
      const data = await roadmapApi.getRoadmaps(token);
      setRoadmaps(data.roadmaps as Roadmap[]);
      setCompletedMilestones(new Set(data.completed_milestones || []));
      if (data.roadmaps && data.roadmaps.length > 0) {
        if (!data.roadmaps.find((r: Roadmap) => r.id === activeId)) {
          setActiveId(data.roadmaps[0].id);
        }
      }
    } catch (err: any) {
      setError("Failed to load roadmaps. The backend might be sleeping. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, [session]);

  const handleCompleteMilestone = async (milestoneId: string) => {
    if (completedMilestones.has(milestoneId)) return; // already completed
    
    // Optimistic UI update
    setCompletedMilestones(prev => {
      const next = new Set(prev);
      next.add(milestoneId);
      return next;
    });

    try {
      const token = "";
      await roadmapApi.logProgress(activeId, milestoneId, token);
    } catch (err) {
      // Revert optimism if failed
      setCompletedMilestones(prev => {
        const next = new Set(prev);
        next.delete(milestoneId);
        return next;
      });
      alert("Failed to track progress. Backend might be unreachable.");
    }
  };

  const active = roadmaps.find(r => r.id === activeId);

  if (loading) return <div style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: 100 }}>Loading roadmaps...</div>;
  if (error || !active) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <p style={{ color: "var(--danger)" }}>{error || "No roadmaps available."}</p>
        <button onClick={fetchRoadmaps} style={{ marginTop: 20, padding: "10px 20px", background: "var(--primary)", borderRadius: 8, border: "none", cursor: "pointer", color: "black", fontWeight: "bold" }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 12 }}>
          Career <span style={{ background: "linear-gradient(135deg, #FF6B6B, #4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Roadmaps</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          15 step-by-step guides to mastering the skills for top tech roles. Follow at your own pace.
        </p>
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        {/* Sidebar Nav */}
        <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {roadmaps.map(r => (
            <button key={r.id} onClick={() => setActiveId(r.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, textAlign: "left",
                background: activeId === r.id ? `${r.color}20` : "transparent",
                color: activeId === r.id ? r.color : "var(--text-muted)",
                boxShadow: activeId === r.id ? `inset 3px 0 0 ${r.color}` : "none",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontSize: 18 }}>{r.icon}</span> {r.title}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div key={active.id}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="dash-card"
            style={{ flex: 1, padding: 36, background: "rgba(255,255,255,0.02)", border: `1px solid ${active.color}30` }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${active.color}20`, border: `1px solid ${active.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                {active.icon}
              </div>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: active.color, margin: 0 }}>{active.title}</h2>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>{active.desc}</p>
              </div>
            </div>

            {/* Section tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16 }}>
              {[
                { id: "milestones", label: "🛣️ Roadmap" },
                { id: "skills", label: "🛠️ Skills" },
                { id: "projects", label: "🚀 Projects" },
                { id: "coding", label: "💻 Coding" },
                { id: "interview", label: "🎯 Interview" },
              ].map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  style={{
                    padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    background: activeSection === s.id ? active.color : "rgba(255,255,255,0.06)",
                    color: activeSection === s.id ? "black" : "var(--text-secondary)",
                    transition: "all 0.2s",
                  }}
                >{s.label}</button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                {activeSection === "milestones" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, borderLeft: `2px solid ${active.color}`, paddingLeft: 24, marginLeft: 8 }}>
                    {active.milestones.map((m, idx) => {
                      const isCompleted = completedMilestones.has(m.id);
                      return (
                      <div key={idx} style={{ position: "relative", cursor: "pointer", opacity: isCompleted ? 0.6 : 1, transition: "0.2s" }} onClick={() => handleCompleteMilestone(m.id)}>
                        <div style={{ position: "absolute", left: -31, top: 6, width: 12, height: 12, borderRadius: "50%", background: isCompleted ? active.color : "var(--background)", border: `2px solid ${active.color}` }} />
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: "0 0 4px", textDecoration: isCompleted ? "line-through" : "none" }}>{m.name}</h4>
                        <span style={{ fontSize: 12, color: active.color, fontWeight: 600, background: `${active.color}15`, padding: "2px 10px", borderRadius: 6 }}>⏱ {m.duration} {isCompleted && "✓ Done"}</span>
                      </div>
                    )})}
                  </div>
                )}

                {activeSection === "skills" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {active.skills.map(s => (
                      <span key={s} style={{ padding: "8px 16px", background: `${active.color}15`, border: `1px solid ${active.color}40`, borderRadius: 20, fontSize: 13, fontWeight: 600, color: "white" }}>{s}</span>
                    ))}
                  </div>
                )}

                {activeSection === "projects" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {active.projects.map((p, i) => (
                      <div key={i} style={{ padding: "14px 18px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ color: active.color, fontSize: 18 }}>🚀</span>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "coding" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {active.coding.map(c => (
                      <span key={c} style={{ padding: "8px 16px", background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: 20, fontSize: 13, fontWeight: 600, color: "#9B95FF" }}>💻 {c}</span>
                    ))}
                  </div>
                )}

                {activeSection === "interview" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {active.interview_tips.map((tip, i) => (
                      <div key={i} style={{ padding: "12px 16px", background: "rgba(255,215,0,0.06)", borderRadius: 10, border: "1px solid rgba(255,215,0,0.15)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "#FFD700" }}>⭐</span>
                        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}>{tip}</span>
                      </div>
                    ))}
                    <a href="/dashboard/interview" style={{ textDecoration: "none", marginTop: 8 }}>
                      <button style={{ width: "100%", padding: "12px", borderRadius: 12, background: `linear-gradient(135deg, ${active.color}, #6C63FF)`, border: "none", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                        🎯 Start Mock Interview →
                      </button>
                    </a>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
