"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { interviewApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { TiltCard } from "@/components/ui/TiltCard";
import {
  Mic, MicOff, Volume2, VolumeX, ArrowRight, CheckCircle2,
  TrendingUp, BrainCircuit, Terminal, Briefcase, Users, Layout,
  Timer, Video, VideoOff, Zap, Target, Award, BarChart3, Star,
  ChevronUp, ChevronDown, RefreshCw
} from "lucide-react";

const ROLES = [
  "Software Engineer", "AI Engineer", "Data Scientist", "Backend Developer",
  "Frontend Developer", "DevOps Engineer", "Product Manager", "QA Engineer",
  "Cybersecurity Engineer", "Full Stack Developer", "ML Engineer", "Cloud Engineer",
];

const INTERVIEW_TYPES = [
  { id: "Technical", icon: <Terminal size={24} />, desc: "DSA, logic, and core coding" },
  { id: "HR / Behavioral", icon: <Users size={24} />, desc: "STAR method and culture fit" },
  { id: "System Design", icon: <Layout size={24} />, desc: "Architecture and scalability" },
  { id: "Coding", icon: <Briefcase size={24} />, desc: "Live walkthrough and debugging" },
];

const COMPANIES = [
  "Google", "Amazon", "Meta", "Apple", "Netflix", "Microsoft",
  "Startup", "Any Company", "TCS", "Infosys", "IBM", "Deloitte",
];

function RetryCountdown({ seconds, onRetry, message = "Neural Sync in Progress..." }: { seconds: number; onRetry: () => void; message?: string }) {
  const [count, setCount] = useState(seconds);
  useEffect(() => {
    if (count <= 0) { onRetry(); return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onRetry]);
  const pct = ((seconds - count) / seconds) * 100;
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        style={{ display: "inline-block", marginBottom: 16 }}>
        <RefreshCw size={24} color="#8B5CF6" />
      </motion.div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "white", marginBottom: 6 }}>{message}</div>
      <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 16 }}>Auto-retrying in <span style={{ color: "#8B5CF6", fontWeight: 900 }}>{count}s</span></div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden", maxWidth: 150, margin: "0 auto" }}>
        <motion.div animate={{ width: `${pct}%` }} style={{ height: "100%", background: "linear-gradient(90deg,#8B5CF6,#06B6D4)", borderRadius: 10 }} />
      </div>
    </div>
  );
}

function VoiceWave({ active, color }: { active: boolean; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 24 }}>
      {[0.4, 0.7, 1, 0.8, 0.5, 0.9, 0.6].map((h, i) => (
        <motion.div
          key={i}
          animate={active ? { height: [8, 24 * h, 8] } : { height: 8 }}
          transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, ease: "easeInOut" }}
          style={{ width: 3, background: color, borderRadius: 2 }}
        />
      ))}
    </div>
  );
}

// ── Mini score ring ──────────────────────────────────────────────────────────
function ScoreRing({ score, max = 10, label, color }: { score: number; max?: number; label: string; color: string }) {
  const pct = (score / max) * 100;
  const r = 28; const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={72} height={72} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        <motion.circle
          cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <text x={36} y={40} textAnchor="middle" fill="white" fontSize={13} fontWeight={800} style={{ transform: "rotate(90deg)", transformOrigin: "36px 36px" }}>
          {score}
        </text>
      </svg>
      <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 0.5 }}>{label}</span>
    </div>
  );
}

// ── Per-question eval panel ──────────────────────────────────────────────────
interface EvalResult {
  score: number; clarity: number; relevance: number; structure: number; depth: number;
  confidence_score: number;
  strengths: string[]; weaknesses: string[];
  missing_keywords: string[];
  improvement_tip: string;
  summary: string;
}

