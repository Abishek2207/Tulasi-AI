"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { interviewApi } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { TiltCard } from "@/components/ui/TiltCard";
import { 
  Mic, MicOff, Volume2, VolumeX, ArrowRight, CheckCircle2, 
  TrendingUp, BrainCircuit, Terminal, Briefcase, Users, Layout, Timer 
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

interface Feedback {
  score: number;
  grade: string;
  feedback_summary: string;
  strengths: string[];
  improvements: string[];
  recommendation: string;
}

export default function InterviewPage() {
  const { data: session } = useSession();
  const [role, setRole] = useState(ROLES[0]);
  const [company, setCompany] = useState(COMPANIES[0]);
  const [interviewType, setInterviewType] = useState("Technical");
  const [numQuestions, setNumQuestions] = useState(5);
  const [phase, setPhase] = useState<"setup" | "active" | "feedback">("setup");
  const [sessionId, setSessionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionNum, setQuestionNum] = useState(1);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === "active" && timeLeft > 0 && !loading) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && phase === "active") {
      submitAnswer();
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft, loading]);

  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(120);
      if (voiceEnabled) speakQuestion(currentQuestion);
    }
  }, [currentQuestion]);

  const speakQuestion = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAnswer((prev) => prev + (prev ? " " : "") + transcript);
    };
    recognition.start();
  };

  const startInterview = async () => {
    setLoading(true);
    setError("");
    trackEvent("interview_started", { role, company, type: interviewType });
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const data = await interviewApi.start(role, company, interviewType, token);
      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      setQuestionNum(1);
      setPhase("active");
    } catch (e: any) {
      setError(e.message || "Failed to initialize interview engine.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    setError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const data = await interviewApi.answer(answer, sessionId, token);
      setAnswer("");
      if ((data as any).status === "completed") {
        setFeedback((data as any).feedback);
        setPhase("feedback");
      } else {
        setCurrentQuestion(data.next_question || "End of Session");
        if (data.next_question) setQuestionNum((prev) => prev + 1);
        else setPhase("feedback");
      }
    } catch (e: any) {
      setError(e.message || "Error processing response.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPhase("setup");
    setSessionId("");
    setCurrentQuestion("");
    setAnswer("");
    setFeedback(null);
    setError("");
    setQuestionNum(1);
  };

  const getScoreColor = (score: number) => (score >= 80 ? "#43E97B" : score >= 60 ? "#FFD93D" : "#FF6B6B");

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60, position: "relative" }}>
      {/* Background radial gradient */}
      <div style={{ 
        position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", 
        width: "100%", height: 400, background: "radial-gradient(circle at center, rgba(124, 58, 237, 0.05) 0%, transparent 70%)", 
        pointerEvents: "none", zIndex: -1 
      }} />

      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ fontSize: 44, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 16, letterSpacing: "-1.5px" }}>
          AI <span className="gradient-text">Mock Interviews</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 550, margin: "0 auto", lineHeight: 1.6 }}>
          Experience high-fidelity, real-time interviews. Instant scoring across 
          DS&A, behavioral, and system design criteria.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* SETUP PHASE */}
        {phase === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card" style={{ padding: 48, marginBottom: 32, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(124, 58, 237, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)" }}>
                  <Briefcase size={20} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Configure Simulation</h2>
              </div>

              {/* Role Selection */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1.5px" }}>Target Career Path</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      style={{
                        padding: "10px 18px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                        background: role === r ? "rgba(124, 58, 237, 0.15)" : "transparent",
                        color: role === r ? "var(--brand-primary)" : "var(--text-secondary)",
                        border: `1px solid ${role === r ? "var(--brand-primary)" : "var(--border)"}`,
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Grid */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1.5px" }}>Assessment Domain</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                  {INTERVIEW_TYPES.map((t) => (
                    <TiltCard
                      key={t.id}
                      intensity={5}
                      onClick={() => setInterviewType(t.id)}
                      style={{
                        padding: "20px", cursor: "pointer", textAlign: "left",
                        background: interviewType === t.id ? "rgba(6, 182, 212, 0.08)" : "transparent",
                        border: `1px solid ${interviewType === t.id ? "var(--brand-secondary)" : "var(--border)"}`,
                      }}
                    >
                      <div style={{ color: interviewType === t.id ? "var(--brand-secondary)" : "var(--text-muted)", marginBottom: 12 }}>{t.icon}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: interviewType === t.id ? "white" : "var(--text-primary)" }}>{t.id}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>{t.desc}</div>
                    </TiltCard>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1.5px" }}>Simulated Organization</label>
                  <select value={company} onChange={(e) => setCompany(e.target.value)} className="input-field" style={{ width: "100%", height: 50, borderRadius: 12, background: "rgba(0,0,0,0.2)" }}>
                    {COMPANIES.map((c) => <option key={c} value={c} style={{ background: "#05070D" }}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1.5px" }}>Depth: {numQuestions} Stages</label>
                  <input type="range" min={3} max={10} value={numQuestions} onChange={(e) => setNumQuestions(+e.target.value)} style={{ width: "100%", marginTop: 12 }} />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startInterview}
                disabled={loading}
                className="btn-primary"
                style={{ width: "100%", padding: "18px", borderRadius: 16, fontSize: 18, fontWeight: 900, boxShadow: "0 10px 30px rgba(124, 58, 237, 0.2)" }}
              >
                {loading ? "Engaging AI Interlocutor..." : `Begin Session at ${company} →`}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ACTIVE PHASE */}
        {phase === "active" && (
          <motion.div key="active" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--brand-primary)", background: "rgba(124, 58, 237, 0.1)", padding: "4px 12px", borderRadius: 20 }}>{role}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: 20 }}>{company} • {interviewType}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 900 }}>
                PROGRESS: <span style={{ color: "var(--brand-secondary)" }}>{questionNum}/{numQuestions}</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 40, marginBottom: 24, background: "rgba(124, 58, 237, 0.02)", border: "1px solid rgba(124, 58, 237, 0.15)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
                <motion.div 
                  animate={{ boxShadow: ["0 0 0px var(--brand-primary)", "0 0 20px var(--brand-primary)", "0 0 0px var(--brand-primary)"] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}
                >
                  🤖
                </motion.div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: 2 }}>Interviewer Context</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: timeLeft < 30 ? "#FF6B6B" : "white", display: "flex", alignItems: "center", gap: 6 }}>
                      <Timer size={14} /> {timeLeft}s
                    </div>
                  </div>
                  <p style={{ fontSize: 18, lineHeight: 1.7, fontWeight: 600, color: "white", margin: 0 }}>{currentQuestion}</p>
                </div>
              </div>
            </div>

            <div style={{ position: "relative", marginBottom: 24 }}>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Synthesize your response here... (Star Method Recommended)"
                className="input-field"
                style={{ width: "100%", height: 220, padding: "24px", borderRadius: 20, resize: "none", fontSize: 16, lineHeight: 1.7, background: "rgba(0,0,0,0.3)" }}
              />
              <div style={{ position: "absolute", bottom: 20, right: 20, display: "flex", gap: 12 }}>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: voiceEnabled ? "var(--brand-secondary)" : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
                <button
                  onClick={startListening}
                  style={{ width: 44, height: 44, borderRadius: 14, background: isListening ? "#FF6B6B" : "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {isListening ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}><Mic size={20} /></motion.div> : <Mic size={20} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={submitAnswer}
                disabled={loading || !answer.trim()}
                className="btn-primary"
                style={{ flex: 1, padding: "18px", borderRadius: 16, fontWeight: 900, fontSize: 16 }}
              >
                {loading ? "Optimizing Transmission..." : questionNum >= numQuestions ? "Review Evaluation 🏁" : "Proceed →"}
              </motion.button>
              <button onClick={reset} style={{ padding: "0 24px", borderRadius: 16, background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", color: "#FF6B6B", fontWeight: 700, cursor: "pointer" }}>Abort</button>
            </div>
          </motion.div>
        )}

        {/* FEEDBACK PHASE */}
        {phase === "feedback" && feedback && (
          <motion.div key="feedback" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card" style={{ padding: 64, textAlign: "center", background: "rgba(255,255,255,0.02)" }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} style={{ marginBottom: 24 }}>
                <CheckCircle2 size={84} color={getScoreColor(feedback.score)} style={{ margin: "0 auto", filter: `drop-shadow(0 0 20px ${getScoreColor(feedback.score)}40)` }} />
              </motion.div>

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
                <h2 style={{ fontSize: 96, fontWeight: 900, color: getScoreColor(feedback.score), margin: 0 }}>{feedback.score}</h2>
                <span style={{ fontSize: 24, fontWeight: 700, color: "var(--text-muted)" }}>/100</span>
              </div>

              <div style={{ 
                display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", 
                padding: "8px 24px", borderRadius: 30, border: "1px solid var(--border)", margin: "24px 0 40px" 
              }}>
                <span style={{ fontWeight: 900, fontSize: 18, color: getScoreColor(feedback.score) }}>{feedback.grade}</span>
                <span style={{ width: 4, height: 4, background: "var(--text-muted)", borderRadius: "50%" }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{feedback.recommendation}</span>
              </div>

              <p style={{ fontSize: 18, color: "var(--text-primary)", lineHeight: 1.8, maxWidth: 650, margin: "0 auto 48px", fontWeight: 500 }}>
                {feedback.feedback_summary}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24, textAlign: "left", marginBottom: 48 }}>
                <TiltCard intensity={5} style={{ background: "rgba(67, 233, 123, 0.05)", border: "1px solid rgba(67, 233, 123, 0.2)", padding: 32 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 900, color: "#43E97B", textTransform: "uppercase", letterSpacing: 2, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}><TrendingUp size={16} /> Architectural Strengths</h3>
                  {feedback.strengths.map((s, i) => (
                    <div key={i} style={{ fontSize: 14, color: "white", marginBottom: 12, display: "flex", gap: 10, lineHeight: 1.5 }}>
                      <span style={{ color: "#43E97B", fontWeight: 900 }}>+</span> {s}
                    </div>
                  ))}
                </TiltCard>
                <TiltCard intensity={5} style={{ background: "rgba(244, 63, 94, 0.05)", border: "1px solid rgba(244, 63, 94, 0.2)", padding: 32 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 900, color: "#F43F5E", textTransform: "uppercase", letterSpacing: 2, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}><BrainCircuit size={16} /> Technical Improvements</h3>
                  {feedback.improvements.map((s, i) => (
                    <div key={i} style={{ fontSize: 14, color: "white", marginBottom: 12, display: "flex", gap: 10, lineHeight: 1.5 }}>
                      <span style={{ color: "#F43F5E", fontWeight: 900 }}>→</span> {s}
                    </div>
                  ))}
                </TiltCard>
              </div>

              <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                <motion.button whileHover={{ scale: 1.05 }} onClick={reset} className="btn-primary" style={{ padding: "16px 40px", borderRadius: 16, fontWeight: 900 }}>
                  Initialize New Run
                </motion.button>
                <a href="/dashboard/certificates" style={{ textDecoration: "none" }}>
                  <button className="btn-ghost" style={{ padding: "16px 32px", borderRadius: 16, fontWeight: 700 }}>
                    Access Archive
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
