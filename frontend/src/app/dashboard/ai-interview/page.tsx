"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Send, ChevronRight, CheckCircle, Brain, Code2, Users, Rocket,
  ShieldCheck, BotMessageSquare, BarChart3, TrendingUp, AlertTriangle, Star,
  MessageSquare, Clock
} from "lucide-react";
import { interviewApi } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import toast from "react-hot-toast";

// --- Data ---
const INTERVIEW_TYPES = [
  { id: "HR / Behavioral", label: "HR Interview", icon: <Users size={20} />, color: "#8B5CF6", desc: "Culture fit, motivation, career goals" },
  { id: "Technical", label: "Technical", icon: <Code2 size={20} />, color: "#3B82F6", desc: "System design, coding, architecture" },
  { id: "System Design", label: "System Design", icon: <Brain size={20} />, color: "#F59E0B", desc: "Data structures, algorithms, complexity" },
  { id: "Coding", label: "Coding", icon: <BotMessageSquare size={20} />, color: "#10B981", desc: "ML concepts, model design, math" },
];

const ROLES = ["Student / Fresher", "SDE-1", "SDE-2", "Senior Engineer", "Tech Lead", "Product Manager", "Frontend Developer", "Backend Developer", "AI Engineer", "ML Engineer", "Full Stack Developer", "DevOps Engineer"];

interface EvalResult {
  score: number;
  clarity: number;
  relevance: number;
  structure: number;
  depth: number;
  strengths: string[];
  weaknesses: string[];
  missing_keywords: string[];
  improvement_tip: string;
  improved_answer: string;
  summary: string;
  confidence_score: number;
}

interface FinalReport {
  score: number;
  grade: string;
  feedback_summary: string;
  strengths: string[];
  improvements: string[];
  recommendation: string;
  job_readiness_score: number;
  avg_score: number;
  avg_confidence: number;
  avg_depth: number;
}

