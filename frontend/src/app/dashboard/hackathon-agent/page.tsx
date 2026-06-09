"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles, Globe, Users, Clock, ExternalLink, Lightbulb, Calendar, Tag } from "lucide-react";

interface Hackathon {
  id: number;
  name: string;
  organizer: string;
  prize: string;
  deadline: string;
  mode: string;
  tags: string[];
  participants: string;
  link: string;
  featured: boolean;
}

const HACKATHONS: Hackathon[] = [
  { id: 1, name: "Google Solution Challenge 2025", organizer: "Google", prize: "$100,000", deadline: "Mar 30, 2025", mode: "Online", tags: ["AI", "Social Impact", "Flutter"], participants: "100K+", link: "#", featured: true },
  { id: 2, name: "HackMIT", organizer: "MIT", prize: "$50,000", deadline: "Sep 15, 2025", mode: "In-person", tags: ["Web", "AI/ML", "Hardware"], participants: "1,000", link: "#", featured: true },
  { id: 3, name: "Smart India Hackathon", organizer: "MoE, Govt of India", prize: "₹1L per winner", deadline: "Aug 20, 2025", mode: "In-person", tags: ["GovTech", "Rural", "Health"], participants: "50K+", link: "#", featured: false },
  { id: 4, name: "Unstop Hackathon Series", organizer: "Unstop", prize: "₹5L pool", deadline: "Ongoing", mode: "Online", tags: ["Open Track", "Fresher Friendly"], participants: "10K+", link: "#", featured: false },
  { id: 5, name: "DevFest Hackathon", organizer: "GDG India", prize: "₹2L + Internship", deadline: "Nov 10, 2025", mode: "Hybrid", tags: ["Firebase", "Google Cloud", "Web3"], participants: "5K+", link: "#", featured: false },
];

const IDEA_DOMAINS = ["AI / ML", "HealthTech", "EdTech", "FinTech", "GreenTech", "Web3", "Productivity"];

interface IdeaResult { title: string; problem: string; solution: string; stack: string[]; mvp: string; }

const MOCK_IDEAS: IdeaResult[] = [
  { title: "MediLink AI", problem: "Rural patients can't access specialist doctors due to distance and cost.", solution: "A WhatsApp-based AI triage system that assesses symptoms and connects to the nearest available specialist via video.", stack: ["FastAPI", "Twilio API", "OpenAI GPT-4o", "Firebase"], mvp: "Symptom intake form → AI triage → Doctor booking page" },
  { title: "SkillBridge", problem: "College students struggle to convert coursework into employable skills.", solution: "AI analyzes a student's GitHub and grades to generate a personalized skill-gap report and micro-project plan.", stack: ["Next.js", "GitHub API", "OpenAI", "PostgreSQL"], mvp: "GitHub connect → Profile analysis → Personalized roadmap" },
];

export default function HackathonAgentPage() {
  const [tab, setTab] = useState<"discover" | "generate">("discover");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [generating, setGenerating] = useState(false);
  const [ideas, setIdeas] = useState<IdeaResult[] | null>(null);

  const generate = async () => {
    if (!selectedDomain) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setIdeas(MOCK_IDEAS);
    setGenerating(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #F59E0B, #D97706)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(245,158,11,0.4)" }}>
          <Trophy size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>Hackathon Agent</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Discover hackathons and generate winning MVP ideas with AI</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16 }}>
        {[{ id: "discover", label: "🌍 Discover Hackathons" }, { id: "generate", label: "💡 AI Idea Generator" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ padding: "10px 20px", borderRadius: 14, background: tab === t.id ? "rgba(245,158,11,0.1)" : "transparent", border: tab === t.id ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent", color: tab === t.id ? "#F59E0B" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "discover" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {HACKATHONS.map(h => (
            <motion.div key={h.id} whileHover={{ y: -2 }}
              style={{ padding: 24, borderRadius: 22, background: h.featured ? "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(255,255,255,0.01))" : "rgba(255,255,255,0.02)", border: `1px solid ${h.featured ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    {h.featured && <span style={{ fontSize: 11, fontWeight: 800, color: "#F59E0B", background: "rgba(245,158,11,0.1)", padding: "3px 10px", borderRadius: 8, border: "1px solid rgba(245,158,11,0.2)" }}>⭐ Featured</span>}
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}><Globe size={12} /> {h.mode}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 4 }}>{h.name}</h3>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>by {h.organizer}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {h.tags.map(tag => <span key={tag} style={{ fontSize: 12, color: "#F59E0B", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>{tag}</span>)}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, marginLeft: 24 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "white" }}>{h.prize}</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> {h.deadline}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={12} /> {h.participants}</span>
                  </div>
                  <a href={h.link} target="_blank" rel="noreferrer"
                    style={{ padding: "10px 20px", borderRadius: 12, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B", fontWeight: 700, fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                    Register <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "generate" && (
        <div>
          <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 18 }}>Select Hackathon Domain</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              {IDEA_DOMAINS.map(d => (
                <button key={d} onClick={() => setSelectedDomain(d)}
                  style={{ padding: "10px 18px", borderRadius: 12, border: `1px solid ${selectedDomain === d ? "#F59E0B" : "rgba(255,255,255,0.1)"}`, background: selectedDomain === d ? "rgba(245,158,11,0.1)" : "transparent", color: selectedDomain === d ? "#F59E0B" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  {d}
                </button>
              ))}
            </div>
            <button onClick={generate} disabled={!selectedDomain || generating}
              style={{ width: "100%", padding: "16px", borderRadius: 14, background: selectedDomain ? "linear-gradient(135deg, #F59E0B, #D97706)" : "rgba(255,255,255,0.05)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: selectedDomain ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: !selectedDomain ? 0.5 : 1 }}>
              {generating ? "Generating..." : <><Sparkles size={20} /> Generate Winning Ideas</>}
            </button>
          </div>

          {ideas && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {ideas.map((idea, i) => (
                <div key={i} style={{ padding: 28, borderRadius: 24, background: "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(255,255,255,0.01))", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <Lightbulb size={20} color="#F59E0B" />
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: "white" }}>{idea.title}</h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div style={{ padding: 14, borderRadius: 12, background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.12)" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#F43F5E", marginBottom: 6 }}>THE PROBLEM</div>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>{idea.problem}</p>
                    </div>
                    <div style={{ padding: 14, borderRadius: 12, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#10B981", marginBottom: 6 }}>THE SOLUTION</div>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>{idea.solution}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>TECH STACK</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {idea.stack.map(s => <span key={s} style={{ fontSize: 12, color: "#F59E0B", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>{s}</span>)}
                      </div>
                    </div>
                    <div style={{ maxWidth: 280 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>24HR MVP PLAN</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{idea.mvp}</div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
