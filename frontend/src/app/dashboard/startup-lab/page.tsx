"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import ReactMarkdown from "react-markdown";
import { startupApi, StartupIdea as ApiStartupIdea } from "@/lib/api";
import { TiltCard } from "@/components/ui/TiltCard";
import { 
  Rocket, Lightbulb, Users, BarChart3, 
  Sparkles, CheckCircle2, Save, History, 
  ArrowRight, Zap, Target, Globe
} from "lucide-react";

interface DisplayStartupIdea {
  name: string;
  problem: string;
  solution: string;
  market_opportunity: string;
  tech_stack: string[];
  monetization: string;
}

interface DisplaySavedIdea extends DisplayStartupIdea {
  id: number;
  domain: string;
  created_at: string;
}

export default function StartupLabPage() {
  const { data: session } = useSession();
  const [domain, setDomain] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState<DisplayStartupIdea | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState<DisplaySavedIdea[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [pitchDeck, setPitchDeck] = useState<string | null>(null);
  const [generatingDeck, setGeneratingDeck] = useState(false);

  const domains = [
    "Artificial Intelligence", "EdTech", "FinTech", "HealthTech", 
    "Web3 & Crypto", "E-Commerce", "SaaS", "Gaming", 
    "ClimateTech", "Developer Tools"
  ];

  const audiences = [
    "University Students", "Software Engineers", "Small Businesses", 
    "Remote Workers", "Healthcare Professionals", "Gamers", 
    "Event Organizers", "Content Creators"
  ];

  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const fetchSavedIdeas = async () => {
    try {
      const data = await startupApi.ideas(token);
      setSavedIdeas((data.ideas as unknown as DisplaySavedIdea[]) || []);
    } catch (e) {}
  };

  useEffect(() => { if (session) fetchSavedIdeas(); }, [session]);

  const saveIdea = async () => {
    if (!idea) return;
    setSaving(true);
    try {
      await startupApi.save({ ...idea, domain } as any, token);
      setSaved(true); 
      fetchSavedIdeas();
    } catch (e) {}
    setSaving(false);
  };

  const handleGenerate = async () => {
    if (!domain || !audience) {
      setError("Please select both a domain and a target audience.");
      return;
    }
    setError("");
    setLoading(true);
    setIdea(null);
    setPitchDeck(null);

    try {
      const { chatApi, extractAndParseJson } = await import("@/lib/api");
      
      const message = `Generate a startup idea in the domain of ${domain} for an audience of ${audience}.
      Provide a detailed idea including name, problem, solution, market opportunity, tech stack, and monetization strategy in the required JSON structure.`;

      const response = await chatApi.send(message, undefined, "startup_lab");
      
      const data = extractAndParseJson<any>(response.response, { 
        name: "Idea Generating...", 
        problem: "", 
        solution: "", 
        market_opportunity: "", 
        tech_stack: [], 
        monetization: "" 
      });
      
      // Handle cases where the AI might return the idea directly or wrapped in 'idea'
      const ideaContent = data.idea || data;
      if (!ideaContent || !ideaContent.name) {
        throw new Error("Invalid startup idea structure received.");
      }

      setIdea(ideaContent as DisplayStartupIdea);
      setSaved(false);
    } catch (err: any) {
      console.error("[StartupLab] Generation failed:", err);
      setError(err.message || "Failed to reach the AI servers.");
    }
    setLoading(false);
  };

  const handleGenerateDeck = async () => {
    if (!idea) return;
    setGeneratingDeck(true);
    setError("");
    try {
      const res = await startupApi.generatePitchDeck({
        name: idea.name,
        problem: idea.problem,
        solution: idea.solution,
        market_opportunity: idea.market_opportunity,
        monetization: idea.monetization
      }, token);
      setPitchDeck(res.pitch_deck);
      // Wait a bit to scroll
      setTimeout(() => {
        const el = document.getElementById("pitch-deck-container");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setError("Failed to generate pitch deck. AI might be busy.");
    }
    setGeneratingDeck(false);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      <style>{`
        @media print {
          .dash-sidebar, .dash-topbar, .btn-primary, .btn-ghost, .no-print, .no-print * {
            display: none !important;
          }
          body { background: white !important; color: black !important; }
          .dash-main, .dash-content { margin: 0 !important; padding: 0 !important; max-width: none !important; }
          .glass-card { background: white !important; border: none !important; box-shadow: none !important; color: black !important; padding: 0 !important; }
          h1, h2, h3, h4, .gradient-text { background: none !important; -webkit-text-fill-color: black !important; color: black !important; }
          .prose h2 { page-break-before: always; margin-top: 40px; border-bottom: 2px solid #EEE; padding-bottom: 10px; }
          .prose h2:first-child { page-break-before: auto; }
        }
      `}</style>
      
      {/* Header */}
      <div style={{ marginBottom: 48, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
           <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #F97316, #FB923C)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(249,115,22,0.3)" }}>
              <Rocket size={22} color="white" />
           </div>
           <span style={{ fontSize: 13, fontWeight: 900, color: "#F97316", textTransform: "uppercase", letterSpacing: 2 }}>Incubator Engine</span>
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-1.5px", marginBottom: 12 }}>
          Startup <span className="gradient-text">Ideation LAB</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 700, lineHeight: 1.6 }}>
          Zero-to-One velocity. Our AI analyzes market gaps in real-time to generate 
          high-fidelity business plans and technical architectures.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 48 }}>
        {/* Domain Selection */}
        <TiltCard intensity={5}>
          <div className="glass-card" style={{ padding: 32, height: "100%", background: "rgba(255,255,255,0.02)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, marginBottom: 24, display: "flex", alignItems: "center", gap: 10, color: "var(--text-primary)" }}>
              <Globe size={16} color="#F97316" /> 01. SELECT MARKET DOMAIN
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {domains.map(d => (
                <button 
                  key={d} 
                  onClick={() => setDomain(d)}
                  style={{ 
                    padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                    background: domain === d ? "#F9731615" : "rgba(255,255,255,0.03)",
                    color: domain === d ? "#F97316" : "var(--text-muted)",
                    border: `1px solid ${domain === d ? "#F97316" : "rgba(255,255,255,0.06)"}`
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </TiltCard>

        {/* Audience Selection */}
        <TiltCard intensity={5}>
          <div className="glass-card" style={{ padding: 32, height: "100%", background: "rgba(255,255,255,0.02)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, marginBottom: 24, display: "flex", alignItems: "center", gap: 10, color: "var(--text-primary)" }}>
              <Users size={16} color="#FB923C" /> 02. TARGET AUDIENCE
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {audiences.map(a => (
                <button 
                  key={a} 
                  onClick={() => setAudience(a)}
                  style={{ 
                    padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                    background: audience === a ? "#FB923C15" : "rgba(255,255,255,0.03)",
                    color: audience === a ? "#FB923C" : "var(--text-muted)",
                    border: `1px solid ${audience === a ? "#FB923C" : "rgba(255,255,255,0.06)"}`
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Action Button */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        {error && <div style={{ color: "#F43F5E", marginBottom: 16, fontSize: 14, fontWeight: 700 }}>{error}</div>}
        <motion.button 
          whileHover={{ scale: 1.02, y: -2 }} 
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={loading || !domain || !audience}
          className="btn-primary"
          style={{ 
            background: "linear-gradient(135deg, #F97316, #FB923C)", 
            padding: "18px 48px", borderRadius: 16, fontSize: 16, fontWeight: 900, 
            boxShadow: "0 12px 32px rgba(249,115,22,0.3)", opacity: (loading || !domain || !audience) ? 0.6 : 1
          }}
        >
          {loading ? "BRACING FOR IMPACT..." : "INITIALIZE GENERATION SEQUENCE"}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: 60 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ width: 44, height: 44, border: "4px solid rgba(249,115,22,0.1)", borderTopColor: "#F97316", borderRadius: "50%", margin: "0 auto 24px" }} />
            <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Synthesizing Business Intelligence...</div>
            <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Analyzing market signals for {audience} in {domain}.</p>
          </motion.div>
        )}

        {idea && !loading && (
          <motion.div initial={{ opacity: 0, scale: 0.98, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
            <TiltCard intensity={3}>
              <div className="glass-card" style={{ padding: 0, overflow: "hidden", border: "1px solid rgba(249,115,22,0.3)" }}>
                <div style={{ background: "linear-gradient(135deg, #F97316, #FB923C)", padding: "48px 40px", textAlign: "center", position: "relative" }}>
                  <div style={{ position: "absolute", top: 20, right: 20, padding: "6px 14px", borderRadius: 12, background: "rgba(0,0,0,0.2)", fontSize: 11, fontWeight: 900, color: "white", letterSpacing: 1 }}>UNICORN POTENTIAL</div>
                  <h2 style={{ fontSize: 44, fontWeight: 900, color: "white", marginBottom: 12, fontFamily: "var(--font-outfit)", letterSpacing: "-1.5px" }}>{idea.name}</h2>
                  <p style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>The definitive operating system for {audience.toLowerCase()}.</p>
                </div>

                <div style={{ padding: 48, display: "flex", flexDirection: "column", gap: 40 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                    <div>
                      <h3 style={{ fontSize: 12, fontWeight: 900, color: "#F97316", letterSpacing: 2, marginBottom: 16 }}>THE PROBLEM</h3>
                      <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.85)" }}>{idea.problem}</p>
                    </div>
                    <div>
                      <h3 style={{ fontSize: 12, fontWeight: 900, color: "#10B981", letterSpacing: 2, marginBottom: 16 }}>THE SOLUTION</h3>
                      <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.85)" }}>{idea.solution}</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, padding: 32, background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                       <h3 style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 12 }}>MARKET DEPTH</h3>
                       <p style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600 }}>{idea.market_opportunity}</p>
                    </div>
                    <div style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: 32 }}>
                       <h3 style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 12 }}>REVENUE MODEL</h3>
                       <p style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600 }}>{idea.monetization}</p>
                    </div>
                  </div>

                  <div>
                     <h3 style={{ fontSize: 12, fontWeight: 900, color: "#8B5CF6", letterSpacing: 2, marginBottom: 20 }}>STEROID ARCHITECTURE</h3>
                     <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {idea.tech_stack.map(tech => (
                          <div key={tech} style={{ padding: "10px 18px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 12, fontSize: 13, fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: 8 }}>
                             <Zap size={14} color="#8B5CF6" /> {tech}
                          </div>
                        ))}
                     </div>
                  </div>

                  <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                    {!saved ? (
                      <button onClick={saveIdea} disabled={saving} className="btn-primary" style={{ flex: 1, padding: "16px", borderRadius: 14, background: "rgba(251,191,36,0.08)", border: "1px solid #FBBF2440", color: "#FBBF24", fontWeight: 900, fontSize: 14 }}>
                        {saving ? "SAVING BLUEPRINT..." : "💾 PERSIST TO ARCHIVE"}
                      </button>
                    ) : (
                      <div style={{ flex: 1, padding: "16px", borderRadius: 14, background: "rgba(16,185,129,0.1)", color: "#10B981", fontWeight: 900, fontSize: 14, textAlign: "center" }}>✅ ARCHIVED SUCCESSFULLY</div>
                    )}
                    <button onClick={() => window.print()} className="btn-ghost" style={{ flex: 1, padding: "16px 24px", borderRadius: 14, fontSize: 14, fontWeight: 900 }}>SHARE PITCH →</button>
                  </div>

                  {/* Pitch Deck Section */}
                  <div id="pitch-deck-container" style={{ marginTop: 24, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                     {!pitchDeck ? (
                        <motion.button 
                           whileHover={{ scale: 1.01 }} 
                           whileTap={{ scale: 0.99 }}
                           onClick={handleGenerateDeck}
                           disabled={generatingDeck}
                           style={{ 
                              width: "100%", padding: "20px", borderRadius: 16, 
                              background: "rgba(139,92,246,0.05)", border: "1px dashed rgba(139,92,246,0.4)", 
                              color: "#A78BFA", fontWeight: 800, fontSize: 15, cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 12
                           }}
                        >
                           {generatingDeck ? (
                              <>
                                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 16, height: 16, border: "2px solid rgba(167,139,250,0.2)", borderTopColor: "#A78BFA", borderRadius: "50%" }} />
                                 DRAFTING 10-SLIDE INVESTOR DECK...
                              </>
                           ) : (
                              <>📊 GENERATE PROFESSIONAL PITCH DECK</>
                           )}
                        </motion.button>
                     ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 40, background: "rgba(0,0,0,0.3)", borderRadius: 24, border: "1px solid rgba(139,92,246,0.2)" }}>
                           <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                              <h3 style={{ fontSize: 14, fontWeight: 900, color: "#A78BFA", letterSpacing: 2 }}>INVESTOR PITCH DECK v1.0</h3>
                              <div style={{ display: "flex", gap: 12 }}>
                                 <button onClick={() => window.print()} style={{ background: "rgba(167,139,250,0.1)", border: "1px solid #A78BFA", color: "#A78BFA", padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>💾 SAVE AS PDF</button>
                                 <button onClick={() => setPitchDeck(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✕ CLOSE</button>
                              </div>
                           </div>
                           <div className="prose prose-invert max-w-none" style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.8 }}>
                              <ReactMarkdown>{pitchDeck}</ReactMarkdown>
                           </div>
                        </motion.div>
                     )}
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Section */}
      {savedIdeas.length > 0 && (
        <div style={{ marginTop: 64 }}>
          <div style={{ display: "flex", alignItems: "center", justifyItems: "space-between", marginBottom: 24 }}>
             <h3 style={{ fontSize: 13, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 2, flex: 1 }}>Historical Archives</h3>
             <button onClick={() => setShowSaved(!showSaved)} className="btn-ghost" style={{ fontSize: 12, fontWeight: 900 }}>{showSaved ? "CONCEAL" : "REVEAL"} ({savedIdeas.length})</button>
          </div>
          
          <AnimatePresence>
            {showSaved && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, paddingBottom: 20 }}>
                  {savedIdeas.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                      className="glass-card" style={{ padding: 24, background: "rgba(255,255,255,0.015)", borderColor: "rgba(255,255,255,0.04)" }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 900, color: "#F97316", marginBottom: 8 }}>{s.domain}</div>
                      <h4 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 12 }}>{s.name}</h4>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>{s.problem.slice(0, 100)}...</p>
                      <button className="btn-ghost" style={{ fontSize: 11, fontWeight: 900, width: "100%" }}>REINITIALIZE →</button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
