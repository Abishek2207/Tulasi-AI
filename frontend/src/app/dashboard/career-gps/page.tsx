"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { Navigation, ChevronRight, Clock, Star, Zap, CheckCircle, ArrowRight, RefreshCw, Sparkles, Target, BookOpen, Building2 } from "lucide-react";
import { AIResilienceWrapper } from "@/components/dashboard/AIResilienceWrapper";

import { API } from "@/lib/api";
const YEARS = [
  { value: "1st_year", label: "1st Year", desc: "Foundation & Basics", icon: "🌱" },
  { value: "2nd_year", label: "2nd Year", desc: "DSA & Projects", icon: "⚡" },
  { value: "3rd_year", label: "3rd Year", desc: "Internships & Advanced", icon: "🚀" },
  { value: "4th_year", label: "4th Year", desc: "Placements & FAANG Prep", icon: "🎯" },
  { value: "professional", label: "Professional", desc: "Upskill & Role Switch", icon: "💎" },
];
const ROLES = [
  "AI Engineer", "AI Research Scientist", "Software Engineer", "Data Scientist",
  "ML Engineer", "Full Stack Developer", "DevOps Engineer", "Product Manager",
  "Cybersecurity Engineer", "Cloud Architect",
];
const PATH_COLORS = ["#8B5CF6", "#10B981", "#F59E0B"];

function getToken() { return typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""; }

