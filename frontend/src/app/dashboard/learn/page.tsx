"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Target, Compass, Code, Wrench, CheckCircle2, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ModelSelector } from "@/components/dashboard/ModelSelector";

export default function LearnModePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleLearn = async () => {
    if (!topic.trim() || loading) return;
    
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/v1/learn/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const container: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item: any = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } };

  const sections = result ? [
    { id: "what", icon: <BookOpen color="#3b82f6" />, title: "What is it?", content: result.what },
    { id: "why", icon: <Target color="#ef4444" />, title: "Why it matters", content: result.why },
    { id: "where", icon: <Compass color="#10b981" />, title: "Where it's used", content: result.where },
    { id: "how", icon: <ArrowRight color="#f59e0b" />, title: "How to learn it", content: result.how },
    { id: "practice", icon: <Code color="#8b5cf6" />, title: "What to practice", content: result.practice },
    { id: "build", icon: <Wrench color="#ec4899" />, title: "What to build", content: result.build },
    { id: "test", icon: <CheckCircle2 color="#14b8a6" />, title: "How to test yourself", content: result.test },
    { id: "next_steps", icon: <Sparkles color="#eab308" />, title: "What comes next", content: result.next_steps },
  ] : [];

  return (
    <motion.div
      initial="hidden" animate="show" variants={container}
      style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 80, paddingTop: 40 }}
    >
      {/* ── Header ── */}
      <motion.div variants={item} style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.5)", fontSize: 14, textDecoration: "none",
            transition: "color 0.2s"
          }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <ModelSelector />
        </div>
        
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 20,
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)",
          color: "#34D399", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em",
          textTransform: "uppercase", marginBottom: 18,
        }}>
          <Sparkles size={13} />
          Phase 6 Intelligence
        </div>

        <h1 style={{
          fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900, color: "white",
          letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14,
          fontFamily: "var(--font-outfit)",
        }}>
          Learn Mode.
        </h1>

        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", maxWidth: 600, lineHeight: 1.6 }}>
          Input any technical concept or skill. The AI will generate a structured teaching sequence answering the fundamental What, Why, Where, and How, guiding you from theory to practice.
        </p>
      </motion.div>

      {/* ── Search Input ── */}
      <motion.div variants={item} style={{ marginBottom: 40 }}>
        <div style={{
          background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24, padding: "12px 12px 12px 24px", display: "flex", alignItems: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLearn()}
            placeholder="e.g., Dynamic Programming, React Server Components, OAuth 2.0"
            style={{
              flex: 1, background: "transparent", border: "none", color: "white",
              fontSize: 16, outline: "none", fontFamily: "var(--font-inter)"
            }}
          />
          <button
            onClick={handleLearn}
            disabled={!topic.trim() || loading}
            style={{
              background: "#4F46E5", color: "white", border: "none",
              padding: "12px 24px", borderRadius: 16, fontSize: 14, fontWeight: 600,
              cursor: (!topic.trim() || loading) ? "not-allowed" : "pointer",
              opacity: (!topic.trim() || loading) ? 0.7 : 1,
              display: "flex", alignItems: "center", gap: 8
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Teach Me
          </button>
        </div>
      </motion.div>

      {/* ── Results ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {sections.map((section, idx) => (
              <div key={idx} style={{
                background: "rgba(30,41,59,0.5)", border: "1px solid rgba(148,163,184,0.1)",
                borderRadius: 20, padding: 24,
                display: "flex", flexDirection: "column", gap: 12
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {React.cloneElement(section.icon as any, { size: 16 })}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "white", letterSpacing: "0.02em" }}>
                    {section.title}
                  </h3>
                </div>
                <p style={{
                  fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6,
                  fontFamily: "var(--font-inter)", whiteSpace: "pre-wrap"
                }}>
                  {section.content}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
