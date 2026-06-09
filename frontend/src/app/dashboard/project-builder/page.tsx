"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FolderKanban, Sparkles, Code, ArrowRight, Copy, Check, ExternalLink } from "lucide-react";

const DOMAINS = ["Web Development", "Mobile App", "Machine Learning", "Data Science", "DevOps / Cloud", "Blockchain", "Game Development", "IoT / Embedded"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

interface Project {
  title: string;
  description: string;
  tech_stack: string[];
  features: string[];
  steps: string[];
  github_topics: string[];
  estimated_time: string;
}

const SAMPLE_PROJECT: Project = {
  title: "AI-Powered Job Tracker",
  description: "A full-stack web application that helps job seekers track their applications, get AI-powered insights on their progress, and receive personalized recommendations for improvement.",
  tech_stack: ["React.js", "Node.js", "PostgreSQL", "OpenAI API", "Tailwind CSS", "JWT Auth"],
  features: ["Application status kanban board", "AI-generated interview tips per company", "Salary benchmarking dashboard", "Auto-fill from LinkedIn/job board URLs", "Weekly progress reports via email"],
  steps: ["Set up Next.js project with authentication", "Design database schema for applications & users", "Build Kanban board with drag-and-drop", "Integrate OpenAI API for insights", "Deploy on Vercel + Railway"],
  github_topics: ["job-tracker", "nextjs", "openai", "fullstack", "postgresql"],
  estimated_time: "3–4 weeks",
};

export default function ProjectBuilderPage() {
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [interest, setInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async () => {
    if (!domain) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2200));
    setProject(SAMPLE_PROJECT);
    setLoading(false);
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #F59E0B, #D97706)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(245,158,11,0.4)" }}>
          <FolderKanban size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px", fontFamily: "var(--font-outfit)" }}>Project Builder</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Generate portfolio-worthy project blueprints with AI</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: project ? "380px 1fr" : "1fr", gap: 24 }}>
        {/* Config Panel */}
        <div>
          <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16 }}>Domain</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {DOMAINS.map(d => (
                <button key={d} onClick={() => setDomain(d)}
                  style={{ padding: "8px 14px", borderRadius: 20, border: `1px solid ${domain === d ? "#F59E0B" : "rgba(255,255,255,0.1)"}`, background: domain === d ? "rgba(245,158,11,0.1)" : "transparent", color: domain === d ? "#F59E0B" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16 }}>Difficulty</h2>
            <div style={{ display: "flex", gap: 8 }}>
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  style={{ flex: 1, padding: "10px", borderRadius: 12, border: `1px solid ${difficulty === d ? "#F59E0B" : "rgba(255,255,255,0.08)"}`, background: difficulty === d ? "rgba(245,158,11,0.1)" : "transparent", color: difficulty === d ? "#F59E0B" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 12 }}>Your Interests (Optional)</h2>
            <input value={interest} onChange={e => setInterest(e.target.value)} placeholder="e.g. fitness, finance, gaming, education..."
              style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          </div>

          <button onClick={generate} disabled={!domain || loading}
            style={{ width: "100%", padding: "16px", borderRadius: 16, background: domain ? "linear-gradient(135deg, #F59E0B, #D97706)" : "rgba(255,255,255,0.05)", color: domain ? "white" : "rgba(255,255,255,0.3)", fontWeight: 900, fontSize: 15, border: "none", cursor: domain ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: domain ? "0 12px 24px rgba(245,158,11,0.3)" : "none" }}>
            {loading ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Sparkles size={18} /></motion.div> Architecting project...</>
            ) : (<><Sparkles size={18} /> Generate Project Idea</>)}
          </button>
        </div>

        {/* Project Output */}
        {project && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ padding: 28, borderRadius: 24, background: "linear-gradient(135deg, rgba(245,158,11,0.05), rgba(255,255,255,0.01))", border: "1px solid rgba(245,158,11,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "1px" }}>{difficulty} • {domain}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>⏱ {project.estimated_time}</span>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 12, letterSpacing: "-0.5px" }}>{project.title}</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>{project.description}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Tech Stack */}
              <div style={{ padding: 24, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Tech Stack</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {project.tech_stack.map(t => <span key={t} style={{ padding: "4px 10px", borderRadius: 20, background: "rgba(99,102,241,0.12)", color: "#818CF8", fontSize: 12, fontWeight: 700, border: "1px solid rgba(99,102,241,0.2)" }}>{t}</span>)}
                </div>
              </div>

              {/* Key Features */}
              <div style={{ padding: 24, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Key Features</div>
                {project.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#F59E0B", flexShrink: 0, marginTop: 6 }} />
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Build Steps */}
            <div style={{ padding: 24, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Build Steps</div>
              {project.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#F59E0B" }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, paddingTop: 2 }}>{step}</span>
                </div>
              ))}
            </div>

            {/* GitHub Topics */}
            <div style={{ padding: 20, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>GitHub Topics</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {project.github_topics.map(t => <span key={t} style={{ padding: "2px 8px", borderRadius: 12, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600 }}>#{t}</span>)}
                </div>
              </div>
              <button onClick={() => copy(project.github_topics.join(", "), "topics")}
                style={{ padding: "8px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                {copied === "topics" ? <><Check size={13} color="#10B981" /> Copied!</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
