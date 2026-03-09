"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { addMessage, setLoading, setSessionId, clearChat } from "@/store/slices/chatSlice";
import { RootState } from "@/store";
import { useSession } from "next-auth/react";

const SUGGESTIONS = ["Explain Big O notation", "How to prepare for system design interviews?", "Python tips for beginners", "Best roadmap for AI engineering", "Debug this code for me"];

export default function ChatPage() {
  const dispatch = useDispatch();
  const { messages, isLoading, sessionId } = useSelector((s: RootState) => s.chat);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const msg = { id: Date.now().toString(), role: "user" as const, content: input, timestamp: Date.now() };
    dispatch(addMessage(msg));
    const text = input;
    setInput("");
    dispatch(setLoading(true));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });
      const data = await res.json();
      if (data.session_id) dispatch(setSessionId(data.session_id));
      dispatch(addMessage({ id: (Date.now()+1).toString(), role: "assistant", content: data.response || "Error.", timestamp: Date.now() }));
    } catch {
      dispatch(addMessage({ id: (Date.now()+1).toString(), role: "assistant", content: "Connection failed. Is the backend running?", timestamp: Date.now() }));
    } finally { dispatch(setLoading(false)); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", maxWidth: 950, margin: "0 auto", position: "relative" }}>
      <div className="orb orb-purple" style={{ width: 350, height: 350, top: "10%", right: "-5%", opacity: 0.12 }} />

      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px" }}>
            🤖 AI <span className="gradient-text">Chat Assistant</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 5 }}>Context-aware RAG tutor with conversation memory</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="badge badge-green" style={{ padding: "5px 14px" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#43E97B", display: "inline-block" }} /> Online
          </span>
          {messages.length > 0 && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => dispatch(clearChat())}
              className="btn-ghost" style={{ padding: "7px 14px", fontSize: 12, borderRadius: 10 }}>
              Clear Chat
            </motion.button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="glass-card" style={{ flex: 1, overflowY: "auto", padding: "28px", display: "flex", flexDirection: "column", gap: 20, marginBottom: 16, position: "relative", zIndex: 1 }}>
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}
            >
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 80, height: 80, borderRadius: 24, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, boxShadow: "0 20px 40px rgba(108,99,255,0.35)" }}>
                🤖
              </motion.div>
              <div style={{ fontFamily: "var(--font-outfit)", fontSize: 22, fontWeight: 700, textAlign: "center" }}>
                Welcome to <span className="gradient-text">Tulasi AI</span>
              </div>
              <p style={{ color: "var(--text-secondary)", textAlign: "center", maxWidth: 420, lineHeight: 1.65, fontSize: 15 }}>
                Your intelligent learning companion. Ask anything about programming, algorithms, career paths, and more.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                {SUGGESTIONS.map(s => (
                  <motion.button key={s} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setInput(s)}
                    style={{ padding: "9px 16px", borderRadius: 12, border: "1px solid rgba(108,99,255,0.2)", background: "rgba(108,99,255,0.05)", color: "white", fontSize: 12, cursor: "pointer", fontWeight: 500, fontFamily: "var(--font-sans)", transition: "all 0.2s" }}
                  >{s}</motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}>
              {msg.role === "user" ? (
                <div style={{ display: "flex", justifyContent: "flex-end", paddingLeft: "15%" }}>
                  <div className="chat-bubble-user">{msg.content}</div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingRight: "10%" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0, boxShadow: "0 4px 12px rgba(108,99,255,0.3)" }}>🤖</div>
                  <div className="chat-bubble-ai">{msg.content}</div>
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🤖</div>
              <div style={{ padding: "14px 18px", background: "rgba(255,255,255,0.04)", borderRadius: "4px 16px 16px 16px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 6 }}>
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="glass-card" style={{ padding: "8px", borderRadius: 18, display: "flex", gap: 10, alignItems: "flex-end", boxShadow: "0 16px 40px rgba(0,0,0,0.3)", zIndex: 10 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask anything... (Shift+Enter for new line)" rows={1}
          style={{ flex: 1, background: "transparent", border: "none", borderRadius: 12, padding: "14px 18px", color: "white", fontSize: 15, resize: "none", outline: "none", fontFamily: "var(--font-sans)", maxHeight: 180 }}
        />
        <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }} onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          style={{ background: input.trim() ? "var(--gradient-primary)" : "rgba(255,255,255,0.07)", border: "none", borderRadius: 13, width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed", flexShrink: 0, margin: "4px 4px 4px 0", transition: "all 0.25s" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </div>
      <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 11, marginTop: 8 }}>Powered by Gemini Flash · Groq Llama 3 · DeepSeek Coder</p>
    </div>
  );
}
