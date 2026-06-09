"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Bot, User, Sparkles, ArrowRight, Briefcase, Target, BookOpen, TrendingUp } from "lucide-react";

const QUICK_PROMPTS = [
  "What career path is best for a CS student graduating in 2026?",
  "How do I transition from a service company to a product company?",
  "What skills should I build to get into FAANG?",
  "Compare SDE vs Data Science career paths",
];

interface Message {
  id: number;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

const AGENT_INTRO = `Hello! I'm your **Career Copilot** — your personal AI guide for navigating the tech industry.

I can help you with:
- 🎯 **Career path decisions** — SDE, DS, ML, DevOps, and more
- 📈 **Salary & compensation** benchmarks at top companies  
- 🏢 **Company culture & fit** across startups and MNCs
- 🛣️ **Roadmap to your dream role** — step by step

What career challenge can I help you tackle today?`;

export default function CareerCopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "agent", content: AGENT_INTRO, timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000"}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: messageText, agent: "career_copilot", context: "career guidance" }),
      });
      const data = await res.json();
      const reply = data.response || data.message || "I'm processing your request. Let me think about your career goals...";
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "agent", content: reply, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "agent",
        content: "I'm currently in deep analysis mode. Please ensure the backend is running and try again.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: "0 4px" }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #8B5CF6, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(139,92,246,0.4)" }}>
          <MessageSquare size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "white", letterSpacing: "-0.5px", fontFamily: "var(--font-outfit)" }}>
            Career Copilot
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>AI Agent Online</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[{ icon: <Briefcase size={14} />, label: "Career" }, { icon: <Target size={14} />, label: "Goals" }, { icon: <TrendingUp size={14} />, label: "Growth" }].map((tag) => (
            <span key={tag.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#A78BFA", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", padding: "4px 10px", borderRadius: 20 }}>
              {tag.icon} {tag.label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Chat Window */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, padding: "4px 4px 8px", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: msg.role === "agent" ? "linear-gradient(135deg, #8B5CF6, #A855F7)" : "rgba(255,255,255,0.1)",
                boxShadow: msg.role === "agent" ? "0 6px 16px rgba(139,92,246,0.3)" : "none"
              }}>
                {msg.role === "agent" ? <Bot size={18} color="white" /> : <User size={18} color="white" />}
              </div>
              <div style={{ maxWidth: "75%", padding: "14px 18px", borderRadius: msg.role === "user" ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
                background: msg.role === "user" ? "linear-gradient(135deg, #8B5CF6, #7C3AED)" : "rgba(255,255,255,0.04)",
                border: msg.role === "agent" ? "1px solid rgba(255,255,255,0.06)" : "none",
                fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.7, fontWeight: 400,
                whiteSpace: "pre-wrap"
              }}>
                {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg, #8B5CF6, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={18} color="white" />
            </div>
            <div style={{ display: "flex", gap: 5, padding: "16px 20px", background: "rgba(255,255,255,0.04)", borderRadius: "20px 20px 20px 6px", border: "1px solid rgba(255,255,255,0.06)" }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "#8B5CF6" }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 0 8px", scrollbarWidth: "none" }}>
        {QUICK_PROMPTS.map((p) => (
          <button key={p} onClick={() => sendMessage(p)}
            style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 20, border: "1px solid rgba(139,92,246,0.25)", background: "rgba(139,92,246,0.07)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.18)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.07)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}>
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", gap: 12, alignItems: "flex-end", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, marginTop: 4 }}>
        <Sparkles size={18} style={{ color: "#8B5CF6", flexShrink: 0, marginBottom: 6 }} />
        <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="Ask your Career Copilot anything..." rows={1}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: 14, fontWeight: 500, resize: "none", fontFamily: "inherit", lineHeight: 1.6 }} />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          style={{ width: 40, height: 40, borderRadius: 14, background: input.trim() ? "linear-gradient(135deg, #8B5CF6, #7C3AED)" : "rgba(255,255,255,0.06)", border: "none", cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0, boxShadow: input.trim() ? "0 8px 16px rgba(139,92,246,0.3)" : "none" }}>
          <Send size={16} color={input.trim() ? "white" : "rgba(255,255,255,0.3)"} />
        </button>
      </motion.div>
    </div>
  );
}
