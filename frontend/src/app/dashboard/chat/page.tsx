"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, BotMessageSquare, Sparkles } from "lucide-react";
import { chatApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";

export default function GeneralChatPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [messages, setMessages] = useState<{role: "user" | "ai", content: string}[]>([{
    role: "ai",
    content: "Hello! I am Tulasi AI. I can help you with career planning, technical concepts, mock interviews, or anything else you need. What's on your mind?"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
        setInput(initialQuery);
        // Automatically send the initial query after a brief delay
        const timer = setTimeout(() => {
            handleSend(initialQuery);
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [initialQuery]);

  const handleSend = async (msgOverride?: string) => {
    const textToSend = msgOverride || input;
    if (!textToSend.trim() || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: textToSend }]);
    setLoading(true);

    try {
      // Use general AI chat endpoint
      const res = await chatApi.send(textToSend, "general_assistant");
      const answer = (res as any)?.data?.response || (res as any)?.response || (typeof res === "string" ? res : "I'm sorry, I couldn't process that.");
      setMessages(prev => [...prev, { role: "ai", content: answer }]);
    } catch (err: any) {
      const errorMessage = err?.message || "Sorry, I encountered a network error. Please try again.";
      setMessages(prev => [...prev, { role: "ai", content: `⚠️ ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 80, height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #6366f1, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(99,102,241,0.3)" }}>
          <BotMessageSquare size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px", fontFamily: "var(--font-outfit)" }}>General Assistant</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Your all-in-one career and learning companion</p>
        </div>
      </div>

      {/* Chat Box */}
      <div style={{ flex: 1, minHeight: 500, background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        
        {/* Messages */}
        <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.role === "ai" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600 }}>
                        <Sparkles size={12} color="#8B5CF6" /> Tulasi AI
                    </div>
                )}
                <div style={{
                  background: msg.role === "user" ? "linear-gradient(135deg, #4F46E5, #6366F1)" : "rgba(255,255,255,0.03)",
                  border: msg.role === "ai" ? "1px solid rgba(255,255,255,0.08)" : "none",
                  color: "white",
                  padding: "16px 20px",
                  borderRadius: 20,
                  borderBottomRightRadius: msg.role === "user" ? 4 : 20,
                  borderBottomLeftRadius: msg.role === "ai" ? 4 : 20,
                  maxWidth: "85%",
                  fontSize: 15,
                  lineHeight: 1.6,
                  boxShadow: msg.role === "user" ? "0 8px 20px rgba(79,70,229,0.3)" : "none"
                }}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "16px 20px",
                  borderRadius: 20, borderBottomLeftRadius: 4, width: "fit-content",
                  display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.5)", fontSize: 14
                }}>
                  <Loader2 size={16} className="animate-spin" /> Thinking...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div style={{ padding: 20, borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{
            display: "flex", alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24, padding: "8px 8px 8px 24px", transition: "all 0.2s"
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Ask anything..."
              style={{
                flex: 1, background: "transparent", border: "none", color: "white", outline: "none",
                fontSize: 15, fontFamily: "var(--font-inter)"
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              style={{
                width: 44, height: 44, borderRadius: 22, background: "linear-gradient(135deg, #4F46E5, #EC4899)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                opacity: input.trim() && !loading ? 1 : 0.5,
                boxShadow: input.trim() && !loading ? "0 8px 16px rgba(79,70,229,0.4)" : "none",
                transition: "all 0.2s"
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
