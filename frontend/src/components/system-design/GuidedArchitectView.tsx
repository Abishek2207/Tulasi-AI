"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { intelligenceApi } from "@/lib/api";
import {
  Sparkles, Send, Brain, ShieldCheck, Cpu, ArrowLeft,
  Loader2, Lightbulb, ArrowRight, RefreshCw, ChevronDown
} from "lucide-react";

function RetryCountdown({ seconds, onRetry, message = "Neural Sync in Progress..." }: { seconds: number; onRetry: () => void; message?: string }) {
  const [count, setCount] = useState(seconds);
  useEffect(() => {
    if (count <= 0) { onRetry(); return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onRetry]);
  const pct = ((seconds - count) / seconds) * 100;
  return (
    <div style={{ padding: "14px 18px", borderRadius: 14, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", gap: 14, width: "fit-content" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
        <RefreshCw size={18} color="#8B5CF6" />
      </motion.div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "white", marginBottom: 4 }}>{message}</div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden", width: 120 }}>
          <motion.div animate={{ width: `${pct}%` }} style={{ height: "100%", background: "linear-gradient(90deg,#8B5CF6,#06B6D4)", borderRadius: 10 }} />
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 900, color: "#8B5CF6", width: 20 }}>{count}s</div>
    </div>
  );
}

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
  const [retrying, setRetrying] = useState(false);
  const [lastFailedMsg, setLastFailedMsg] = useState("");
  const [showContext, setShowContext] = useState(false); // mobile: toggle problem context
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (isRetry = false) => {
    let userMsg = input;
    if (!isRetry) {
      if (!input.trim() || loading) return;
      setInput("");
      setMessages((prev) => [...prev, { role: "user", guidance: userMsg }]);
    } else {
      userMsg = lastFailedMsg;
    }
    setLoading(true);
    setRetrying(false);

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
      setLastFailedMsg("");
    } catch {
      setLastFailedMsg(userMsg);
      setRetrying(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ height: "calc(100vh - 120px)", minHeight: 600, display: "flex", flexDirection: "column", gap: 0 }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, fontWeight: 700, marginBottom: 20, padding: 0, width: "fit-content" }}
      >
        <ArrowLeft size={16} /> BACK TO SYSTEM DESIGN
      </button>

      {/* Main layout: two columns on desktop, stacked on mobile */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr", gap: 20, minHeight: 0 }}>
        {/* Problem context panel */}
        <style>{`
          @media (min-width: 900px) {
            .sd-grid { grid-template-columns: 1fr 1.3fr !important; }
            .sd-context-toggle { display: none !important; }
            .sd-context-panel { display: flex !important; }
          }
          @media (max-width: 899px) {
            .sd-context-panel { display: ${showContext ? "flex" : "none"} !important; }
          }
        `}</style>

        <div className="sd-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, flex: 1, height: "100%" }}>
          {/* Context Panel (desktop visible, mobile toggle) */}
          <button
            className="sd-context-toggle"
            onClick={() => setShowContext(p => !p)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 700, fontSize: 13 }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Lightbulb size={16} color="#06B6D4" /> Problem Context
            </span>
            <motion.div animate={{ rotate: showContext ? 180 : 0 }}>
              <ChevronDown size={16} />
            </motion.div>
          </button>

          <div className="sd-context-panel" style={{ flexDirection: "column", gap: 20, overflowY: "auto" }}>
            <div className="glass-card" style={{ padding: 28, flex: 1, overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <h2 style={{ fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 900, fontFamily: "var(--font-outfit)", lineHeight: 1.2 }}>{problem.title}</h2>
                {problem.difficulty && (
                  <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 12px", background: "rgba(16,185,129,0.15)", color: "#10B981", borderRadius: 20, flexShrink: 0, marginLeft: 12 }}>
                    {problem.difficulty}
                  </span>
                )}
              </div>

              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 28 }}>
                {problem.description}
              </p>

              {problem.solution_hints?.length > 0 && (
                <div style={{ display: "grid", gap: 10 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Design Constraints</h3>
                  {problem.solution_hints.map((hint: string, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <ShieldCheck size={16} color="#8B5CF6" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{hint}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 32, padding: 20, background: "linear-gradient(135deg, rgba(6,182,212,0.08), transparent)", borderRadius: 16, border: "1px solid rgba(6,182,212,0.18)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Lightbulb size={18} color="#06B6D4" />
                  <span style={{ fontSize: 14, fontWeight: 800 }}>Architect's Focus</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  Think about high availability, database partitioning, and how to minimize latency for global users. Cover bottlenecks, SPOFs, and data consistency tradeoffs.
                </p>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", border: "1px solid rgba(139,92,246,0.2)", minHeight: "60vh" }}>
            {/* Chat Header */}
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(139,92,246,0.05)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6" }}>
                  <Brain size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>Socratic Architect</div>
                  <div style={{ fontSize: 10, color: "#8B5CF6", fontWeight: 700, letterSpacing: 1 }}>AI MENTOR MODE</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 10px #10B981" }} />
                <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700 }}>ONLINE</span>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 18 }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "92%" }}
                >
                  {msg.role === "architect" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {msg.analysis && (
                        <div style={{ padding: "14px 16px", background: "rgba(0,0,0,0.25)", borderRadius: "14px 14px 14px 4px", fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic", borderLeft: "3px solid #8B5CF6", lineHeight: 1.6 }}>
                          {msg.analysis}
                        </div>
                      )}
                      <div style={{ padding: "14px 18px", background: "rgba(255,255,255,0.05)", borderRadius: "14px 14px 14px 4px", fontSize: 14, lineHeight: 1.7, color: "white" }}>
                        {msg.guidance}
                      </div>
                      {msg.architecture_tip && (
                        <div style={{ padding: "10px 14px", background: "rgba(16,185,129,0.08)", borderRadius: 10, border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "start", gap: 8 }}>
                          <Cpu size={14} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div style={{ fontSize: 12, color: "#10B981", fontWeight: 600, lineHeight: 1.5 }}>{msg.architecture_tip}</div>
                        </div>
                      )}
                      {msg.next_step && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}>
                          <ArrowRight size={12} /> Next: {msg.next_step}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: "14px 18px", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", borderRadius: "14px 14px 4px 14px", fontSize: 14, color: "white", fontWeight: 600, lineHeight: 1.6, boxShadow: "0 4px 15px rgba(139,92,246,0.3)" }}>
                      {msg.guidance}
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && !retrying && (
                <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 10, width: "fit-content" }}>
                  <Loader2 size={16} className="animate-spin" color="#8B5CF6" />
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Thinking architecturally...</span>
                </div>
              )}
              {retrying && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <RetryCountdown seconds={5} onRetry={() => handleSend(true)} message="Reconnecting Architect..." />
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: "18px 20px", background: "rgba(0,0,0,0.15)", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ position: "relative" }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(false); } }}
                  placeholder="Propose your solution or ask a concern... (Enter to send)"
                  rows={2}
                  style={{ width: "100%", padding: "14px 56px 14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 14, color: "white", fontSize: 14, resize: "none", boxSizing: "border-box", lineHeight: 1.6 }}
                />
                <button
                  onClick={() => handleSend(false)}
                  disabled={loading || !input.trim() || retrying}
                  style={{ position: "absolute", right: 12, bottom: 12, width: 38, height: 38, borderRadius: 10, background: loading || !input.trim() ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #8B5CF6, #6D28D9)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: loading || !input.trim() ? "not-allowed" : "pointer", transition: "all 0.15s" }}
                >
                  <Send size={16} />
                </button>
              </div>
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, margin: 0 }}>
                  ENTER TO SEND · SHIFT+ENTER FOR NEW LINE · ARCHITECT IS THINKING SOCRATICALLY
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