function EvalPanel({ eval: e, questionNum }: { eval: EvalResult; questionNum: number }) {
  const [expanded, setExpanded] = useState(true);
  const scoreColor = (s: number) => s >= 8 ? "#43E97B" : s >= 5 ? "#FFD93D" : "#FF6B6B";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        borderRadius: 14, border: `1px solid rgba(139,92,246,0.2)`,
        background: "rgba(139,92,246,0.05)", overflow: "hidden"
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: "none", border: "none", cursor: "pointer"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Star size={14} color="#FFD93D" />
          <span style={{ fontSize: 12, fontWeight: 800, color: "white" }}>Q{questionNum} Evaluation</span>
          <span style={{
            fontSize: 11, fontWeight: 900, padding: "2px 8px", borderRadius: 20,
            background: `${scoreColor(e.score)}20`, color: scoreColor(e.score)
          }}>{e.score}/10</span>
        </div>
        {expanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Score rings */}
              <div style={{ display: "flex", justifyContent: "space-around", padding: "8px 0" }}>
                <ScoreRing score={e.clarity} label="Clarity" color="#06B6D4" />
                <ScoreRing score={e.depth} label="Depth" color="#8B5CF6" />
                <ScoreRing score={e.structure} label="Structure" color="#10B981" />
                <ScoreRing score={e.confidence_score} label="Confidence" color="#F59E0B" />
              </div>

              {/* Summary */}
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{e.summary}</p>

              {/* Strengths */}
              {e.strengths?.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#43E97B", marginBottom: 4, letterSpacing: 1 }}>✓ STRENGTHS</div>
                  {e.strengths.map((s, i) => (
                    <div key={i} style={{ fontSize: 11, color: "white", marginBottom: 3, display: "flex", gap: 6 }}>
                      <span style={{ color: "#43E97B" }}>+</span> {s}
                    </div>
                  ))}
                </div>
              )}

              {/* Weaknesses */}
              {e.weaknesses?.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#F43F5E", marginBottom: 4, letterSpacing: 1 }}>✗ GAPS</div>
                  {e.weaknesses.map((s, i) => (
                    <div key={i} style={{ fontSize: 11, color: "white", marginBottom: 3, display: "flex", gap: 6 }}>
                      <span style={{ color: "#F43F5E" }}>→</span> {s}
                    </div>
                  ))}
                </div>
              )}

              {/* Missing keywords */}
              {e.missing_keywords?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", width: "100%", letterSpacing: 1 }}>MISSING KEYWORDS</span>
                  {e.missing_keywords.map((kw, i) => (
                    <span key={i} style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 20,
                      background: "rgba(244,63,94,0.1)", color: "#F43F5E", border: "1px solid rgba(244,63,94,0.2)"
                    }}>{kw}</span>
                  ))}
                </div>
              )}

              {/* Tip */}
              {e.improvement_tip && (
                <div style={{
                  padding: "8px 12px", borderRadius: 8, background: "rgba(255,215,0,0.05)",
                  border: "1px solid rgba(255,215,0,0.1)", fontSize: 11, color: "#FFD93D", lineHeight: 1.5
                }}>
                  💡 {e.improvement_tip}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Difficulty badge ─────────────────────────────────────────────────────────
function DifficultyBadge({ level }: { level: number }) {
  const color = level >= 8 ? "#F43F5E" : level >= 5 ? "#FFD93D" : "#43E97B";
  const label = level >= 8 ? "Hard" : level >= 5 ? "Medium" : "Easy";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
      borderRadius: 20, background: `${color}15`, border: `1px solid ${color}30`, fontSize: 10, fontWeight: 800, color
    }}>
      <Zap size={10} /> {label} ({level}/10)
    </div>
  );
}

// ── Extended feedback interface ───────────────────────────────────────────────
interface Feedback {
  score: number; grade: string; feedback_summary: string;
  strengths: string[]; improvements: string[]; recommendation: string;
  job_readiness_score?: number;
  avg_score?: number; avg_confidence?: number; avg_depth?: number;
  per_question_scores?: Record<string, EvalResult>;
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function InterviewPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialCompany = searchParams.get("company") || COMPANIES[0];

