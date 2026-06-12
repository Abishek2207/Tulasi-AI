"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { chatApi } from "@/lib/api";
import {
  Users, Send, RefreshCw, ChevronRight, CheckCircle2,
  Lock, Crown
} from "lucide-react";
import { useSession } from "@/hooks/useSession";

const PROMPTS = [
  { id: "conflict", category: "Conflict",   text: "Two of your senior engineers strongly disagree on the architecture for a new service. How do you resolve this?" },
  { id: "under",    category: "Performance",text: "A previously high-performing team member has missed deadlines for the last 3 sprints. What do you say?" },
  { id: "manageup", category: "Stakeholder",text: "Your VP just cut your project's deadline in half, but scope remains the same. How do you respond?" },
  { id: "morale",   category: "Culture",    text: "Your team just survived a massive crunch period and morale is low. How do you address the team?" },
];

interface Feedback {
  empathy: string;
  effectiveness: string;
  score: number; // 0-100
  suggestions: string[];
  verdict: string;
}

export default function LeadershipCoachPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [activePrompt, setActivePrompt] = useState(PROMPTS[0]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ prompt: string; score: number }[]>([]);

  const hasProfile = user?.is_onboarded;

  const handleSubmit = async () => {
    if (!answer.trim() || loading) return;
    setLoading(true);
    setFeedback(null);
    setError(null);

    const prompt = `You are an expert Engineering Manager Coach.

The user was given this management scenario: "${activePrompt.text}"

Their response/handling is:
"${answer}"

Analyze for empathy, leadership effectiveness, and practical outcome.
Respond ONLY with a valid JSON object in this exact format:
{
  "empathy": "brief assessment of emotional intelligence and team care",
  "effectiveness": "brief assessment of problem resolution and stakeholder management",
  "score": <number 0-100 representing leadership quality>,
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "verdict": "one sentence overall assessment"
}`;

    try {
      const res = await chatApi.send(prompt, "leadership_feedback");
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
          <Lock size={40} color="#10B981" strokeWidth={1.5} />
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 10 }}>Profile Required</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 380 }}>Complete your profile first so the Leadership Coach can set appropriate scenarios.</p>
          </div>
          <Link href="/onboarding" style={{ padding: "12px 28px", borderRadius: 14, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34D399", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Complete Profile →</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 960, margin: "0 auto", paddingBottom: 80 }}>
      <Header />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "white" }}>Leadership Scenario</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#34D399", background: "rgba(52,211,153,0.1)", padding: "3px 10px", borderRadius: 8, border: "1px solid rgba(52,211,153,0.2)" }}>
                  {activePrompt.category}
                </span>
                <button onClick={nextPrompt} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "4px 10px", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                  <RefreshCw size={12} /> Next
                </button>
              </div>
            </div>
            <p style={{ fontSize: 16, color: "white", lineHeight: 1.7, fontWeight: 500 }}>&quot;{activePrompt.text}&quot;</p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PROMPTS.map(p => (
              <button key={p.id} onClick={() => { setActivePrompt(p); setAnswer(""); setFeedback(null); setError(null); }}
                style={{
                  padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  background: p.id === activePrompt.id ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${p.id === activePrompt.id ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.06)"}`,
                  color: p.id === activePrompt.id ? "#34D399" : "rgba(255,255,255,0.4)",
                }}>
                {p.category}
              </button>
            ))}
          </div>

          <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 12 }}>
              Your Response / Action Plan
            </label>
            <textarea
              value={answer} onChange={e => setAnswer(e.target.value)} rows={6}
              placeholder="How would you approach this situation? What exactly would you say?"
              style={{ width: "100%", padding: "14px 16px", borderRadius: 14, resize: "vertical", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 14, lineHeight: 1.7, outline: "none", fontFamily: "var(--font-inter)", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
              <button
                onClick={handleSubmit} disabled={!answer.trim() || loading}
                style={{
                  padding: "11px 28px", borderRadius: 12, border: "none", cursor: answer.trim() && !loading ? "pointer" : "not-allowed",
                  background: answer.trim() && !loading ? "linear-gradient(135deg, #10B981, #059669)" : "rgba(255,255,255,0.05)",
                  color: answer.trim() && !loading ? "white" : "rgba(255,255,255,0.25)",
                  fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8,
                  boxShadow: answer.trim() && !loading ? "0 8px 20px rgba(16,185,129,0.35)" : "none", transition: "all 0.2s",
                }}
              >
                {loading ? <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> Coaching…</> : <><Send size={15} /> Evaluate Leadership</>}
              </button>
            </div>
          </div>

          {error && <div style={{ padding: 16, borderRadius: 14, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", fontSize: 13, color: "#F87171" }}>⚠️ {error}</div>}

          <AnimatePresence>
            {feedback && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: 28, borderRadius: 24, background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.18)", display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 42, fontWeight: 900, color: feedback.score >= 80 ? "#10B981" : feedback.score >= 50 ? "#F59E0B" : "#F43F5E" }}>{feedback.score}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginTop: 2 }}>LEADERSHIP</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: "white", fontWeight: 600, marginBottom: 8 }}>{feedback.verdict}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#60A5FA", marginBottom: 6, textTransform: "uppercase" }}>Empathy</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{feedback.empathy}</div>
                  </div>
                  <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#10B981", marginBottom: 6, textTransform: "uppercase" }}>Effectiveness</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{feedback.effectiveness}</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>💡 Actionable Coaching</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {feedback.suggestions.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <CheckCircle2 size={15} color="#10B981" style={{ marginTop: 1, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {avgScore !== null && (
            <div style={{ padding: 24, borderRadius: 20, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#34D399", marginBottom: 4, textTransform: "uppercase" }}>Avg Leadership</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "white" }}>{avgScore}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>/100</span></div>
            </div>
          )}
          <div style={{ padding: 20, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Crown size={16} color="#10B981" /> Trajectory</h4>
            {history.length === 0 ? <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>Start coaching to see history.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map((h, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1, marginRight: 8 }}>{h.prompt}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: h.score >= 80 ? "#10B981" : h.score >= 50 ? "#F59E0B" : "#F43F5E" }}>{h.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Header() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #10B981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(16,185,129,0.35)" }}>
          <Users size={26} color="white" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "white" }}>Leadership Coach</h1>
            <AgentBadge variant="beta" />
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Team management · Conflict resolution · Soft skills</p>
        </div>
      </div>
      <Link href="/dashboard/professional" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Back</Link>
    </div>
  );
}
