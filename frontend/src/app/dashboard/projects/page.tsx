"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatApi } from "@/lib/api";
import { Lightbulb, Sparkles, Wand2, TerminalSquare, ArrowRight, Save, LayoutTemplate, Copy, Cpu } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import toast from "react-hot-toast";

export default function ProjectIdeasPage() {
  const [techStack, setTechStack] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("Summary");
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
      toast.error("Please sign in to access the Neural Architect.");
      return;
    }

    setLoading(true);
    setGeneratedIdea(null);
    
    // Super-Intelligent Architect Prompt
    const prompt = `Act as a Super-Intelligent AI Software Architect & Product Lead (AGI-level reasoning). 
I want to build an elite portfolio project using: ${techStack}.

Generate a high-fidelity 'Neural Blueprint' with these EXACT sections:
1. [SUMMARY]: A visionary catching name, a 1-sentence elite elevator pitch, and 'The Problem it Solves'.
2. [TECH_STACK]: Detailed breakdown of the stack, why these tools (scalability/perf), and the 'Neural Advantage'.
3. [PRD]: 5 core features with technical implementation logic for each.
4. [ROADMAP]: A 4-phase implementation strategy (Alpha, Beta, v1, Scale).
5. [SCALING]: How this handles 100k+ users and potential AGI-integration points.

Use Markdown for structure but keep it extremely professional and dense with engineering value. No conversational filler.`;

    try {
      const { chatApi } = await import("@/lib/api");
      const res = await chatApi.send(prompt, undefined, "project_architect");
      setGeneratedIdea(res.response);
      toast.success("Neural Blueprint Synthesized.");
    } catch (err: any) {
      console.error("[ProjectIdeas] Handshake failed:", err);
      toast.error("Handshake failed. Retrying Neural Sync...");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedIdea) {
      navigator.clipboard.writeText(generatedIdea);
      toast.success("Blueprint Copied to Memory.");
    }
  };

  // Helper to parse sections with specific markers
  const getSectionContent = (sectionName: string) => {
    if (!generatedIdea) return "";
    // Resilient splitting: handle both [SECTION]: and [SECTION] (case-insensitive)
    const sections = generatedIdea.split(/\[(SUMMARY|TECH_STACK|PRD|ROADMAP|SCALING)\]:?/i);
    const index = sections.findIndex(s => s.toUpperCase() === sectionName.toUpperCase());
    
    if (index !== -1 && sections[index + 1]) {
      return sections[index + 1].trim();
    }
    return generatedIdea; // Fallback
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 30px rgba(124,58,237,0.3)", position: "relative", overflow: "hidden"
          }}>
            <Cpu size={28} color="white" />
            <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} 
              style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: "var(--brand-primary)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Neural Intelligence Layer</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-1px", margin: 0 }}>
              Project <span className="gradient-text">Architect</span>
            </h1>
          </div>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600 }}>
          Synthesize high-fidelity, portfolio-ready SaaS blueprints. Driven by AGI-standard architectural reasoning.
        </p>
      </motion.div>

      {/* Input Form */}
      <TiltCard>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card" style={{ padding: 32, marginBottom: 32, position: "relative", overflow: "hidden" }}>
          <form onSubmit={handleGenerate} style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                <TerminalSquare size={16} color="#06B6D4" /> CORE TECH STACK
              </label>
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 900, color: "var(--brand-primary)" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 12, height: 12, border: "2px solid var(--brand-primary)", borderTopColor: "transparent", borderRadius: "50%" }} />
                  NEURAL SYNC IN PROGRESS...
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <input
                ref={inputRef} type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)}
                placeholder="e.g. Next.js, FastAPI, Supabase, Redis, LLMs..."
                disabled={loading}
                style={{
                  flex: 1, padding: "18px 24px", borderRadius: 16,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "white", fontSize: 16, outline: "none", transition: "all 0.3s"
                }}
              />
              <button type="submit" disabled={loading || !techStack.trim()} className="btn-primary"
                style={{ padding: "0 32px", borderRadius: 16, fontWeight: 900, display: "flex", alignItems: "center", gap: 10 }}>
                <Wand2 size={20} /> INITIALIZE
              </button>
            </div>
          </form>
        </motion.div>
      </TiltCard>

      {/* Results */}
      <AnimatePresence mode="wait">
        {generatedIdea && !loading ? (
          <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Section Tabs */}
              <div style={{ display: "flex", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
                {["SUMMARY", "TECH_STACK", "PRD", "ROADMAP", "SCALING"].map((s) => (
                  <button key={s} onClick={() => setActiveSection(s)}
                    style={{
                      padding: "18px 24px", fontSize: 11, fontWeight: 900, letterSpacing: 1.5, border: "none", cursor: "pointer", transition: "all 0.2s",
                      background: activeSection === s ? "rgba(124,58,237,0.1)" : "transparent",
                      color: activeSection === s ? "white" : "var(--text-muted)",
                      borderBottom: activeSection === s ? "2px solid var(--brand-primary)" : "2px solid transparent"
                    }}>
                    {s.replace("_", " ")}
                  </button>
                ))}
                <div style={{ flex: 1 }} />
                <button onClick={copyToClipboard} style={{ padding: "18px 24px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><Copy size={16} /></button>
              </div>

              {/* Dynamic Content Rendering */}
              <div style={{ padding: 40, minHeight: 400 }}>
                <div className="prose prose-invert max-w-none">
                  {getSectionContent(activeSection).split("\n").map((line, i) => {
                    const isStep = line.match(/^(\d+\.|-|\*)/);
                    const isTitle = line.startsWith("#");
                    
                    if (isTitle) return <h3 key={i} style={{ fontSize: 22, fontWeight: 900, color: "white", marginTop: 24, marginBottom: 16, fontFamily: "var(--font-outfit)" }}>{line.replace(/^#+\s/, "")}</h3>;
                    if (isStep) return (
                      <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                        <div style={{ marginTop: 6 }}><ArrowRight size={14} color="var(--brand-primary)" /></div>
                        <span style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", lineHeight: 1.7 }}>{line.replace(/^(\d+\.|-|\*)\s/, "")}</span>
                      </div>
                    );
                    return <p key={i} style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 16 }}>{line}</p>;
                  })}
                </div>
              </div>

              {/* Footer Badge */}
              <div style={{ padding: "16px 40px", background: "rgba(124,58,237,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 900, color: "var(--brand-primary)", letterSpacing: 1 }}>
                  <Sparkles size={12} /> ARCHITECT QUALITY: ELITE
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>GEN_ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
              </div>
            </div>
          </motion.div>
        ) : loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: 80, textAlign: "center" }}>
            <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Cpu size={64} color="var(--brand-primary)" style={{ opacity: 0.2, marginBottom: 24 }} />
            </motion.div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Synthesizing Architecture...</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Engaging Neural Strategist to build your roadmap.</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