  const [role, setRole] = useState(ROLES[0]);
  const [company, setCompany] = useState(initialCompany);
  const [interviewType, setInterviewType] = useState("Technical");
  const [numQuestions, setNumQuestions] = useState(5);
  const [phase, setPhase] = useState<"setup" | "active" | "feedback">("setup");
  const [sessionId, setSessionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionNum, setQuestionNum] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(5);
  const [evalHistory, setEvalHistory] = useState<{ q: number; eval: EvalResult }[]>([]);
  const [currentEval, setCurrentEval] = useState<EvalResult | null>(null);
  const [retryingStart, setRetryingStart] = useState(false);
  const [retryingAnswer, setRetryingAnswer] = useState(false);
  const evalPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cameraEnabled && phase !== "feedback") {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(s => setStream(s))
        .catch(() => setCameraEnabled(false));
    } else if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [cameraEnabled, phase]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === "active" && timeLeft > 0 && !loading) {
      timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0 && phase === "active") {
      submitAnswer();
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft, loading]);

  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(120);
      setCurrentEval(null);
      if (voiceEnabled) speakQuestion(currentQuestion);
    }
  }, [currentQuestion]);

  const speakQuestion = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false; rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setAnswer(p => p + (p ? " " : "") + t);
    };
    rec.start();
  };

  const startInterview = async (isRetry = false) => {
    setLoading(true); setError(""); setRetryingStart(false);
    if (!isRetry) trackEvent("interview_started", { role, company, type: interviewType });
    try {
      const token = localStorage.getItem("token") || "";
      const data = await interviewApi.start(role, company, interviewType, token);
      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      setTotalQuestions(data.total_questions || numQuestions);
      setQuestionNum(1);
      setCurrentDifficulty(5);
      setEvalHistory([]);
      setCurrentEval(null);
      setPhase("active");
    } catch (e: any) {
      setError(e.message || "Failed to initialize interview engine.");
      setRetryingStart(true);
    } finally { setLoading(false); }
  };

  const submitAnswer = async (isRetry = false) => {
    if (!answer.trim()) return;
    setLoading(true); setError(""); setRetryingAnswer(false);
    try {
      const token = localStorage.getItem("token") || "";
      const data: any = await interviewApi.answer(answer, sessionId, token);
      setAnswer("");

      // Store per-question eval
      if (data.eval) {
        const ev = data.eval as EvalResult;
        setCurrentEval(ev);
        setEvalHistory(prev => [...prev, { q: questionNum, eval: ev }]);
        setTimeout(() => evalPanelRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
      }

      if (data.status === "completed") {
        setFeedback(data.feedback);
        setPhase("feedback");
      } else {
        setCurrentQuestion(data.question || "End of Session");
        setQuestionNum(data.question_number || questionNum + 1);
        setCurrentDifficulty(data.difficulty || currentDifficulty);
      }
    } catch (e: any) {
      setError(e.message || "Error processing response.");
      setRetryingAnswer(true);
    } finally {
      setLoading(false); setIsListening(false);
    }
  };

  const reset = () => {
    setPhase("setup"); setSessionId(""); setCurrentQuestion("");
    setAnswer(""); setFeedback(null); setError(""); setQuestionNum(1);
    setEvalHistory([]); setCurrentEval(null);
  };

  const getScoreColor = (score: number) => score >= 80 ? "#43E97B" : score >= 60 ? "#FFD93D" : "#FF6B6B";
  const getScoreColor10 = (score: number) => score >= 8 ? "#43E97B" : score >= 5 ? "#FFD93D" : "#FF6B6B";

  // ── Running avg for mini progress bar ───────────────────────────────────────
  const runningAvg = evalHistory.length > 0
    ? Math.round(evalHistory.reduce((sum, e) => sum + e.eval.score, 0) / evalHistory.length * 10)
    : 0;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60, position: "relative" }}>
      <div style={{
        position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
        width: "100%", height: 400,
        background: "radial-gradient(circle at center, rgba(124,58,237,0.05) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: -1
      }} />

      <div style={{ textAlign: "center", marginBottom: 48, padding: "0 10px" }}>
        <h1 className="hero-title" style={{ fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 16, letterSpacing: "-1.5px" }}>
          AI <span className="gradient-text">Interview Engine</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "clamp(15px,2vw,18px)", maxWidth: 580, margin: "0 auto", lineHeight: 1.6 }}>
          RAG-powered real-time evaluation with per-answer scoring, keyword matching, and adaptive difficulty.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* ── SETUP ─────────────────────────────────────────────────────── */}
        {phase === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card card-padding" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)" }}>
                  <BrainCircuit size={20} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Configure Simulation</h2>
              </div>

              {/* Role */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1.5px" }}>Target Career Path</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {ROLES.map(r => (
                    <button key={r} onClick={() => setRole(r)} style={{
                      padding: "10px 18px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                      background: role === r ? "rgba(124,58,237,0.15)" : "transparent",
                      color: role === r ? "var(--brand-primary)" : "var(--text-secondary)",
                      border: `1px solid ${role === r ? "var(--brand-primary)" : "var(--border)"}`,
                    }}>{r}</button>
                  ))}
                </div>
              </div>

              {/* Type Grid */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1.5px" }}>Assessment Domain</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(220px,100%),1fr))", gap: 16 }}>
                  {INTERVIEW_TYPES.map(t => (
                    <TiltCard key={t.id} intensity={5} onClick={() => setInterviewType(t.id)} style={{
                      padding: "20px", cursor: "pointer", textAlign: "left",
                      background: interviewType === t.id ? "rgba(6,182,212,0.08)" : "transparent",
                      border: `1px solid ${interviewType === t.id ? "var(--brand-secondary)" : "var(--border)"}`,
                    }}>
                      <div style={{ color: interviewType === t.id ? "var(--brand-secondary)" : "var(--text-muted)", marginBottom: 12 }}>{t.icon}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: interviewType === t.id ? "white" : "var(--text-primary)" }}>{t.id}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>{t.desc}</div>
                    </TiltCard>
                  ))}
                </div>
              </div>

              {/* Company + Questions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1.5px" }}>Simulated Organization</label>
                  <select value={company} onChange={e => setCompany(e.target.value)} className="input-field" style={{ width: "100%", height: 50, borderRadius: 12, background: "rgba(0,0,0,0.2)" }}>
                    {COMPANIES.map(c => <option key={c} value={c} style={{ background: "#05070D" }}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1.5px" }}>Total Questions</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[3, 5, 8, 10].map(n => (
                      <button key={n} onClick={() => setNumQuestions(n)} style={{
                        flex: 1, padding: "12px", borderRadius: 10,
                        background: numQuestions === n ? "#8B5CF615" : "rgba(255,255,255,0.03)",
                        color: numQuestions === n ? "#8B5CF6" : "var(--text-muted)",
                        border: `1px solid ${numQuestions === n ? "#8B5CF6" : "rgba(255,255,255,0.06)"}`,
                        fontWeight: 700, cursor: "pointer", fontSize: 14
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Voice toggle */}
              <div className="glass-card" style={{ padding: 20, marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", display: "block" }}>VOICE MODE 🎙️</label>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>AI speaks questions aloud · Use mic for answers</p>
                </div>
                <button onClick={() => setVoiceEnabled(!voiceEnabled)} style={{
                  width: 50, height: 26, borderRadius: 20, padding: 4, cursor: "pointer", transition: "all 0.3s",
                  background: voiceEnabled ? "#8B5CF6" : "rgba(255,255,255,0.1)", border: "none"
                }}>
                  <motion.div animate={{ x: voiceEnabled ? 24 : 0 }} style={{ width: 18, height: 18, background: "white", borderRadius: "50%" }} />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => startInterview(false)} disabled={loading} className="btn-primary"
                style={{ width: "100%", padding: 18, borderRadius: 16, fontSize: 16, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 10px 30px rgba(124,58,237,0.2)" }}
              >
                {loading ? "Engaging AI Interlocutor..." : "INITIALIZE INTERVIEW ENGINE"} <ArrowRight size={20} />
              </motion.button>
              
              {retryingStart && (
                 <div style={{ marginTop: 16, background: "rgba(139,92,246,0.05)", borderRadius: 16, border: "1px solid rgba(139,92,246,0.2)" }}>
                    <RetryCountdown seconds={5} onRetry={() => startInterview(true)} message="Network hiccup detected. Resyncing..." />
                 </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── ACTIVE ────────────────────────────────────────────────────── */}
        {phase === "active" && (
          <motion.div key="active" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            {/* Progress bar + metadata */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>Q{questionNum}/{totalQuestions}</span>
                <DifficultyBadge level={currentDifficulty} />
                {evalHistory.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: getScoreColor(runningAvg) }}>
                    <BarChart3 size={12} /> Running Avg: {runningAvg}/100
                  </div>
                )}
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20,
                background: timeLeft < 30 ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.05)",
                color: timeLeft < 30 ? "#F43F5E" : "var(--text-muted)", fontSize: 12, fontWeight: 800
              }}>
                <Timer size={12} /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </div>
            </div>

            {/* Progress track */}
            <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.05)", marginBottom: 24, overflow: "hidden" }}>
              <motion.div
                animate={{ width: `${((questionNum - 1) / totalQuestions) * 100}%` }}
                style={{ height: "100%", background: "linear-gradient(90deg, #8B5CF6, #06B6D4)", borderRadius: 4 }}
              />
            </div>

            <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
              {/* LEFT: Question + Answer */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Question box */}
                <div className="glass-card" style={{ padding: 28, background: "rgba(8,8,18,0.6)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "#8B5CF620", display: "flex", alignItems: "center", justifyContent: "center", color: "#A78BFA", fontSize: 10, fontWeight: 900 }}>AI</div>
                    <span style={{ fontSize: 10, fontWeight: 900, color: "#A78BFA", letterSpacing: 1.5 }}>INTERVIEWER · {role} @ {company}</span>
                  </div>
                  {loading && !currentQuestion ? (
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }}
                      style={{ fontSize: 15, color: "var(--text-muted)" }}>Generating question...</motion.div>
                  ) : (
                    <p style={{ fontSize: 18, fontWeight: 700, color: "white", lineHeight: 1.6, margin: 0 }}>{currentQuestion}</p>
                  )}
                </div>

                {/* Answer textarea */}
                <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", letterSpacing: 1 }}>YOUR RESPONSE</span>
                    <button onClick={startListening} style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                      borderRadius: 20, background: isListening ? "#F43F5E20" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isListening ? "#F43F5E" : "rgba(255,255,255,0.08)"}`,
                      color: isListening ? "#F43F5E" : "var(--text-muted)", fontSize: 11, fontWeight: 700, cursor: "pointer"
                    }}>
                      {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                      {isListening ? "Listening…" : "Voice Input"}
                      {isListening && <VoiceWave active color="#F43F5E" />}
                    </button>
                  </div>
                  <textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Type or use voice input to answer the question…"
                    rows={7}
                    style={{
                      width: "100%", padding: "16px", borderRadius: 12, resize: "vertical",
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                      color: "white", fontSize: 14, lineHeight: 1.7, fontFamily: "inherit", boxSizing: "border-box"
                    }}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => submitAnswer(false)} disabled={loading || !answer.trim()}
                      className="btn-primary"
                      style={{ flex: 1, padding: "14px", borderRadius: 12, fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                      {loading ? (
                        <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} /> Evaluating…</>
                      ) : (
                        <>{questionNum === totalQuestions ? "FINISH INTERVIEW" : "SUBMIT ANSWER"} <ArrowRight size={16} /></>
                      )}
                    </motion.button>
                    <button onClick={reset} style={{
                      padding: "14px 20px", borderRadius: 12, background: "rgba(244,63,94,0.08)",
                      border: "1px solid rgba(244,63,94,0.2)", color: "#F43F5E", fontWeight: 700, fontSize: 12, cursor: "pointer"
                    }}>Leave</button>
                  </div>
                  {error && !retryingAnswer && (
                    <div style={{ fontSize: 12, color: "#F43F5E", padding: "8px 12px", borderRadius: 8, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.15)" }}>
                      ⚠️ {error}
                    </div>
                  )}
                  {retryingAnswer && (
                    <div style={{ marginTop: 8, background: "rgba(139,92,246,0.05)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.2)" }}>
                      <RetryCountdown seconds={5} onRetry={() => submitAnswer(true)} message="Syncing AI response..." />
                    </div>
                  )}
                </div>

                {/* Per-question eval panels */}
                <div ref={evalPanelRef} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <AnimatePresence>
                    {[...evalHistory].reverse().map(({ q, eval: ev }) => (
                      <EvalPanel key={q} eval={ev} questionNum={q} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* RIGHT: AI avatar + tips */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* AI Interviewer card */}
                <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ height: 180, position: "relative", background: "#0c0e14" }}>
                    <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop"
                      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6, filter: "grayscale(100%) contrast(1.2)" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,#0c0e14 0%,transparent 55%)" }} />
                    {isSpeaking && (
                      <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)" }}>
                        <VoiceWave active color="#8B5CF6" />
                      </div>
                    )}
                    <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 11, fontWeight: 800, color: "white" }}>
                      AI Interviewer
                    </div>
                    <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(139,92,246,0.3)", padding: "3px 8px", borderRadius: 20, fontSize: 9, fontWeight: 900, color: "white", letterSpacing: 1 }}>
                      RAG ENGINE
                    </div>
                  </div>
                  <div style={{ padding: 16 }}>
                    <button
                      onClick={() => setVoiceEnabled(!voiceEnabled)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        padding: "8px", borderRadius: 8, background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, cursor: "pointer"
                      }}
                    >
                      {voiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                      {voiceEnabled ? "Voice On" : "Voice Off"}
                    </button>
                  </div>
                </div>

                {/* Performance snapshot */}
                {evalHistory.length > 0 && (
                  <div className="glass-card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", marginBottom: 14, letterSpacing: 1 }}>SESSION METRICS</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {["score", "depth", "confidence_score"].map(key => {
                        const label = key === "confidence_score" ? "Confidence" : key.charAt(0).toUpperCase() + key.slice(1);
                        const avg = evalHistory.reduce((s, e) => s + ((e.eval as any)[key] || 0), 0) / evalHistory.length;
                        const color = avg >= 7 ? "#43E97B" : avg >= 4 ? "#FFD93D" : "#FF6B6B";
                        return (
                          <div key={key}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                              <span style={{ color: "var(--text-muted)" }}>{label}</span>
                              <span style={{ color, fontWeight: 800 }}>{avg.toFixed(1)}/10</span>
                            </div>
                            <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)" }}>
                              <motion.div animate={{ width: `${(avg / 10) * 100}%` }} style={{ height: "100%", background: color, borderRadius: 4 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tip box */}
                <div className="glass-card" style={{ padding: 20, background: "rgba(139,92,246,0.04)" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", marginBottom: 8, letterSpacing: 1 }}>💡 STRATEGY TIP</div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, fontStyle: "italic", lineHeight: 1.6 }}>
                    Use the STAR method (Situation, Task, Action, Result) for behavioral questions. For technical answers, state your approach first, then walk through implementation.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── FEEDBACK ──────────────────────────────────────────────────── */}
        {phase === "feedback" && feedback && (
          <motion.div key="feedback" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Job Readiness Hero */}
            <div className="glass-card card-padding" style={{ textAlign: "center", background: "rgba(255,255,255,0.02)", marginBottom: 24 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} style={{ marginBottom: 20 }}>
                <Award size={72} color={getScoreColor(feedback.job_readiness_score || feedback.score)} style={{ margin: "0 auto", filter: `drop-shadow(0 0 24px ${getScoreColor(feedback.job_readiness_score || feedback.score)}50)` }} />
              </motion.div>

              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", letterSpacing: 2, marginBottom: 8 }}>JOB READINESS SCORE</div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
                <h2 style={{ fontSize: "clamp(64px,15vw,96px)", fontWeight: 900, color: getScoreColor(feedback.job_readiness_score || feedback.score), margin: 0 }}>
                  {feedback.job_readiness_score || feedback.score}
                </h2>
                <span style={{ fontSize: "clamp(18px,4vw,24px)", fontWeight: 700, color: "var(--text-muted)" }}>/100</span>
              </div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", padding: "8px 24px", borderRadius: 30, border: "1px solid var(--border)", margin: "20px 0 32px" }}>
                <span style={{ fontWeight: 900, fontSize: 18, color: getScoreColor(feedback.job_readiness_score || feedback.score) }}>{feedback.grade}</span>
                <span style={{ width: 4, height: 4, background: "var(--text-muted)", borderRadius: "50%" }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{feedback.recommendation}</span>
              </div>

              {/* Aggregate metrics */}
              {(feedback.avg_score || feedback.avg_confidence || feedback.avg_depth) && (
                <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 32 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#8B5CF6" }}>{feedback.avg_score?.toFixed(1)}/10</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>AVG SCORE</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#F59E0B" }}>{feedback.avg_confidence?.toFixed(1)}/10</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>AVG CONFIDENCE</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#06B6D4" }}>{feedback.avg_depth?.toFixed(1)}/10</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>AVG DEPTH</div>
                  </div>
                </div>
              )}

              <p style={{ fontSize: 17, color: "var(--text-primary)", lineHeight: 1.8, maxWidth: 650, margin: "0 auto 40px", fontWeight: 500 }}>
                {feedback.feedback_summary}
              </p>

              <div className="responsive-grid" style={{ gap: 16, textAlign: "left", marginBottom: 40 }}>
                <TiltCard intensity={5} style={{ background: "rgba(67,233,123,0.05)", border: "1px solid rgba(67,233,123,0.2)", padding: 28 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 900, color: "#43E97B", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <TrendingUp size={14} /> Strengths
                  </h3>
                  {feedback.strengths.map((s, i) => (
                    <div key={i} style={{ fontSize: 13, color: "white", marginBottom: 10, display: "flex", gap: 8, lineHeight: 1.5 }}>
                      <span style={{ color: "#43E97B", fontWeight: 900 }}>+</span> {s}
                    </div>
                  ))}
                </TiltCard>
                <TiltCard intensity={5} style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.2)", padding: 28 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 900, color: "#F43F5E", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <BrainCircuit size={14} /> Improvements
                  </h3>
                  {feedback.improvements.map((s, i) => (
                    <div key={i} style={{ fontSize: 13, color: "white", marginBottom: 10, display: "flex", gap: 8, lineHeight: 1.5 }}>
                      <span style={{ color: "#F43F5E", fontWeight: 900 }}>→</span> {s}
                    </div>
                  ))}
                </TiltCard>
              </div>

              {/* Per-question breakdown */}
              {feedback.per_question_scores && Object.keys(feedback.per_question_scores).length > 0 && (
                <div style={{ textAlign: "left", marginBottom: 40 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 16 }}>PER-QUESTION BREAKDOWN</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Object.entries(feedback.per_question_scores).map(([qNum, score]) => (
                      <EvalPanel key={qNum} eval={score as EvalResult} questionNum={parseInt(qNum)} />
                    ))}
                  </div>
                </div>
              )}

              <div className="hero-buttons" style={{ justifyContent: "center" }}>
                <motion.button whileHover={{ scale: 1.04 }} onClick={reset} className="btn-primary"
                  style={{ padding: "16px 40px", borderRadius: 16, fontWeight: 900, width: "100%" }}>
                  Start New Interview
                </motion.button>
                <a href="/dashboard/certificates" style={{ textDecoration: "none", width: "100%" }}>
                  <button className="btn-ghost" style={{ padding: "16px 32px", borderRadius: 16, fontWeight: 700, width: "100%" }}>
                    View Certificates
                  </button>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
