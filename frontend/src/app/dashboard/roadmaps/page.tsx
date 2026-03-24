"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { roadmapApi } from "@/lib/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { TiltCard } from "@/components/ui/TiltCard";
import { 
  Map, CheckCircle2, Clock, Globe, Rocket, 
  Terminal, Target, Star, BrainCircuit, ChevronRight,
  Layout, Briefcase, GraduationCap, Code2
} from "lucide-react";

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

export default function RoadmapsPage() {
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
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const data = await roadmapApi.getRoadmaps(token);
      const fetchedRoadmaps = data.roadmaps as unknown as Roadmap[];
      setRoadmaps(fetchedRoadmaps);
      setCompletedMilestones(new Set((data.completed_milestones as string[]) || []));
      if (fetchedRoadmaps && fetchedRoadmaps.length > 0) {
        if (!fetchedRoadmaps.find((r) => r.id === activeId)) {
          setActiveId(fetchedRoadmaps[0].id);
        }
      }
    } catch (err: unknown) {
      setError("Failed to load roadmaps. The backend might be sleeping. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, [session]);

  const handleCompleteMilestone = async (milestoneId: string) => {
    if (completedMilestones.has(milestoneId)) return;
    
    setCompletedMilestones(prev => {
      const next = new Set(prev);
      next.add(milestoneId);
      return next;
    });

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      await roadmapApi.logProgress(activeId, milestoneId, token);
    } catch (err) {
      setCompletedMilestones(prev => {
        const next = new Set(prev);
        next.delete(milestoneId);
        return next;
      });
    }
  };

  const active = roadmaps.find(r => r.id === activeId);

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
       <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--brand-primary)", borderRadius: "50%" }} />
       <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Synthesizing career paths...</p>
    </div>
  );

  if (error || !active) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }} className="glass-card p-10">
        <p style={{ color: "#FF6B6B", fontWeight: 700 }}>{error || "No roadmaps available."}</p>
        <button onClick={fetchRoadmaps} className="btn-primary" style={{ marginTop: 24 }}>Retry Sync</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header Section */}
      <div style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 42, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 8, letterSpacing: "-1.5px" }}>
            Career <span className="gradient-text">Architect</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 600 }}>
            Precision-engineered step-by-step guides to mastering top tech roles. 
            Track your progress through the industry's most rigorous paths.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
           <div style={{ padding: "8px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <Globe size={16} className="text-brand" /> <span style={{ fontSize: 13, fontWeight: 700 }}>{roadmaps.length} GLOBAL PATHS</span>
           </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Left Nav Overlay */}
        <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 10, fontWeight: 900, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 2, paddingLeft: 12, marginBottom: 12 }}>Specializations</label>
          {roadmaps.map(r => (
            <motion.button key={r.id} onClick={() => setActiveId(r.id)} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
                borderRadius: 16, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, textAlign: "left",
                background: activeId === r.id ? "rgba(255,255,255,0.04)" : "transparent",
                color: activeId === r.id ? "white" : "var(--text-muted)",
                position: "relative",
                transition: "all 0.2s ease",
              }}
            >
              {activeId === r.id && (
                <motion.div layoutId="roadmap-active" style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: r.color, borderRadius: 2 }} />
              )}
              <span style={{ fontSize: 20 }}>{r.icon}</span> 
              <span style={{ flex: 1 }}>{r.title}</span>
              {activeId === r.id && <ChevronRight size={16} style={{ color: r.color }} />}
            </motion.button>
          ))}
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, minWidth: 600 }}>
          <AnimatePresence mode="wait">
            <motion.div key={active.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
              <TiltCard intensity={5} style={{ marginBottom: 24 }}>
                <div className="glass-card" style={{ padding: 48, borderColor: `${active.color}30`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, background: `radial-gradient(circle, ${active.color}15 0%, transparent 70%)`, filter: "blur(40px)" }} />
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
                    <div style={{ 
                      width: 80, height: 80, borderRadius: 24, background: `${active.color}15`, border: `1px solid ${active.color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, boxShadow: `0 12px 24px ${active.color}20`
                    }}>
                      {active.icon}
                    </div>
                    <div>
                      <h2 style={{ fontSize: 36, fontWeight: 900, color: "white", margin: 0, fontFamily: "var(--font-outfit)", letterSpacing: "-1px" }}>{active.title}</h2>
                      <p style={{ margin: "4px 0 0", fontSize: 17, color: "var(--text-secondary)", maxWidth: 500 }}>{active.desc}</p>
                    </div>
                  </div>

                  {/* High Fidelity Section Tabs */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 40, padding: 6, background: "rgba(0,0,0,0.2)", borderRadius: 16, width: "fit-content" }}>
                    {[
                      { id: "milestones", label: "MILESTONES", icon: <Map size={14} /> },
                      { id: "skills", label: "CORE SKILLS", icon: <BrainCircuit size={14} /> },
                      { id: "projects", label: "CAPSTONE", icon: <Rocket size={14} /> },
                      { id: "coding", label: "ARENA", icon: <Terminal size={14} /> },
                      { id: "interview", label: "FINALS", icon: <Target size={14} /> },
                    ].map(s => (
                      <button key={s.id} onClick={() => setActiveSection(s.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 900,
                          background: activeSection === s.id ? active.color : "transparent",
                          color: activeSection === s.id ? "black" : "var(--text-secondary)",
                          transition: "all 0.2s",
                        }}
                      >{s.label}</button>
                    ))}
                  </div>

                  {/* Section Content Rendering */}
                  <AnimatePresence mode="wait">
                    <motion.div key={activeSection} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      
                      {activeSection === "milestones" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingLeft: 8 }}>
                          {active.milestones.map((m, idx) => {
                            const isCompleted = completedMilestones.has(m.id);
                            return (
                              <div key={idx} style={{ position: "relative", display: "flex", gap: 24, opacity: isCompleted ? 0.5 : 1 }} onClick={() => handleCompleteMilestone(m.id)}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <div style={{ 
                                    width: 32, height: 32, borderRadius: "50%", background: isCompleted ? active.color : "rgba(255,255,255,0.05)",
                                    border: `2px solid ${active.color}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 1
                                  }}>
                                    {isCompleted && <CheckCircle2 size={16} color="black" />}
                                  </div>
                                  {idx < active.milestones.length - 1 && <div style={{ width: 2, flex: 1, background: `linear-gradient(180deg, ${active.color} 0%, rgba(255,255,255,0.05) 100%)`, margin: "8px 0" }} />}
                                </div>
                                <div style={{ paddingBottom: 24 }}>
                                  <h4 style={{ fontSize: 18, fontWeight: 800, color: "white", margin: "0 0 6px" }}>{m.name}</h4>
                                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                     <div style={{ fontSize: 12, color: active.color, fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
                                        <Clock size={12} /> {m.duration}
                                     </div>
                                     <span style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)" }}>STUDENT BENCHMARK</span>
                                  </div>
                                </div>
                              </div>
                            )})}
                        </div>
                      )}

                      {activeSection === "skills" && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                          {active.skills.map(s => (
                            <div key={s} className="glass-card" style={{ padding: "16px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
                               <CheckCircle2 size={14} className="text-brand" />
                               <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{s}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeSection === "projects" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {active.projects.map((p, i) => (
                            <div key={i} className="glass-card" style={{ padding: 24, background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: 16 }}>
                               <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}><Rocket size={20} className="text-brand" /></div>
                               <span style={{ fontSize: 16, fontWeight: 700, flex: 1 }}>{p}</span>
                               <button className="btn-ghost" style={{ fontSize: 11, fontWeight: 900, padding: "8px 16px" }}>GUIDE →</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeSection === "coding" && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                          {active.coding.map(c => (
                            <div key={c} className="glass-card" style={{ padding: 20, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(124, 58, 237, 0.2)", borderRadius: 16, display: "flex", alignItems: "center", gap: 12 }}>
                               <Code2 size={18} color="#8B5CF6" />
                               <span style={{ fontSize: 13, fontWeight: 700 }}>{c}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeSection === "interview" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                           <div style={{ padding: 32, background: "rgba(251,191,36,0.05)", borderRadius: 24, border: "1px solid rgba(251,191,36,0.2)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                 <Star size={20} color="#FBBF24" fill="#FBBF24" />
                                 <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Final Assessment Tips</h3>
                              </div>
                              <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                                 {active.interview_tips.map((tip, i) => (
                                   <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", display: "flex", gap: 10, lineHeight: 1.5 }}>
                                      <span style={{ color: "#FBBF24" }}>•</span> {tip}
                                   </li>
                                 ))}
                              </ul>
                           </div>
                           <Link href="/dashboard/interview" style={{ textDecoration: "none" }}>
                              <button className="btn-primary" style={{ width: "100%", padding: "18px", borderRadius: 16, fontSize: 16, fontWeight: 900, background: "linear-gradient(135deg, #FBBF24, #F97316)", color: "black" }}>
                                 LAUNCH FINAL INTERVIEW SIMULATION →
                              </button>
                           </Link>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>
              </TiltCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
