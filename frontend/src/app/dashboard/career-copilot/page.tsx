"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Briefcase, Target, Map, CheckCircle, ChevronRight, CheckSquare, Clock, ArrowRight, Zap, GraduationCap, Building2 } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { intelligenceApi } from "@/lib/api";
import toast from "react-hot-toast";

interface CareerPath {
  id: string;
  title: string;
  tagline: string;
  color: string;
  timeline_months: number;
  difficulty: string;
  milestones: { month: number; goal: string; resources: string[] }[];
  key_skills: string[];
  companies: string[];
  job_readiness_pct: number;
}

interface GPSResult {
  paths: CareerPath[];
  recommendation: string;
  founder_note: string;
}

export default function CareerCopilotPage() {
  const { data: session } = useSession();
  const [phase, setPhase] = useState<"input" | "loading" | "dashboard">("input");
  
  // Form State
  const [year, setYear] = useState("3rd_year");
  const [goalRole, setGoalRole] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  // Result State
  const [result, setResult] = useState<GPSResult | null>(null);
  const [activePathId, setActivePathId] = useState<string>("");

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const analyzeProfile = async () => {
    if (!goalRole) {
      toast.error("Please enter a target role.");
      return;
    }
    if (!session?.user?.accessToken) {
      toast.error("Please log in to generate career paths.");
      return;
    }
    
    setPhase("loading");
    
    try {
        const res = await intelligenceApi.getCareerGPS(year, goalRole, skills.join(", "));
        setResult(res);
        setActivePathId(res.recommendation || res.paths[0]?.id);
        setPhase("dashboard");
    } catch (err: any) {
        toast.error(err.message || "Failed to generate Career GPS");
        setPhase("input");
    }
  };

  const activePath = result?.paths.find(p => p.id === activePathId) || result?.paths[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #8B5CF6, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(139,92,246,0.4)" }}>
          <BrainCircuit size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px", fontFamily: "var(--font-outfit)" }}>Career GPS</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 2 }}>AI-driven career profiling and strategic roadmaps</p>
        </div>
      </div>

      {phase === "input" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ padding: 32, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 24 }}>Setup Your GPS</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Current Stage</label>
                <select value={year} onChange={e => setYear(e.target.value)}
                  style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, outline: "none" }}>
                    <option value="1st_year" style={{color: "black"}}>1st Year</option>
                    <option value="2nd_year" style={{color: "black"}}>2nd Year</option>
                    <option value="3rd_year" style={{color: "black"}}>3rd Year</option>
                    <option value="4th_year" style={{color: "black"}}>4th Year</option>
                    <option value="fresher" style={{color: "black"}}>Fresher / Graduate</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Target Role *</label>
                <input value={goalRole} onChange={e => setGoalRole(e.target.value)} placeholder="e.g. AI Engineer, Product Manager"
                  style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, outline: "none" }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Current Skills (Press Enter)</label>
              <div style={{ padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, display: "flex", flexWrap: "wrap", gap: 8, minHeight: 50, alignItems: "center" }}>
                {skills.map(s => (
                  <span key={s} style={{ padding: "4px 10px", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#C4B5FD", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                    {s} <span onClick={() => removeSkill(s)} style={{ cursor: "pointer", opacity: 0.5 }}>×</span>
                  </span>
                ))}
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} placeholder="e.g. React, Python, AWS..."
                  style={{ flex: 1, minWidth: 150, background: "transparent", border: "none", color: "white", fontSize: 14, outline: "none", padding: "6px" }} />
              </div>
            </div>

            <button onClick={analyzeProfile} disabled={!goalRole || !session?.user?.accessToken}
              style={{ width: "100%", padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: (!goalRole || !session?.user?.accessToken) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: (!goalRole || !session?.user?.accessToken) ? "none" : "0 12px 24px rgba(139,92,246,0.3)", opacity: (!goalRole || !session?.user?.accessToken) ? 0.5 : 1 }}>
              <Map size={20} /> Generate Career Paths
            </button>
            {!session?.user?.accessToken && <p style={{ textAlign: "center", color: "#F87171", fontSize: 13, marginTop: 12 }}>You must be logged in to use Career GPS.</p>}
          </div>
        </motion.div>
      )}

      {phase === "loading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid rgba(139,92,246,0.2)", borderTopColor: "#8B5CF6" }} />
          </motion.div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Calculating Trajectories...</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Mapping your skills against industry standards for {goalRole}</p>
        </div>
      )}

      {phase === "dashboard" && result && activePath && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          
          {/* Path Selector */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            {result.paths.map(path => {
                const isActive = activePathId === path.id;
                const isRecommended = result.recommendation === path.id;
                return (
                    <div key={path.id} onClick={() => setActivePathId(path.id)} style={{
                        padding: "20px", borderRadius: "20px", cursor: "pointer", transition: "all 0.2s",
                        background: isActive ? `${path.color}15` : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isActive ? path.color : "rgba(255,255,255,0.06)"}`,
                        position: "relative"
                    }}>
                        {isRecommended && (
                            <div style={{ position: "absolute", top: -10, right: 20, background: path.color, color: "white", fontSize: 10, fontWeight: 800, padding: "4px 8px", borderRadius: 8, textTransform: "uppercase" }}>Recommended</div>
                        )}
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: isActive ? "white" : "rgba(255,255,255,0.7)", marginBottom: 4 }}>{path.title}</h3>
                        <div style={{ fontSize: 12, color: isActive ? path.color : "rgba(255,255,255,0.4)", fontWeight: 600, display: "flex", gap: 12, alignItems: "center" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12}/> {path.timeline_months} months</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Zap size={12}/> {path.difficulty}</span>
                        </div>
                    </div>
                )
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Timeline / Milestones */}
                <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: 8 }}><Map size={18} color={activePath.color} /> Execution Roadmap</h3>
                        <span style={{ fontSize: 13, fontWeight: 700, color: activePath.color, background: `${activePath.color}15`, padding: "4px 12px", borderRadius: 12 }}>{activePath.tagline}</span>
                    </div>

                    <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: 15, top: 10, bottom: 10, width: 2, background: "rgba(255,255,255,0.05)" }} />
                        {activePath.milestones.map((step, i) => (
                        <div key={i} style={{ display: "flex", gap: 20, marginBottom: i !== activePath.milestones.length - 1 ? 24 : 0, position: "relative", zIndex: 1 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: activePath.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 0 }}>
                                <span style={{ fontSize: 12, fontWeight: 900, color: "white" }}>{i + 1}</span>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: activePath.color, marginBottom: 4, textTransform: "uppercase" }}>Month {step.month}</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8 }}>{step.goal}</div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {step.resources.map(res => (
                                        <span key={res} style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 6 }}>{res}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>

                {/* Founder Note */}
                <div style={{ padding: 24, borderRadius: 20, background: "linear-gradient(to right, rgba(139,92,246,0.1), rgba(255,255,255,0.02))", borderLeft: "4px solid #8B5CF6" }}>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontStyle: "italic", lineHeight: 1.6 }}>"{result.founder_note}"</p>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Job Readiness */}
                <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: activePath.color, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Target Job Readiness</div>
                    <div style={{ fontSize: 64, fontWeight: 900, color: "white", lineHeight: 1 }}>{activePath.job_readiness_pct}%</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: 4 }}>End of Timeline Projection</div>
                </div>

                {/* Key Skills */}
                <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Target size={16} color={activePath.color} /> Core Technologies</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {activePath.key_skills.map(s => <span key={s} style={{ padding: "6px 12px", borderRadius: 10, background: `${activePath.color}15`, border: `1px solid ${activePath.color}30`, color: activePath.color, fontSize: 12, fontWeight: 600 }}>{s}</span>)}
                    </div>
                </div>

                {/* Target Companies */}
                <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Building2 size={16} color={activePath.color} /> Target Companies</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {activePath.companies.map((c, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                                <Briefcase size={14} color="rgba(255,255,255,0.5)" />
                                <span style={{ fontSize: 13, color: "white", fontWeight: 600 }}>{c}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

          </div>
          
          <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
            <button onClick={() => setPhase("input")} style={{ padding: "12px 24px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Reset & Recalculate
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
