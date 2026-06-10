"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { chatApi } from "@/lib/api";
import {
  Mic, Send, RefreshCw, ChevronRight, CheckCircle2,
  MessageSquare, Brain, TrendingUp, Lock,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";

const PROMPTS = [
  { id: "intro",    category: "HR",           text: "Tell me about yourself and why you chose engineering." },
  { id: "conflict", category: "Behavioral",   text: "Describe a time you faced a conflict in a team project. How did you resolve it?" },
  { id: "failure",  category: "Behavioral",   text: "Talk about a project that failed. What did you learn from it?" },
  { id: "strength", category: "HR",           text: "What is your biggest technical strength and how have you used it?" },
  { id: "goal",     category: "Career",       text: "Where do you see yourself in 3 years in your career?" },
  { id: "pressure", category: "Situational",  text: "How do you manage pressure during a hackathon or tight deadline?" },
];

interface Feedback {
  grammar: string;
  clarity: string;
  confidence: number; // 0-100
  suggestions: string[];
  overall: string;
}

export default function CommunicationAgentPage() {
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

    const prompt = `You are an expert interview coach and communication evaluator.

The candidate was asked: "${activePrompt.text}"

Their answer was:
"${answer}"

Respond ONLY with a valid JSON object in this exact format:
{
  "grammar": "brief grammar assessment",
  "clarity": "brief clarity/structure assessment",
  "confidence": <number 0-100>,
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "overall": "one sentence overall verdict"
}`;

    const res = await chatApi.send(prompt, "communication_feedback");

    if (res.error || !res.data) {
      setError(res.error || "Could not get feedback. Please try again.");
    } else {
      try {
        const raw = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed: Feedback = JSON.parse(match[0]);
          setFeedback(parsed);
          setHistory(prev => [
            { prompt: activePrompt.text.slice(0, 50) + "…", score: parsed.confidence },
            ...prev.slice(0, 4),
          ]);
        } else {
          setError("Could not parse AI feedback. Try again.");
        }
      } catch {
        setError("Could not parse AI feedback. Try again.");
      }
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

  const avgScore = history.length
    ? Math.round(history.reduce((a, h) => a + h.score, 0) / history.length)
    : null;

  if (!hasProfile) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60 }}>
        <Header />
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "80px 32px", borderRadius: 24,
          background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.08)", gap: 20,
        }}>
          <Lock size={40} color="#A78BFA" strokeWidth={1.5} />
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 10 }}>Profile Required</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 380 }}>
              Complete your profile first so the Communication Agent can tailor prompts to your target role and experience level.
            </p>
          </div>
          <Link href="/onboarding" style={{
            padding: "12px 28px", borderRadius: 14, background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.3)", color: "#A78BFA",
            fontWeight: 700, fontSize: 14, textDecoration: "none",
          }}>Complete Profile →</Link>
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
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "white" }}>Interview Prompt</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#A78BFA", background: "rgba(167,139,250,0.1)", padding: "3px 10px", borderRadius: 8, border: "1px solid rgba(167,139,250,0.2)" }}>
                  {activePrompt.category}
                </span>
                <button onClick={nextPrompt} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "4px 10px", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                  <RefreshCw size={12} /> Next
                </button>
              </div>
            </div>
            <p style={{ fontSize: 16, color: "white", lineHeight: 1.7, fontWeight: 500 }}>
              &quot;{activePrompt.text}&quot;
            </p>
          </div>

          {/* Quick Pick */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PROMPTS.map(p => (
              <button key={p.id} onClick={() => { setActivePrompt(p); setAnswer(""); setFeedback(null); setError(null); }}
                style={{
                  padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  background: p.id === activePrompt.id ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${p.id === activePrompt.id ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.06)"}`,
                  color: p.id === activePrompt.id ? "#A78BFA" : "rgba(255,255,255,0.4)",
                }}>
                {p.category}
              </button>
            ))}
          </div>

          {/* Answer Box */}
          <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 12 }}>
              Your Answer <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>(type as you would speak it)</span>
            </label>
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={6}
              placeholder="Write your answer here. Be as natural as possible — as if you're speaking in the interview..."
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
                onClick={handleSubmit}
                disabled={!answer.trim() || loading}
                style={{
                  padding: "11px 28px", borderRadius: 12, border: "none", cursor: answer.trim() && !loading ? "pointer" : "not-allowed",
                  background: answer.trim() && !loading ? "linear-gradient(135deg, #8B5CF6, #6D28D9)" : "rgba(255,255,255,0.05)",
                  color: answer.trim() && !loading ? "white" : "rgba(255,255,255,0.25)",
                  fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8,
                  boxShadow: answer.trim() && !loading ? "0 8px 20px rgba(139,92,246,0.35)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {loading ? <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> Analyzing…</> : <><Send size={15} /> Get AI Feedback</>}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: 16, borderRadius: 14, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", fontSize: 13, color: "#F87171" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: 28, borderRadius: 24, background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.18)", display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Confidence Score */}
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 42, fontWeight: 900, color: feedback.confidence >= 70 ? "#10B981" : feedback.confidence >= 45 ? "#F59E0B" : "#F43F5E" }}>
                      {feedback.confidence}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginTop: 2 }}>CONFIDENCE</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: "white", fontWeight: 600, marginBottom: 8 }}>{feedback.overall}</div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 6 }}>
                      <div style={{ height: "100%", width: `${feedback.confidence}%`, borderRadius: 6, background: feedback.confidence >= 70 ? "#10B981" : feedback.confidence >= 45 ? "#F59E0B" : "#F43F5E", transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                </div>

                {/* Detail Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Grammar",  val: feedback.grammar,  color: "#3B82F6" },
                    { label: "Clarity",  val: feedback.clarity,  color: "#A78BFA" },
                  ].map(c => (
                    <div key={c.label} style={{ padding: "14px 16px", borderRadius: 14, background: `${c.color}08`, border: `1px solid ${c.color}20` }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: c.color, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{c.label}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{c.val}</div>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>💡 Suggestions to Improve</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {feedback.suggestions.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <CheckCircle2 size={15} color="#10B981" style={{ marginTop: 1, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={nextPrompt} style={{
                  padding: "11px 0", borderRadius: 12, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                  color: "#A78BFA", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  Next Prompt <ChevronRight size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Session Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {avgScore !== null && (
            <div style={{ padding: 24, borderRadius: 20, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#A78BFA", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Session Avg</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "white" }}>{avgScore}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>/100</span></div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>From {history.length} answer{history.length !== 1 ? "s" : ""} this session</div>
            </div>
          )}

          <div style={{ padding: 20, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} color="#10B981" /> Session History
            </h4>
            {history.length === 0 ? (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>
                Submit your first answer to track progress.
              </p>
            ) : (
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

          <div style={{ padding: 18, borderRadius: 16, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#60A5FA", marginBottom: 8 }}>🎯 Goal</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
              Aim for a confidence score of 75+ consistently. Practice 3–5 prompts per session for the best results.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}

function Header() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #A78BFA, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(167,139,250,0.35)" }}>
          <Mic size={26} color="white" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "white" }}>Communication Agent</h1>
            <AgentBadge variant="beta" />
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Spoken interview prompts · AI grammar & clarity feedback · Confidence scoring</p>
        </div>
      </div>
      <Link href="/dashboard/student" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Back</Link>
    </div>
  );
}
