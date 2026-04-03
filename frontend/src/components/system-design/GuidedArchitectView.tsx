"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { intelligenceApi } from "@/lib/api";
import { Sparkles, Send, Brain, ShieldCheck, Cpu, ArrowLeft, Loader2, Lightbulb, ArrowRight } from "lucide-react";

interface Message {
  role: "user" | "architect";
  analysis?: string;
  guidance: string;
  architecture_tip?: string;
  next_step?: string;
}

export function GuidedArchitectView({ problem, onBack }: { problem: any; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "architect",
      guidance: `Greetings, Architect. We are designing: **${problem.title}**. \n\nBefore we dive into the blocks, tell me: what do you anticipate will be the primary bottleneck for this system at 100M MAU?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", guidance: userMsg }]);
    setLoading(true);

    try {
      const response = await intelligenceApi.getSystemDesignSolution(problem.id, userMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: "architect",
          analysis: response.analysis,
          guidance: response.guidance,
          architecture_tip: response.architecture_tip,
          next_step: response.next_step,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "architect", guidance: "I apologize, my neural link is flickering. Could you repeat that architectural concern?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 32, height: "calc(100vh - 200px)", minHeight: 700 }}
    >
      {/* Problem Context */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <button 
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
        >
          <ArrowLeft size={16} /> BACK TO PRACTICE
        </button>

        <div className="glass-card" style={{ padding: 32, flex: 1, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, fontFamily: "var(--font-outfit)" }}>{problem.title}</h2>
            <span style={{ fontSize: 13, fontWeight: 800, padding: "4px 12px", background: "rgba(16,185,129,0.15)", color: "#10B981", borderRadius: 20 }}>
              {problem.difficulty}
            </span>
          </div>
          
          <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 32 }}>
            {problem.description}
          </p>

          <div style={{ display: "grid", gap: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Design constraints</h3>
            {problem.solution_hints.map((hint: string, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                <ShieldCheck size={18} color="#8B5CF6" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{hint}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40, padding: 24, background: "linear-gradient(135deg, rgba(6,182,212,0.1), transparent)", borderRadius: 20, border: "1px solid rgba(6,182,212,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Lightbulb size={20} color="#06B6D4" />
              <span style={{ fontSize: 15, fontWeight: 800 }}>Architect's Focus</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Think about high availability, database partitioning, and how to minimize latency for global users.
            </p>
          </div>
        </div>
      </div>

      {/* Guided Chat Interface */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", border: "1px solid rgba(139,92,246,0.2)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(139,92,246,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6" }}>
              <Brain size={24} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900 }}>Socratic Architect</div>
              <div style={{ fontSize: 11, color: "#8B5CF6", fontWeight: 700 }}>AI MENTOR MODE</div>
            </div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 10px #10B981" }} />
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "90%" }}
            >
              {msg.role === "architect" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {msg.analysis && (
                    <div style={{ padding: "16px", background: "rgba(0,0,0,0.3)", borderRadius: "16px 16px 16px 4px", fontSize: 14, color: "var(--text-secondary)", fontStyle: "italic", borderLeft: "3px solid #8B5CF6" }}>
                      {msg.analysis}
                    </div>
                  )}
                  <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.05)", borderRadius: "16px 16px 16px 4px", fontSize: 15, lineHeight: 1.6, color: "white" }}>
                    {msg.guidance}
                  </div>
                  {msg.architecture_tip && (
                    <div style={{ padding: "12px 16px", background: "rgba(16,185,129,0.1)", borderRadius: 12, border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "start", gap: 10 }}>
                      <Cpu size={16} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div style={{ fontSize: 13, color: "#10B981", fontWeight: 600 }}>{msg.architecture_tip}</div>
                    </div>
                  )}
                  {msg.next_step && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      <ArrowRight size={14} /> Next: {msg.next_step}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: "16px 20px", background: "var(--brand-primary)", borderRadius: "16px 16px 4px 16px", fontSize: 15, color: "white", fontWeight: 600, boxShadow: "0 4px 15px rgba(139,92,246,0.3)" }}>
                  {msg.guidance}
                </div>
              )}
            </motion.div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, width: "fit-content" }}>
              <Loader2 size={18} className="animate-spin" color="var(--brand-primary)" />
              <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Philosophizing...</span>
            </div>
          )}
        </div>

        <div style={{ padding: "24px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid var(--border)" }}>
          <div style={{ position: "relative" }}>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Propose your solution or ask a concern..."
              style={{ width: "100%", padding: "16px 60px 16px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 16, color: "white", fontSize: 15 }}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: 10, background: loading || !input.trim() ? "rgba(255,255,255,0.1)" : "var(--brand-primary)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: loading || !input.trim() ? "not-allowed" : "pointer" }}
            >
              <Send size={18} />
            </button>
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
             <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>PRESS ENTER TO SEND &bull; ARCHITECT IS THINKING SOCKRATICALLY</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
