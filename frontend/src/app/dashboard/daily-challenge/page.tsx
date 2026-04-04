"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import {
  Zap, Trophy, Timer, Flame, ChevronRight, Send,
  CheckCircle2, Star, Calendar, BarChart3, Target, Sparkles, RefreshCw
} from "lucide-react";

import { API } from "@/lib/api";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
}

function RetryCountdown({ seconds, onRetry, message = "Neural Sync in Progress..." }: { seconds: number; onRetry: () => void; message?: string }) {
  const [count, setCount] = useState(seconds);
  useEffect(() => {
    if (count <= 0) { onRetry(); return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onRetry]);
  const pct = ((seconds - count) / seconds) * 100;
  return (
    <div style={{ padding: "16px", borderRadius: 16, background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.2)", display: "flex", alignItems: "center", gap: 16, width: "fit-content", marginTop: 16 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
        <RefreshCw size={20} color="#F97316" />
      </motion.div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "white", marginBottom: 4 }}>{message}</div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden", width: 120 }}>
          <motion.div animate={{ width: `${pct}%` }} style={{ height: "100%", background: "linear-gradient(90deg,#F97316,#FBBF24)", borderRadius: 10 }} />
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 900, color: "#F97316", width: 20 }}>{count}s</div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string }> = {
    coding:     { label: "⚡ Coding",     color: "#06B6D4" },
    interview:  { label: "🎯 Interview",  color: "#A78BFA" },
    design:     { label: "🏗️ Design",    color: "#F59E0B" },
    behavioral: { label: "💬 Behavioral", color: "#10B981" },
  };
  const badge = map[type] || { label: type, color: "#8B5CF6" };
  return (
    <span style={{
      fontSize: 11, fontWeight: 900, padding: "4px 12px", borderRadius: 20, letterSpacing: 1,
      background: `${badge.color}18`, color: badge.color, border: `1px solid ${badge.color}30`
    }}>{badge.label}</span>
  );
}

function DifficultyBadge({ level }: { level: string }) {
  const map: Record<string, string> = { Easy: "#10B981", Medium: "#F59E0B", Hard: "#F43F5E" };
  const color = map[level] || "#8B5CF6";
  return (
    <span style={{
      fontSize: 11, fontWeight: 900, padding: "4px 10px", borderRadius: 20,
      background: `${color}18`, color, border: `1px solid ${color}30`
    }}>{level}</span>
  );
}

function Countdown({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setRemaining(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {[["H", h], ["M", m], ["S", s]].map(([label, val]) => (
        <div key={label as string} style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 22, fontWeight: 900, fontFamily: "var(--font-outfit)",
            color: "white", background: "rgba(255,255,255,0.06)",
            width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.08)"
          }}>{String(val).padStart(2, "0")}</div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, marginTop: 4 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#F43F5E";
  const r = 44; const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={120} height={120} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={60} cy={60} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <motion.circle
          cx={60} cy={60} r={r} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: "var(--font-outfit)" }}>{score}</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>SCORE</div>
      </div>
    </div>
  );
}

