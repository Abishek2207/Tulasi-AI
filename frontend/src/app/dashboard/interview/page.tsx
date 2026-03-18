"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

import { interviewApi } from "@/lib/api";

const ROLES = [
  "Software Engineer", "AI Engineer", "Data Scientist", "Backend Developer",
  "Frontend Developer", "DevOps Engineer", "Product Manager", "QA Engineer",
  "Cybersecurity Engineer", "Full Stack Developer", "ML Engineer", "Cloud Engineer",
];

const INTERVIEW_TYPES = [
  { id: "Technical", icon: "⚙️", desc: "DSA, problem-solving, and programming concepts" },
  { id: "HR / Behavioral", icon: "🎤", desc: "STAR method, leadership, and culture fit" },
  { id: "System Design", icon: "🏗️", desc: "Architecture, scalability, and design patterns" },
  { id: "Coding", icon: "💻", desc: "Live coding problems and walkthrough" },
];

const COMPANIES = [
  "Google", "Amazon", "Meta", "Apple", "Netflix", "Microsoft",
  "Startup", "Any Company", "TCS", "Infosys", "IBM", "Deloitte",
];

interface Feedback {
  score: number; grade: string; feedback_summary: string;
  strengths: string[]; improvements: string[]; recommendation: string;
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
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === "active" && timeLeft > 0 && !loading) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && phase === "active") {
      submitAnswer(); // Auto-submit when time's up
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft, loading]);

  // Reset timer on new question
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
      setAnswer(prev => prev + (prev ? " " : "") + transcript);
    };
    recognition.start();
  };


  const startInterview = async () => {
    setLoading(true); setError("");
    try {
      const token = (session?.user as any)?.accessToken;
      if (!token) { setError("Please log in to start an interview."); setLoading(false); return; }
      
      const data = await interviewApi.start(role, company, interviewType, token);
      
      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      setQuestionNum(1);
      setPhase("active");
    } catch (e: any) {
      setError(e.message || "Failed to start interview. The backend might be sleeping. Please try again.");
    } finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true); setError("");
    try {
      const token = (session?.user as any)?.accessToken;
      if (!token) throw new Error("Please log in.");
      const data = await interviewApi.answer(answer, sessionId, token);
      
      setAnswer("");
      if ((data as any).status === "completed") {
        setFeedback((data as any).feedback);
        setPhase("feedback");
      } else {
        setCurrentQuestion(data.next_question || "End of Interview");
        if (data.next_question) {
           setQuestionNum(prev => prev + 1);
        } else {
           // Handle end of interview if next_question is missing
           setPhase("feedback");
        }
      }
    } catch (e: any) {
      setError(e.message || "Error submitting answer. The backend might be sleeping. Please try again.");
    } finally { setLoading(false); }
  };

  const reset = () => {
    setPhase("setup"); setSessionId(""); setCurrentQuestion(""); setAnswer(""); setFeedback(null); setError(""); setQuestionNum(1);
  };

  const SCORE_COLOR = (score: number) => score >= 80 ? "#43E97B" : score >= 60 ? "#FFD93D" : "#FF6B6B";
  const GRADE_EMOJI: Record<string, string> = { "Excellent": "🏆", "Good": "👍", "Average": "📊", "Needs Improvement": "📈" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 10 }}>
          AI <span style={{ background: "linear-gradient(135deg, #FFD93D, #FF6B6B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Mock Interviews</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>
          Real AI interviewer. 9 roles. 4 types. Instant scoring & feedback.
        </p>
      </div>

      {error && (
        <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 12, padding: "12px 16px", color: "#FF6B6B", marginBottom: 24, fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* SETUP PHASE */}
        {phase === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="dash-card" style={{ padding: 36, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>🎯 Configure Your Interview</h2>

              {/* Role select */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>Role</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ROLES.map(r => (
                    <button key={r} onClick={() => setRole(r)}
                      style={{
                        padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 600,
                        background: role === r ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.04)",
                        color: role === r ? "#9B95FF" : "var(--text-muted)",
                        border: role === r ? "1px solid rgba(108,99,255,0.4)" : "1px solid rgba(255,255,255,0.07)",
                        transition: "all 0.2s",
                      }}>{r}</button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>Interview Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {INTERVIEW_TYPES.map(t => (
                    <button key={t.id} onClick={() => setInterviewType(t.id)}
                      style={{
                        padding: "12px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                        background: interviewType === t.id ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.03)",
                        border: interviewType === t.id ? "1px solid rgba(78,205,196,0.4)" : "1px solid rgba(255,255,255,0.07)",
                        transition: "all 0.2s",
                      }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: interviewType === t.id ? "#4ECDC4" : "white" }}>{t.id}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Company & Questions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>Company</label>
                  <select value={company} onChange={e => setCompany(e.target.value)} className="input-field">
                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>Questions: {numQuestions}</label>
                  <input type="range" min={3} max={10} value={numQuestions} onChange={e => setNumQuestions(+e.target.value)}
                    style={{ width: "100%", marginTop: 12 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)" }}><span>3 quick</span><span>10 full</span></div>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startInterview} disabled={loading}
                style={{ width: "100%", padding: "16px", borderRadius: 14, background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", border: "none", color: "white", fontWeight: 800, fontSize: 17, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Starting Interview..." : `Start ${interviewType} Interview at ${company} →`}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ACTIVE PHASE */}
        {phase === "active" && (
          <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{role} @ {company} • {interviewType}</span>
              </div>
              <div style={{ background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 700, color: "#9B95FF" }}>
                Q{questionNum}/{numQuestions}
              </div>
            </div>

            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${(questionNum / numQuestions) * 100}%`, background: "linear-gradient(90deg, #6C63FF, #4ECDC4)", borderRadius: 4, transition: "width 0.5s ease" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button 
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    style={{ background: voiceEnabled ? "rgba(78,205,196,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${voiceEnabled ? "#4ECDC4" : "rgba(255,255,255,0.1)"}`, color: voiceEnabled ? "#4ECDC4" : "var(--text-muted)", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    {voiceEnabled ? "🔊 Voice On" : "📁 Voice Off"}
                  </button>
                  {voiceEnabled && (
                    <button onClick={() => speakQuestion(currentQuestion)} style={{ background: "none", border: "none", color: "#6C63FF", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Replay Audio</button>
                  )}
               </div>
               <div style={{ fontSize: 14, fontWeight: 800, color: timeLeft < 30 ? "#FF6B6B" : "#FFD93D", display: "flex", alignItems: "center", gap: 6 }}>
                  ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
               </div>
            </div>

            <div className="dash-card" style={{ padding: 32, marginBottom: 20, background: "rgba(108,99,255,0.05)", border: "1px solid rgba(108,99,255,0.2)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🤖</div>
                <div>
                  <div style={{ fontSize: 12, color: "#9B95FF", fontWeight: 700, marginBottom: 6 }}>AI INTERVIEWER</div>
                  <p style={{ fontSize: 16, lineHeight: 1.65, color: "white", margin: 0 }}>{currentQuestion}</p>
                </div>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <textarea
                value={answer} onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here... Take your time and be thorough."
                style={{
                  width: "100%", minHeight: 160, padding: "16px", borderRadius: 14, resize: "vertical",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "white", fontSize: 15, lineHeight: 1.6, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(108,99,255,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
              <button 
                onClick={startListening}
                style={{ 
                  position: "absolute", bottom: 16, right: 16, width: 40, height: 40, borderRadius: 20, 
                  background: isListening ? "#FF6B6B" : "rgba(108,99,255,0.2)", border: "none", color: "white", 
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  boxShadow: isListening ? "0 0 15px rgba(255,107,107,0.5)" : "none"
                }}
              >
                {isListening ? "🔴" : "🎤"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={submitAnswer} disabled={loading || !answer.trim()}
                style={{ flex: 1, padding: "14px", borderRadius: 12, background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", border: "none", color: "white", fontWeight: 800, fontSize: 16, cursor: "pointer", opacity: loading || !answer.trim() ? 0.6 : 1 }}>
                {loading ? "Processing..." : questionNum >= numQuestions ? "Submit Final Answer 🏁" : "Next Question →"}
              </motion.button>
              <button onClick={reset} style={{ padding: "14px 20px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,107,107,0.3)", color: "#FF6B6B", fontWeight: 600, cursor: "pointer" }}>End</button>
            </div>
          </motion.div>
        )}

        {/* FEEDBACK PHASE */}
        {phase === "feedback" && feedback && (
          <motion.div key="feedback" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="dash-card" style={{ padding: 40, textAlign: "center", marginBottom: 24, background: "rgba(255,255,255,0.02)" }}>

              <div style={{ fontSize: 48, marginBottom: 16 }}>{GRADE_EMOJI[feedback.grade] || "📋"}</div>

              <div style={{ fontSize: 80, fontWeight: 900, color: SCORE_COLOR(feedback.score), lineHeight: 1, marginBottom: 8 }}>{feedback.score}</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 8 }}>/ 100</div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${SCORE_COLOR(feedback.score)}20`, border: `1px solid ${SCORE_COLOR(feedback.score)}50`, borderRadius: 20, padding: "6px 20px", marginBottom: 20 }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: SCORE_COLOR(feedback.score) }}>{feedback.grade}</span>
                <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>• {feedback.recommendation}</span>
              </div>

              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 32px" }}>{feedback.feedback_summary}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, textAlign: "left", marginBottom: 32 }}>
                <div style={{ background: "rgba(67,233,123,0.07)", border: "1px solid rgba(67,233,123,0.2)", borderRadius: 14, padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#43E97B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>✅ Strengths</h3>
                  {feedback.strengths.map((s, i) => (
                    <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 8, display: "flex", gap: 8 }}>
                      <span style={{ color: "#43E97B", flexShrink: 0 }}>+</span> {s}
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(255,107,107,0.07)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 14, padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#FF6B6B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>🎯 Improve</h3>
                  {feedback.improvements.map((s, i) => (
                    <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 8, display: "flex", gap: 8 }}>
                      <span style={{ color: "#FF6B6B", flexShrink: 0 }}>→</span> {s}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <motion.button whileHover={{ scale: 1.04 }} onClick={reset}
                  style={{ padding: "13px 32px", borderRadius: 12, background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", border: "none", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                  🔄 Start New Interview
                </motion.button>
                <a href="/dashboard/certificates" style={{ textDecoration: "none" }}>
                  <button style={{ padding: "13px 28px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    🎓 View Certificates
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
