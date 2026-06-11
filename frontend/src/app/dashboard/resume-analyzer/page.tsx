"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle, AlertCircle, Sparkles, Zap, ShieldCheck, Target, Download, PenTool, Briefcase } from "lucide-react";
import { resumeApi } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import toast from "react-hot-toast";

interface BackendAnalysis {
  ats_score: number;
  readability_score: number;
  keyword_match_percent: number;
  feedback: string[];
  missing_keywords: string[];
  improved_resume: string;
}

export default function ResumeAnalyzerPage() {
  const { data: session } = useSession();
  const [phase, setPhase] = useState<"upload" | "loading" | "results">("upload");
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<BackendAnalysis | null>(null);

  const analyze = async () => {
    if (!resumeText || !targetRole) return;
    if (!session?.token) {
        toast.error("Please log in to analyze your resume.");
        return;
    }
    
    setPhase("loading");
    
    try {
        const payload = {
            resume_text: resumeText,
            job_description: jobDescription || `Role: ${targetRole}`,
            mode: "Standard",
            document_type: "Resume"
        };
        const res = await resumeApi.improve(payload, session.token);
        
        if (res) {
            setResult(res);
            setPhase("results");
        } else {
            throw new Error("Empty response from server");
        }
    } catch (err: any) {
        toast.error(err.message || "Failed to analyze resume");
        setPhase("upload");
    }
  };

  const getScoreColor = (score: number) => score >= 80 ? "#10B981" : score >= 65 ? "#F59E0B" : "#F43F5E";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #3B82F6, #2563EB)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(59,130,246,0.4)" }}>
          <FileText size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px", fontFamily: "var(--font-outfit)" }}>AI Resume Analyzer</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 2 }}>Deep ATS parsing, readiness scoring, and bullet rewrites</p>
        </div>
      </div>

      {phase === "upload" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ padding: 32, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 24 }}>Paste Resume & Target Details</h2>
            
            {/* Target Role Inputs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Target Role *</label>
                <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Backend Engineer at Stripe"
                  style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Job Description (Optional)</label>
                <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the job description for a tailored analysis..."
                  style={{ width: "100%", height: 100, padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit" }} />
              </div>
            </div>

            {/* Resume Text Input */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Resume Content *</label>
              <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your entire resume text here..."
                  style={{ width: "100%", height: 250, padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.6 }} />
            </div>

            <button onClick={analyze} disabled={!resumeText || !targetRole || !session?.token}
              style={{ width: "100%", padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: (!resumeText || !targetRole || !session?.token) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: (!resumeText || !targetRole || !session?.token) ? 0.5 : 1, boxShadow: (!resumeText || !targetRole || !session?.token) ? "none" : "0 12px 24px rgba(59,130,246,0.3)" }}>
              <Zap size={20} /> Analyze Resume
            </button>
            {!session?.token && <p style={{ textAlign: "center", color: "#F87171", fontSize: 13, marginTop: 12 }}>You must be logged in to analyze your resume.</p>}
          </div>
        </motion.div>
      )}

      {phase === "loading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid rgba(59,130,246,0.2)", borderTopColor: "#3B82F6" }} />
          </motion.div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Scanning Resume...</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Checking ATS parsability, keyword matches, and building improvement plan.</p>
        </div>
      )}

      {phase === "results" && result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Top Metrics Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
            {[
              { label: "Overall ATS Score", value: result.ats_score, icon: <FileText size={18} color={getScoreColor(result.ats_score)} /> },
              { label: "Readability Score", value: result.readability_score, icon: <ShieldCheck size={18} color={getScoreColor(result.readability_score)} /> },
              { label: "Keyword Match", value: result.keyword_match_percent, icon: <Target size={18} color={getScoreColor(result.keyword_match_percent)} /> },
            ].map((metric, i) => (
              <div key={i} style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: `1px solid ${getScoreColor(metric.value)}30`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  {metric.icon} <span style={{ fontSize: 12, fontWeight: 800, color: getScoreColor(metric.value), textTransform: "uppercase", letterSpacing: "1px" }}>{metric.label}</span>
                </div>
                <div style={{ fontSize: 64, fontWeight: 900, color: "white", lineHeight: 1 }}>{metric.value}</div>
                <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10, marginTop: 16, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${metric.value}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ height: "100%", background: getScoreColor(metric.value), borderRadius: 10 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* Deep Audit / Feedback */}
            <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <AlertCircle size={20} color="#F59E0B" /> AI Feedback & Suggestions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {result.feedback?.map((p, i) => (
                    <div key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 4, display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: "#F59E0B", marginTop: 2 }}>•</span> 
                        <span style={{ lineHeight: 1.5 }}>{p}</span>
                    </div>
                ))}
                {(!result.feedback || result.feedback.length === 0) && (
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>No critical feedback found. Your resume structure looks solid.</div>
                )}
              </div>
            </div>

            {/* Keyword Relevance & Missing */}
            <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <Target size={20} color="#10B981" /> Keyword Analysis
              </h3>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 10, textTransform: "uppercase" }}>Missing Keywords for Target Role</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.missing_keywords?.map(k => <span key={k} style={{ padding: "6px 12px", borderRadius: 10, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#F43F5E", fontSize: 12, fontWeight: 700 }}>{k}</span>)}
                  {(!result.missing_keywords || result.missing_keywords.length === 0) && (
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Great! You hit all major keywords.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, marginBottom: 24 }}>
            {/* AI Bullet Point Rewriter / Improved Resume */}
            <div style={{ padding: 28, borderRadius: 24, background: "linear-gradient(135deg, rgba(59,130,246,0.05), rgba(255,255,255,0.01))", border: "1px solid rgba(59,130,246,0.2)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <PenTool size={20} color="#3B82F6" /> Improved Version
              </h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>Based on our analysis, here is an optimized rewrite of your resume content:</p>
              
              <div style={{ padding: 20, borderRadius: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <pre style={{ whiteSpace: "pre-wrap", fontSize: 14, color: "rgba(255,255,255,0.9)", fontFamily: "inherit", lineHeight: 1.6 }}>
                      {result.improved_resume}
                  </pre>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
            <button onClick={() => setPhase("upload")} style={{ padding: "12px 24px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Analyze Another Resume
            </button>
            <button style={{ padding: "14px 28px", borderRadius: 16, background: "white", color: "#0A0A0F", fontWeight: 900, fontSize: 15, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
              <Sparkles size={18} /> Re-Generate AI Version
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
