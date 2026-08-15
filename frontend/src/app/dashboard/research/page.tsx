"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft, Loader2, BookOpen, Briefcase, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ModelSelector } from "@/components/dashboard/ModelSelector";

export default function DeepResearchPage() {
  const [activeTab, setActiveTab] = useState<"deep" | "career">("deep");
  const [loading, setLoading] = useState(false);

  // Deep Research State
  const [question, setQuestion] = useState("");
  const [deepResult, setDeepResult] = useState<any>(null);

  // Career GPS State
  const [targetRole, setTargetRole] = useState("");
  const [targetPackage, setTargetPackage] = useState("");
  const [careerResult, setCareerResult] = useState<any>(null);

  const handleDeepSearch = async () => {
    if (!question.trim() || loading) return;
    setLoading(true);
    setDeepResult(null);
    try {
      const res = await fetch("/api/v1/research/deep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      if (res.ok) setDeepResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCareerSearch = async () => {
    if (!targetRole.trim() || !targetPackage.trim() || loading) return;
    setLoading(true);
    setCareerResult(null);
    try {
      const res = await fetch("/api/v1/research/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_role: targetRole, target_package: targetPackage })
      });
      if (res.ok) setCareerResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const container: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item: any = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } };

  return (
    <motion.div initial="hidden" animate="show" variants={container} style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 80, paddingTop: 40 }}>
      {/* ── Header ── */}
      <motion.div variants={item} style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", fontSize: 14, textDecoration: "none" }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <ModelSelector />
        </div>
        
        <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900, color: "white", letterSpacing: "-0.03em", marginBottom: 14, fontFamily: "var(--font-outfit)" }}>
          Research Engine
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", maxWidth: 600, lineHeight: 1.6 }}>
          Run extensive technical deep dives or calculate the exact trajectory required to hit your target salary and role.
        </p>
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div variants={item} style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <button
          onClick={() => setActiveTab("deep")}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 24, fontSize: 14, fontWeight: 600,
            background: activeTab === "deep" ? "rgba(255,255,255,0.1)" : "transparent",
            color: activeTab === "deep" ? "white" : "rgba(255,255,255,0.4)",
            border: activeTab === "deep" ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent", cursor: "pointer", transition: "all 0.2s"
          }}
        >
          <BookOpen size={16} /> Deep Tech Research
        </button>
        <button
          onClick={() => setActiveTab("career")}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 24, fontSize: 14, fontWeight: 600,
            background: activeTab === "career" ? "rgba(99,102,241,0.1)" : "transparent",
            color: activeTab === "career" ? "#818CF8" : "rgba(255,255,255,0.4)",
            border: activeTab === "career" ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent", cursor: "pointer", transition: "all 0.2s"
          }}
        >
          <Briefcase size={16} /> Career GPS
        </button>
      </motion.div>

      {/* ── Tab Content: Deep Research ── */}
      {activeTab === "deep" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "12px 12px 12px 24px", display: "flex", alignItems: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", marginBottom: 40 }}>
            <input
              value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && handleDeepSearch()}
              placeholder="e.g., What skills will an AI Engineer need in the next 12 months?"
              style={{ flex: 1, background: "transparent", border: "none", color: "white", fontSize: 16, outline: "none", fontFamily: "var(--font-inter)" }}
            />
            <button
              onClick={handleDeepSearch} disabled={!question.trim() || loading}
              style={{ background: "#4F46E5", color: "white", border: "none", padding: "12px 24px", borderRadius: 16, fontSize: 14, fontWeight: 600, cursor: (!question.trim() || loading) ? "not-allowed" : "pointer", opacity: (!question.trim() || loading) ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8 }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Search
            </button>
          </div>

          <AnimatePresence>
            {deepResult && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
                <div style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 20, padding: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.5)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
                    <CheckCircle2 size={14} color="#10b981" /> Synthesis Complete
                  </div>
                  <p style={{ fontSize: 18, color: "white", lineHeight: 1.6, fontWeight: 500, marginBottom: 24 }}>{deepResult.summary}</p>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "var(--font-inter)" }}>
                    {deepResult.synthesis}
                  </p>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: "rgba(30,41,59,0.3)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 20, padding: 24 }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Confidence Score</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 36, fontWeight: 900, color: deepResult.confidence_score > 80 ? "#10b981" : "#f59e0b" }}>{deepResult.confidence_score}</span>
                      <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>/ 100</span>
                    </div>
                  </div>

                  <div style={{ background: "rgba(30,41,59,0.3)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 20, padding: 24 }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Sources</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {deepResult.sources.map((s: any, i: number) => (
                        <div key={i}>
                          <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: 14, fontWeight: 600, color: "#60A5FA", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                            {s.title} <ChevronRight size={14} />
                          </a>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{s.date}</div>
                          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{s.key_finding}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Tab Content: Career GPS ── */}
      {activeTab === "career" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "8px 24px", display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 8 }}>Target Role</label>
              <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g., AI Engineer" style={{ background: "transparent", border: "none", color: "white", fontSize: 16, padding: "8px 0", outline: "none", fontFamily: "var(--font-inter)" }} />
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "8px 12px 8px 24px", display: "flex", alignItems: "center" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 8 }}>Target Package</label>
                <input value={targetPackage} onChange={e => setTargetPackage(e.target.value)} placeholder="e.g., ₹25 LPA" style={{ background: "transparent", border: "none", color: "white", fontSize: 16, padding: "8px 0", outline: "none", fontFamily: "var(--font-inter)" }} />
              </div>
              <button
                onClick={handleCareerSearch} disabled={!targetRole.trim() || !targetPackage.trim() || loading}
                style={{ background: "#4F46E5", color: "white", border: "none", padding: "12px 24px", borderRadius: 16, fontSize: 14, fontWeight: 600, cursor: (!targetRole.trim() || !targetPackage.trim() || loading) ? "not-allowed" : "pointer", opacity: (!targetRole.trim() || !targetPackage.trim() || loading) ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8 }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Calculate
              </button>
            </div>
          </div>

          <AnimatePresence>
            {careerResult && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 20, padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#F87171", marginBottom: 12 }}>Current Gap</h3>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{careerResult.current_gap}</p>
                  </div>
                  
                  <div style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 20, padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "white", marginBottom: 16 }}>Priority Skills</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {careerResult.priority_skills.map((s: string, i: number) => (
                        <div key={i} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 8, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{s}</div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 20, padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "white", marginBottom: 16 }}>Interview Focus Areas</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {careerResult.interview_areas.map((s: string, i: number) => (
                        <div key={i} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 8, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{s}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 20, padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#34D399", marginBottom: 12 }}>Weekly Plan</h3>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{careerResult.weekly_plan}</p>
                  </div>

                  <div style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 20, padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "white", marginBottom: 16 }}>Recommended Projects</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {careerResult.projects.map((p: string, i: number) => (
                        <div key={i} style={{ paddingLeft: 12, borderLeft: "2px solid #818CF8", fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{p}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