export default function DailyChallengePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [activeTab, setActiveTab] = useState<"challenge" | "leaderboard" | "history">("challenge");
  const [history, setHistory] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (session) {
      fetchAll();
    }
  }, [session]);

  const fetchAll = async () => {
    setLoading(true);
    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [challengeRes, lbRes, streakRes] = await Promise.all([
        fetch(`${API}/api/daily-challenge/today`, { headers }),
        fetch(`${API}/api/daily-challenge/leaderboard`, { headers }),
        fetch(`${API}/api/daily-challenge/streak`, { headers }),
      ]);
      const [challengeData, lbData, streakData] = await Promise.all([
        challengeRes.json(), lbRes.json(), streakRes.json()
      ]);
      setData(challengeData);
      setLeaderboard(lbData.leaderboard || []);
      setStreak(streakData);
      if (challengeData.already_submitted) setResult(challengeData.submission);
    } catch { setError("Failed to load today's challenge. Try refreshing."); }
    setLoading(false);
  };

  const fetchHistory = async () => {
    const token = getToken();
    try {
      const res = await fetch(`${API}/api/daily-challenge/history`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setHistory(d.history || []);
    } catch {}
  };

  const handleSubmit = async (isRetry = false) => {
    if (!answer.trim()) { setError("Write your answer first!"); return; }
    setSubmitting(true); setError(""); setRetrying(false);
    const token = getToken();
    try {
      const res = await fetch(`${API}/api/daily-challenge/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answer }),
      });
      const d = await res.json();
      if (!res.ok) { throw new Error(d.detail || "Submission failed."); }
      setResult(d);
      fetchAll(); // refresh leaderboard
    } catch (e: any) { 
      setError(e.message || "Submission failed. Try again.");
      setRetrying(true);
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, flexDirection: "column", gap: 16 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        style={{ width: 48, height: 48, border: "4px solid rgba(249,115,22,0.1)", borderTopColor: "#F97316", borderRadius: "50%" }} />
      <div style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: 14 }}>Loading ORBIT DAILY...</div>
    </div>
  );

  const challenge = data?.challenge;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #F97316, #FBBF24)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(249,115,22,0.3)" }}>
                <Target size={22} color="white" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 900, color: "#F97316", textTransform: "uppercase", letterSpacing: 2 }}>Daily Intelligence</span>
            </div>
            <h1 style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-1.5px", marginBottom: 8 }}>
              ORBIT <span className="gradient-text">DAILY</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 17, lineHeight: 1.6 }}>
              One elite challenge per day. Compete globally. Build unstoppable momentum.
            </p>
          </div>

          {/* Streak + Countdown */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {streak && (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card"
                style={{ padding: "16px 24px", borderRadius: 20, border: "1px solid rgba(249,115,22,0.2)", display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ fontSize: 36 }}>🔥</div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#F97316", lineHeight: 1 }}>{streak.streak}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>DAY STREAK</div>
                </div>
              </motion.div>
            )}
            {data?.seconds_until_reset > 0 && (
              <div className="glass-card" style={{ padding: "16px 20px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", marginBottom: 8, textAlign: "center", letterSpacing: 1 }}>NEXT RESET</div>
                <Countdown seconds={data.seconds_until_reset} />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tab Nav */}
      <div style={{ display: "flex", gap: 4, marginBottom: 32, background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 16, width: "fit-content", border: "1px solid rgba(255,255,255,0.05)" }}>
        {(["challenge", "leaderboard", "history"] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); if (tab === "history") fetchHistory(); }}
            style={{
              padding: "10px 24px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, transition: "all 0.2s",
              background: activeTab === tab ? "rgba(249,115,22,0.15)" : "transparent",
              color: activeTab === tab ? "#F97316" : "var(--text-muted)",
            }}>
            {tab === "challenge" ? "🎯 Challenge" : tab === "leaderboard" ? "🏆 Leaderboard" : "📅 History"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* CHALLENGE TAB */}
        {activeTab === "challenge" && challenge && (
          <motion.div key="challenge" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
              {/* Left: Challenge Card */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Challenge Header */}
                <div className="glass-card" style={{ padding: 36, border: "1px solid rgba(249,115,22,0.2)", background: "rgba(249,115,22,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                    <TypeBadge type={challenge.type} />
                    <DifficultyBadge level={challenge.difficulty} />
                    <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 800, color: "#FBBF24", display: "flex", alignItems: "center", gap: 6 }}>
                      <Zap size={14} /> +{challenge.xp_reward} XP
                    </span>
                  </div>
                  <h2 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 20, letterSpacing: "-0.5px" }}>
                    {challenge.title}
                  </h2>
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.85)", whiteSpace: "pre-wrap", fontFamily: "var(--font-mono, monospace)" }}>
                    {challenge.question}
                  </p>

                  {challenge.tags?.length > 0 && (
                    <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
                      {challenge.tags.map((tag: string, i: number) => (
                        <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", fontWeight: 700 }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hint */}
                {challenge.hint && !result && (
                  <div className="glass-card" style={{ padding: 20, border: "1px solid rgba(252,211,77,0.15)", background: "rgba(252,211,77,0.03)" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#FBBF24", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <Sparkles size={14} /> HINT
                    </div>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{challenge.hint}</p>
                  </div>
                )}

                {/* Answer Input or Result */}
                <AnimatePresence mode="wait">
                  {!result ? (
                    <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="glass-card" style={{ padding: 28 }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 16 }}>YOUR ANSWER</div>
                      {error && !retrying && (
                        <div style={{ color: "#F43F5E", fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "rgba(244,63,94,0.08)", borderRadius: 8 }}>⚠️ {error}</div>
                      )}
                      <textarea
                        ref={textareaRef}
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        placeholder={`Write your ${challenge.type === "coding" ? "code + explanation" : "answer"} here...\n\nBe specific, structured, and thorough. The AI evaluates depth, clarity, and technical accuracy.`}
                        rows={10}
                        style={{
                          width: "100%", padding: "16px", borderRadius: 12, resize: "vertical", fontSize: 14, lineHeight: 1.7,
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white",
                          fontFamily: challenge.type === "coding" ? "var(--font-mono, monospace)" : "inherit", boxSizing: "border-box"
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{answer.length} chars</span>
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => handleSubmit(false)} disabled={submitting || !answer.trim()}
                          className="btn-primary"
                          style={{ padding: "14px 32px", borderRadius: 14, fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", gap: 8,
                            background: "linear-gradient(135deg, #F97316, #FBBF24)", opacity: submitting || !answer.trim() ? 0.6 : 1 }}>
                          {submitting ? (
                            <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                              style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                              Evaluating...</>
                          ) : <><Send size={16} /> Submit Answer</>}
                        </motion.button>
                      </div>
                      
                      {retrying && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                          <RetryCountdown seconds={5} onRetry={() => handleSubmit(true)} message="Evaluating your orbit sequence..." />
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                      className="glass-card" style={{ padding: 36, border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.02)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
                        <ScoreRing score={result.score} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 900, color: "var(--text-muted)", marginBottom: 6 }}>ORBIT DAILY — COMPLETED</div>
                          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
                            {result.score >= 80 ? "🔥 Excellent!" : result.score >= 60 ? "✅ Good Work" : "📈 Keep Improving"}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Zap size={16} color="#FBBF24" />
                            <span style={{ fontSize: 18, fontWeight: 900, color: "#FBBF24" }}>+{result.xp_awarded} XP earned</span>
                          </div>
                        </div>
                      </div>

                      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, marginBottom: 24 }}>{result.ai_feedback}</p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {result.strengths?.length > 0 && (
                          <div style={{ padding: 16, borderRadius: 12, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                            <div style={{ fontSize: 10, fontWeight: 900, color: "#10B981", marginBottom: 10, letterSpacing: 1 }}>✓ STRENGTHS</div>
                            {result.strengths.map((s: string, i: number) => (
                              <div key={i} style={{ fontSize: 13, color: "white", marginBottom: 6, display: "flex", gap: 8 }}>
                                <span style={{ color: "#10B981" }}>+</span>{s}
                              </div>
                            ))}
                          </div>
                        )}
                        {result.improvements?.length > 0 && (
                          <div style={{ padding: 16, borderRadius: 12, background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.12)" }}>
                            <div style={{ fontSize: 10, fontWeight: 900, color: "#F43F5E", marginBottom: 10, letterSpacing: 1 }}>↗ IMPROVE</div>
                            {result.improvements.map((s: string, i: number) => (
                              <div key={i} style={{ fontSize: 13, color: "white", marginBottom: 6, display: "flex", gap: 8 }}>
                                <span style={{ color: "#F43F5E" }}>→</span>{s}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right: Stats sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Today's stats */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 16 }}>TODAY</div>
                  <div style={{ display: "flex", gap: 20 }}>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "#F97316" }}>{data?.submitters_today || 0}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>SUBMITTED</div>
                    </div>
                    <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "#FBBF24" }}>{challenge?.xp_reward}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>MAX XP</div>
                    </div>
                  </div>
                </div>

                {/* Personal streak */}
                {streak && (
                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 16 }}>YOUR STATS</div>
                    {[
                      ["Current Streak", `🔥 ${streak.streak} days`],
                      ["Best Streak", `⭐ ${streak.longest_streak} days`],
                      ["Total Completed", `✅ ${streak.total_completed}`],
                    ].map(([label, value]) => (
                      <div key={label as string} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13 }}>
                        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                        <span style={{ fontWeight: 800, color: "white" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mini leaderboard */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 16 }}>
                    TOP TODAY 🏆
                  </div>
                  {leaderboard.slice(0, 5).map((entry, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 10px", borderRadius: 10,
                      background: entry.is_me ? "rgba(249,115,22,0.08)" : "transparent",
                      border: entry.is_me ? "1px solid rgba(249,115,22,0.2)" : "1px solid transparent",
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 900, width: 20, color: i === 0 ? "#FBBF24" : i === 1 ? "#9CA3AF" : i === 2 ? "#CD7C2F" : "var(--text-muted)" }}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: entry.is_me ? 900 : 600, color: entry.is_me ? "#F97316" : "white" }}>
                        {entry.user_name}{entry.is_me ? " (You)" : ""}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 900, color: "#10B981" }}>{entry.score}</span>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "16px 0" }}>
                      Be the first to submit! 🚀
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === "leaderboard" && (
          <motion.div key="leaderboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card" style={{ padding: 32 }}>
              <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <Trophy size={18} color="#FBBF24" /> Global Leaderboard — Today
              </div>
              {leaderboard.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
                  <div style={{ fontWeight: 700 }}>No submissions yet. Be the first!</div>
                </div>
              ) : (
                leaderboard.map((entry, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 14, marginBottom: 8,
                      background: entry.is_me ? "rgba(249,115,22,0.08)" : i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                      border: entry.is_me ? "1px solid rgba(249,115,22,0.25)" : "1px solid transparent",
                    }}>
                    <div style={{ width: 32, textAlign: "center", fontSize: 18, fontWeight: 900 }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span style={{ fontSize: 13, color: "var(--text-muted)" }}>#{i + 1}</span>}
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "white" }}>
                      {entry.user_name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: entry.is_me ? 900 : 700, color: entry.is_me ? "#F97316" : "white", fontSize: 14 }}>
                        {entry.user_name}{entry.is_me ? " · You" : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: entry.score >= 80 ? "#10B981" : entry.score >= 60 ? "#F59E0B" : "#F43F5E" }}>{entry.score}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>score</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: "#FBBF24" }}>+{entry.xp_awarded}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>XP</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {history.length === 0 ? (
              <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
                <div style={{ fontWeight: 700, color: "var(--text-muted)" }}>No challenge history yet. Complete today's challenge!</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {history.map((h, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <TypeBadge type={h.type} />
                      <DifficultyBadge level={h.difficulty} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, color: "white" }}>{h.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>{h.date}</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 24, fontWeight: 900, color: h.score >= 80 ? "#10B981" : h.score >= 60 ? "#F59E0B" : "#F43F5E" }}>{h.score}/100</span>
                      <span style={{ fontSize: 14, fontWeight: 900, color: "#FBBF24" }}>+{h.xp_awarded} XP</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