function MilestoneTimeline({ milestones, color }: { milestones: any[], color: string }) {
  return (
    <div style={{ position: "relative", paddingLeft: 28 }}>
      <div style={{ position: "absolute", left: 9, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${color}60, transparent)` }} />
      {milestones.map((m, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          style={{ position: "relative", marginBottom: 24 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 + 0.05, type: "spring" }}
            style={{ position: "absolute", left: -24, top: 4, width: 12, height: 12, borderRadius: "50%", background: color, border: "2px solid var(--bg-primary)", boxShadow: `0 0 8px ${color}60` }} />
          <div style={{ fontSize: 10, fontWeight: 900, color, marginBottom: 4, letterSpacing: 1 }}>MONTH {m.month}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 8, lineHeight: 1.4 }}>{m.goal}</div>
          {m.resources?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {m.resources.map((r: string, ri: number) => (
                <span key={ri} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: `${color}12`, color, fontWeight: 700, border: `1px solid ${color}30` }}>
                  {r}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default function CareerGPSPage() {
  const { data: session } = useSession();
  const [year, setYear] = useState("3rd_year");
  const [role, setRole] = useState("Software Engineer");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [selectedPath, setSelectedPath] = useState(0);

  const handleGenerate = async (isRetry = false) => {
    setLoading(true); setError(""); if (!isRetry) setResult(null); setRetrying(false);
    try {
      const { chatApi, extractAndParseJson } = await import("@/lib/api");
      
      const message = `Generate a Career GPS for a ${year.replace("_", " ")} student targeting the role of ${role}. ${skills ? `My skills: ${skills}` : ""}.
      Please provide exactly 3 paths (fast_track, balanced, conservative) in the required JSON structure.`;

      const response = await chatApi.send(message, undefined, "career_gps");
      
      const data = extractAndParseJson<any>(response.response, { paths: [] });
      
      if (!data || !data.paths || data.paths.length === 0) {
        throw new Error("Invalid data structure received from AI.");
      }

      setResult(data);
      const recommended = data.paths?.findIndex((p: any) => p.id === data.recommendation);
      setSelectedPath(recommended >= 0 ? recommended : 0);
    } catch (e: any) {
      console.error("[CareerGPS] Generation failed:", e);
      setError(e.message || "Career GPS generation failed. Please try again.");
      setRetrying(true);
    }
    setLoading(false);
  };

  const activePath = result?.paths?.[selectedPath];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 80 }}>
      {/* Animated background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.07, 0.03] }} transition={{ repeat: Infinity, duration: 8 }}
          style={{ position: "absolute", top: "10%", left: "20%", width: 500, height: 500, background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)", filter: "blur(80px)" }} />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.04, 0.08, 0.04] }} transition={{ repeat: Infinity, duration: 10, delay: 3 }}
          style={{ position: "absolute", bottom: "20%", right: "10%", width: 400, height: 400, background: "radial-gradient(circle, #10B981 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <motion.div
              animate={{ boxShadow: ["0 8px 20px rgba(139,92,246,0.3)", "0 8px 40px rgba(139,92,246,0.6)", "0 8px 20px rgba(139,92,246,0.3)"] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Navigation size={22} color="white" />
            </motion.div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: 2 }}>AGI Career Intelligence</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>3 paths · Real milestones · Company targets</div>
            </div>
          </div>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-2px", marginBottom: 10, lineHeight: 1 }}>
            Career{" "}
            <span style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GPS</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 500 }}>
            3 personalized roadmaps to your dream role — built by AGI, tailored to your exact year and skills.
          </p>
        </motion.div>

        <div className="mobile-stack" style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Config Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            style={{ width: "100%", maxWidth: 300, flexShrink: 0 }}>
            <div style={{ padding: 28, position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 24, background: "rgba(255,255,255,0.02)", borderRadius: 28, border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
              {/* Year selector */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" }}>Your Year</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {YEARS.map(y => (
                    <motion.button key={y.value}
                      whileHover={{ x: 4 }}
                      onClick={() => setYear(y.value)}
                      style={{
                        padding: "12px 14px", borderRadius: 14, border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                        background: year === y.value ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.02)",
                        borderLeft: `3px solid ${year === y.value ? "#8B5CF6" : "transparent"}`,
                        display: "flex", alignItems: "center", gap: 10
                      }}>
                      <span style={{ fontSize: 18 }}>{y.icon}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: year === y.value ? "white" : "var(--text-secondary)" }}>{y.label}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{y.desc}</div>
                      </div>
                      {year === y.value && <motion.div layoutId="yearActive" style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#8B5CF6", boxShadow: "0 0 8px #8B5CF6" }} />}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Role selector */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>Target Role</div>
                <select value={role} onChange={e => setRole(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 14, fontSize: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white", outline: "none", fontFamily: "inherit" }}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Skills */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>Current Skills <span style={{ color: "rgba(255,255,255,0.2)" }}>(optional)</span></div>
                <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. Python, React, SQL..."
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 14, fontSize: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>

              <motion.button whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(139,92,246,0.4)" }} whileTap={{ scale: 0.97 }}
                onClick={() => handleGenerate()} disabled={loading}
                style={{ width: "100%", padding: "16px", borderRadius: 16, fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", border: "none", color: "white", cursor: loading ? "wait" : "pointer", boxShadow: "0 8px 24px rgba(139,92,246,0.3)" }}>
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                ) : <><Navigation size={16} /> Generate My GPS</>}
              </motion.button>
            </div>
          </motion.div>

          {/* Results Area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <AIResilienceWrapper
              loading={loading}
              retrying={retrying}
              result={result}
              onRetry={() => handleGenerate(true)}
              title="Career Trajectory Engine"
              subtitle={`Analyzing ${year.replace("_", " ")} + ${role} + 2025 market data`}
              color="#8B5CF6"
              icon={<Navigation size={40} color="#8B5CF6" />}
            >
              {/* Empty state (only shown when no result and not loading) */}
              {!result && !loading && !retrying && (
                <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  style={{ padding: 80, textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <motion.div animate={{ rotate: [0, 15, -15, 0], y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 5 }}
                    style={{ fontSize: 72, marginBottom: 24, display: "inline-block" }}>🗺️</motion.div>
                  <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, fontFamily: "var(--font-outfit)" }}>Your Career GPS</div>
                  <div style={{ color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 340, margin: "0 auto", fontSize: 15 }}>
                    Select your year and target role, then hit <strong style={{ color: "white" }}>Generate My GPS</strong> to receive 3 precision-engineered career paths.
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
                    {["3 Career Paths", "Monthly Milestones", "Company Targets"].map((tag, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>
                        <CheckCircle size={14} color="#10B981" /> {tag}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Actual Results Content */}
              {result && (
                <motion.div key="result-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  {/* Path Selector */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 24 }}>
                    {result.paths?.map((path: any, i: number) => (
                      <motion.div key={i}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPath(i)}
                        style={{
                          padding: 20, borderRadius: 20, cursor: "pointer", transition: "all 0.25s",
                          background: selectedPath === i ? `${PATH_COLORS[i]}12` : "rgba(255,255,255,0.02)",
                          border: selectedPath === i ? `2px solid ${PATH_COLORS[i]}` : "2px solid rgba(255,255,255,0.06)",
                          boxShadow: selectedPath === i ? `0 0 24px ${PATH_COLORS[i]}20` : "none",
                        }}>
                        <div style={{ fontSize: 11, fontWeight: 900, color: PATH_COLORS[i], marginBottom: 6, letterSpacing: 0.5 }}>{path.difficulty?.toUpperCase()}</div>
                        <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 4, color: "white", lineHeight: 1.3 }}>{path.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.4 }}>{path.tagline}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                          <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={10} /> {path.timeline_months}mo
                          </span>
                          <span style={{ color: PATH_COLORS[i], fontWeight: 900 }}>{path.job_readiness_pct}% ready</span>
                        </div>
                        {result.recommendation === path.id && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                            style={{ marginTop: 8, fontSize: 10, fontWeight: 900, color: PATH_COLORS[i], background: `${PATH_COLORS[i]}15`, padding: "4px 10px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 4, border: `1px solid ${PATH_COLORS[i]}30` }}>
                            <Star size={10} fill={PATH_COLORS[i]} /> RECOMMENDED
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Active Path Detail */}
                  {activePath && (
                    <motion.div key={selectedPath} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      {/* Path Overview */}
                      <div style={{ padding: 32, background: "rgba(255,255,255,0.02)", borderRadius: 28, border: `1px solid ${PATH_COLORS[selectedPath]}25`, backdropFilter: "blur(20px)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 900, color: PATH_COLORS[selectedPath], marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{activePath.difficulty} PATH</div>
                            <h2 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px", marginBottom: 6, color: "white" }}>{activePath.title}</h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>{activePath.tagline}</p>
                          </div>
                          {/* Readiness Ring */}
                          <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
                            <svg width={90} height={90} style={{ transform: "rotate(-90deg)" }}>
                              <circle cx={45} cy={45} r={36} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
                              <motion.circle cx={45} cy={45} r={36} fill="none" stroke={PATH_COLORS[selectedPath]} strokeWidth={7}
                                strokeDasharray={226}
                                initial={{ strokeDashoffset: 226 }}
                                animate={{ strokeDashoffset: 226 - (activePath.job_readiness_pct / 100) * 226 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                strokeLinecap="round" />
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                              <div style={{ fontSize: 17, fontWeight: 900, color: PATH_COLORS[selectedPath] }}>{activePath.job_readiness_pct}%</div>
                              <div style={{ fontSize: 8, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 0.5 }}>READY</div>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
                          {[
                            { icon: <Clock size={14} />, label: "Timeline", val: `${activePath.timeline_months} months` },
                            { icon: <Target size={14} />, label: "Top Skills", val: activePath.key_skills?.slice(0, 2).join(", ") || "—" },
                            { icon: <Building2 size={14} />, label: "Companies", val: activePath.companies?.slice(0, 2).join(", ") || "—" },
                          ].map((item, i) => (
                            <div key={i} style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>
                                <span style={{ color: PATH_COLORS[selectedPath] }}>{item.icon}</span> {item.label}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{item.val}</div>
                            </div>
                          ))}
                        </div>

                        {/* Skills */}
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                            <BookOpen size={12} /> Key Skills to Master
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {activePath.key_skills?.map((skill: string, i: number) => (
                              <motion.span key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                style={{ fontSize: 12, padding: "6px 14px", borderRadius: 20, background: `${PATH_COLORS[selectedPath]}12`, color: PATH_COLORS[selectedPath], fontWeight: 700, border: `1px solid ${PATH_COLORS[selectedPath]}25` }}>
                                {skill}
                              </motion.span>
                            ))}
                          </div>
                        </div>

                        {/* Companies */}
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                            <Building2 size={12} /> Target Companies
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {activePath.companies?.map((co: string, i: number) => (
                              <span key={i} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)", fontWeight: 700, border: "1px solid rgba(255,255,255,0.08)" }}>
                                🏢 {co}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Milestones */}
                      {activePath.milestones?.length > 0 && (
                        <div style={{ padding: 28, background: "rgba(255,255,255,0.02)", borderRadius: 28, border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ fontSize: 12, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 24, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: PATH_COLORS[selectedPath] }}>📍</span> Monthly Milestone Roadmap
                          </div>
                          <MilestoneTimeline milestones={activePath.milestones} color={PATH_COLORS[selectedPath]} />
                        </div>
                      )}

                      {/* Founder Note */}
                      {result.founder_note && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          style={{ padding: 24, background: "rgba(139,92,246,0.04)", borderRadius: 24, border: "1px solid rgba(139,92,246,0.2)" }}>
                          <div style={{ fontSize: 11, fontWeight: 900, color: "#8B5CF6", marginBottom: 12, letterSpacing: 1 }}>💬 FROM ABISHEK R — FOUNDER & CEO, TULASIAI</div>
                          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>"{result.founder_note}"</p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AIResilienceWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}
