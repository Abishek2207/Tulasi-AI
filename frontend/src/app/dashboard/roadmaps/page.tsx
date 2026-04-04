"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { roadmapApi } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
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
      setError("Neural Link Synced partially. Reload to stabilize.");
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
      toast.success("Intelligence Milestone Synced.");
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
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>
       <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 60, height: 60, border: "4px solid rgba(255,255,255,0.05)", borderTopColor: "var(--brand-primary)", borderRadius: "50%" }} />
       <div style={{ fontSize: 13, fontWeight: 900, color: "var(--text-secondary)", letterSpacing: 2 }}>SYNTHESIZING NEURAL PATHS...</div>
    </div>
  );

  if (error || !active) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }} className="glass-card p-12">
        <AlertCircle size={48} color="#FF6B6B" style={{ marginBottom: 20 }} />
        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Neural Handshake Failed</h3>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>{error || "No intelligence paths synchronized."}</p>
        <button onClick={fetchRoadmaps} className="btn-primary" style={{ padding: "12px 32px", borderRadius: 12 }}>Retry Sync</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 100 }}>
       {/* SEO & Header */}
      <h1 style={{ display: "none" }}>Neural Career Architect - TulasiAI Super-Intelligence</h1>

      <div style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
        <div style={{ position: "absolute", top: -50, left: 0, width: 400, height: 200, background: "radial-gradient(circle, rgba(124, 58, 237, 0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: "var(--brand-primary)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Trajectory Intelligence Layer</div>
          <h1 style={{ fontSize: 44, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 8, letterSpacing: "-1.5px" }}>
            Neural Career <span className="gradient-text">Architect</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 650, lineHeight: 1.6 }}>
            AGI-calibrated roadmaps for elite technical roles. Our neural engine 
            analyzes global market shifts to architect your specific trajectory.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
           <div className="glass-card" style={{ padding: "10px 20px", borderRadius: 14, display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.02)" }}>
              <Compass size={16} color="var(--brand-primary)" /> 
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>{roadmaps.length} NEURAL PATHWAYS ACTIVE</span>
           </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Left Specializations */}
        <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 10, fontWeight: 900, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 2.5, paddingLeft: 12, marginBottom: 12 }}>Intelligence Sectors</label>
          {roadmaps.map(r => (
            <motion.button key={r.id} onClick={() => setActiveId(r.id)} whileHover={{ x: 6, background: "rgba(255,255,255,0.02)" }} whileTap={{ scale: 0.98 }}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                borderRadius: 20, border: "1px solid transparent", cursor: "pointer", fontSize: 15, fontWeight: 800, textAlign: "left",
                background: activeId === r.id ? "rgba(255,255,255,0.04)" : "transparent",
                borderColor: activeId === r.id ? "rgba(255,255,255,0.05)" : "transparent",
                color: activeId === r.id ? "white" : "var(--text-muted)",
                position: "relative",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {activeId === r.id && (
                <motion.div layoutId="roadmap-active" style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 4, background: r.color, borderRadius: 2, boxShadow: `0 0 10px ${r.color}` }} />
              )}
              <span style={{ fontSize: 24, filter: activeId === r.id ? "drop-shadow(0 0 8px rgba(255,255,255,0.3))" : "grayscale(1)" }}>{r.icon}</span> 
              <span style={{ flex: 1, letterSpacing: -0.2 }}>{r.title}</span>
              {activeId === r.id && <ChevronRight size={16} style={{ color: r.color, opacity: 0.6 }} />}
            </motion.button>
          ))}
        </div>

        {/* Path Execution View */}
        <div style={{ flex: 1, minWidth: 600 }}>
          <AnimatePresence mode="wait">
            <motion.div key={active.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: "easeOut" }}>
              
              {/* Path Hero */}
              <TiltCard intensity={2} style={{ marginBottom: 32 }}>
                <div className="glass-card" style={{ padding: 56, borderColor: `${active.color}20`, position: "relative", overflow: "hidden", borderRadius: 32 }}>
                  <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, background: `radial-gradient(circle, ${active.color}10 0%, transparent 75%)`, filter: "blur(60px)" }} />
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 48 }}>
                    <div style={{ 
                      width: 100, height: 100, borderRadius: 28, background: `${active.color}10`, border: `1px solid ${active.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, boxShadow: `0 20px 40px ${active.color}15`,
                      backdropFilter: "blur(10px)"
                    }}>
                      {active.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 900, color: active.color, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Active Trajectory</div>
                      <h2 style={{ fontSize: 42, fontWeight: 900, color: "white", margin: 0, fontFamily: "var(--font-outfit)", letterSpacing: "-1.5px" }}>{active.title}</h2>
                      <p style={{ margin: "8px 0 0", fontSize: 18, color: "var(--text-secondary)", maxWidth: 550, lineHeight: 1.6 }}>{active.desc}</p>
                    </div>
                    
                    {/* Path Stats */}
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 6 }}>COGNITIVE SYNERGY</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 120, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: "88%" }} style={{ height: "100%", background: active.color }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 900, color: active.color }}>88%</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 900, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "6px 12px", borderRadius: 8, display: "inline-block" }}>MARKET DEMAND: CRITICAL</div>
                    </div>
                  </div>

                  {/* High Fidelity Section Tabs */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 48, padding: 8, background: "rgba(0,0,0,0.3)", borderRadius: 20, width: "fit-content", border: "1px solid rgba(255,255,255,0.05)" }}>
                    {[
                      { id: "milestones", label: "MILESTONES", icon: <Map size={14} /> },
                      { id: "skills", label: "NEURAL SKILLS", icon: <BrainCircuit size={14} /> },
                      { id: "projects", label: "BLUEPRINTS", icon: <Rocket size={14} /> },
                      { id: "coding", label: "DS&A ARENA", icon: <Terminal size={14} /> },
                      { id: "interview", label: "MAANG SIMS", icon: <Target size={14} /> },
                    ].map(s => (
                      <button key={s.id} onClick={() => setActiveSection(s.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", borderRadius: 14, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 900,
                          background: activeSection === s.id ? active.color : "transparent",
                          color: activeSection === s.id ? "black" : "var(--text-secondary)",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          letterSpacing: 1
                        }}
                      >{s.label}</button>
                    ))}
                  </div>

                  {/* Section Content */}
                  <AnimatePresence mode="wait">
                    <motion.div key={activeSection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                      
                      {activeSection === "milestones" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingLeft: 12 }}>
                          {active.milestones.map((m, idx) => {
                            const isCompleted = completedMilestones.has(m.id);
                            return (
                              <motion.div key={idx} whileHover={{ x: 8 }} style={{ position: "relative", display: "flex", gap: 32, opacity: isCompleted ? 0.4 : 1, cursor: "pointer" }} onClick={() => handleCompleteMilestone(m.id)}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <div style={{ 
                                    width: 40, height: 40, borderRadius: "50%", background: isCompleted ? active.color : "rgba(255,255,255,0.03)",
                                    border: `2px solid ${active.color}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1,
                                    boxShadow: isCompleted ? `0 0 15px ${active.color}` : "none", transition: "all 0.3s"
                                  }}>
                                    {isCompleted ? <CheckCircle2 size={20} color="black" /> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: active.color, opacity: 0.3 }} />}
                                  </div>
                                  {idx < active.milestones.length - 1 && <div style={{ width: 2, flex: 1, background: `linear-gradient(180deg, ${isCompleted ? active.color : active.color + "20"} 0%, rgba(255,255,255,0.02) 100%)`, margin: "10px 0" }} />}
                                </div>
                                <div style={{ paddingBottom: 32, flex: 1 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                    <h4 style={{ fontSize: 20, fontWeight: 900, color: "white", margin: 0, letterSpacing: -0.5 }}>{m.name}</h4>
                                    <div style={{ fontSize: 11, color: active.color, fontWeight: 900, display: "flex", alignItems: "center", gap: 6, background: `${active.color}05`, padding: "4px 10px", borderRadius: 6 }}>
                                      <Clock size={12} /> {m.duration.toUpperCase()}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 12 }}>
                                     <span style={{ fontWeight: 800, color: "var(--text-secondary)" }}>BENCHMARK: {idx === 0 ? "Entry" : idx < active.milestones.length - 1 ? "Intermediate" : "Elite"}</span>
                                     <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                                     <span>Verified by Tulasi Engine</span>
                                  </div>
                                </div>
                              </motion.div>
                            )})}
                        </div>
                      )}

                      {activeSection === "skills" && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
                          {active.skills.map(s => (
                            <div key={s} className="glass-card" style={{ padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 14 }}>
                               <div style={{ width: 32, height: 32, borderRadius: 10, background: `${active.color}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                 <BrainCircuit size={16} color={active.color} />
                               </div>
                               <span style={{ fontSize: 15, fontWeight: 800, color: "white", letterSpacing: -0.2 }}>{s}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeSection === "projects" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          {active.projects.map((p, i) => (
                            <div key={i} className="glass-card" style={{ padding: 28, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 20, borderRadius: 24, border: "1px solid rgba(255,255,255,0.03)" }}>
                               <div style={{ width: 52, height: 52, borderRadius: 16, background: `${active.color}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                 <Rocket size={24} color={active.color} />
                               </div>
                               <div style={{ flex: 1 }}>
                                 <h4 style={{ fontSize: 17, fontWeight: 900, color: "white", marginBottom: 4 }}>{p}</h4>
                                 <span style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1.5 }}>CAPSTONE INTEGRATION</span>
                               </div>
                               <button className="btn-ghost" style={{ fontSize: 12, fontWeight: 900, padding: "10px 24px", borderRadius: 12 }}>ARCHITECT BLUEPRINT →</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeSection === "coding" && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                          {active.coding.map(c => (
                            <div key={c} className="glass-card" style={{ padding: 24, background: "rgba(0,0,0,0.2)", border: `1px solid ${active.color}20`, borderRadius: 20, display: "flex", alignItems: "center", gap: 14 }}>
                               <Terminal size={20} color={active.color} />
                               <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.2 }}>{c}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeSection === "interview" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                           <div className="glass-card" style={{ padding: 40, background: "rgba(251,191,36,0.03)", borderRadius: 32, border: "1px solid rgba(251,191,36,0.15)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                                 <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(251,191,36,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                   <Star size={24} color="#FBBF24" fill="#FBBF24" />
                                 </div>
                                 <h3 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>Executive Calibration Tips</h3>
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                                {active.interview_tips.map((tip, i) => (
                                   <div key={i} style={{ fontSize: 15, color: "var(--text-secondary)", display: "flex", gap: 14, lineHeight: 1.7, background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                                      <div style={{ marginTop: 4, width: 6, height: 6, borderRadius: "50%", background: "#FBBF24", flexShrink: 0 }} />
                                      {tip}
                                   </div>
                                 ))}
                              </div>
                           </div>
                           <Link href="/dashboard/interview" style={{ textDecoration: "none" }}>
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary" 
                                style={{ width: "100%", padding: "24px", borderRadius: 24, fontSize: 18, fontWeight: 900, background: "linear-gradient(135deg, #FBBF24, #F97316)", color: "black", boxShadow: "0 20px 40px rgba(249,115,22,0.2)" }}>
                                 LAUNCH NEURAL INTERVIEW SIMULATION ⚡
                              </motion.button>
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

// Fixed imports for the overhaul
import { Compass, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
