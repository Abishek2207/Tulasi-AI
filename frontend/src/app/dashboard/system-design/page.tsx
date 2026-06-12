"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { chatApi } from "@/lib/api";
import {
  Server, Send, RefreshCw, ChevronRight, CheckCircle2,
  TrendingUp, Lock, HardDrive, Database, Network
} from "lucide-react";
import { useSession } from "@/hooks/useSession";

const PROMPTS = [
  { id: "url",       category: "Architecture",  text: "Design a URL shortener like Bitly. What database would you choose and why?" },
  { id: "chat",      category: "Scalability",   text: "How would you design a real-time chat application like WhatsApp for 10M DAU?" },
  { id: "uber",      category: "Microservices", text: "Design the location tracking system for a ride-sharing app like Uber." },
  { id: "cache",     category: "Performance",   text: "Explain how you would implement a distributed cache for a social media feed." },
  { id: "rate",      category: "Security",      text: "Design a distributed rate limiter for an API gateway." },
  { id: "ecommerce", category: "Database",      text: "Design the inventory management database schema for an e-commerce platform." },
];

interface Feedback {
  architecture: string;
  scalability: string;
  score: number; // 0-100
  improvements: string[];
  verdict: string;
}

export default function SystemDesignPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [activePrompt, setActivePrompt] = useState(PROMPTS[0]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ prompt: string; score: number }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasProfile = user?.is_onboarded;

  const handleSubmit = async () => {
    if (!answer.trim() || loading) return;
    setLoading(true);
    setFeedback(null);
    setError(null);

    const prompt = `You are an expert Staff/Principal Software Engineer conducting a System Design interview.

The candidate was given this prompt: "${activePrompt.text}"

Their proposed design/answer:
"${answer}"

Respond ONLY with a valid JSON object in this exact format:
{
  "architecture": "brief assessment of components and flow",
  "scalability": "brief assessment of bottlenecks and scaling approach",
  "score": <number 0-100>,
  "improvements": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "verdict": "one sentence overall assessment"
}`;

    try {
      const res = await chatApi.send(prompt, "system_design_feedback");
      const rawText: string = (res as any)?.data?.response ?? (res as any)?.response ?? (typeof res === "string" ? res : "");

      if (!rawText) {
        setError("Could not get feedback. Please try again.");
      } else {
        try {
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed: Feedback = JSON.parse(match[0]);
            setFeedback(parsed);
            setHistory(prev => [{ prompt: activePrompt.text.slice(0, 40) + "…", score: parsed.score }, ...prev.slice(0, 4)]);
          } else {
            setError("Could not parse AI feedback. Try again.");
          }
        } catch {
          setError("Could not parse AI feedback. Try again.");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Could not get feedback. Please try again.");
    }
    setLoading(false);
  };

  const nextPrompt = () => {
    const idx = PROMPTS.findIndex(p => p.id === activePrompt.id);
    setActivePrompt(PROMPTS[(idx + 1) % PROMPTS.length]);
    setAnswer("");
    setFeedback(null);
    setError(null);
  };

  const avgScore = history.length ? Math.round(history.reduce((a, h) => a + h.score, 0) / history.length) : null;

  if (!hasProfile) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60 }}>
        <Header />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 32px", borderRadius: 24, background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.08)", gap: 20 }}>
          <Lock size={40} color="#3B82F6" strokeWidth={1.5} />
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 10 }}>Profile Required</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 380 }}>Complete your profile first so the System Design Agent can tailor complexity to your level.</p>
          </div>
          <Link href="/onboarding" style={{ padding: "12px 28px", borderRadius: 14, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#60A5FA", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Complete Profile →</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 960, margin: "0 auto", paddingBottom: 80 }}>
      <Header />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
        {/* Left — Practice Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Prompt Selector */}
          <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "white" }}>Design Prompt</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#60A5FA", background: "rgba(96,165,250,0.1)", padding: "3px 10px", borderRadius: 8, border: "1px solid rgba(96,165,250,0.2)" }}>
                  {activePrompt.category}
                </span>
                <button onClick={nextPrompt} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "4px 10px", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                  <RefreshCw size={12} /> Next
                </button>
              </div>
            </div>
            <p style={{ fontSize: 16, color: "white", lineHeight: 1.7, fontWeight: 500 }}>&quot;{activePrompt.text}&quot;</p>
          </div>

          {/* Quick Pick */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PROMPTS.map(p => (
              <button key={p.id} onClick={() => { setActivePrompt(p); setAnswer(""); setFeedback(null); setError(null); }}
                style={{
                  padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  background: p.id === activePrompt.id ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${p.id === activePrompt.id ? "rgba(96,165,250,0.3)" : "rgba(255,255,255,0.06)"}`,
                  color: p.id === activePrompt.id ? "#60A5FA" : "rgba(255,255,255,0.4)",
                }}>
                {p.category}
              </button>
            ))}
          </div>

          {/* Answer Box */}
          <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 12 }}>
              Your Design Proposal
            </label>
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={8}
              placeholder="Describe your system architecture, databases, load balancing, and bottlenecks..."
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 14, resize: "vertical",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                color: "white", fontSize: 14, lineHeight: 1.7, outline: "none",
                fontFamily: "var(--font-inter)", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
              <button
                onClick={handleSubmit} disabled={!answer.trim() || loading}
                style={{
                  padding: "11px 28px", borderRadius: 12, border: "none", cursor: answer.trim() && !loading ? "pointer" : "not-allowed",
                  background: answer.trim() && !loading ? "linear-gradient(135deg, #3B82F6, #1D4ED8)" : "rgba(255,255,255,0.05)",
                  color: answer.trim() && !loading ? "white" : "rgba(255,255,255,0.25)",
                  fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8,
                  boxShadow: answer.trim() && !loading ? "0 8px 20px rgba(59,130,246,0.35)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {loading ? <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> Reviewing Architecture…</> : <><Send size={15} /> Submit Design</>}
              </button>
            </div>
          </div>

          {error && <div style={{ padding: 16, borderRadius: 14, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", fontSize: 13, color: "#F87171" }}>⚠️ {error}</div>}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: 28, borderRadius: 24, background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.18)", display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 42, fontWeight: 900, color: feedback.score >= 70 ? "#10B981" : feedback.score >= 45 ? "#F59E0B" : "#F43F5E" }}>{feedback.score}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginTop: 2 }}>SCORE</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: "white", fontWeight: 600, marginBottom: 8 }}>{feedback.verdict}</div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 6 }}>
                      <div style={{ height: "100%", width: `${feedback.score}%`, borderRadius: 6, background: feedback.score >= 70 ? "#10B981" : feedback.score >= 45 ? "#F59E0B" : "#F43F5E", transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#60A5FA", marginBottom: 6, textTransform: "uppercase" }}>Architecture</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{feedback.architecture}</div>
                  </div>
                  <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#A78BFA", marginBottom: 6, textTransform: "uppercase" }}>Scalability</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{feedback.scalability}</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>💡 Areas for Improvement</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {feedback.improvements.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <CheckCircle2 size={15} color="#3B82F6" style={{ marginTop: 1, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={nextPrompt} style={{ padding: "11px 0", borderRadius: 12, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#60A5FA", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  Next Design Challenge <ChevronRight size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Session Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {avgScore !== null && (
            <div style={{ padding: 24, borderRadius: 20, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#60A5FA", marginBottom: 4, textTransform: "uppercase" }}>Avg Design Score</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "white" }}>{avgScore}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>/100</span></div>
            </div>
          )}

          <div style={{ padding: 20, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><TrendingUp size={16} color="#3B82F6" /> Session History</h4>
            {history.length === 0 ? <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>Submit a design to track progress.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map((h, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1, marginRight: 8 }}>{h.prompt}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: h.score >= 70 ? "#10B981" : h.score >= 45 ? "#F59E0B" : "#F43F5E" }}>{h.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

function Header() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #3B82F6, #1D4ED8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(59,130,246,0.35)" }}>
          <Server size={26} color="white" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "white" }}>System Design Agent</h1>
            <AgentBadge variant="beta" />
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>High-level architecture · Scalability testing · FAANG-style questions</p>
        </div>
      </div>
      <Link href="/dashboard/professional" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Back</Link>
    </div>
  );
}