export default function AIInterviewPage() {
  const { data: session } = useSession();
  const [phase, setPhase] = useState<"setup" | "interview" | "evaluating" | "results">("setup");
  const [interviewType, setInterviewType] = useState("");
  const [role, setRole] = useState("SDE-1");
  const [company, setCompany] = useState("Any Company");
  
  const [sessionId, setSessionId] = useState("");
  const [currentQuestionStr, setCurrentQuestionStr] = useState("");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [totalQ, setTotalQ] = useState(5);
  
  const [answer, setAnswer] = useState("");
  const [evaluations, setEvaluations] = useState<EvalResult[]>([]);
  const [currentEval, setCurrentEval] = useState<EvalResult | null>(null);
  const [report, setReport] = useState<FinalReport | null>(null);
  
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedType = INTERVIEW_TYPES.find(t => t.id === interviewType);

  useEffect(() => {
    if (phase === "interview") {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startInterview = async () => {
    if (!interviewType) return;
    if (!session?.token) {
        toast.error("Please log in to start the interview.");
        return;
    }
    setPhase("evaluating");
    try {
        const res = await interviewApi.start(role, company, interviewType, session.token);
        setSessionId(res.session_id);
        setCurrentQuestionStr(res.question);
        setTotalQ(res.total_questions);
        setCurrentQIndex(0);
        setEvaluations([]);
        setCurrentEval(null);
        setAnswer("");
        setPhase("interview");
    } catch (err: any) {
        toast.error(err.message || "Failed to start interview");
        setPhase("setup");
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || !session?.token) return;
    setPhase("evaluating");
    
    try {
        const res = await interviewApi.answer(answer, sessionId, session.token) as any;
        
        // res.eval contains the per-question evaluation
        if (res.eval) {
            const ev = res.eval as EvalResult;
            setEvaluations(prev => [...prev, ev]);
            setCurrentEval(ev);
        }

        if (res.status === "completed") {
            setReport(res.feedback as FinalReport);
        } else {
            setCurrentQuestionStr(res.question);
        }
        
        setAnswer("");
    } catch (err: any) {
        toast.error(err.message || "Failed to submit answer");
        setPhase("interview");
    }
  };

  const nextQuestion = () => {
    if (report) {
        // Interview is completed
        finishInterview();
    } else {
        setCurrentQIndex(q => q + 1);
        setCurrentEval(null);
        setPhase("interview");
    }
  };

  const finishInterview = async () => {
    setCurrentEval(null);
    setPhase("results");
  };

  const getColor = (score: number) => score >= 80 ? "#10B981" : score >= 65 ? "#F59E0B" : "#F43F5E";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #F43F5E, #BE123C)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(244,63,94,0.4)" }}>
          <Mic size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>AI Interview Simulator</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Real-time evaluation, scoring, and personalized feedback</p>
        </div>
      </div>

      {/* SETUP PHASE */}
      {phase === "setup" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ padding: 32, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 20 }}>Choose Interview Type</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 32 }}>
              {INTERVIEW_TYPES.map(type => (
                <button key={type.id} onClick={() => setInterviewType(type.id)}
                  style={{ padding: "18px", borderRadius: 18, border: `2px solid ${interviewType === type.id ? type.color : "rgba(255,255,255,0.08)"}`, background: interviewType === type.id ? `${type.color}15` : "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                  <span style={{ color: interviewType === type.id ? type.color : "rgba(255,255,255,0.35)", display: "block", marginBottom: 10 }}>{type.icon}</span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 4 }}>{type.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{type.desc}</div>
                </button>
              ))}
            </div>

            <h2 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 12 }}>Experience Level & Role</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              {ROLES.map(r => (
                <button key={r} onClick={() => setRole(r)}
                  style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${role === r ? "#F43F5E" : "rgba(255,255,255,0.1)"}`, background: role === r ? "rgba(244,63,94,0.1)" : "transparent", color: role === r ? "#F43F5E" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  {r}
                </button>
              ))}
            </div>
            
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 12 }}>Target Company (Optional)</h2>
            <input 
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Stripe, Any Company"
              style={{ width: "100%", padding: "14px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "white", marginBottom: 32 }}
            />

            {interviewType && (
              <div style={{ padding: 18, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                  <strong style={{ color: "white" }}>5 questions</strong> in this session
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>~<strong style={{ color: "white" }}>15–25 min</strong> estimated</div>
              </div>
            )}

            <button onClick={startInterview} disabled={!interviewType || !session?.token}
              style={{ width: "100%", padding: "16px", borderRadius: 16, background: interviewType ? "linear-gradient(135deg, #F43F5E, #BE123C)" : "rgba(255,255,255,0.05)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: interviewType ? "pointer" : "not-allowed", opacity: (!interviewType || !session?.token) ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: interviewType ? "0 14px 28px rgba(244,63,94,0.3)" : "none", transition: "all 0.3s" }}>
              <Mic size={20} /> Start Interview
            </button>
            {!session?.token && <p style={{ textAlign: "center", color: "#F87171", fontSize: 13, marginTop: 12 }}>You must be logged in to start an interview.</p>}
          </div>
        </motion.div>
      )}

      {/* INTERVIEW PHASE */}
      {(phase === "interview" || phase === "evaluating") && (
        <div>
          {/* Progress Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentQIndex + (currentEval ? 1 : 0)) / totalQ) * 100}%` }}
                style={{ height: "100%", background: "#F43F5E", borderRadius: 10 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
              {currentQIndex + 1} / {totalQ}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, padding: "6px 12px" }}>
              <Clock size={14} color="#F43F5E" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#F43F5E" }}>{formatTime(timer)}</span>
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div key={currentQIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              style={{ padding: 28, borderRadius: 24, background: `linear-gradient(135deg, ${selectedType?.color}12, rgba(255,255,255,0.01))`, border: `1px solid ${selectedType?.color}30`, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ color: selectedType?.color }}>{selectedType?.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: selectedType?.color, textTransform: "uppercase", letterSpacing: "1px" }}>{selectedType?.label} · Q{currentQIndex + 1}</span>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: "white", lineHeight: 1.5 }}>{currentQuestionStr}</p>
            </motion.div>
          </AnimatePresence>

          {/* Answer / Evaluation Area */}
          {phase === "interview" && !currentEval && (
            <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here... Take your time, think it through."
                style={{ width: "100%", minHeight: 180, background: "transparent", border: "none", color: "white", fontSize: 15, outline: "none", resize: "none", lineHeight: 1.7, fontFamily: "inherit" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12, background: isRecording ? "rgba(244,63,94,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${isRecording ? "rgba(244,63,94,0.3)" : "rgba(255,255,255,0.1)"}`, color: isRecording ? "#F43F5E" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  {isRecording ? <><MicOff size={16} /> Stop Recording</> : <><Mic size={16} /> Voice Answer</>}
                </button>
                <button
                  onClick={submitAnswer}
                  disabled={!answer.trim()}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 14, background: answer.trim() ? "linear-gradient(135deg, #F43F5E, #BE123C)" : "rgba(255,255,255,0.05)", border: "none", color: "white", fontWeight: 800, fontSize: 14, cursor: answer.trim() ? "pointer" : "not-allowed", opacity: !answer.trim() ? 0.5 : 1 }}>
                  Submit Answer <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Evaluation Display */}
          {phase === "evaluating" && !currentEval && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} style={{ marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", border: "3px solid rgba(244,63,94,0.2)", borderTopColor: "#F43F5E" }} />
              </motion.div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15 }}>AI is evaluating your answer...</p>
            </div>
          )}

          {currentEval && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 8 }}>Answer Evaluation</h3>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{currentEval.summary}</p>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: getColor(currentEval.score) }}>{currentEval.score}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>/100</span></div>
                </div>

                <div style={{ padding: 16, borderRadius: 14, background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.15)", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#F43F5E", marginBottom: 8, textTransform: "uppercase" }}>AI Feedback</div>
                  <ul style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, margin: 0, paddingLeft: 16 }}>
                    {currentEval.strengths?.map((s, i) => <li key={`s-${i}`} style={{ color: "#10B981" }}><span style={{ color: "rgba(255,255,255,0.8)" }}>{s}</span></li>)}
                    {currentEval.weaknesses?.map((w, i) => <li key={`w-${i}`} style={{ color: "#F43F5E" }}><span style={{ color: "rgba(255,255,255,0.8)" }}>{w}</span></li>)}
                  </ul>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginTop: 12 }}><strong>Tip:</strong> {currentEval.improvement_tip}</p>
                </div>

                <div style={{ padding: 16, borderRadius: 14, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#10B981", marginBottom: 8, textTransform: "uppercase" }}>💡 Improved Answer Example</div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{currentEval.improved_answer}</p>
                </div>

                <button onClick={nextQuestion}
                  style={{ width: "100%", padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {!report ? <><ChevronRight size={16} /> Next Question</> : <><Star size={16} /> Finish & Get Report</>}
                </button>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* FINAL REPORT PHASE */}
      {phase === "results" && report && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Score Header */}
          <div style={{ padding: 36, borderRadius: 28, background: `linear-gradient(135deg, ${getColor(report.score)}15, rgba(255,255,255,0.01))`, border: `1px solid ${getColor(report.score)}30`, textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: getColor(report.score), textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Overall Interview Score</div>
            <div style={{ fontSize: 80, fontWeight: 900, color: "white", lineHeight: 1 }}>{report.score}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>out of 100 · {selectedType?.label} · {role}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginTop: 16 }}>{report.recommendation} - {report.grade}</div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>{report.feedback_summary}</p>
          </div>

          {/* Trait Scores */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Confidence", val: report.avg_confidence * 10 },
              { label: "Tech Depth", val: report.avg_depth * 10 },
              { label: "Avg Score", val: report.avg_score },
            ].map((metric) => (
              <div key={metric.label} style={{ padding: 20, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 10 }}>{metric.label}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: getColor(metric.val) }}>{metric.val}</div>
                <div style={{ marginTop: 10, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${metric.val}%` }} transition={{ duration: 1, delay: 0.3 }} style={{ height: "100%", background: getColor(metric.val), borderRadius: 10 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* Strengths */}
            <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <TrendingUp size={18} color="#10B981" /> Strengths
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {report.strengths?.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <CheckCircle size={16} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={18} color="#F59E0B" /> Weaknesses
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {report.improvements?.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <AlertTriangle size={16} color="#F59E0B" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => setPhase("setup")}
              style={{ padding: "14px 28px", borderRadius: 14, background: "linear-gradient(135deg, #F43F5E, #BE123C)", color: "white", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 10px 20px rgba(244,63,94,0.3)" }}>
              <Mic size={16} /> Start New Interview
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
