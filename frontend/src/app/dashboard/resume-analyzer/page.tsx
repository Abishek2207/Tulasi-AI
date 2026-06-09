"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, CheckCircle, XCircle, AlertCircle, Sparkles, Zap, ShieldCheck, Target, Download, PenTool, LayoutTemplate, Briefcase } from "lucide-react";

interface ResumeAnalysis {
  atsScore: number;
  faangReadiness: number;
  roleMatch: number;
  problems: {
    formatting: string[];
    weakSections: string[];
    projectQuality: string[];
  };
  keywords: {
    missing: string[];
    relevant: string[];
  };
  suggestions: {
    improvements: string[];
    missingProjects: string[];
  };
  bulletRewrites: {
    original: string;
    improved: string;
  }[];
}

export default function ResumeAnalyzerPage() {
  const [phase, setPhase] = useState<"upload" | "loading" | "results">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") setFile(dropped);
  };

  const analyze = async () => {
    if (!file || !targetRole) return;
    setPhase("loading");
    
    // Simulate AI Processing
    await new Promise(r => setTimeout(r, 2500));
    
    setResult({
      atsScore: 74,
      faangReadiness: 62,
      roleMatch: 81,
      problems: {
        formatting: ["Inconsistent bullet point indentation", "Uses a multi-column layout which breaks ATS parsers"],
        weakSections: ["Professional Summary is too generic", "Education section takes up too much space for your experience level"],
        projectQuality: ["Projects lack quantifiable metrics (e.g., 'improved performance by X%')", "Uses too many basic tutorials (e.g., 'To-Do App')"],
      },
      keywords: {
        missing: ["Docker", "Kubernetes", "Microservices", "System Design", "AWS"],
        relevant: ["React", "Node.js", "TypeScript", "REST APIs", "PostgreSQL"],
      },
      suggestions: {
        improvements: [
          "Convert your multi-column template into a single-column ATS-friendly template.",
          "Move Education below Experience since you have >1 year of work experience.",
          "Add concrete impact numbers to your top 2 projects."
        ],
        missingProjects: [
          "Build a highly concurrent distributed system to demonstrate scalability.",
          "Deploy an application using Docker and AWS to hit missing cloud keywords."
        ]
      },
      bulletRewrites: [
        {
          original: "Built a backend API for a web application using Node.js.",
          improved: "Architected a RESTful API using Node.js and Express, supporting 10k+ daily requests and reducing data retrieval latency by 40%."
        },
        {
          original: "Worked on fixing bugs and improving the database.",
          improved: "Optimized PostgreSQL queries through indexing and query refactoring, improving database read speeds by 3x across core application flows."
        }
      ]
    });
    
    setPhase("results");
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
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 2 }}>Deep ATS parsing, FAANG readiness, and bullet rewrites</p>
        </div>
      </div>

      {phase === "upload" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ padding: 32, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 24 }}>Upload for Deep Analysis</h2>
            
            {/* Target Role Inputs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Target Role *</label>
                <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Backend Engineer"
                  style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Target Company (Optional)</label>
                <input value={targetCompany} onChange={e => setTargetCompany(e.target.value)} placeholder="e.g. Meta, Amazon"
                  style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, outline: "none" }} />
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${dragging ? "#3B82F6" : file ? "#10B981" : "rgba(255,255,255,0.12)"}`, borderRadius: 20, padding: "40px 24px", textAlign: "center", cursor: "pointer", background: dragging ? "rgba(59,130,246,0.06)" : file ? "rgba(16,185,129,0.04)" : "rgba(255,255,255,0.02)", transition: "all 0.2s", marginBottom: 24 }}>
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
              <div style={{ width: 64, height: 64, borderRadius: 20, background: file ? "rgba(16,185,129,0.1)" : "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                {file ? <CheckCircle size={32} color="#10B981" /> : <Upload size={32} color="#3B82F6" />}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: file ? "#10B981" : "white", marginBottom: 4 }}>
                {file ? file.name : "Drop your PDF Resume here"}
              </h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{file ? `${(file.size / 1024).toFixed(0)} KB` : "Max 5MB. PDF formats only."}</p>
            </div>

            <button onClick={analyze} disabled={!file || !targetRole}
              style={{ width: "100%", padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: (!file || !targetRole) ? 0.5 : 1, boxShadow: (!file || !targetRole) ? "none" : "0 12px 24px rgba(59,130,246,0.3)" }}>
              <Zap size={20} /> Analyze Resume
            </button>
          </div>
        </motion.div>
      )}

      {phase === "loading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid rgba(59,130,246,0.2)", borderTopColor: "#3B82F6" }} />
          </motion.div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Scanning Resume...</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Checking ATS parsability, FAANG requirements, and keyword matches.</p>
        </div>
      )}

      {phase === "results" && result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Top Metrics Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
            {[
              { label: "Overall ATS Score", value: result.atsScore, icon: <FileText size={18} color={getScoreColor(result.atsScore)} /> },
              { label: "FAANG Readiness", value: result.faangReadiness, icon: <ShieldCheck size={18} color={getScoreColor(result.faangReadiness)} /> },
              { label: "Role Match", value: result.roleMatch, icon: <Target size={18} color={getScoreColor(result.roleMatch)} /> },
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
            {/* Deep Audit / Problems Found */}
            <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <AlertCircle size={20} color="#F43F5E" /> Deep Audit: Problems Found
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Formatting & ATS</div>
                  {result.problems.formatting.map((p, i) => <div key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 4, display: "flex", gap: 8 }}><span style={{ color: "#F43F5E" }}>•</span> {p}</div>)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Weak Sections</div>
                  {result.problems.weakSections.map((p, i) => <div key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 4, display: "flex", gap: 8 }}><span style={{ color: "#F59E0B" }}>•</span> {p}</div>)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Project Quality</div>
                  {result.problems.projectQuality.map((p, i) => <div key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 4, display: "flex", gap: 8 }}><span style={{ color: "#8B5CF6" }}>•</span> {p}</div>)}
                </div>
              </div>
            </div>

            {/* Keyword Relevance & Missing */}
            <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <Target size={20} color="#10B981" /> Keyword & Skill Relevance
              </h3>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 10, textTransform: "uppercase" }}>Relevant Skills Found</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.keywords.relevant.map(k => <span key={k} style={{ padding: "6px 12px", borderRadius: 10, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981", fontSize: 12, fontWeight: 700 }}>{k}</span>)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 10, textTransform: "uppercase" }}>Critical Missing Keywords</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.keywords.missing.map(k => <span key={k} style={{ padding: "6px 12px", borderRadius: 10, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#F43F5E", fontSize: 12, fontWeight: 700 }}>{k}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* AI Bullet Point Rewriter */}
            <div style={{ padding: 28, borderRadius: 24, background: "linear-gradient(135deg, rgba(59,130,246,0.05), rgba(255,255,255,0.01))", border: "1px solid rgba(59,130,246,0.2)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <PenTool size={20} color="#3B82F6" /> AI Bullet Rewriter
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {result.bulletRewrites.map((rewrite, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ padding: 12, borderRadius: 12, background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.1)", position: "relative" }}>
                      <span style={{ position: "absolute", top: -8, left: 12, background: "#1E293B", padding: "0 6px", fontSize: 10, color: "#F43F5E", fontWeight: 800, borderRadius: 4 }}>BEFORE</span>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{rewrite.original}</p>
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", position: "relative" }}>
                      <span style={{ position: "absolute", top: -8, left: 12, background: "#1E293B", padding: "0 6px", fontSize: 10, color: "#10B981", fontWeight: 800, borderRadius: 4 }}>AFTER</span>
                      <p style={{ fontSize: 14, color: "white", fontWeight: 500 }}>{rewrite.improved}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Suggestions & Projects */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <LayoutTemplate size={16} color="#8B5CF6" /> Structural Improvements
                </h3>
                {result.suggestions.improvements.map((s, i) => <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8, display: "flex", gap: 8 }}><span style={{ color: "#8B5CF6", fontWeight: 900 }}>{i + 1}.</span> {s}</div>)}
              </div>

              <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Briefcase size={16} color="#F59E0B" /> Suggested Missing Projects
                </h3>
                {result.suggestions.missingProjects.map((s, i) => <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8, display: "flex", gap: 8 }}><Sparkles size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} /> {s}</div>)}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
            <button onClick={() => setPhase("upload")} style={{ padding: "12px 24px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Upload New Resume
            </button>
            <button style={{ padding: "14px 28px", borderRadius: 16, background: "white", color: "#0A0A0F", fontWeight: 900, fontSize: 15, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
              <Download size={18} /> Download Improved Resume
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
