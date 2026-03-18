"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { resumeApi } from "@/lib/api";

export default function ResumeBuilderPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken;

  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [mode, setMode] = useState("ATS-Optimized");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ 
    ats_score: number; 
    readability_score: number;
    keyword_match_percent: number;
    feedback: string[];
    missing_keywords: string[];
    improved_resume: string;
  } | null>(null);
  const [error, setError] = useState("");
  
  const printRef = useRef<HTMLDivElement>(null);

  const handleImprove = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please provide both your resume and the job description.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setLoading(true);
    setResult(null);
    setError("");

    try {
      if (!token) throw new Error("Unauthorized");
      const data = await resumeApi.improve({ 
        resume_text: resumeText, 
        job_description: jobDescription,
        mode: mode
      }, token);
      
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.improved_resume) {
      navigator.clipboard.writeText(result.improved_resume);
      alert("✅ Copied to clipboard!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 60, height: "100%", display: "flex", flexDirection: "column" }}>
      
      {/* Hide elements during print */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section { position: absolute; left: 0; top: 0; width: 100%; white-space: pre-wrap; font-family: serif; color: black; background: white; padding: 40px; }
        }
      `}} />

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: 8 }}>
          AI Resume <span className="gradient-text">Optimizer</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          Paste your resume and target job description. Our AI will extract missing keywords and fully rewrite your resume to beat ATS systems.
        </p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ padding: "12px 20px", background: "rgba(255, 107, 107, 0.15)", border: "1px solid rgba(255, 107, 107, 0.4)", color: "#FF6B6B", borderRadius: 12, fontWeight: 600, marginBottom: 24 }}>
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", gap: 24, flex: 1, minHeight: 600, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* Left Column - Inputs */}
        <div style={{ flex: "1 1 450px", display: "flex", flexDirection: "column", gap: 20 }}>
          
          <div className="dash-card" style={{ flex: 0, display: "flex", flexDirection: "column", padding: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 12, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
              Target AI Tone
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", background: "rgba(0,0,0,0.3)", padding: 6, borderRadius: 12 }}>
              {["ATS-Optimized", "Professional", "Creative"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1, 
                    padding: "10px", 
                    fontSize: 13, 
                    fontWeight: 600, 
                    borderRadius: 8, 
                    background: mode === m ? "var(--brand-primary)" : "transparent",
                    color: mode === m ? "white" : "var(--text-secondary)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {m === "ATS-Optimized" && "🤖 "}
                  {m === "Professional" && "👔 "}
                  {m === "Creative" && "🎨 "}
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="dash-card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
              Your Resume (Text format)
            </label>
            <textarea 
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your past experiences, skills, and education here..."
              className="input-field"
              style={{ flex: 1, resize: "vertical", padding: 16, fontFamily: "inherit", fontSize: 14, lineHeight: 1.6, minHeight: 250 }}
            />
          </div>

          <div className="dash-card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
              Target Job Description
            </label>
            <textarea 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description of the role you are applying for..."
              className="input-field"
              style={{ flex: 1, resize: "vertical", padding: 16, fontFamily: "inherit", fontSize: 14, lineHeight: 1.6, minHeight: 200 }}
            />
          </div>

          <button 
            onClick={handleImprove}
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "16px", fontSize: 16, justifyContent: "center", position: "relative", overflow: "hidden" }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                Optimizing with Google Gemini...
              </span>
            ) : "✨ Improve My Resume"}
          </button>

        </div>

        {/* Right Column - Results */}
        <div className="dash-card" style={{ flex: "1.5 1 600px", padding: 32, display: "flex", flexDirection: "column", background: "rgba(30,30,35,0.4)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Optimization Results</span>
            {result && (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleCopy} className="btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>📋 Copy</button>
                <button onClick={handlePrint} className="btn-primary" style={{ padding: "6px 12px", fontSize: 13 }}>📄 Save PDF</button>
              </div>
            )}
          </h2>

          {!result && !loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8 }}>Ready to Optimize</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 300 }}>Paste context to the left to automatically inject missing keywords and restructure your experience.</p>
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ fontSize: 64 }}>
                🧠
              </motion.div>
              <div style={{ color: "var(--brand-primary)", fontWeight: 600, letterSpacing: 1 }}>ANALYZING ATS SYSTEMS...</div>
            </div>
          )}

          {result && !loading && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              
              {/* Top Row: Score & Keywords */}
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                {/* ATS Score Circle */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                      <motion.circle 
                        cx="70" cy="70" r="60" fill="none" 
                        stroke={result.ats_score >= 80 ? "#43E97B" : result.ats_score >= 50 ? "#FFD93D" : "#FF6B6B"} 
                        strokeWidth="10" strokeLinecap="round" 
                        strokeDasharray="377" // 2 * pi * 60
                        initial={{ strokeDashoffset: 377 }}
                        animate={{ strokeDashoffset: 377 - (377 * result.ats_score) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: 36, fontWeight: 900, fontFamily: "var(--font-display)", color: result.ats_score >= 80 ? "#43E97B" : result.ats_score >= 50 ? "#FFD93D" : "#FF6B6B" }}>
                        {result.ats_score}%
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>Match</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", background: result.ats_score >= 80 ? "rgba(67, 233, 123, 0.1)" : result.ats_score >= 50 ? "rgba(255, 217, 61, 0.1)" : "rgba(255, 107, 107, 0.1)", padding: "6px 12px", borderRadius: 20, color: result.ats_score >= 80 ? "#43E97B" : result.ats_score >= 50 ? "#FFD93D" : "#FF6B6B", fontWeight: 700, fontSize: 12 }}>
                    {result.ats_score >= 80 ? "🌟 Excellent Match" : result.ats_score >= 50 ? "⚠️ Needs Keywords" : "❌ Poor Match"}
                  </div>
                </div>

                {/* Secondary Scores */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "center", minWidth: 200 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Readability Score</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{result.readability_score}%</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${result.readability_score}%` }} transition={{ duration: 1.2, delay: 0.2 }}
                        style={{ height: "100%", background: "linear-gradient(90deg, #4ECDC4, #556270)", borderRadius: 4 }} 
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Keyword Match</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{result.keyword_match_percent}%</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${result.keyword_match_percent}%` }} transition={{ duration: 1.2, delay: 0.4 }}
                        style={{ height: "100%", background: "linear-gradient(90deg, #FFD93D, #F09819)", borderRadius: 4 }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Missing Keywords */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>🔍</span> Missing Keywords
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.missing_keywords.map((kw, idx) => (
                      <span key={idx} style={{ background: "rgba(255, 107, 107, 0.1)", color: "#FF6B6B", border: "1px solid rgba(255, 107, 107, 0.3)", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                        + {kw}
                      </span>
                    ))}
                    {result.missing_keywords.length === 0 && (
                      <span style={{ color: "#43E97B", fontSize: 13, fontWeight: 600 }}>All major keywords matched! ✅</span>
                    )}
                  </div>
                  
                  {/* High level feedback */}
                  <div style={{ marginTop: 16 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase" }}>Quick Feedback</h3>
                    <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>
                      {result.feedback.slice(0, 3).map((fb, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>{fb}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Fully Rewritten Resume */}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#4ECDC4", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>✨</span> Fully Rewritten Resume
                </h3>
                <textarea 
                  id="print-section"
                  value={result.improved_resume}
                  onChange={(e) => setResult({ ...result, improved_resume: e.target.value })}
                  className="input-field"
                  style={{ width: "100%", height: 350, resize: "vertical", padding: 20, fontFamily: "monospace", fontSize: 14, lineHeight: 1.6, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(78, 205, 196, 0.2)", borderRadius: 12 }}
                />
              </div>

            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
