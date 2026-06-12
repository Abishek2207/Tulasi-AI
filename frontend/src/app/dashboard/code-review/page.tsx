"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { chatApi } from "@/lib/api";
import {
  Code, Send, RefreshCw, ChevronRight, CheckCircle2,
  TrendingUp, Lock, TerminalSquare
} from "lucide-react";
import { useSession } from "@/hooks/useSession";

interface Feedback {
  time_complexity: string;
  security: string;
  score: number;
  suggestions: string[];
  refactored_code: string;
}

export default function CodeReviewPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ snippet: string; score: number }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasProfile = user?.is_onboarded;

  const handleSubmit = async () => {
    if (!answer.trim() || loading) return;
    setLoading(true);
    setFeedback(null);
    setError(null);

    const prompt = `You are a strict but helpful Senior Staff Engineer doing a code review.

The user has submitted this code snippet for review:
\`\`\`
${answer}
\`\`\`

Analyze the code for performance, security vulnerabilities, and code quality.
Respond ONLY with a valid JSON object in this exact format (ensure strings are escaped properly):
{
  "time_complexity": "brief analysis of Big-O time and space complexity",
  "security": "brief analysis of security or edge case vulnerabilities",
  "score": <number 0-100 representing code quality>,
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "refactored_code": "a brief clean version of the code"
}`;

    try {
      const res = await chatApi.send(prompt, "code_review_feedback");
      const rawText: string = (res as any)?.data?.response ?? (res as any)?.response ?? (typeof res === "string" ? res : "");

      if (!rawText) {
        setError("Could not get feedback. Please try again.");
      } else {
        try {
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed: Feedback = JSON.parse(match[0]);
            setFeedback(parsed);
            setHistory(prev => [{ snippet: answer.slice(0, 30) + "…", score: parsed.score }, ...prev.slice(0, 4)]);
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

  const clearSnippet = () => {
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
          <Lock size={40} color="#F59E0B" strokeWidth={1.5} />
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 10 }}>Profile Required</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 380 }}>Complete your profile first so the Code Review Agent knows what languages and standards to apply.</p>
          </div>
          <Link href="/onboarding" style={{ padding: "12px 28px", borderRadius: 14, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#FBBF24", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Complete Profile →</Link>
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
          
          {/* Answer Box */}
          <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
                Paste Code Snippet
              </label>
              <button onClick={clearSnippet} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12 }}>Clear</button>
            </div>
            
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={12}
              placeholder="def process_data(arr):\n    for i in arr:\n        ..."
              style={{
                width: "100%", padding: "16px", borderRadius: 14, resize: "vertical",
                background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)",
                color: "#10B981", fontSize: 14, lineHeight: 1.6, outline: "none",
                fontFamily: "monospace", boxSizing: "border-box", whiteSpace: "pre"
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <button
                onClick={handleSubmit} disabled={!answer.trim() || loading}
                style={{
                  padding: "11px 28px", borderRadius: 12, border: "none", cursor: answer.trim() && !loading ? "pointer" : "not-allowed",
                  background: answer.trim() && !loading ? "linear-gradient(135deg, #F59E0B, #D97706)" : "rgba(255,255,255,0.05)",
                  color: answer.trim() && !loading ? "white" : "rgba(255,255,255,0.25)",
                  fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8,
                  boxShadow: answer.trim() && !loading ? "0 8px 20px rgba(245,158,11,0.35)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {loading ? <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> Running Linter & Review…</> : <><Send size={15} /> Request Review</>}
              </button>
            </div>
          </div>

          {error && <div style={{ padding: 16, borderRadius: 14, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", fontSize: 13, color: "#F87171" }}>⚠️ {error}</div>}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: 28, borderRadius: 24, background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.18)", display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 42, fontWeight: 900, color: feedback.score >= 80 ? "#10B981" : feedback.score >= 60 ? "#F59E0B" : "#F43F5E" }}>{feedback.score}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginTop: 2 }}>QUALITY</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 6 }}>
                      <div style={{ height: "100%", width: `${feedback.score}%`, borderRadius: 6, background: feedback.score >= 80 ? "#10B981" : feedback.score >= 60 ? "#F59E0B" : "#F43F5E", transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#10B981", marginBottom: 6, textTransform: "uppercase" }}>Time & Space Complexity</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{feedback.time_complexity}</div>
                  </div>
                  <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#F43F5E", marginBottom: 6, textTransform: "uppercase" }}>Security & Edge Cases</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{feedback.security}</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>💡 Actionable Feedback</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {feedback.suggestions.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <CheckCircle2 size={15} color="#F59E0B" style={{ marginTop: 1, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {feedback.refactored_code && (
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>✨ Refactored Approach</div>
                        <pre style={{ background: "#0d0d0d", padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", overflowX: "auto", fontSize: 13, color: "#10B981", fontFamily: "monospace" }}>
                            {feedback.refactored_code}
                        </pre>
                    </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Session Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {avgScore !== null && (
            <div style={{ padding: 24, borderRadius: 20, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#FBBF24", marginBottom: 4, textTransform: "uppercase" }}>Avg Code Quality</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "white" }}>{avgScore}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>/100</span></div>
            </div>
          )}

          <div style={{ padding: 20, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><TrendingUp size={16} color="#F59E0B" /> History</h4>
            {history.length === 0 ? <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>Submit code to track quality.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map((h, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1, marginRight: 8, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.snippet}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: h.score >= 80 ? "#10B981" : h.score >= 60 ? "#F59E0B" : "#F43F5E" }}>{h.score}</span>
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
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #F59E0B, #D97706)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(245,158,11,0.35)" }}>
          <TerminalSquare size={26} color="white" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "white" }}>Code Review Agent</h1>
            <AgentBadge variant="beta" />
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Security · Complexity · Linting · Best Practices</p>
        </div>
      </div>
      <Link href="/dashboard/professional" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Back</Link>
    </div>
  );
}
