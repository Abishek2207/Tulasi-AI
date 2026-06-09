"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Send, ChevronRight, CheckCircle, Brain, Code2, Users, Rocket,
  ShieldCheck, BotMessageSquare, BarChart3, TrendingUp, AlertTriangle, Star,
  MessageSquare, Clock
} from "lucide-react";

// --- Data ---
const INTERVIEW_TYPES = [
  { id: "hr", label: "HR Interview", icon: <Users size={20} />, color: "#8B5CF6", desc: "Culture fit, motivation, career goals" },
  { id: "technical", label: "Technical", icon: <Code2 size={20} />, color: "#3B82F6", desc: "System design, coding, architecture" },
  { id: "dsa", label: "DSA Round", icon: <Brain size={20} />, color: "#F59E0B", desc: "Data structures, algorithms, complexity" },
  { id: "aiml", label: "AI/ML Round", icon: <BotMessageSquare size={20} />, color: "#10B981", desc: "ML concepts, model design, math" },
  { id: "behavioral", label: "Behavioral", icon: <MessageSquare size={20} />, color: "#EC4899", desc: "STAR stories, leadership, conflict" },
  { id: "founder", label: "Founder Pitch", icon: <Rocket size={20} />, color: "#F97316", desc: "Problem, solution, market, traction" },
];

const ROLES = ["Student / Fresher", "SDE-1", "SDE-2", "Senior Engineer", "Tech Lead", "Product Manager"];

const QUESTIONS: Record<string, string[]> = {
  hr: [
    "Tell me about yourself and what motivates you.",
    "Why do you want to join our company specifically?",
    "Where do you see yourself in 5 years?",
    "Describe a time you failed and what you learned from it.",
    "How do you handle working under pressure or tight deadlines?"
  ],
  technical: [
    "Explain the difference between REST and GraphQL APIs.",
    "How would you design a URL shortener like bit.ly at scale?",
    "What is the CAP theorem and how does it apply to distributed systems?",
    "Explain database indexing and when you would use it.",
    "Walk me through how you'd design a rate limiter."
  ],
  dsa: [
    "What is the time complexity of Dijkstra's algorithm and why?",
    "Explain how a HashMap works internally.",
    "How would you find the longest common subsequence of two strings?",
    "Describe the difference between BFS and DFS. When would you use each?",
    "How do you detect a cycle in a linked list?"
  ],
  aiml: [
    "Explain the difference between overfitting and underfitting.",
    "What is the vanishing gradient problem and how do you solve it?",
    "When would you choose Random Forest over a Neural Network?",
    "How does the attention mechanism work in Transformers?",
    "Explain the difference between supervised, unsupervised, and reinforcement learning."
  ],
  behavioral: [
    "Tell me about a time you disagreed with your manager. What did you do?",
    "Describe a situation where you had to deliver a project under a very tight deadline.",
    "Give me an example of a time you showed leadership without having a formal authority.",
    "Tell me about your most impactful project and what made it successful.",
    "Describe a time you had to learn something completely new very quickly."
  ],
  founder: [
    "Explain your product in one sentence as if I'm a 10-year-old.",
    "What evidence do you have that customers actually want this?",
    "Who are your top 3 competitors and what is your unfair advantage?",
    "What does your go-to-market strategy look like for the first 6 months?",
    "If you had to pivot tomorrow, what would you do and why?"
  ]
};

const MOCK_EVALUATIONS: { score: number; feedback: string; improved: string }[] = [
  {
    score: 72,
    feedback: "Good answer with personal context, but lacked concrete quantifiable outcomes. The structure was clear but could be tighter.",
    improved: "I'd recommend using the STAR method: Start with the Situation (team context), the Task (your specific goal), the Action (steps you took), and the Result (measurable outcome — e.g., reduced bug count by 40%, shipped 2 weeks early). This makes your answer memorable and verifiable."
  },
  {
    score: 65,
    feedback: "The answer showed theoretical understanding but lacked real-world application examples. Interviewers at FAANG companies want to see you've dealt with these problems in production.",
    improved: "Anchor your answer in a real or hypothetical production scenario. For example: 'At my last internship, we faced X. I proposed Y solution because of Z trade-off. The result was...' This shows technical maturity."
  },
  {
    score: 85,
    feedback: "Strong answer! You demonstrated clear thinking and acknowledged trade-offs. Minor improvement: be more concise in the opening and lead with the conclusion.",
    improved: "Lead with your conclusion, then support it. Instead of building up to your answer, start with: 'I'd use approach X because of Y' and then explain. This shows confident, structured thinking."
  }
];

