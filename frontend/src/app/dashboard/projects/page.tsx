"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatApi } from "@/lib/api";
import { Lightbulb, Sparkles, Wand2, TerminalSquare, ArrowRight, Save, LayoutTemplate, Copy } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import toast from "react-hot-toast";

export default function ProjectIdeasPage() {
  const [techStack, setTechStack] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techStack.trim() || loading) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please sign in to generate projects.");
      return;
    }

    setLoading(true);
    setGeneratedIdea(null);
    const prompt = `Act as a Senior Y-Combinator level Product Manager and Software Architect. I want to build a portfolio project using the following tech stack: ${techStack}. Please generate 1 unique, impressive, and highly technical SaaS project idea. Format the output with: 
1. Project Name (Catchy & modern)
2. Elevator Pitch (1 sentence)
3. Core Features (3 bullet points)
4. Technical Architecture (Brief overview of how the stack fits together)
Do not include conversational filler, jump straight into the project pitch. Use Markdown.`;

    try {
      // Use the existing chatApi which wraps NEXT_PUBLIC_API_URL and token logic
      const res = await chatApi.send(prompt);
      setGeneratedIdea(res.response);
      toast.success("Awesome project generated!");
    } catch (err: any) {
      toast.error("Failed to generate project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedIdea) {
      navigator.clipboard.writeText(generatedIdea);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 64 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 40 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: "linear-gradient(135deg, #7C3AED, #F43F5E)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 24px rgba(244,63,94,0.3)"
          }}>
            <Lightbulb size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px", margin: 0 }}>
              AI Project Generator
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: "4px 0 0" }}>
              Generate highly technical, portfolio-ready SaaS ideas instantly.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Input Form */}
      <TiltCard>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ padding: 32, marginBottom: 32, position: "relative", overflow: "hidden" }}
        >
          {/* Subtle background glow */}
          <div style={{
            position: "absolute", top: -50, right: -50, width: 150, height: 150,
            background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
            filter: "blur(30px)", zIndex: 0
          }} />

          <form onSubmit={handleGenerate} style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
              <TerminalSquare size={16} color="#06B6D4" /> What's your Tech Stack?
            </label>
            <div style={{ display: "flex", gap: 16, position: "relative" }}>
              <input
                ref={inputRef}
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="e.g. Next.js, FastAPI, PostgreSQL, Redis..."
                disabled={loading}
                style={{
                  flex: 1, padding: "16px 20px", borderRadius: 14,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "white", fontSize: 15, fontFamily: "var(--font-inter)",
                  outline: "none", transition: "all 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--brand-primary)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
              <button
                type="submit"
                disabled={loading || !techStack.trim()}
                className="btn-primary"
                style={{
                  padding: "0 28px", borderRadius: 14, cursor: loading || !techStack.trim() ? "not-allowed" : "pointer",
                  opacity: loading || !techStack.trim() ? 0.6 : 1, display: "flex", alignItems: "center", gap: 8
                }}
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles size={18} />
                  </motion.div>
                ) : (
                  <><Wand2 size={18} /> Generate</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </TiltCard>

      {/* Generated Result Container */}
      <AnimatePresence>
        {generatedIdea && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="glass-card" style={{ padding: "32px", position: "relative" }}>
              <div style={{
                position: "absolute", top: 24, right: 24, display: "flex", gap: 12
              }}>
                <button onClick={copyToClipboard} className="btn-ghost" style={{ padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <Copy size={14} /> Copy
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
                <LayoutTemplate size={20} color="#10B981" />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "white" }}>Your Blueprint</h2>
              </div>

              <div 
                className="prose prose-invert max-w-none"
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.8,
                  fontSize: 15,
                  color: "var(--text-primary)"
                }}
              >
                {/* Normally we would use react-markdown here, but plain text with pre-wrap works beautifully for AI formatting */}
                {generatedIdea.split('\n').map((line, i) => {
                  if (line.startsWith('#')) {
                    const level = line.match(/^#+/)?.[0].length || 1;
                    const text = line.replace(/^#+\s/, '');
                    return <h3 key={i} style={{ fontSize: 22 - level * 2, fontWeight: 800, marginTop: 24, marginBottom: 12, color: level === 1 ? 'var(--brand-secondary)' : 'white' }}>{text}</h3>;
                  }
                  if (line.startsWith('-') || line.startsWith('*')) {
                    return <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, margin: "8px 0" }}><ArrowRight size={16} color="#7C3AED" style={{ marginTop: 6, flexShrink: 0 }} /> <span>{line.substring(1).trim()}</span></div>;
                  }
                  return <p key={i} style={{ margin: "12px 0", color: i === 0 ? "var(--text-secondary)" : "inherit" }}>{line}</p>;
                })}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty / Loading State Skeleton */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card" style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
          >
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--brand-primary)", filter: "blur(12px)" }} />
            </motion.div>
            <p style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 500, animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
              Architecting your next big project...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
