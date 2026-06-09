"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Mic, MicOff, Bot, User, Send, Sparkles, Clock, ChevronRight } from "lucide-react";

const INTERVIEW_TYPES = [
  { id: "technical", label: "Technical", desc: "DSA, System Design, Coding", color: "#8B5CF6" },
  { id: "behavioral", label: "Behavioral", desc: "STAR method, Soft skills", color: "#06B6D4" },
  { id: "hr", label: "HR Round", desc: "Salary, culture fit, career goals", color: "#10B981" },
  { id: "managerial", label: "Managerial", desc: "Leadership, team dynamics", color: "#F59E0B" },
];

interface Message {
  id: number;
  role: "interviewer" | "candidate";
  content: string;
  feedback?: string;
}

const STARTER_QUESTIONS: Record<string, string[]> = {
  technical: ["Tell me about yourself and your technical background.", "Can you explain the difference between a stack and a queue?", "How would you design a URL shortener like bit.ly?", "What is the time complexity of your favorite sorting algorithm?"],
  behavioral: ["Tell me about a time you faced a significant challenge at work.", "Describe a situation where you had to work with a difficult team member.", "Give me an example of when you showed leadership.", "Tell me about your biggest professional failure and what you learned."],
  hr: ["Why are you looking for a new opportunity?", "Where do you see yourself in 5 years?", "What are your salary expectations?", "Why do you want to work at our company?"],
  managerial: ["How do you prioritize tasks when everything is urgent?", "Describe your management style.", "How do you handle underperforming team members?", "Tell me about a successful project you led."],
};

export default function AIInterviewPage() {
  const [phase, setPhase] = useState<"setup" | "interview" | "feedback">("setup");
  const [type, setType] = useState<string>("technical");
  const [role, setRole] = useState("Software Engineer");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (phase === "interview") {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const startInterview = () => {
    const firstQ = STARTER_QUESTIONS[type]?.[0] || "Tell me about yourself.";
    setMessages([{ id: 1, role: "interviewer", content: `Welcome! I'm your AI interviewer today. We'll be conducting a ${type} interview for the ${role} role. Let's begin.\n\n${firstQ}` }]);
    setPhase("interview");
  };

  const sendAnswer = async () => {
    if (!input.trim() || loading) return;
    const answer = input.trim();
    setInput("");
    setMessages(prev => [...prev, { id: Date.now(), role: "candidate", content: answer }]);
    setLoading(true);

    await new Promise(r => setTimeout(r, 1500));
    const nextQ = STARTER_QUESTIONS[type]?.[questionIndex + 1];
    const feedback = `Good answer! You touched on the key points. ${nextQ ? "Let me ask you another question." : "That concludes our interview."}`;
    const nextQuestion = nextQ || "That's all from my end. Do you have any questions for me?";
    setMessages(prev => [...prev,
      { id: Date.now() + 1, role: "interviewer", content: `${feedback}\n\n${nextQuestion}`, feedback: "Strong response — consider adding a specific example next time." }
    ]);
    setQuestionIndex(i => i + 1);
    setLoading(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (phase === "setup") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 720, margin: "0 auto", paddingBottom: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #F43F5E, #E11D48)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(244,63,94,0.4)" }}>
            <Target size={26} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px", fontFamily: "var(--font-outfit)" }}>AI Interviewer</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Practice with an adaptive AI hiring manager</p>
          </div>
        </div>

        <div style={{ padding: 32, borderRadius: 28, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16 }}>Interview Type</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {INTERVIEW_TYPES.map(t => (
              <button key={t.id} onClick={() => setType(t.id)}
                style={{ padding: "18px", borderRadius: 18, border: `2px solid ${type === t.id ? t.color : "rgba(255,255,255,0.08)"}`, background: type === t.id ? `${t.color}10` : "rgba(255,255,255,0.01)", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: type === t.id ? "white" : "rgba(255,255,255,0.6)", marginBottom: 4 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: type === t.id ? t.color : "rgba(255,255,255,0.3)", fontWeight: 500 }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: 32, borderRadius: 28, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16 }}>Role you're preparing for</h2>
          <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer, Data Scientist..."
            style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, color: "white", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
        </div>

        <button onClick={startInterview}
          style={{ width: "100%", padding: "18px", borderRadius: 18, background: "linear-gradient(135deg, #F43F5E, #E11D48)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 14px 28px rgba(244,63,94,0.35)" }}>
          <Target size={20} /> Start Interview
        </button>
      </motion.div>
    );
  }

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", maxWidth: 900, margin: "0 auto" }}>
      {/* Interview Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "0 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #F43F5E, #E11D48)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Target size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "white" }}>AI Interviewer — {INTERVIEW_TYPES.find(t => t.id === type)?.label}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{role}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)" }}>
            <Clock size={13} color="#F43F5E" />
            <span style={{ fontSize: 13, fontWeight: 800, color: "#F43F5E" }}>{formatTime(timer)}</span>
          </div>
          <button onClick={() => setPhase("setup")} style={{ padding: "6px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>End</button>
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, padding: "4px", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
        {messages.map(msg => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: msg.role === "candidate" ? "row-reverse" : "row" }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: msg.role === "interviewer" ? "linear-gradient(135deg, #F43F5E, #E11D48)" : "rgba(255,255,255,0.08)" }}>
              {msg.role === "interviewer" ? <Bot size={18} color="white" /> : <User size={18} color="white" />}
            </div>
            <div style={{ maxWidth: "78%" }}>
              <div style={{ padding: "14px 18px", borderRadius: msg.role === "candidate" ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
                background: msg.role === "candidate" ? "linear-gradient(135deg, #8B5CF6, #7C3AED)" : "rgba(255,255,255,0.04)",
                border: msg.role === "interviewer" ? "1px solid rgba(255,255,255,0.06)" : "none",
                fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {msg.content}
              </div>
              {msg.feedback && (
                <div style={{ marginTop: 8, padding: "8px 14px", borderRadius: 12, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", fontSize: 12, color: "#10B981", fontWeight: 600 }}>
                  💡 {msg.feedback}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg, #F43F5E, #E11D48)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={18} color="white" />
            </div>
            <div style={{ display: "flex", gap: 5, padding: "14px 18px", background: "rgba(255,255,255,0.04)", borderRadius: "20px 20px 20px 6px", border: "1px solid rgba(255,255,255,0.06)" }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "#F43F5E" }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, marginTop: 12 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAnswer(); } }}
          placeholder="Type your answer..." rows={1}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: 14, resize: "none", fontFamily: "inherit", lineHeight: 1.6 }} />
        <button onClick={sendAnswer} disabled={!input.trim() || loading}
          style={{ width: 40, height: 40, borderRadius: 14, background: input.trim() ? "linear-gradient(135deg, #F43F5E, #E11D48)" : "rgba(255,255,255,0.06)", border: "none", cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Send size={16} color={input.trim() ? "white" : "rgba(255,255,255,0.3)"} />
        </button>
      </div>
    </div>
  );
}