interface EvalResult { score: number; feedback: string; improved: string; }
interface FinalReport {
  overallScore: number;
  confidence: number;
  clarity: number;
  technicalDepth: number;
  communication: number;
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string[];
}

export default function AIInterviewPage() {
  const [phase, setPhase] = useState<"setup" | "interview" | "evaluating" | "results">("setup");
  const [interviewType, setInterviewType] = useState("");
  const [role, setRole] = useState("SDE-1");
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluations, setEvaluations] = useState<EvalResult[]>([]);
  const [currentEval, setCurrentEval] = useState<EvalResult | null>(null);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const questions = interviewType ? QUESTIONS[interviewType] || [] : [];
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

  const startInterview = () => {
    if (!interviewType) return;
    setCurrentQ(0);
    setEvaluations([]);
    setCurrentEval(null);
    setAnswer("");
    setPhase("interview");
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setPhase("evaluating");
    await new Promise(r => setTimeout(r, 1800));
    const evalResult = MOCK_EVALUATIONS[evaluations.length % MOCK_EVALUATIONS.length];
    const newEvals = [...evaluations, evalResult];
    setEvaluations(newEvals);
    setCurrentEval(evalResult);
    setAnswer("");
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setCurrentEval(null);
      setPhase("interview");
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    setCurrentEval(null);
    setPhase("evaluating");
    await new Promise(r => setTimeout(r, 2000));
    const avg = evaluations.length > 0 ? Math.round(evaluations.reduce((a, e) => a + e.score, 0) / evaluations.length) : 70;
    setReport({
      overallScore: avg,
      confidence: Math.round(avg * 0.9),
      clarity: Math.round(avg * 0.95),
      technicalDepth: Math.round(avg * 0.85),
      communication: Math.round(avg * 1.05 > 100 ? 100 : avg * 1.05),
      strengths: [
        "Clear and structured communication style",
        "Good understanding of core concepts",
        "Showed awareness of trade-offs in technical decisions"
      ],
      weaknesses: [
        "Answers lack specific quantifiable outcomes",
        "Could improve depth on edge cases and scalability",
        "Hesitation on system design open-ended questions"
      ],
      improvementPlan: [
        "Practice 2 STAR stories per week using a past experience journal",
        "Complete 1 System Design question daily from Grokking the System Design Interview",
        "Record yourself answering questions and self-review for filler words"
      ]
    });
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
              {INTERVIEW_TYPES.map(type => (
                <button key={type.id} onClick={() => setInterviewType(type.id)}
                  style={{ padding: "18px", borderRadius: 18, border: `2px solid ${interviewType === type.id ? type.color : "rgba(255,255,255,0.08)"}`, background: interviewType === type.id ? `${type.color}15` : "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                  <span style={{ color: interviewType === type.id ? type.color : "rgba(255,255,255,0.35)", display: "block", marginBottom: 10 }}>{type.icon}</span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 4 }}>{type.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{type.desc}</div>
                </button>
              ))}
            </div>

            <h2 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 12 }}>Experience Level</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
              {ROLES.map(r => (
                <button key={r} onClick={() => setRole(r)}
                  style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${role === r ? "#F43F5E" : "rgba(255,255,255,0.1)"}`, background: role === r ? "rgba(244,63,94,0.1)" : "transparent", color: role === r ? "#F43F5E" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  {r}
                </button>
              ))}
            </div>

            {interviewType && (
              <div style={{ padding: 18, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                  <strong style={{ color: "white" }}>{questions.length} questions</strong> in this session
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>~<strong style={{ color: "white" }}>15–25 min</strong> estimated</div>
              </div>
            )}

            <button onClick={startInterview} disabled={!interviewType}
              style={{ width: "100%", padding: "16px", borderRadius: 16, background: interviewType ? "linear-gradient(135deg, #F43F5E, #BE123C)" : "rgba(255,255,255,0.05)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: interviewType ? "pointer" : "not-allowed", opacity: !interviewType ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: interviewType ? "0 14px 28px rgba(244,63,94,0.3)" : "none", transition: "all 0.3s" }}>
              <Mic size={20} /> Start Interview
            </button>
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
                animate={{ width: `${((currentQ + (currentEval ? 1 : 0)) / questions.length) * 100}%` }}
                style={{ height: "100%", background: "#F43F5E", borderRadius: 10 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
              {currentQ + 1} / {questions.length}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, padding: "6px 12px" }}>
              <Clock size={14} color="#F43F5E" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#F43F5E" }}>{formatTime(timer)}</span>
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              style={{ padding: 28, borderRadius: 24, background: `linear-gradient(135deg, ${selectedType?.color}12, rgba(255,255,255,0.01))`, border: `1px solid ${selectedType?.color}30`, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ color: selectedType?.color }}>{selectedType?.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: selectedType?.color, textTransform: "uppercase", letterSpacing: "1px" }}>{selectedType?.label} · Q{currentQ + 1}</span>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: "white", lineHeight: 1.5 }}>{questions[currentQ]}</p>
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
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "white" }}>Answer Evaluation</h3>
                  <div style={{ fontSize: 36, fontWeight: 900, color: getColor(currentEval.score) }}>{currentEval.score}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>/100</span></div>
                </div>

                <div style={{ padding: 16, borderRadius: 14, background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.15)", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#F43F5E", marginBottom: 8, textTransform: "uppercase" }}>AI Feedback</div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{currentEval.feedback}</p>
                </div>

                <div style={{ padding: 16, borderRadius: 14, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#10B981", marginBottom: 8, textTransform: "uppercase" }}>💡 Improved Answer Approach</div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{currentEval.improved}</p>
                </div>

                <button onClick={nextQuestion}
                  style={{ width: "100%", padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {currentQ < questions.length - 1 ? <><ChevronRight size={16} /> Next Question</> : <><Star size={16} /> Finish & Get Report</>}
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
          <div style={{ padding: 36, borderRadius: 28, background: `linear-gradient(135deg, ${getColor(report.overallScore)}15, rgba(255,255,255,0.01))`, border: `1px solid ${getColor(report.overallScore)}30`, textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: getColor(report.overallScore), textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Overall Interview Score</div>
            <div style={{ fontSize: 80, fontWeight: 900, color: "white", lineHeight: 1 }}>{report.overallScore}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>out of 100 · {selectedType?.label} · {role}</div>
          </div>

          {/* Trait Scores */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Confidence", val: report.confidence },
              { label: "Clarity", val: report.clarity },
              { label: "Tech Depth", val: report.technicalDepth },
              { label: "Communication", val: report.communication },
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
                {report.strengths.map((s, i) => (
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
                {report.weaknesses.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <AlertTriangle size={16} color="#F59E0B" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Improvement Plan */}
          <div style={{ padding: 28, borderRadius: 24, background: "linear-gradient(135deg, rgba(244,63,94,0.05), rgba(255,255,255,0.01))", border: "1px solid rgba(244,63,94,0.2)", marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart3 size={18} color="#F43F5E" /> Personalized Improvement Plan
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {report.improvementPlan.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 10, background: "#F43F5E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: "white" }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginTop: 4 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={startInterview}
              style={{ padding: "14px 28px", borderRadius: 14, background: "linear-gradient(135deg, #F43F5E, #BE123C)", color: "white", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 10px 20px rgba(244,63,94,0.3)" }}>
              <Mic size={16} /> Retry Interview
            </button>
            <button onClick={() => setPhase("setup")}
              style={{ padding: "14px 28px", borderRadius: 14, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Change Interview Type
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
