"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Sparkles, Code, Terminal, Target, Briefcase, CalendarDays, CheckCircle, Shield, BrainCircuit, PenTool, GitBranch, ArrowRight, BookOpen, ExternalLink, Activity } from "lucide-react";
import { roadmapApi } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import toast from "react-hot-toast";

const GOALS = [
  { id: "ai", label: "AI Engineer", icon: <BrainCircuit size={18} /> },
  { id: "ds", label: "Data Scientist", icon: <Target size={18} /> },
  { id: "fs", label: "Full Stack Developer", icon: <Code size={18} /> },
  { id: "pm", label: "Product Manager", icon: <Briefcase size={18} /> },
  { id: "cs", label: "Cybersecurity", icon: <Shield size={18} /> },
  { id: "devops", label: "DevOps Engineer", icon: <Terminal size={18} /> },
  { id: "switch", label: "Career Switch", icon: <GitBranch size={18} /> },
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const TIMELINES = ["3 Months", "6 Months"];

interface BackendRoadmap {
  title: string;
  description: string;
  estimated_months: number;
  milestones: {
    phase: string;
    title: string;
    duration: string;
    topics: string[];
    project_idea: string;
    resources: { name: string; url: string }[];
  }[];
}

export default function PersonalizedRoadmapPage() {
  const { data: session } = useSession();
  const [phase, setPhase] = useState<"input" | "loading" | "dashboard">("input");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [timeline, setTimeline] = useState("3 Months");
  const [expandedPhase, setExpandedPhase] = useState<string | null>("1");
  const [roadmap, setRoadmap] = useState<BackendRoadmap | null>(null);

  const generate = async () => {
    if (!goal) return;
    if (!session?.user?.accessToken) {
      toast.error("Please log in to generate a roadmap.");
      return;
    }
    
    setPhase("loading");
    
    try {
      const selectedLabel = GOALS.find(g => g.id === goal)?.label || goal;
      const fullGoal = `${level} level ${selectedLabel} in ${timeline}`;
      
      const res = await roadmapApi.generate(fullGoal, session.user.accessToken);
      if (res && res.roadmap) {
        setRoadmap(res.roadmap as any);
        if (res.roadmap.milestones && Array.isArray(res.roadmap.milestones) && res.roadmap.milestones.length > 0) {
            setExpandedPhase(res.roadmap.milestones[0].phase);
        }
        setPhase("dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate roadmap");
      setPhase("input");
    }
  };

  const selectedGoalName = GOALS.find(g => g.id === goal)?.label;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #10B981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(16,185,129,0.4)" }}>
          <Map size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px", fontFamily: "var(--font-outfit)" }}>Personalized Roadmap</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 2 }}>Dynamic career planning built for your skill level</p>
        </div>
      </div>

      {phase === "input" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ padding: 32, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16 }}>Select Career Goal</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
              {GOALS.map(g => (
                <button key={g.id} onClick={() => setGoal(g.id)}
                  style={{ padding: "14px", borderRadius: 16, border: `2px solid ${goal === g.id ? "#10B981" : "rgba(255,255,255,0.08)"}`, background: goal === g.id ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}>
                  <span style={{ color: goal === g.id ? "#10B981" : "rgba(255,255,255,0.4)" }}>{g.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: goal === g.id ? "white" : "rgba(255,255,255,0.6)" }}>{g.label}</span>
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 12 }}>Current Skill Level</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setLevel(l)}
                      style={{ padding: "12px", borderRadius: 12, border: `1px solid ${level === l ? "#10B981" : "rgba(255,255,255,0.08)"}`, background: level === l ? "rgba(16,185,129,0.1)" : "transparent", color: level === l ? "#10B981" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 12 }}>Timeline Strategy</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {TIMELINES.map(t => (
                    <button key={t} onClick={() => setTimeline(t)}
                      style={{ padding: "12px", borderRadius: 12, border: `1px solid ${timeline === t ? "#10B981" : "rgba(255,255,255,0.08)"}`, background: timeline === t ? "rgba(16,185,129,0.1)" : "transparent", color: timeline === t ? "#10B981" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                      {t} {t === "3 Months" ? "(Sprint)" : "(Deep Dive)"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={generate} disabled={!goal || !session?.user?.accessToken}
              style={{ width: "100%", padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #10B981, #059669)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: (!goal || !session?.user?.accessToken) ? 0.5 : 1, boxShadow: (!goal || !session?.user?.accessToken) ? "none" : "0 14px 28px rgba(16,185,129,0.3)" }}>
              <Sparkles size={20} /> Generate Personalized Roadmap
            </button>
            {!session?.user?.accessToken && <p style={{ textAlign: "center", color: "#F87171", fontSize: 13, marginTop: 12 }}>You must be logged in to generate roadmaps.</p>}
          </div>
        </motion.div>
      )}

      {phase === "loading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid rgba(16,185,129,0.2)", borderTopColor: "#10B981" }} />
          </motion.div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Architecting Your Future...</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Generating custom plan via AI. This may take up to 10 seconds.</p>
        </div>
      )}

      {phase === "dashboard" && roadmap && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Header Metadata */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(16,185,129,0.2)" }}>{selectedGoalName}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>{level}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>{timeline}</span>
            </div>
            <button onClick={() => setPhase("input")} style={{ padding: "8px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Reconfigure
            </button>
          </div>

          <div style={{ marginBottom: 32, padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 8 }}>{roadmap.title}</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)" }}>{roadmap.description}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
            {roadmap.milestones?.map((milestone) => (
              <div key={milestone.phase} style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: `1px solid ${expandedPhase === milestone.phase ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.06)"}`, transition: "all 0.3s" }}>
                <div onClick={() => setExpandedPhase(expandedPhase === milestone.phase ? null : milestone.phase)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#10B981", marginBottom: 6, textTransform: "uppercase", letterSpacing: "1px" }}>Phase {milestone.phase} • {milestone.duration}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 4 }}>{milestone.title}</div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <motion.div animate={{ rotate: expandedPhase === milestone.phase ? 90 : 0 }}><ArrowRight size={18} color="white" /></motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedPhase === milestone.phase && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                      <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 24 }}>
                        
                        <div>
                            <h4 style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: 8 }}><BookOpen size={14} /> Topics to Cover</h4>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {milestone.topics?.map(topic => (
                                    <span key={topic} style={{ padding: "6px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{topic}</span>
                                ))}
                            </div>
                        </div>

                        {milestone.project_idea && (
                            <div style={{ padding: 16, borderRadius: 16, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
                                <h4 style={{ fontSize: 13, fontWeight: 800, color: "#10B981", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><Briefcase size={14} /> Recommended Project</h4>
                                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{milestone.project_idea}</p>
                            </div>
                        )}

                        {milestone.resources && milestone.resources.length > 0 && (
                            <div>
                                <h4 style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: 8 }}><Activity size={14} /> Resources</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {milestone.resources.map(res => (
                                        <a key={res.name} href={res.url} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", fontSize: 13, color: "#3B82F6", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none" }}>
                                            {res.name}
                                            <ExternalLink size={14} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
