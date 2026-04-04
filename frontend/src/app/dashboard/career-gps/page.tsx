"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { Navigation, ChevronRight, Clock, Star, Zap, CheckCircle, ArrowRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:10000";
const YEARS = [
  { value: "1st_year", label: "1st Year", desc: "Foundation & Basics" },
  { value: "2nd_year", label: "2nd Year", desc: "DSA & Projects" },
  { value: "3rd_year", label: "3rd Year", desc: "Internships & Advanced" },
  { value: "4th_year", label: "4th Year", desc: "Placements & FAANG Prep" },
  { value: "professional", label: "Professional", desc: "Upskill & Role Switch" },
];
const ROLES = [
  "AI Engineer", "AI Research Scientist", "Software Engineer", "Data Scientist",
  "ML Engineer", "Full Stack Developer", "DevOps Engineer", "Product Manager",
  "Cybersecurity Engineer", "Cloud Architect",
];
const PATH_COLORS = ["#8B5CF6", "#10B981", "#F59E0B"];

function getToken() { return typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""; }

function MilestoneTimeline({ milestones }: { milestones: any[] }) {
  return (
    <div style={{ position: "relative", paddingLeft: 24 }}>
      <div style={{ position: "absolute", left: 9, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.06)" }} />
      {milestones.map((m, i) => (
        <div key={i} style={{ position: "relative", marginBottom: 20 }}>
          <div style={{ position: "absolute", left: -20, top: 4, width: 10, height: 10, borderRadius: "50%", background: "var(--brand-primary)", border: "2px solid var(--bg-primary)" }} />
          <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", marginBottom: 4 }}>MONTH {m.month}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 6 }}>{m.goal}</div>
          {m.resources?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {m.resources.map((r: string, ri: number) => (
                <span key={ri} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", fontWeight: 600 }}>
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CareerGPSPage() {
  const { data: session } = useSession();
  const [year, setYear] = useState("3rd_year");
  const [role, setRole] = useState("AI Engineer");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [selectedPath, setSelectedPath] = useState(0);

  const handleGenerate = async () => {
    setLoading(true); setError(""); setResult(null);
    const token = getToken();
    try {
      const res = await fetch(`${API}/api/intel/career-gps`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ year, target_role: role, current_skills: skills }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "GPS failed");
      setResult(d);
      const recommended = d.paths?.findIndex((p: any) => p.id === d.recommendation);
      setSelectedPath(recommended >= 0 ? recommended : 0);
    } catch (e: any) { setError(e.message || "Career GPS failed. Try again."); }
    setLoading(false);
  };

  const activePath = result?.paths?.[selectedPath];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(139,92,246,0.3)" }}>
            <Navigation size={22} color="white" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 900, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: 2 }}>AGI Career Intelligence</span>
        </div>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-1.5px", marginBottom: 8 }}>
          Career <span className="gradient-text">GPS</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 17 }}>
          3 personalized roadmaps to your dream role — built by AI, tailored to your exact year and skills.
        </p>
      </motion.div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        {/* Config Panel */}
        <div style={{ width: 320, flexShrink: 0 }}>
          <div className="glass-card" style={{ padding: 28, position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 14 }}>YOUR YEAR</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {YEARS.map(y => (
                  <button key={y.value} onClick={() => setYear(y.value)}
                    style={{
                      padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                      background: year === y.value ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.02)",
                      borderLeft: year === y.value ? "3px solid var(--brand-primary)" : "3px solid transparent",
                    }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: year === y.value ? "white" : "var(--text-secondary)" }}>{y.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{y.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 10 }}>TARGET ROLE</div>
              <select value={role} onChange={e => setRole(e.target.value)} className="input-field"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 14, background: "rgba(255,255,255,0.04)" }}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 10 }}>CURRENT SKILLS (Optional)</div>
              <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. Python, React, SQL..."
                className="input-field"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 14, background: "rgba(255,255,255,0.04)", boxSizing: "border-box" }} />
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleGenerate} disabled={loading} className="btn-primary"
              style={{ width: "100%", padding: "14px", borderRadius: 14, fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                  style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%" }} />
              ) : <><Navigation size={16} /> Generate My GPS</>}
            </motion.button>
            {error && <div style={{ color: "#F43F5E", fontSize: 12, textAlign: "center" }}>⚠️ {error}</div>}
          </div>
        </div>

        {/* Results */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass-card" style={{ padding: 80, textAlign: "center" }}>
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}
                  style={{ fontSize: 64, marginBottom: 20 }}>🗺️</motion.div>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Your Career GPS</div>
                <div style={{ color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 320, margin: "0 auto" }}>
                  Tell the AI your year and target role — get 3 precise career paths with timelines, milestones, and company targets.
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card"
                style={{ padding: 60, textAlign: "center" }}>
                <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ fontSize: 48, marginBottom: 20 }}>🧭</motion.div>
                <div style={{ fontWeight: 700, color: "var(--text-secondary)" }}>Calculating your career trajectory...</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>Analyzing {year} + {role} + market data</div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Path Selector */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                  {result.paths?.map((path: any, i: number) => (
                    <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPath(i)}
                      style={{
                        padding: 20, borderRadius: 18, cursor: "pointer", transition: "all 0.25s",
                        background: selectedPath === i ? `${PATH_COLORS[i]}12` : "rgba(255,255,255,0.02)",
                        border: selectedPath === i ? `2px solid ${PATH_COLORS[i]}` : "2px solid rgba(255,255,255,0.06)",
                      }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: PATH_COLORS[i], marginBottom: 6, letterSpacing: 0.5 }}>{path.difficulty?.toUpperCase()}</div>
                      <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 4, color: "white" }}>{path.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.4 }}>{path.tagline}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                        <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={10} /> {path.timeline_months}mo
                        </span>
                        <span style={{ color: PATH_COLORS[i], fontWeight: 900 }}>{path.job_readiness_pct}% ready</span>
                      </div>
                      {result.recommendation === path.id && (
                        <div style={{ marginTop: 8, fontSize: 10, fontWeight: 900, color: PATH_COLORS[i], background: `${PATH_COLORS[i]}15`, padding: "3px 8px", borderRadius: 6, display: "inline-block" }}>
                          ⭐ RECOMMENDED
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Active Path Detail */}
                {activePath && (
                  <motion.div key={selectedPath} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Path Overview */}
                    <div className="glass-card" style={{ padding: 32, border: `1px solid ${PATH_COLORS[selectedPath]}25` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: PATH_COLORS[selectedPath], marginBottom: 4 }}>{activePath.difficulty} PATH</div>
                          <h2 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px", marginBottom: 4 }}>{activePath.title}</h2>
                          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{activePath.tagline}</p>
                        </div>
                        {/* Readiness Ring */}
                        <div style={{ position: "relative", width: 80, height: 80 }}>
                          <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
                            <circle cx={40} cy={40} r={32} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
                            <motion.circle cx={40} cy={40} r={32} fill="none" stroke={PATH_COLORS[selectedPath]} strokeWidth={6}
                              strokeDasharray={201}
                              initial={{ strokeDashoffset: 201 }}
                              animate={{ strokeDashoffset: 201 - (activePath.job_readiness_pct / 100) * 201 }}
                              transition={{ duration: 1.5, ease: "easeOut" }} />
                          </svg>
                          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ fontSize: 16, fontWeight: 900, color: PATH_COLORS[selectedPath] }}>{activePath.job_readiness_pct}%</div>
                            <div style={{ fontSize: 8, color: "var(--text-muted)", fontWeight: 700 }}>READY</div>
                          </div>
                        </div>
                      </div>

                      {/* Key Info */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                        <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)" }}>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6 }}>TIMELINE</div>
                          <div style={{ fontSize: 18, fontWeight: 900 }}>{activePath.timeline_months} months</div>
                        </div>
                        <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)" }}>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6 }}>KEY SKILLS</div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>{activePath.key_skills?.slice(0, 2).join(", ")}</div>
                        </div>
                        <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)" }}>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6 }}>TARGET COs</div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>{activePath.companies?.slice(0, 2).join(", ")}</div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                        {activePath.key_skills?.map((skill: string, i: number) => (
                          <span key={i} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 20, background: `${PATH_COLORS[selectedPath]}12`, color: PATH_COLORS[selectedPath], fontWeight: 700, border: `1px solid ${PATH_COLORS[selectedPath]}25` }}>
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Companies */}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {activePath.companies?.map((co: string, i: number) => (
                          <span key={i} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)", fontWeight: 700, border: "1px solid rgba(255,255,255,0.08)" }}>
                            🏢 {co}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Milestones */}
                    {activePath.milestones?.length > 0 && (
                      <div className="glass-card" style={{ padding: 28 }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 20 }}>📍 MILESTONE ROADMAP</div>
                        <MilestoneTimeline milestones={activePath.milestones} />
                      </div>
                    )}

                    {/* Founder Note */}
                    {result.founder_note && (
                      <div className="glass-card" style={{ padding: 24, border: "1px solid rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.03)" }}>
                        <div style={{ fontSize: 11, fontWeight: 900, color: "var(--brand-primary)", marginBottom: 10 }}>💬 FROM ABISHEK R — FOUNDER, TULASIAI</div>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, fontStyle: "italic" }}>{result.founder_note}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
