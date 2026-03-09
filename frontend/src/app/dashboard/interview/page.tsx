"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

interface ChatMsg {
  role: "user" | "ai";
  content: string;
}

interface Feedback {
  score: number;
  feedback_summary: string;
  strengths: string[];
  improvements: string[];
}

export default function InterviewPage() {
  const { data: session } = useSession();
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startInterview = async () => {
    if (!role || !company) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.user?.accessToken}`
        },
        body: JSON.stringify({ role, company })
      });
      const data = await res.json();
      if (res.ok) {
        setSessionId(data.session_id);
        setMessages([{ role: "ai", content: data.question }]);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !sessionId) return;
    
    const answer = inputVal;
    setInputVal("");
    setMessages(prev => [...prev, { role: "user", content: answer }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.user?.accessToken}`
        },
        body: JSON.stringify({ session_id: sessionId, answer })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.status === "completed") {
          setFeedback(data.feedback);
        } else {
          setMessages(prev => [...prev, { role: "ai", content: data.question }]);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  if (!sessionId && !feedback) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", paddingTop: 60 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 16 }}>
          🎯 AI Mock <span className="gradient-text" style={{ background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Interviews</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 40 }}>Practice your behavioral and technical answers with an AI Hiring Manager.</p>
        
        <div className="dash-card" style={{ maxWidth: 600, margin: "0 auto", padding: 40, border: "1px solid rgba(255,107,107,0.3)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Desired Role</label>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Frontend Engineer, Product Manager" className="input-field" style={{ width: "100%", padding: 16, fontSize: 15 }} />
            </div>
            <div>
              <label style={{ display: "block", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Target Company</label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, Stripe, Startup" className="input-field" style={{ width: "100%", padding: 16, fontSize: 15 }} />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={startInterview} disabled={isLoading || !role || !company}
              style={{ background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", color: "white", border: "none", padding: 16, borderRadius: 12, fontSize: 16, fontWeight: 700, marginTop: 12, cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? "Preparing Virtual Room..." : "Start Interview"}
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 24, height: "calc(100vh - 120px)", maxWidth: 1200, margin: "0 auto" }}>
      
      {/* Left Pane: Chat Interface */}
      <div className="dash-card" style={{ flex: 1, padding: 0, display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid rgba(255,107,107,0.3)" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "rgba(255,107,107,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Hiring Manager ({company})</h2>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Interviewing for: {role}</p>
          </div>
          {feedback && <span className="badge badge-green">Completed</span>}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div 
                key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "linear-gradient(135deg, #FF6B6B, #FF8E53)" : "rgba(255,255,255,0.05)",
                  color: "white", padding: "16px 20px", borderRadius: 16,
                  borderBottomRightRadius: m.role === "user" ? 4 : 16, borderTopLeftRadius: m.role === "user" ? 16 : 4,
                  maxWidth: "80%", fontSize: 15, lineHeight: 1.6,
                  border: m.role === "user" ? "none" : "1px solid var(--border)"
                }}
              >
                {m.content}
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && !feedback && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: "flex-start", padding: "12px 16px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: "var(--text-muted)", animation: "bounce 1s infinite" }} />
              <div style={{ width: 8, height: 8, borderRadius: 4, background: "var(--text-muted)", animation: "bounce 1s infinite 0.2s" }} />
              <div style={{ width: 8, height: 8, borderRadius: 4, background: "var(--text-muted)", animation: "bounce 1s infinite 0.4s" }} />
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {!feedback && (
          <form onSubmit={submitAnswer} style={{ padding: 20, borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", display: "flex", gap: 12 }}>
            <input
              value={inputVal} onChange={e => setInputVal(e.target.value)} disabled={isLoading}
              placeholder="Type your response here..."
              style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "0 20px", color: "white", outline: "none", fontSize: 15 }}
              onFocus={e => e.target.style.borderColor = "#FF6B6B"} onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            <button type="submit" disabled={!inputVal.trim() || isLoading} className="btn btn-primary" style={{ background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", padding: "14px 28px", borderRadius: 12, opacity: (!inputVal.trim() || isLoading) ? 0.5 : 1 }}>
              Submit
            </button>
          </form>
        )}
      </div>

      {/* Right Pane: Live Feedback / Score */}
      <div style={{ width: 400, display: "flex", flexDirection: "column", gap: 16 }}>
        {feedback ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="dash-card" style={{ border: "1px solid rgba(67,233,123,0.3)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, textAlign: "center", marginBottom: 24 }}>Interview Results</h3>
            
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 64, fontWeight: 900, fontFamily: "var(--font-outfit)", background: feedback.score >= 80 ? "linear-gradient(135deg,#43E97B,#4ECDC4)" : "linear-gradient(135deg,#FFD93D,#FF6B9D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {feedback.score}%
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 600 }}>{feedback.score >= 80 ? "Strong Hire 🔥" : "Keep Practicing 💪"}</div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 13, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, marginBottom: 8 }}>Overview</h4>
              <p style={{ fontSize: 14, color: "white", lineHeight: 1.6 }}>{feedback.feedback_summary}</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 13, textTransform: "uppercase", color: "#43E97B", fontWeight: 700, marginBottom: 8 }}>Strengths</h4>
              <ul style={{ paddingLeft: 20, margin: 0, color: "white", fontSize: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: 13, textTransform: "uppercase", color: "#FF6B6B", fontWeight: 700, marginBottom: 8 }}>Areas to Improve</h4>
              <ul style={{ paddingLeft: 20, margin: 0, color: "white", fontSize: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            <button onClick={() => { setSessionId(null); setFeedback(null); setMessages([]); }} className="btn btn-secondary" style={{ width: "100%", marginTop: 32, padding: 14, borderRadius: 12 }}>Start New Interview</button>

          </motion.div>
        ) : (
          <div className="dash-card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", border: "1px dashed var(--border)", background: "rgba(255,255,255,0.01)" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📊</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Awaiting Completion</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 250 }}>Complete the interview to receive your AI-generated score, feedback, and improvement plan.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  );
}
