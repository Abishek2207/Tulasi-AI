"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Sparkles, Users, Trophy, ArrowRight, Clock, Globe, Tag } from "lucide-react";

const SAMPLE_HACKATHONS = [
  { id: 1, name: "Smart India Hackathon 2026", org: "Government of India", deadline: "Aug 15, 2026", prize: "₹1 Lakh", mode: "Offline", tags: ["AI/ML", "GovTech", "Open"], participants: 48000, color: "#F43F5E" },
  { id: 2, name: "Google Solution Challenge", org: "Google", deadline: "Mar 30, 2026", prize: "$15,000", mode: "Online", tags: ["Mobile", "Cloud", "Sustainability"], participants: 32000, color: "#4285F4" },
  { id: 3, name: "MLH Global Hack Week", org: "Major League Hacking", deadline: "Jul 20, 2026", prize: "Swag + $1,000", mode: "Online", tags: ["Beginner Friendly", "Web", "APIs"], participants: 5000, color: "#8B5CF6" },
];

interface IdeaResult {
  title: string;
  problem: string;
  solution: string;
  tech: string[];
  mvp_steps: string[];
  differentiator: string;
}

const SAMPLE_IDEA: IdeaResult = {
  title: "EduSync — Offline-first Smart Learning Assistant",
  problem: "Rural students in India lack consistent internet access, preventing them from using modern AI learning tools.",
  solution: "A PWA that uses edge AI (TensorFlow.js) to run locally on low-end devices, syncing progress when online.",
  tech: ["Next.js PWA", "TensorFlow.js", "IndexedDB", "Service Workers", "Node.js"],
  mvp_steps: ["Build offline content delivery system", "Integrate on-device NLP model", "Create sync engine for when online", "Build simple dashboard for teachers", "Test on low-end Android devices"],
  differentiator: "Unlike cloud-based solutions, this works completely offline — targeting the 300M+ students in rural India.",
};

export default function HackathonAgentPage() {
  const [activeTab, setActiveTab] = useState<"discover" | "ideate">("discover");
  const [theme, setTheme] = useState("");
  const [generating, setGenerating] = useState(false);
  const [idea, setIdea] = useState<IdeaResult | null>(null);

  const generateIdea = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setIdea(SAMPLE_IDEA);
    setGenerating(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #F97316, #EA580C)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(249,115,22,0.4)" }}>
          <Rocket size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px", fontFamily: "var(--font-outfit)" }}>Hackathon Agent</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Discover hackathons, generate winning ideas, build faster</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 32, background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 4 }}>
        {(["discover", "ideate"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: "10px", borderRadius: 12, background: activeTab === tab ? "rgba(249,115,22,0.15)" : "transparent", border: activeTab === tab ? "1px solid rgba(249,115,22,0.3)" : "1px solid transparent", color: activeTab === tab ? "#F97316" : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 14, cursor: "pointer", textTransform: "capitalize" }}>
            {tab === "discover" ? "🏆 Discover Hackathons" : "💡 AI Idea Generator"}
          </button>
        ))}
      </div>

      {activeTab === "discover" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {SAMPLE_HACKATHONS.map((h, i) => (
            <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              style={{ padding: "28px", borderRadius: 24, background: "rgba(255,255,255,0.02)", border: `1px solid rgba(255,255,255,0.06)`, display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: `${h.color}15`, border: `1px solid ${h.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Trophy size={24} color={h.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 4 }}>{h.name}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>{h.org}</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.4)" }}><Clock size={12} />Deadline: {h.deadline}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.4)" }}><Globe size={12} />{h.mode}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.4)" }}><Users size={12} />{h.participants.toLocaleString()} participants</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981" }}>Prize: {h.prize}</span>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  {h.tags.map(t => <span key={t} style={{ padding: "3px 10px", borderRadius: 12, background: `${h.color}12`, color: h.color, fontSize: 11, fontWeight: 700, border: `1px solid ${h.color}25` }}>{t}</span>)}
                </div>
              </div>
              <button style={{ padding: "12px 22px", borderRadius: 16, background: `linear-gradient(135deg, ${h.color}, ${h.color}cc)`, color: "white", fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, boxShadow: `0 8px 20px ${h.color}30` }}>
                Register <ArrowRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 12 }}>Hackathon Theme or Problem Statement</h2>
            <textarea value={theme} onChange={e => setTheme(e.target.value)} rows={3} placeholder="e.g. AI for Healthcare, Sustainable Agriculture, Smart Cities, EdTech for Rural India..."
              style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, color: "white", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none" }} />
            <button onClick={generateIdea} disabled={generating}
              style={{ marginTop: 16, width: "100%", padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #F97316, #EA580C)", color: "white", fontWeight: 900, fontSize: 15, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 12px 24px rgba(249,115,22,0.3)" }}>
              {generating ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Sparkles size={18} /></motion.div> Generating winning idea...</> : <><Sparkles size={18} /> Generate Idea</>}
            </button>
          </div>

          {idea && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 28, borderRadius: 24, background: "linear-gradient(135deg, rgba(249,115,22,0.06), rgba(255,255,255,0.01))", border: "1px solid rgba(249,115,22,0.2)" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#F97316", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>🏆 Winning Idea</div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 14 }}>{idea.title}</h2>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", marginBottom: 6, textTransform: "uppercase" }}>Problem</div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{idea.problem}</p>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", marginBottom: 6, textTransform: "uppercase" }}>Solution</div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{idea.solution}</p>
                </div>
                <div style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#F97316", marginBottom: 4, textTransform: "uppercase" }}>Key Differentiator</div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{idea.differentiator}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ padding: 24, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", marginBottom: 12, textTransform: "uppercase" }}>Tech Stack</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {idea.tech.map(t => <span key={t} style={{ padding: "4px 10px", borderRadius: 20, background: "rgba(99,102,241,0.12)", color: "#818CF8", fontSize: 12, fontWeight: 700, border: "1px solid rgba(99,102,241,0.2)" }}>{t}</span>)}
                  </div>
                </div>
                <div style={{ padding: 24, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", marginBottom: 12, textTransform: "uppercase" }}>MVP Steps</div>
                  {idea.mvp_steps.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 900, color: "#F97316", minWidth: 16 }}>{i + 1}.</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
