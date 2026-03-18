"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { startupApi } from "@/lib/api";

interface StartupIdea {
  name: string;
  problem: string;
  solution: string;
  market_opportunity: string;
  tech_stack: string[];
  monetization: string;
}

interface SavedIdea extends StartupIdea {
  id: number;
  domain: string;
  created_at: string;
}

export default function StartupLabPage() {
  const { data: session } = useSession();
  const [domain, setDomain] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState<StartupIdea | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [showSaved, setShowSaved] = useState(false);

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

  const token = (session?.user as any)?.accessToken;

  const fetchSavedIdeas = async () => {
    if (!token) return;
    try {
      const data = await startupApi.ideas(token);
      setSavedIdeas(data.ideas || []);
    } catch (e) {}
  };

  useEffect(() => { if (session) fetchSavedIdeas(); }, [session]);

  const saveIdea = async () => {
    if (!idea || !token) return;
    setSaving(true);
    try {
      await startupApi.save({ ...idea, domain }, token);
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

    try {
      const data = await startupApi.generate(domain, audience, token);
      setIdea(data.idea);
      setSaved(false);
    } catch (err: any) {
      setError(err.message || "Failed to reach the AI servers.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      
      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-outfit)", letterSpacing: "-1px" }}>
          🚀 Startup <span className="gradient-text" style={{ background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ideas LAB</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 8, maxWidth: 600, margin: "8px auto 0" }}>
          Select an industry and an audience. Our AI will instantly generate a 
          verified business plan, complete with a technical architecture recommendation.
        </p>
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 40, flexWrap: "wrap", justifyContent: "center" }}>
        <div className="dash-card" style={{ flex: "1 1 300px", padding: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,107,107,0.2)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>1. Select Domain</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {domains.map(d => (
              <button 
                key={d} 
                onClick={() => setDomain(d)}
                style={{ 
                  padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  background: domain === d ? "rgba(255,107,107,0.15)" : "transparent",
                  color: domain === d ? "#FF6B6B" : "var(--text-secondary)",
                  border: `1px solid ${domain === d ? "#FF6B6B" : "var(--border)"}`
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="dash-card" style={{ flex: "1 1 300px", padding: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,142,83,0.2)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>2. Target Audience</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {audiences.map(a => (
              <button 
                key={a} 
                onClick={() => setAudience(a)}
                style={{ 
                  padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  background: audience === a ? "rgba(255,142,83,0.15)" : "transparent",
                  color: audience === a ? "#FF8E53" : "var(--text-secondary)",
                  border: `1px solid ${audience === a ? "#FF8E53" : "var(--border)"}`
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        {error && <div style={{ color: "#FF6B6B", marginBottom: 16, fontSize: 14 }}>{error}</div>}
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerate}
          disabled={loading || !domain || !audience}
          style={{ 
            background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", 
            color: "white", padding: "14px 40px", borderRadius: 30, fontSize: 16, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer",
            opacity: (!domain || !audience || loading) ? 0.6 : 1,
            boxShadow: "0 10px 20px rgba(255,107,107,0.3)"
          }}
        >
          {loading ? "Brainstorming with AI..." : "Generate Startup Pitch"}
        </motion.button>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: 40 }}>
            <div className="spinner" style={{ margin: "0 auto 20px", width: 40, height: 40, border: "3px solid rgba(255,107,107,0.2)", borderTopColor: "#FF6B6B", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <div style={{ fontSize: 18, fontWeight: 600, color: "white", marginBottom: 8 }}>Analyzing Market Gaps...</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Finding optimal product-market fit for {audience} in {domain}.</div>
          </motion.div>
        )}

        {idea && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }}
            className="dash-card"
            style={{ padding: 0, overflow: "hidden", border: "1px solid rgba(255,107,107,0.3)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
          >
            <div style={{ background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", padding: "30px", textAlign: "center", position: "relative" }}>
              <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.2)", padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600, color: "white" }}>YC W26</div>
              <h2 style={{ fontSize: 40, fontWeight: 900, color: "white", marginBottom: 8, textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>{idea.name}</h2>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>The operating system for {audience.toLowerCase()}.</div>
            </div>

            <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 32 }}>
              
              <div>
                <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "1px", color: "#FF6B6B", fontWeight: 800, marginBottom: 12 }}>🔴 The Problem</h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.9)" }}>{idea.problem}</p>
              </div>

              <div>
                <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "1px", color: "#4ECDC4", fontWeight: 800, marginBottom: 12 }}>🟢 The Solution</h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.9)" }}>{idea.solution}</p>
              </div>

              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid var(--border)" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", fontWeight: 700, marginBottom: 12 }}>📈 Market Opportunity</h3>
                  <p style={{ fontSize: 15, color: "white" }}>{idea.market_opportunity}</p>
                </div>
                <div style={{ flex: 1, minWidth: 200, borderLeft: "1px solid var(--border)", paddingLeft: 24 }}>
                  <h3 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", fontWeight: 700, marginBottom: 12 }}>💸 Monetization Strategy</h3>
                  <p style={{ fontSize: 15, color: "white" }}>{idea.monetization}</p>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "1px", color: "#8B5CF6", fontWeight: 800, marginBottom: 16 }}>⚙️ Recommended Tech Stack</h3>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {idea.tech_stack.map(tech => (
                    <div key={tech} style={{ padding: "8px 16px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#8B5CF6" }}>⚡</span> {tech}
                    </div>
                  ))}
                </div>
              </div>

            </div>
            {/* Save Button */}
            {!saved ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={saveIdea}
                disabled={saving || !token}
                style={{ margin: "0 40px 24px", padding: "12px", borderRadius: 14, border: "1px solid rgba(255,215,0,0.4)", background: "rgba(255,215,0,0.08)", color: "#FFD700", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {saving ? "Saving..." : "💾 Save This Idea"}
              </motion.button>
            ) : (
              <div style={{ margin: "0 40px 24px", padding: "12px", borderRadius: 14, background: "rgba(67,233,123,0.1)", color: "#43E97B", fontWeight: 700, textAlign: "center" }}>✅ Idea Saved!</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Ideas */}
      {savedIdeas.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <button onClick={() => setShowSaved(!showSaved)} style={{ background: "transparent", border: "1px solid var(--border)", color: "white", padding: "10px 20px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
            {showSaved ? "▲" : "▼"} 💾 My Saved Ideas ({savedIdeas.length})
          </button>
          <AnimatePresence>
            {showSaved && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {savedIdeas.map(s => (
                  <motion.div key={s.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ background: "linear-gradient(135deg, rgba(255,107,107,0.08), rgba(255,142,83,0.05))", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 16, padding: 20 }}
                  >
                    <div style={{ fontSize: 11, color: "#FF8E53", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{s.domain}</div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{s.name}</h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{s.problem.slice(0, 100)}...</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
