"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, ChevronRight, CheckCircle, Circle, Sparkles, Code, BookOpen, Trophy, ArrowRight, Lock } from "lucide-react";

const TRACKS = [
  { id: "frontend", label: "Frontend Dev", color: "#06B6D4", icon: <Code size={18} /> },
  { id: "backend", label: "Backend Dev", color: "#8B5CF6", icon: <Code size={18} /> },
  { id: "fullstack", label: "Full Stack", color: "#10B981", icon: <Code size={18} /> },
  { id: "ml", label: "ML / AI", color: "#F59E0B", icon: <Sparkles size={18} /> },
  { id: "devops", label: "DevOps / Cloud", color: "#F43F5E", icon: <Trophy size={18} /> },
  { id: "datascience", label: "Data Science", color: "#A855F7", icon: <BookOpen size={18} /> },
];

const SAMPLE_ROADMAP = [
  { phase: "Foundation", weeks: "Weeks 1–4", items: ["Learn Python basics", "Data structures & algorithms", "Git & GitHub fundamentals", "Linux command line"], status: "completed" },
  { phase: "Core Skills", weeks: "Weeks 5–12", items: ["React.js fundamentals", "Node.js & Express", "SQL & NoSQL databases", "REST API design"], status: "in-progress" },
  { phase: "Advanced Topics", weeks: "Weeks 13–20", items: ["System Design basics", "Docker & containers", "AWS fundamentals", "Testing strategies"], status: "locked" },
  { phase: "Production Ready", weeks: "Weeks 21–28", items: ["CI/CD pipelines", "Performance optimization", "Security best practices", "Open source contributions"], status: "locked" },
  { phase: "Job Ready", weeks: "Weeks 29–32", items: ["Build portfolio projects", "Resume & LinkedIn polish", "Mock interview practice", "Apply to 20+ companies"], status: "locked" },
];

export default function PersonalizedRoadmapPage() {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<typeof SAMPLE_ROADMAP | null>(null);
  const [goal, setGoal] = useState("");
  const [timeline, setTimeline] = useState("6 months");

  const generate = async () => {
    if (!selectedTrack) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setRoadmap(SAMPLE_ROADMAP);
    setGenerating(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #10B981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(16,185,129,0.4)" }}>
          <Map size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px", fontFamily: "var(--font-outfit)" }}>Personalized Roadmap</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 2 }}>Your AI-generated, week-by-week career path</p>
        </div>
      </div>

      {!roadmap ? (
        <motion.div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ padding: 32, borderRadius: 28, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20 }}>Choose your career track</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {TRACKS.map(track => (
                <button key={track.id} onClick={() => setSelectedTrack(track.id)}
                  style={{ padding: "16px 12px", borderRadius: 16, border: `2px solid ${selectedTrack === track.id ? track.color : "rgba(255,255,255,0.08)"}`, background: selectedTrack === track.id ? `${track.color}12` : "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
                  <span style={{ color: track.color }}>{track.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: selectedTrack === track.id ? "white" : "rgba(255,255,255,0.5)" }}>{track.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 32, borderRadius: 28, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20 }}>Define your goal</h2>
            <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Get a job at a product company with 12 LPA+ package"
              style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, color: "white", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 12 }}>
              {["3 months", "6 months", "1 year"].map(t => (
                <button key={t} onClick={() => setTimeline(t)}
                  style={{ flex: 1, padding: "10px", borderRadius: 12, border: `1px solid ${timeline === t ? "#10B981" : "rgba(255,255,255,0.08)"}`, background: timeline === t ? "rgba(16,185,129,0.1)" : "transparent", color: timeline === t ? "#10B981" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={!selectedTrack || generating}
            style={{ width: "100%", padding: "18px", borderRadius: 18, background: selectedTrack ? "linear-gradient(135deg, #10B981, #059669)" : "rgba(255,255,255,0.05)", color: selectedTrack ? "white" : "rgba(255,255,255,0.3)", fontWeight: 900, fontSize: 16, border: "none", cursor: selectedTrack ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: selectedTrack ? "0 14px 28px rgba(16,185,129,0.3)" : "none" }}>
            {generating ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Sparkles size={20} /></motion.div> Generating your roadmap...</>
            ) : (<><Map size={20} /> Generate My Roadmap</>)}
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "4px 12px", borderRadius: 20 }}>
                {TRACKS.find(t => t.id === selectedTrack)?.label} Track • {timeline}
              </span>
            </div>
            <button onClick={() => setRoadmap(null)} style={{ padding: "8px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Regenerate
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 24, top: 0, bottom: 0, width: 2, background: "linear-gradient(to bottom, #10B981, #8B5CF6, rgba(255,255,255,0.05))" }} />
            {roadmap.map((phase, i) => (
              <motion.div key={phase.phase} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                style={{ display: "flex", gap: 24, marginBottom: 32 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: phase.status === "completed" ? "#10B981" : phase.status === "in-progress" ? "#8B5CF6" : "rgba(255,255,255,0.06)",
                  border: phase.status === "locked" ? "2px dashed rgba(255,255,255,0.15)" : "none",
                  boxShadow: phase.status !== "locked" ? `0 8px 20px ${phase.status === "completed" ? "rgba(16,185,129,0.3)" : "rgba(139,92,246,0.3)"}` : "none",
                  zIndex: 1 }}>
                  {phase.status === "completed" ? <CheckCircle size={22} color="white" /> : phase.status === "in-progress" ? <ArrowRight size={22} color="white" /> : <Lock size={20} color="rgba(255,255,255,0.3)" />}
                </div>
                <div style={{ flex: 1, padding: "20px 24px", borderRadius: 20, background: phase.status === "locked" ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.03)", border: `1px solid ${phase.status === "in-progress" ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`, opacity: phase.status === "locked" ? 0.6 : 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 900, color: "white" }}>Phase {i + 1}: {phase.phase}</h3>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 12 }}>{phase.weeks}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                    {phase.items.map((item, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: phase.status === "completed" ? "#10B981" : phase.status === "in-progress" ? "#8B5CF6" : "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: phase.status === "locked" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.75)", fontWeight: 500 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
