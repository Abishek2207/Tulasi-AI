"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, Sparkles, ChevronRight, Code2, Database, Cloud, GitBranch, ExternalLink, Layers, Cpu } from "lucide-react";

const DOMAINS = [
  { id: "web", label: "Full Stack Web App", icon: <Code2 size={18} />, color: "#3B82F6" },
  { id: "ai", label: "AI / ML System", icon: <Cpu size={18} />, color: "#8B5CF6" },
  { id: "backend", label: "Backend / API Platform", icon: <Database size={18} />, color: "#10B981" },
  { id: "devops", label: "DevOps / Cloud Native", icon: <Cloud size={18} />, color: "#06B6D4" },
  { id: "mobile", label: "Mobile App", icon: <Layers size={18} />, color: "#F59E0B" },
  { id: "open", label: "Open Source Tool", icon: <GitBranch size={18} />, color: "#EC4899" },
];

const COMPLEXITIES = ["Beginner Friendly", "Intermediate", "Production-Level"];

interface Project {
  name: string;
  tagline: string;
  stack: string[];
  architecture: { layer: string; tools: string[] }[];
  features: string[];
  resumeTips: string[];
  githubStructure: string;
  deploymentPlan: string;
}

const MOCK_PROJECT: Project = {
  name: "NexaFeed — AI-Powered News Aggregator",
  tagline: "A production-grade platform that curates, summarizes, and personalizes news using LLMs and real-time data pipelines.",
  stack: ["Next.js 14", "FastAPI", "PostgreSQL", "Redis", "OpenAI API", "Docker", "AWS EC2"],
  architecture: [
    { layer: "Frontend", tools: ["Next.js 14 (App Router)", "TailwindCSS", "React Query"] },
    { layer: "Backend API", tools: ["FastAPI (Python)", "JWT Auth", "REST + WebSocket"] },
    { layer: "AI Layer", tools: ["OpenAI GPT-4o", "LangChain", "Embedding Search"] },
    { layer: "Database", tools: ["PostgreSQL (primary)", "Redis (cache + sessions)"] },
    { layer: "Infrastructure", tools: ["Docker Compose", "AWS EC2", "GitHub Actions CI/CD"] },
  ],
  features: [
    "Real-time news ingestion from 20+ RSS feeds via background worker",
    "LLM-powered summarization (GPT-4o) for each article",
    "Personalized feed algorithm based on user reading history",
    "Semantic search across articles using vector embeddings",
    "Bookmark, share, and annotation system",
    "Admin dashboard for feed management and analytics"
  ],
  resumeTips: [
    "Built a production-grade AI news platform serving personalized content via LLM summarization (OpenAI GPT-4o)",
    "Reduced article read-time by 70% through AI-generated summaries with semantic similarity search",
    "Designed a scalable microservice architecture using FastAPI, PostgreSQL, and Redis on AWS"
  ],
  githubStructure: "/nexafeed\n  /frontend   — Next.js app\n  /backend    — FastAPI service\n  /ai-worker  — LLM pipeline\n  /infra      — Docker + CI/CD\n  README.md",
  deploymentPlan: "Docker Compose locally → Push to GitHub → GitHub Actions builds → Deploys to AWS EC2 via SSH"
};

