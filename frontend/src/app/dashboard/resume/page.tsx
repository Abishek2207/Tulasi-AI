"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { resumeApi } from "@/lib/api";

export default function ResumeBuilderPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken;

  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string[] } | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
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
      const data = await resumeApi.analyze({ 
        resume_text: resumeText, 
        job_description: jobDescription 
      }, token);
      
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60, height: "100%", display: "flex", flexDirection: "column" }}>
      
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: 8 }}>
          AI Resume <span className="gradient-text">Analyzer</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          Paste your resume and a target job description to get instant ATS scoring and actionable feedback to improve your match rate.
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

      <div style={{ display: "flex", gap: 24, flex: 1, minHeight: 600, flexDirection: "row", flexWrap: "wrap" }}>
        
        {/* Left Column - Inputs */}
        <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: 20 }}>
          
          <div className="dash-card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
              Your Resume (Text format)
            </label>
            <textarea 
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your past experiences, skills, and education here..."
              className="input-field"
              style={{ flex: 1, resize: "none", padding: 16, fontFamily: "inherit", fontSize: 14, lineHeight: 1.6, minHeight: 200 }}
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
              style={{ flex: 1, resize: "none", padding: 16, fontFamily: "inherit", fontSize: 14, lineHeight: 1.6, minHeight: 200 }}
            />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "16px", fontSize: 16, justifyContent: "center", position: "relative", overflow: "hidden" }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                Analyzing with Google Gemini...
              </span>
            ) : "Analyze ATS Match Rate"}
          </button>

        </div>

        {/* Right Column - Results */}
        <div className="dash-card" style={{ flex: "1 1 400px", padding: 32, display: "flex", flexDirection: "column", background: "rgba(30,30,35,0.4)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
            Analysis Results
          </h2>

          {!result && !loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8 }}>Ready to scan</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>Fill in your resume and job description to see how well you match the role requirements.</p>
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ fontSize: 64 }}>
                🧠
              </motion.div>
              <div style={{ color: "var(--brand-primary)", fontWeight: 600, letterSpacing: 1 }}>EXTRACTING KEYWORDS...</div>
            </div>
          )}

          {result && !loading && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              
              {/* ATS Score Circle */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    <motion.circle 
                      cx="80" cy="80" r="70" fill="none" 
                      stroke={result.score >= 80 ? "#43E97B" : result.score >= 50 ? "#FFD93D" : "#FF6B6B"} 
                      strokeWidth="12" strokeLinecap="round" 
                      strokeDasharray="439.8" // 2 * pi * 70
                      initial={{ strokeDashoffset: 439.8 }}
                      animate={{ strokeDashoffset: 439.8 - (439.8 * result.score) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: 42, fontWeight: 900, fontFamily: "var(--font-display)", color: result.score >= 80 ? "#43E97B" : result.score >= 50 ? "#FFD93D" : "#FF6B6B" }}>
                      {result.score}%
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>Match</span>
                  </div>
                </div>
                
                <div style={{ textAlign: "center", background: result.score >= 80 ? "rgba(67, 233, 123, 0.1)" : result.score >= 50 ? "rgba(255, 217, 61, 0.1)" : "rgba(255, 107, 107, 0.1)", padding: "8px 16px", borderRadius: 20, color: result.score >= 80 ? "#43E97B" : result.score >= 50 ? "#FFD93D" : "#FF6B6B", fontWeight: 700, fontSize: 13 }}>
                  {result.score >= 80 ? "🌟 Excellent Match!" : result.score >= 50 ? "⚠️ Needs Improvement" : "❌ Poor Match (Revise Highly)"}
                </div>
              </div>

              {/* Feedback List */}
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>💡</span> Actionable Feedback
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {result.feedback.map((fb, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (idx * 0.1) }}
                      style={{ padding: 16, background: "rgba(255,255,255,0.03)", borderLeft: "3px solid var(--brand-primary)", borderRadius: "0 8px 8px 0", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      {fb}
                    </motion.div>
                  ))}
                  {result.feedback.length === 0 && (
                    <div style={{ color: "var(--text-muted)", fontSize: 14 }}>No feedback generated.</div>
                  )}
                </div>
              </div>

            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
