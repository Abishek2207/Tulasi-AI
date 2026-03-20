"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useToken } from "@/hooks/useToken";
import { roadmapApi } from "@/lib/api";

interface Milestone {
  phase: string;
  title: string;
  duration: string;
  topics: string[];
  project_idea: string;
  resources: { name: string; url: string }[];
}

interface RoadmapResponse {
  title: string;
  description: string;
  estimated_months: number;
  milestones: Milestone[];
}

export default function RoadmapsPage() {
  const { data: session } = useSession();
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorDesc, setErrorDesc] = useState("");
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);

  const generateRoadmap = async () => {
    if (!goal.trim()) return;
    const token = useToken();
    if (!token) {
       console.error("No access token found. Please log in.");
       setLoading(false);
       return;
    }
    setRoadmap(null);
    setErrorDesc("");
    try {
      const data = await roadmapApi.generate(goal, token);
      if (data && data.roadmap) {
        setRoadmap(data.roadmap);
      }
    } catch (err: any) {
      console.error(err);
      setErrorDesc(err.message || "Failed to generate roadmap. Please check connection.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header Area */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 12 }}>
          Dynamic Career <span className="gradient-text" style={{ background: "linear-gradient(135deg, #4ECDC4, #6C63FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Roadmaps</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, margin: "0 auto 32px" }}>
          Tell us your dream job. Our AI will generate a structured, week-by-week curriculum to get you hired.
        </p>
        
        <div style={{ display: "flex", gap: 12, background: "var(--surface)", padding: 8, borderRadius: 16, border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
          <input 
            value={goal} onChange={e => setGoal(e.target.value)}
            disabled={loading}
            placeholder="e.g. Machine Learning Engineer at OpenAI"
            style={{ flex: 1, background: "transparent", border: "none", color: "var(--text-primary)", fontSize: 16, padding: "12px 20px", outline: "none" }}
            onKeyDown={e => e.key === "Enter" && generateRoadmap()}
          />
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={generateRoadmap} disabled={loading || !goal.trim()}
            style={{ background: "linear-gradient(135deg, #4ECDC4, #6C63FF)", color: "white", border: "none", padding: "12px 32px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: (!goal.trim() || loading) ? 0.7 : 1 }}
          >
            {loading ? "Generating..." : "Generate Path"}
          </motion.button>
        </div>
      </div>

      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: 60 }}>
           <div className="spinner" style={{ margin: "0 auto 20px", width: 40, height: 40, border: "4px solid rgba(78,205,196,0.2)", borderTopColor: "#4ECDC4", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
           <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Analyzing job requirements and mapping milestones...</p>
        </motion.div>
      )}

      {errorDesc && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 12, padding: "16px", color: "#FF6B6B", marginBottom: 24, fontSize: 14, textAlign: "center", fontWeight: 600 }}>
          ⚠️ {errorDesc}
        </motion.div>
      )}

      {/* Render Roadmap */}
      <AnimatePresence>
        {roadmap && !loading && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            
            <div style={{ textAlign: "center", marginBottom: 48, padding: 32, background: "linear-gradient(135deg, rgba(78,205,196,0.1), rgba(108,99,255,0.1))", borderRadius: 24, border: "1px solid rgba(108,99,255,0.2)" }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12 }}>{roadmap.title}</h2>
              <p style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 16 }}>{roadmap.description}</p>
              <div style={{ display: "inline-block", background: "rgba(108,99,255,0.2)", color: "#A78BFA", padding: "6px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700 }}>
                Estimated Timeline: {roadmap.estimated_months} Months
              </div>
            </div>

            {/* Vertical Timeline */}
            <div style={{ position: "relative", paddingLeft: 32 }}>
              {/* Timeline Line */}
              <div style={{ position: "absolute", left: 16, top: 20, bottom: 20, width: 2, background: "linear-gradient(to bottom, #4ECDC4, #6C63FF)" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {roadmap.milestones.map((ms, idx) => (
                  <motion.div 
                    key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                    style={{ position: "relative" }}
                  >
                    {/* Circle Node */}
                    <div style={{ position: "absolute", left: -32, top: 0, width: 34, height: 34, borderRadius: "50%", background: "var(--background)", border: "3px solid #6C63FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white", transform: "translateX(-50%)" }}>
                      {idx + 1}
                    </div>

                    <div className="dash-card" style={{ padding: 24, border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div>
                          <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{ms.title}</h3>
                          <p style={{ fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginTop: 4 }}>Phase {ms.phase}</p>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                          {ms.duration}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                        {ms.topics.map((t, i) => (
                          <span key={i} style={{ background: "rgba(78,205,196,0.1)", color: "#4ECDC4", border: "1px solid rgba(78,205,196,0.2)", padding: "4px 12px", borderRadius: 16, fontSize: 12, fontWeight: 600 }}>
                            {t}
                          </span>
                        ))}
                      </div>

                      <div style={{ background: "rgba(167,139,250,0.07)", borderLeft: "3px solid #A78BFA", padding: "16px", borderRadius: "0 8px 8px 0", marginBottom: 20 }}>
                        <h4 style={{ fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>🚀 Milestone Project</h4>
                        <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5 }}>{ms.project_idea}</p>
                      </div>

                      {ms.resources.length > 0 && (
                        <div>
                          <h4 style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 700, marginBottom: 12 }}>Recommended Resources</h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {ms.resources.map((r, i) => (
                              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, color: "#6C63FF", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                                <span style={{ opacity: 0.6 }}>🔗</span> {r.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