export default function ProjectBuilderPage() {
  const [phase, setPhase] = useState<"input" | "loading" | "output">("input");
  const [domain, setDomain] = useState("");
  const [complexity, setComplexity] = useState("Intermediate");
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);

  const generate = async () => {
    if (!domain) return;
    setPhase("loading");
    await new Promise(r => setTimeout(r, 2500));
    setProject(MOCK_PROJECT);
    setPhase("output");
  };

  const selectedDomain = DOMAINS.find(d => d.id === domain);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #F97316, #EA580C)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(249,115,22,0.4)" }}>
          <Hammer size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>Project Builder</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>AI-architected portfolio projects built to impress interviewers</p>
        </div>
      </div>

      {phase === "input" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ padding: 32, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 20 }}>Choose Project Domain</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
              {DOMAINS.map(d => (
                <button key={d.id} onClick={() => setDomain(d.id)}
                  style={{ padding: "16px", borderRadius: 16, border: `2px solid ${domain === d.id ? d.color : "rgba(255,255,255,0.08)"}`, background: domain === d.id ? `${d.color}12` : "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}>
                  <span style={{ color: domain === d.id ? d.color : "rgba(255,255,255,0.3)" }}>{d.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: domain === d.id ? "white" : "rgba(255,255,255,0.6)" }}>{d.label}</span>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 10, textTransform: "uppercase" }}>Project Name (Optional)</label>
              <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Leave blank for AI to generate one..."
                style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, outline: "none" }} />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 10, textTransform: "uppercase" }}>Complexity Level</label>
              <div style={{ display: "flex", gap: 10 }}>
                {COMPLEXITIES.map(c => (
                  <button key={c} onClick={() => setComplexity(c)}
                    style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${complexity === c ? "#F97316" : "rgba(255,255,255,0.08)"}`, background: complexity === c ? "rgba(249,115,22,0.1)" : "transparent", color: complexity === c ? "#F97316" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={!domain}
              style={{ width: "100%", padding: "16px", borderRadius: 16, background: domain ? "linear-gradient(135deg, #F97316, #EA580C)" : "rgba(255,255,255,0.05)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: domain ? "pointer" : "not-allowed", opacity: !domain ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: domain ? "0 12px 24px rgba(249,115,22,0.3)" : "none" }}>
              <Sparkles size={20} /> Generate Project Blueprint
            </button>
          </div>
        </motion.div>
      )}

      {phase === "loading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid rgba(249,115,22,0.2)", borderTopColor: "#F97316" }} />
          </motion.div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Architecting Project Blueprint...</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Designing {complexity.toLowerCase()} {selectedDomain?.label.toLowerCase()} project</p>
        </div>
      )}

      {phase === "output" && project && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Project Title */}
          <div style={{ padding: 32, borderRadius: 24, background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(255,255,255,0.01))", border: "1px solid rgba(249,115,22,0.2)", marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#F97316", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Generated Project Blueprint</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "white", marginBottom: 10 }}>{project.name}</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 20 }}>{project.tagline}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {project.stack.map(s => <span key={s} style={{ padding: "6px 12px", borderRadius: 10, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", color: "#FB923C", fontSize: 12, fontWeight: 700 }}>{s}</span>)}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* Architecture */}
            <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 20 }}>System Architecture</h3>
              {project.architecture.map((layer) => (
                <div key={layer.layer} style={{ marginBottom: 12 }}>
                  <button onClick={() => setExpandedLayer(expandedLayer === layer.layer ? null : layer.layer)}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{layer.layer}</span>
                    <motion.div animate={{ rotate: expandedLayer === layer.layer ? 90 : 0 }}><ChevronRight size={14} color="rgba(255,255,255,0.4)" /></motion.div>
                  </button>
                  <AnimatePresence>
                    {expandedLayer === layer.layer && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: "hidden", paddingTop: 8 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 12px" }}>
                          {layer.tools.map(t => <span key={t} style={{ fontSize: 12, color: "#F97316", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)", padding: "4px 10px", borderRadius: 8 }}>{t}</span>)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Features */}
            <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 20 }}>Core Features to Build</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {project.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 8, background: "rgba(249,115,22,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 900, color: "#F97316" }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resume & Deployment */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
            <div style={{ padding: 24, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", gridColumn: "span 2" }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <ExternalLink size={16} color="#10B981" /> Resume-Ready Bullet Points
              </h3>
              {project.resumeTips.map((t, i) => <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 8, display: "flex", gap: 8 }}><span style={{ color: "#10B981" }}>•</span>{t}</div>)}
            </div>
            <div style={{ padding: 24, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 14 }}>GitHub Structure</h3>
              <pre style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", whiteSpace: "pre-wrap", fontFamily: "monospace", lineHeight: 1.8 }}>{project.githubStructure}</pre>
            </div>
          </div>

          <div style={{ padding: 20, borderRadius: 16, background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.15)", marginBottom: 24 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#F97316", marginRight: 12 }}>DEPLOYMENT PATH →</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{project.deploymentPlan}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <button onClick={() => setPhase("input")}
              style={{ padding: "12px 24px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Generate Another Project
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
