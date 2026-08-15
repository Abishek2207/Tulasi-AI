"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, BookOpen, Quote } from "lucide-react";

interface PDFChatWidgetProps {
  documentId: number;
}

interface Message {
  role: "user" | "ai";
  content: string;
  citations?: { page: number; content: string }[];
}

export function PDFChatWidget({ documentId }: PDFChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([{
    role: "ai",
    content: "Hi! I have analyzed your document. What would you like to know?"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    
    try {
      const res = await fetch("/api/rag/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: documentId,
          message: userMsg
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { 
          role: "ai", 
          content: data.answer,
          citations: data.citations
        }]);
      } else {
        setMessages(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: "Network error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "rgba(15,23,42,0.6)",
      border: "1px solid rgba(255,255,255,0.05)",
      borderRadius: 24,
      display: "flex",
      flexDirection: "column",
      height: 600,
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", gap: 12
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#818CF8"
        }}>
          <BookOpen size={18} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "white" }}>Document Chat</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Ask questions based on your PDF</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24
      }}>
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
              <div style={{
                background: msg.role === "user" ? "#4F46E5" : "rgba(255,255,255,0.05)",
                color: "white",
                padding: "12px 18px",
                borderRadius: 16,
                borderBottomRightRadius: msg.role === "user" ? 4 : 16,
                borderBottomLeftRadius: msg.role === "ai" ? 4 : 16,
                maxWidth: "85%",
                fontSize: 15,
                lineHeight: 1.6
              }}>
                {msg.content}
              </div>
              
              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div style={{
                  marginTop: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  width: "85%"
                }}>
                  {msg.citations.map((cit, idx) => (
                    <div key={idx} style={{
                      background: "rgba(0,0,0,0.3)",
                      borderLeft: "2px solid #818CF8",
                      padding: "8px 12px",
                      borderRadius: "0 8px 8px 0",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.6)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, color: "#818CF8", fontWeight: 500 }}>
                        <Quote size={12} /> Page {cit.page}
                      </div>
                      <div style={{ fontStyle: "italic" }}>"{cit.content.substring(0, 80)}..."</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{
                background: "rgba(255,255,255,0.05)", padding: "12px 18px",
                borderRadius: 16, borderBottomLeftRadius: 4, width: "fit-content",
                display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.5)"
              }}>
                <Loader2 size={16} className="animate-spin" /> Thinking...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div style={{
        padding: 16, borderTop: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(0,0,0,0.2)"
      }}>
        <div style={{
          display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)",
          borderRadius: 100, padding: "6px 6px 6px 20px"
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Ask about this document..."
            style={{
              flex: 1, background: "transparent", border: "none", color: "white", outline: "none",
              fontSize: 15
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: 36, height: 36, borderRadius: 18, background: "#4F46E5",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              opacity: input.trim() && !loading ? 1 : 0.5
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
