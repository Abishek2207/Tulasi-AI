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
  Briefcase, GraduationCap, Layout, Languages
} from "lucide-react";

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
  const [mode, setMode] = useState("ATS-Optimized");
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
      setError("Resume and Job Description required for analysis.");
      return;
    }
    const cacheKey = `${resumeText.trim()}|${jobDescription.trim()}|${mode}|${documentType}`;
    if (cacheRef.current.has(cacheKey)) {
      setResult(cacheRef.current.get(cacheKey) || null);
      return;
    }
    setLoading(true); setResult(null); setError("");
    try {
      const data = await resumeApi.improve({ 
        resume_text: resumeText, 
        job_description: jobDescription,
        mode: mode,
        document_type: documentType
      }, token);
      cacheRef.current.set(cacheKey, data);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Analysis failed. Connecting to AI...");
    } finally { setLoading(false); }
  };

  const handleCopy = () => {
    if (result?.improved_resume) {
      navigator.clipboard.writeText(result.improved_resume);
    }
  };

  const exportPDF = () => {
    const element = document.getElementById("pdf-preview-container");
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `Resume_${session?.user?.name || "TulasiAI"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" as const }
    };

    // Dynamic import for client-side only library
    import("html2pdf.js").then((html2pdf) => {
      html2pdf.default().from(element).set(opt).save();
    });
  };

  const parseSections = (text: string) => {
    const sectionHeaders = ["SUMMARY", "EXPERIENCE", "SKILLS", "PROJECTS", "EDUCATION"];
    const lines = text.split("\n");
    const sections: { title: string; lines: string[] }[] = [];
    let current: { title: string; lines: string[] } | null = null;
    for (const line of lines) {
      const trimmed = line.trim();
      if (sectionHeaders.some(h => trimmed.toUpperCase().startsWith(h))) {
        if (current) sections.push(current);
        current = { title: trimmed, lines: [] };
      } else if (current) {
        if (trimmed) current.lines.push(trimmed);
      } else if (!sections.length) {
        if (!current) current = { title: "", lines: [] };
        if (trimmed) current.lines.push(trimmed);
      }
    }
    if (current) sections.push(current);
    return sections;
  };

  const renderResumeMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      const isHeader1 = line.startsWith("# ");
      const isHeader2 = line.startsWith("## ");
      const isHeader3 = line.startsWith("### ");
      const isBullet = line.startsWith("- ") || line.startsWith("* ");
      
      let cleanLine = line.replace(/#/g, "").replace(/^- /g, "").replace(/^\* /g, "").trim();
      
      // Basic inline bold parsing **text**
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
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 60 }}>
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden !important; display: none !important; }
          #pdf-preview-container, #pdf-preview-container * { visibility: visible !important; display: block !important; }
          #pdf-preview-container { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important; 
            background: white !important; 
            margin: 0 !important;
            padding: 20px !important;
          }
          @page { margin: 1cm; }
        }
      `}} />
      
      {/* Hidden Pristine PDF Document (Off-screen for capture) */}
      {result && (
        <div id="pdf-preview-container" style={{ position: "absolute", left: "-9999px", top: "-9999px", color: "black", background: "white", width: "800px", padding: "40px" }}>
          {renderResumeMarkdown(result.improved_resume)}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
        <div style={{ position: "absolute", top: -50, left: 0, width: 300, height: 200, background: "radial-gradient(circle, rgba(124, 58, 237, 0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div>
          <h1 style={{ fontSize: 42, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 8, letterSpacing: "-1.5px" }}>
            AI Resume <span className="gradient-text">Optimizer</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 600 }}>
            Precision-engineered ATS bypass. Paste your raw text and let Gemini 
            re-architect your professional narrative.
          </p>
        </div>
        <Link href="/dashboard/resume/history" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ padding: "10px 24px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
            <History size={18} /> Optimization Archive
          </button>
        </Link>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: "14px 24px", background: "rgba(255, 107, 107, 0.1)", border: "1px solid rgba(255, 107, 107, 0.3)", color: "#FF6B6B", borderRadius: 16, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={18} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* Left Inputs - Sticky on Large Screens */}
        <div style={{ flex: "1 1 480px", display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 20 }}>
          
          <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: 6, borderRadius: 16, border: "1px solid var(--border)" }}>
            {["Resume", "Cover Letter"].map((type) => (
              <button key={type} onClick={() => setDocumentType(type)}
                style={{
                  flex: 1, padding: "12px", fontSize: 13, fontWeight: 800, borderRadius: 12, border: "none", cursor: "pointer", transition: "all 0.2s",
                  background: documentType === type ? "var(--brand-primary)" : "transparent",
                  color: documentType === type ? "white" : "var(--text-secondary)",
                }}>
                {type === "Resume" ? <><FileText size={14} style={{ display: "inline", marginRight: 6 }} /> Resume</> : <><Sparkles size={14} style={{ display: "inline", marginRight: 6 }} /> Cover Letter</>}
              </button>
            ))}
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Target size={18} className="text-secondary" />
              <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1.5 }}>Optimization Context</label>
            </div>
            
            <textarea 
              value={resumeText} onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste existing experience data..."
              className="input-field"
              style={{ width: "100%", height: 280, borderRadius: 12, padding: "16px", fontSize: 14, background: "rgba(0,0,0,0.2)" }}
            />

            {resumeText.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: "var(--text-secondary)" }}>CONSTRUCTION QUALITY</span>
                  <span style={{ fontSize: 10, fontWeight: 900, color: getScoreColor(inputStrength) }}>{inputStrength}%</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
                  <motion.div animate={{ width: `${inputStrength}%` }} style={{ height: "100%", background: getScoreColor(inputStrength) }} />
                </div>
              </motion.div>
            )}
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <ScanEye size={18} className="text-secondary" />
              <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1.5 }}>Target Role Description</label>
            </div>
            <textarea 
              value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste target job requirements..."
              className="input-field"
              style={{ width: "100%", height: 160, borderRadius: 12, padding: "16px", fontSize: 14, background: "rgba(0,0,0,0.2)" }}
            />
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleImprove} disabled={loading}
            className="btn-primary" style={{ width: "100%", padding: "18px", borderRadius: 16, fontSize: 17, fontWeight: 900 }}>
            {loading ? "Synthesizing Optimization..." : "Execute AI Upgrade →"}
          </motion.button>
        </div>

        {/* Right Results - Professional Preview Panel */}
        <div style={{ flex: "1.5 1 650px", display: "flex", flexDirection: "column", gap: 24, minHeight: 800 }}>
          {!result && !loading && (
            <div className="glass-card" style={{ flex: 1, minHeight: 600, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 60 }}>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                <Sparkles size={64} style={{ color: "var(--brand-primary)", opacity: 0.3, marginBottom: 24 }} />
              </motion.div>
              <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Optimization Hub</h3>
              <p style={{ color: "var(--text-secondary)", maxWidth: 350, lineHeight: 1.6 }}>Initialize the data stream on the left to see your ATS score and fully rewritten career narrative.</p>
            </div>
          )}

          {loading && (
            <div className="glass-card" style={{ flex: 1, padding: 48, display: "flex", flexDirection: "column", gap: 32 }}>
               <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                 <div style={{ width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "4px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 40, height: 40, border: "3px solid transparent", borderTopColor: "var(--brand-primary)", borderRadius: "50%" }} />
                 </div>
                 <div style={{ flex: 1 }}>
                   <div style={{ height: 12, width: "70%", background: "rgba(255,255,255,0.05)", borderRadius: 10, marginBottom: 12 }} />
                   <div style={{ height: 8, width: "90%", background: "rgba(255,255,255,0.03)", borderRadius: 10, marginBottom: 12 }} />
                   <div style={{ height: 8, width: "40%", background: "rgba(255,255,255,0.03)", borderRadius: 10 }} />
                 </div>
               </div>
               <div style={{ flex: 1, background: "rgba(255,255,255,0.01)", borderRadius: 20, border: "1px dashed rgba(255,255,255,0.05)" }} />
            </div>
          )}

          {result && !loading && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <TiltCard intensity={5} style={{ padding: 40 }}>
                <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ position: "relative", width: 150, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="150" height="150" style={{ transform: "rotate(-90deg)" }}>
                       <circle cx="75" cy="75" r="65" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                       <motion.circle cx="75" cy="75" r="65" fill="none" 
                         stroke={getScoreColor(result.ats_score)} strokeWidth="11" strokeDasharray="408" 
                         initial={{ strokeDashoffset: 408 }} animate={{ strokeDashoffset: 408 - (408 * result.ats_score) / 100 }} transition={{ duration: 2, ease: "easeOut" }}
                       />
                    </svg>
                    <div style={{ position: "absolute", textAlign: "center" }}>
                      <div style={{ fontSize: 42, fontWeight: 900, color: getScoreColor(result.ats_score), lineHeight: 1 }}>{result.ats_score}</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", letterSpacing: 1 }}>ATS MATCH</div>
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 800 }}><span>Readability</span><span>{result.readability_score}%</span></div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}><motion.div initial={{ width: 0 }} animate={{ width: `${result.readability_score}%` }} style={{ height: "100%", background: "var(--brand-secondary)", borderRadius: 10 }} /></div>
                    </div>
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 800 }}><span>Keyword Density</span><span>{result.keyword_match_percent}%</span></div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}><motion.div initial={{ width: 0 }} animate={{ width: `${result.keyword_match_percent}%` }} style={{ height: "100%", background: "var(--brand-yellow)", borderRadius: 10 }} /></div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                       {result.missing_keywords.slice(0, 5).map((k, i) => <span key={i} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,107,107,0.2)", color: "#FF6B6B", fontWeight: 700 }}>+{k}</span>)}
                    </div>
                  </div>
                </div>
              </TiltCard>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", minHeight: 600 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, letterSpacing: 1 }}>RAW OUTPUT</h3>
                    <button onClick={handleCopy} className="btn-ghost" style={{ padding: "6px 12px", borderRadius: 8, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}><Copy size={12} /> Copy</button>
                  </div>
                   <textarea 
                    value={result.improved_resume} readOnly
                    className="input-field" 
                    style={{ flex: 1, width: "100%", fontSize: 13, fontFamily: "monospace", padding: 16, background: "rgba(0,0,0,0.3)", borderRadius: 12, lineHeight: 1.6, resize: "none" }}
                  />
                </div>

                <div className="glass-card" style={{ padding: 24, background: "white", color: "black", minHeight: 600, overflowY: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 12 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, letterSpacing: 1, color: "#666" }}>LIVE PREVIEW (A4)</h3>
                    <button onClick={exportPDF} className="btn-primary" style={{ padding: "8px 16px", borderRadius: 8, fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", gap: 6 }}><Printer size={14} /> EXPORT PDF</button>
                  </div>
                  <div style={{ padding: "0 10px" }} className="resume-live-preview">
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
