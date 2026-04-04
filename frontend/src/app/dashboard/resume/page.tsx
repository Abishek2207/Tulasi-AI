"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import { resumeApi } from "@/lib/api";
import Link from "next/link";
import { TiltCard } from "@/components/ui/TiltCard";
import { 
  FileText, History, Copy, Printer, Sparkles, 
  Target, BarChart3, ScanEye, CheckCircle2, AlertCircle,
  Briefcase, GraduationCap, Layout, Languages, Cpu
} from "lucide-react";
import toast from "react-hot-toast";

export interface ResumeResult {
  ats_score: number;
  readability_score: number;
  keyword_match_percent: number;
  feedback: string[];
  missing_keywords: string[];
  improved_resume: string;
}

export default function ResumeBuilderPage() {
  const { data: session } = useSession();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [mode, setMode] = useState("MAANG-Standard");
  const [documentType, setDocumentType] = useState("Resume");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputStrength, setInputStrength] = useState(0);
  
  const cacheRef = useRef<Map<string, ResumeResult>>(new Map());

  const analyzeInput = (text: string) => {
    const hints: string[] = [];
    let score = 0;
    if (text.length > 100) score += 20;
    if (text.length > 300) score += 20;
    const hasNumbers = /\d+/.test(text) || /%/.test(text);
    if (hasNumbers) score += 20; else hints.push("📊 Add metrics (e.g. 40% improvement)");
    const actionVerbs = ["led", "built", "designed", "developed", "optimized", "launched"];
    if (actionVerbs.some(v => text.toLowerCase().includes(v))) score += 20; else hints.push("💪 Use action verbs");
    const skills = ["python", "react", "typescript", "aws", "sql"];
    if (skills.some(s => text.toLowerCase().includes(s))) score += 20; else hints.push("🛠️ List tech stack");
    setSuggestions(hints);
    setInputStrength(Math.min(score, 100));
  };

  useEffect(() => {
    if (!resumeText.trim()) { setSuggestions([]); setInputStrength(0); return; }
    const timer = setTimeout(() => analyzeInput(resumeText), 600);
    return () => clearTimeout(timer);
  }, [resumeText]);

  const handleImprove = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Experience data and Job Description required for Neural Calibration.");
      return;
    }
    const cacheKey = `${resumeText.trim()}|${jobDescription.trim()}|${mode}|${documentType}`;
    if (cacheRef.current.has(cacheKey)) {
      setResult(cacheRef.current.get(cacheKey) || null);
      return;
    }
    setLoading(true); setResult(null); setError("");
    try {
      // Upgraded Prompting for Resume Optimizer
      const data = await resumeApi.improve({ 
        resume_text: resumeText, 
        job_description: jobDescription,
        mode: mode === "MAANG-Standard" ? "Elite-Technical" : "ATS-Optimized",
        document_type: documentType
      }, token);
      cacheRef.current.set(cacheKey, data);
      setResult(data);
      toast.success("Neural Calibration Complete.");
    } catch (err: any) {
      setError(err.message || "Neural Handshake failed. Retrying sync...");
    } finally { setLoading(false); }
  };

  const handleCopy = () => {
    if (result?.improved_resume) {
      navigator.clipboard.writeText(result.improved_resume);
      toast.success("Blueprint Copied.");
    }
  };

  const exportPDF = () => {
    const element = document.getElementById("pdf-preview-container");
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `TulasiAI_Optimized_${session?.user?.name || "Professional"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" as const }
    };

    import("html2pdf.js").then((html2pdf) => {
      html2pdf.default().from(element).set(opt).save();
    });
  };

  const renderResumeMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      const isHeader1 = line.startsWith("# ");
      const isHeader2 = line.startsWith("## ");
      const isHeader3 = line.startsWith("### ");
      const isBullet = line.startsWith("- ") || line.startsWith("* ");
      const cleanLine = line.replace(/#/g, "").replace(/^- /g, "").replace(/^\* /g, "").trim();
      
      const boldParsed = cleanLine.split(/(\*\*.*?\*\*)/g).map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={idx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (!cleanLine) return <div key={i} style={{ height: 8 }} />;
      if (isHeader1) return <h1 key={i} style={{ fontSize: 24, fontWeight: 900, borderBottom: "2px solid #222", paddingBottom: 6, marginTop: 24, marginBottom: 12, color: "black", fontFamily: "Arial, sans-serif" }}>{boldParsed}</h1>;
      if (isHeader2) return <h2 key={i} style={{ fontSize: 18, fontWeight: 700, marginTop: 16, marginBottom: 8, color: "#333", fontFamily: "Arial, sans-serif" }}>{boldParsed}</h2>;
      if (isHeader3) return <h3 key={i} style={{ fontSize: 15, fontWeight: 600, fontStyle: "italic", marginTop: 12, color: "#444" }}>{boldParsed}</h3>;
      if (isBullet) return <li key={i} style={{ marginLeft: 24, marginBottom: 6, fontSize: 13, color: "black", lineHeight: 1.6, fontFamily: "Georgia, serif" }}>{boldParsed}</li>;
      return <div key={i} style={{ margin: "6px 0", fontSize: 13, color: "black", lineHeight: 1.6, fontFamily: "Georgia, serif" }}>{boldParsed}</div>;
    });
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
        <div style={{ position: "absolute", top: -50, left: 0, width: 300, height: 200, background: "radial-gradient(circle, rgba(124, 58, 237, 0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: "var(--brand-primary)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Strategic Optimization Layer</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 8, letterSpacing: "-1.5px" }}>
            Neural Resume <span className="gradient-text">Optimizer</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 650 }}>
            MAANG-calibrated ATS bypass engine. Synthesize an elite technical narrative and optimize for super-intelligent screening.
          </p>
        </div>
        <Link href="/dashboard/resume/history" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ padding: "12px 28px", borderRadius: 14, display: "flex", alignItems: "center", gap: 10, fontWeight: 800 }}>
            <History size={18} /> Optimization Archive
          </button>
        </Link>
      </div>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* Left Inputs */}
        <div style={{ flex: "1 1 480px", display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 20 }}>
          
          <div className="glass-card" style={{ padding: 6, borderRadius: 18, border: "1px solid var(--border)", display: "flex", gap: 4 }}>
            {["MAANG-Standard", "ATS-Bypass"].map((m) => (
              <button key={m} onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: m === mode ? "12px 24px" : "12px 20px", fontSize: 11, fontWeight: 900, borderRadius: 14, border: "none", cursor: "pointer", transition: "all 0.3s",
                  background: mode === m ? "var(--brand-primary)" : "transparent",
                  color: mode === m ? "white" : "var(--text-secondary)",
                  letterSpacing: 1
                }}>
                {m.replace("-", " ")}
              </button>
            ))}
          </div>

          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Target size={16} color="var(--brand-primary)" />
              </div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", letterSpacing: 1 }}>EXPERIENCE DATA STREAM</label>
            </div>
            
            <textarea 
              value={resumeText} onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your raw professional narrative..."
              className="input-field"
              style={{ width: "100%", height: 320, borderRadius: 16, padding: "20px", fontSize: 14, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}
            />

            {resumeText.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: "var(--text-secondary)", letterSpacing: 1 }}>DATA FIDELITY</span>
                  <span style={{ fontSize: 10, fontWeight: 900, color: getScoreColor(inputStrength) }}>{inputStrength}%</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
                  <motion.div animate={{ width: `${inputStrength}%` }} style={{ height: "100%", background: getScoreColor(inputStrength) }} />
                </div>
              </motion.div>
            )}
          </div>

          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(6,182,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ScanEye size={16} color="#06B6D4" />
              </div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", letterSpacing: 1 }}>TARGET CALIBRATION</label>
            </div>
            <textarea 
              value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste Job Description for alignment..."
              className="input-field"
              style={{ width: "100%", height: 180, borderRadius: 16, padding: "20px", fontSize: 14, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={handleImprove} disabled={loading}
            className="btn-primary" 
            style={{ 
              width: "100%", padding: "20px", borderRadius: 20, fontSize: 17, fontWeight: 900,
              boxShadow: "0 10px 30px rgba(124,58,237,0.3)", position: "relative", overflow: "hidden"
            }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 18, height: 18, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                CALIBRATING NEURAL CORE...
              </div>
            ) : "EXECUTE OPTIMIZATION ⚡"}
          </motion.button>
        </div>

        {/* Right Results */}
        <div style={{ flex: "1.5 1 650px", display: "flex", flexDirection: "column", gap: 24, minHeight: 900 }}>
          {!result && !loading && (
            <div className="glass-card" style={{ flex: 1, minHeight: 700, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 80 }}>
              <motion.div animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 5 }}>
                <Cpu size={80} style={{ color: "var(--brand-primary)", opacity: 0.15, marginBottom: 32 }} />
              </motion.div>
              <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 16 }}>Optimization Hub</h3>
              <p style={{ color: "var(--text-secondary)", maxWidth: 450, lineHeight: 1.8, fontSize: 16 }}>
                Synthesize your experience data streams to generate an elite, ATS-immune professional profile.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-card" style={{ flex: 1, padding: 48, display: "flex", flexDirection: "column", gap: 40 }}>
               <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                 <div style={{ width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 50, height: 50, border: "4px solid transparent", borderTopColor: "var(--brand-primary)", borderRadius: "50%" }} />
                 </div>
                 <div style={{ flex: 1 }}>
                   <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} style={{ height: 14, width: "80%", background: "rgba(255,255,255,0.05)", borderRadius: 10, marginBottom: 16 }} />
                   <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} style={{ height: 10, width: "95%", background: "rgba(255,255,255,0.03)", borderRadius: 10, marginBottom: 16 }} />
                   <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} style={{ height: 10, width: "50%", background: "rgba(255,255,255,0.03)", borderRadius: 10 }} />
                 </div>
               </div>
               <div style={{ flex: 1, background: "rgba(255,255,255,0.01)", borderRadius: 24, border: "1px dashed rgba(255,255,255,0.05)" }} />
            </div>
          )}

          {result && !loading && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Score Matrix */}
              <TiltCard intensity={3}>
                <div style={{ padding: 48, background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", gap: 60, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ position: "relative", width: 170, height: 170, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="170" height="170" style={{ transform: "rotate(-90deg)" }}>
                         <circle cx="85" cy="85" r="75" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                         <motion.circle cx="85" cy="85" r="75" fill="none" 
                           stroke={getScoreColor(result.ats_score)} strokeWidth="14" strokeDasharray="471" 
                           initial={{ strokeDashoffset: 471 }} animate={{ strokeDashoffset: 471 - (471 * result.ats_score) / 100 }} transition={{ duration: 2.5, ease: "easeOut" }}
                           strokeLinecap="round"
                         />
                      </svg>
                      <div style={{ position: "absolute", textAlign: "center" }}>
                        <div style={{ fontSize: 52, fontWeight: 900, color: getScoreColor(result.ats_score), lineHeight: 1 }}>{result.ats_score}</div>
                        <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text-secondary)", letterSpacing: 2 }}>NEURAL MATCH</div>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 300 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 40 }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>TONE ARCHITECTURE</span>
                            <span style={{ fontSize: 11, fontWeight: 900, color: "var(--brand-secondary)" }}>{result.readability_score}%</span>
                          </div>
                          <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${result.readability_score}%` }} style={{ height: "100%", background: "var(--brand-secondary)", borderRadius: 10 }} />
                          </div>
                        </div>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>KEYWORD DENSITY</span>
                            <span style={{ fontSize: 11, fontWeight: 900, color: "var(--brand-yellow)" }}>{result.keyword_match_percent}%</span>
                          </div>
                          <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${result.keyword_match_percent}%` }} style={{ height: "100%", background: "var(--brand-yellow)", borderRadius: 10 }} />
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                         {result.missing_keywords.slice(0, 8).map((k, i) => (
                           <span key={i} style={{ 
                             fontSize: 10, padding: "6px 14px", borderRadius: 8, background: "rgba(255,107,107,0.05)", 
                             border: "1px solid rgba(255,107,107,0.2)", color: "#FF6B6B", fontWeight: 900, letterSpacing: 1 
                           }}>
                             +{k.toUpperCase()}
                           </span>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>

              {/* Actionable Feedback */}
              <div className="glass-card" style={{ padding: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                  <Sparkles size={18} color="var(--brand-primary)" />
                  <h3 style={{ fontSize: 13, fontWeight: 900, letterSpacing: 1.5 }}>NEURAL FEEDBACK & STRATEGIC GAPS</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                  {result.feedback.map((f, i) => (
                    <div key={i} style={{ 
                      padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.02)", 
                      border: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 14 
                    }}>
                      <div style={{ marginTop: 2 }}><CheckCircle2 size={16} color="var(--brand-secondary)" /></div>
                      <span style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Narrative Panel */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div className="glass-card" style={{ padding: 32, display: "flex", flexDirection: "column", minHeight: 700 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", gap: 10, letterSpacing: 1 }}>RAW NARRATIVE OUTPUT</h3>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={handleCopy} className="btn-ghost" style={{ padding: "8px 16px", borderRadius: 10, fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}><Copy size={14} /> COPY MEMORY</motion.button>
                  </div>
                   <textarea 
                    value={result.improved_resume} readOnly
                    className="input-field" 
                    style={{ flex: 1, width: "100%", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", padding: 24, background: "rgba(0,0,0,0.4)", borderRadius: 16, lineHeight: 1.8, resize: "none", border: "1px solid rgba(255,255,255,0.05)" }}
                  />
                </div>

                <div className="glass-card" style={{ padding: 32, background: "white", color: "black", minHeight: 700, overflowY: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid #eee", paddingBottom: 16 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", gap: 10, letterSpacing: 1, color: "#999" }}>PREVIEW ARCHITECTURE</h3>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={exportPDF} className="btn-primary" style={{ padding: "10px 20px", borderRadius: 12, fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", gap: 10 }}><Printer size={16} /> GENERATE PDF</motion.button>
                  </div>
                  <div id="pdf-preview-container-live" style={{ padding: "0 10px" }}>
                    {renderResumeMarkdown(result.improved_resume)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function getScoreColor(s: number) {
  if (s >= 80) return "#43E97B";
  if (s >= 50) return "#FFD93D";
  return "#FF6B6B";
}
