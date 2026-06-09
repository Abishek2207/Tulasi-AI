"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Briefcase, Target, Upload, CheckCircle, BrainCircuit, ShieldAlert, Check, ChevronRight, CheckSquare, FileText, ArrowRight, BookOpen, Clock } from "lucide-react";

interface AnalysisResult {
  score: number;
  readiness: number;
  levelAnalysis: string;
  strongAreas: string[];
  weakAreas: string[];
  actionPlan: { day: string; task: string }[];
  projects: { title: string; desc: string }[];
  interviewPrep: string[];
}

export default function CareerCopilotPage() {
  const [phase, setPhase] = useState<"input" | "loading" | "dashboard">("input");
  
  // Form State
  const [currentRole, setCurrentRole] = useState("");
  const [goalRole, setGoalRole] = useState("");
  const [goalCompany, setGoalCompany] = useState("");
  const [experience, setExperience] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Result State
  const [result, setResult] = useState<AnalysisResult | null>(null);

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
    if (!currentRole || !goalRole || !goalCompany || !experience || skills.length === 0) return;
    
    setPhase("loading");
    
    // Simulate AI Processing API Call
    await new Promise(r => setTimeout(r, 2500));
    
    setResult({
      score: 72,
      readiness: 65,
      levelAnalysis: `You are currently positioned as a strong ${currentRole} with solid foundational skills. To reach the ${goalRole} level at ${goalCompany}, you need to bridge the gap in distributed systems, scalability, and advanced system design. Your ${experience} of experience provides a good base, but the target role expects more architectural ownership.`,
      strongAreas: skills.slice(0, 3).length > 0 ? skills.slice(0, 3) : ["Problem Solving", "Core Programming", "Team Collaboration"],
      weakAreas: ["System Design", "Scalability", "Cloud Architecture (AWS/GCP)", "Advanced Algorithms"],
      actionPlan: [
        { day: "Days 1-7", task: "Master foundational System Design concepts (CAP Theorem, Load Balancing, Caching)." },
        { day: "Days 8-14", task: "Complete a deep dive into Cloud Architecture and deploy a sample microservice." },
        { day: "Days 15-21", task: "Solve 20 Medium/Hard LeetCode graphs and dynamic programming questions." },
        { day: "Days 22-30", task: "Do 3 mock interviews focusing heavily on System Design and Behavioral STAR method." }
      ],
      projects: [
        { title: "Distributed Key-Value Store", desc: "Build a highly available KV store using Raft consensus algorithm. This hits the core requirements for distributed systems." },
        { title: "High-Throughput Message Queue", desc: "Implement an in-memory message broker similar to Kafka to demonstrate understanding of pub-sub and throughput." }
      ],
      interviewPrep: [
        `${goalCompany} emphasizes Leadership Principles/Culture Fit. Prepare 5 solid STAR stories.`,
        `Focus on High-Level Design (HLD). Be ready to draw architecture diagrams on a whiteboard.`,
        `Expect at least one hard algorithmic round focusing on optimization (time/space complexity).`
      ]
    });
    
    setPhase("dashboard");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #8B5CF6, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(139,92,246,0.4)" }}>
          <BrainCircuit size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px", fontFamily: "var(--font-outfit)" }}>Career Copilot</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 2 }}>AI-driven career profiling and action planning</p>
        </div>
      </div>

      {phase === "input" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ padding: 32, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 24 }}>Profile Setup</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Current Role</label>
                <input value={currentRole} onChange={e => setCurrentRole(e.target.value)} placeholder="e.g. SDE-1, Student"
                  style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Experience Level</label>
                <input value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g. 2 Years, Fresher"
                  style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, outline: "none" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Goal Role</label>
                <input value={goalRole} onChange={e => setGoalRole(e.target.value)} placeholder="e.g. Senior SDE, Product Manager"
                  style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Goal Company</label>
                <input value={goalCompany} onChange={e => setGoalCompany(e.target.value)} placeholder="e.g. Google, Stripe, Startups"
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

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Resume (Optional)</label>
              <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed rgba(255,255,255,0.12)", borderRadius: 16, padding: "24px", textAlign: "center", cursor: "pointer", background: file ? "rgba(16,185,129,0.04)" : "transparent" }}>
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
                {file ? <CheckCircle size={28} color="#10B981" style={{ margin: "0 auto 8px" }} /> : <Upload size={28} color="rgba(255,255,255,0.3)" style={{ margin: "0 auto 8px" }} />}
                <div style={{ fontSize: 14, fontWeight: 600, color: file ? "#10B981" : "rgba(255,255,255,0.6)" }}>{file ? file.name : "Click to upload PDF"}</div>
              </div>
            </div>

            <button onClick={analyzeProfile} disabled={!currentRole || !goalRole || !goalCompany || !experience || skills.length === 0}
              style={{ width: "100%", padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 12px 24px rgba(139,92,246,0.3)", opacity: (!currentRole || !goalRole || !goalCompany || !experience || skills.length === 0) ? 0.5 : 1 }}>
              <BrainCircuit size={20} /> Generate Career Analysis
            </button>
          </div>
        </motion.div>
      )}

      {phase === "loading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid rgba(139,92,246,0.2)", borderTopColor: "#8B5CF6" }} />
          </motion.div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Analyzing Career Profile...</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Mapping your skills against {goalCompany}'s requirements for {goalRole}</p>
        </div>
      )}

      {phase === "dashboard" && result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Top Metrics Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 20, marginBottom: 20 }}>
            {/* Score */}
            <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Career Score</div>
              <div style={{ fontSize: 64, fontWeight: 900, color: "white", lineHeight: 1 }}>{result.score}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: 4 }}>out of 100</div>
            </div>

            {/* Readiness */}
            <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#10B981", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Job Readiness</div>
              <div style={{ fontSize: 64, fontWeight: 900, color: "white", lineHeight: 1 }}>{result.readiness}%</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: 4 }}>For {goalRole} at {goalCompany}</div>
            </div>

            {/* Level Analysis */}
            <div style={{ padding: 28, borderRadius: 24, background: "linear-gradient(135deg, rgba(139,92,246,0.05), rgba(255,255,255,0.01))", border: "1px solid rgba(139,92,246,0.15)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Target size={18} color="#8B5CF6" />
                <span style={{ fontSize: 14, fontWeight: 800, color: "white" }}>Current vs Goal Level</span>
              </div>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{result.levelAnalysis}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* Skill Gap */}
            <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 20 }}>Skill Gap Analysis</h3>
              
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#10B981", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Check size={14} /> Strong Areas</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.strongAreas.map(s => <span key={s} style={{ padding: "6px 12px", borderRadius: 10, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981", fontSize: 12, fontWeight: 600 }}>{s}</span>)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#F43F5E", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><ShieldAlert size={14} /> Areas to Improve (Weaknesses)</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.weakAreas.map(s => <span key={s} style={{ padding: "6px 12px", borderRadius: 10, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#F43F5E", fontSize: 12, fontWeight: 600 }}>{s}</span>)}
                </div>
              </div>
            </div>

            {/* Projects & Interview */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Briefcase size={16} color="#06B6D4" /> Recommended Projects</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {result.projects.map((p, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 }}>{p.title}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
             {/* Action Plan */}
             <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><CheckSquare size={16} color="#8B5CF6" /> Next 30-Day Action Plan</h3>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 11, top: 10, bottom: 10, width: 2, background: "rgba(255,255,255,0.05)" }} />
                {result.actionPlan.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, marginBottom: i !== result.actionPlan.length - 1 ? 20 : 0, position: "relative", zIndex: 1 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 900, color: "white" }}>{i + 1}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#8B5CF6", marginBottom: 4 }}>{step.day}</div>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{step.task}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Prep */}
            <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", alignSelf: "start" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><FileText size={16} color="#F59E0B" /> {goalCompany} Interview Prep</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {result.interviewPrep.map((prep, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <ChevronRight size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{prep}</span>
                  </div>
                ))}
              </div>
              <button style={{ width: "100%", padding: "14px", borderRadius: 12, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 }}>
                Launch Interview Agent <ArrowRight size={14} />
              </button>
            </div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
            <button onClick={() => setPhase("input")} style={{ padding: "12px 24px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Recalculate Profile
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
