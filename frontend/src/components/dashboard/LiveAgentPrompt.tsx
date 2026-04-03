"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Bot, Command, Mic, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveAgentPrompt({ userName }: { userName: string }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    // Redirect instantly to the Chat engine passing the prompt in the URL.
    // The chat engine will pick up ?q=... and immediately start generating.
    router.push(`/dashboard/chat?q=${encodeURIComponent(query)}`);
  };

  const SUGGESTIONS = [
    "Plan a 3-month AI Engineer roadmap",
    "Conduct a FAANG level mock interview",
    "Review my system design architecture",
    "Explain Transformers like I'm 5",
  ];

  return (
    <div className="glass-card" style={{
      position: "relative",
      padding: "40px",
      borderRadius: "32px",
      background: "linear-gradient(135deg, rgba(20,20,25,0.8) 0%, rgba(10,10,15,0.95) 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center"
    }}>
      {/* Background Orbs */}
      <div style={{ position: "absolute", top: -100, left: -50, width: 300, height: 300, background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: -80, right: -50, width: 250, height: 250, background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 800 }}>
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 style={{ 
            fontSize: "clamp(32px, 5vw, 48px)", 
            fontWeight: 900, 
            fontFamily: "var(--font-outfit)", 
            marginBottom: 16, 
            lineHeight: 1.1,
            background: "linear-gradient(to right, #fff, #a5a5a5)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Hello, <span className="gradient-text">{userName}</span>
          </h1>
          <p style={{ fontSize: 20, color: "var(--text-secondary)", marginBottom: 40, fontWeight: 500 }}>
            How can I engineer your career today?
          </p>
        </motion.div>

        {/* Search Bar Container */}
        <motion.form 
          initial={{ opacity: 0, y: 20, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSubmit}
          style={{ position: "relative", width: "100%", marginBottom: 32 }}
        >
          <div style={{
            position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", gap: 12
          }}>
             <Sparkles size={24} color="#8B5CF6" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a prompt to your neural strategist..."
            style={{
              width: "100%",
              padding: "24px 80px 24px 64px",
              borderRadius: "24px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "18px",
              color: "white",
              outline: "none",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
              transition: "all 0.3s ease"
            }}
            onFocus={(e) => {
              e.target.style.background = "rgba(255,255,255,0.05)";
              e.target.style.borderColor = "rgba(139,92,246,0.5)";
              e.target.style.boxShadow = "0 10px 40px -10px rgba(139,92,246,0.2)";
            }}
            onBlur={(e) => {
              e.target.style.background = "rgba(255,255,255,0.03)";
              e.target.style.borderColor = "rgba(255,255,255,0.08)";
              e.target.style.boxShadow = "0 10px 40px -10px rgba(0,0,0,0.5)";
            }}
          />

          <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 10 }}>
            {/* Pseudo buttons to emulate standard agent inputs */}
            <button type="button" style={{
              width: 36, height: 36, borderRadius: "50%", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Mic size={18} />
            </button>
            <button type="submit" disabled={!query.trim()} style={{
              width: 40, height: 40, borderRadius: "12px", background: query.trim() ? "white" : "rgba(255,255,255,0.1)", color: query.trim() ? "black" : "rgba(255,255,255,0.3)", border: "none", cursor: query.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
            }}>
              <ArrowRight size={20} strokeWidth={3} />
            </button>
          </div>
        </motion.form>

        {/* Action Pills */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}
        >
          {SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => { setQuery(sug); inputRef.current?.focus(); }}
              style={{
                padding: "10px 18px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "100px",
                fontSize: 13,
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 8
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              {sug}
            </button>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
