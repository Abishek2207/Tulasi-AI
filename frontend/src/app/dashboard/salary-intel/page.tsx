"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { MapPin, Briefcase, Clock, Zap, TrendingUp, ChevronRight, Copy, CheckCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:10000";
const ROLES = ["Software Engineer", "AI Engineer", "ML Engineer", "Data Scientist", "Product Manager", "Frontend Developer", "Backend Developer", "DevOps Engineer", "Full Stack Developer", "AI Research Scientist"];
const LOCATIONS = ["Bangalore", "Hyderabad", "Chennai", "Pune", "Mumbai", "Delhi NCR", "Remote (India)", "USA", "UK", "Singapore"];

function getToken() { return typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""; }

function PercentileBar({ label, val, color }: { label: string; val: number; color: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ color }}>₹{val} LPA</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${(val / 50) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ height: "100%", background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 10 }} />
      </div>
    </div>
  );
}

export default function SalaryIntelPage() {
  const { data: session } = useSession();
  const [role, setRole] = useState("Software Engineer");
  const [location, setLocation] = useState("Bangalore");
  const [yoe, setYoe] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true); setError(""); setResult(null);
    const token = getToken();
    try {
      const res = await fetch(`${API}/api/intel/salary-intel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role, location, yoe }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "Failed");
      setResult(d);
    } catch (e: any) { setError(e.message || "Salary analysis failed. Try again."); }
    setLoading(false);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #10B981, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(16,185,129,0.3)" }}>
            <TrendingUp size={22} color="white" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 900, color: "#10B981", textTransform: "uppercase", letterSpacing: 2 }}>Market Intelligence</span>
        </div>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-1.5px", marginBottom: 8 }}>
          Salary <span className="gradient-text">Intelligence</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 17 }}>
          Real market data + your personal negotiation playbook. Know exactly what to ask for.
        </p>
      </motion.div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        {/* Input Panel */}
        <div style={{ width: 340, flexShrink: 0 }}>
          <div className="glass-card" style={{ padding: 28, position: "sticky", top: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 20 }}>CONFIGURE QUERY</div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-secondary)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                <Briefcase size={12} style={{ display: "inline", marginRight: 6 }} />Target Role
              </label>
              <select value={role} onChange={e => setRole(e.target.value)} className="input-field"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 14, background: "rgba(255,255,255,0.04)" }}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-secondary)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                <MapPin size={12} style={{ display: "inline", marginRight: 6 }} />Location
              </label>
              <select value={location} onChange={e => setLocation(e.target.value)} className="input-field"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 14, background: "rgba(255,255,255,0.04)" }}>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-secondary)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                <Clock size={12} style={{ display: "inline", marginRight: 6 }} />Years of Experience: <span style={{ color: "var(--brand-primary)" }}>{yoe} yrs</span>
              </label>
              <input type="range" min={0} max={15} value={yoe} onChange={e => setYoe(+e.target.value)}
                style={{ width: "100%", accentColor: "var(--brand-primary)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                <span>Fresher</span><span>15+ yrs</span>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze} disabled={loading} className="btn-primary"
              style={{ width: "100%", padding: "14px", borderRadius: 14, fontWeight: 900, fontSize: 14,
                background: "linear-gradient(135deg, #10B981, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                  style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
              ) : <><Zap size={16} /> Analyze Market</>}
            </motion.button>

            {error && <div style={{ color: "#F43F5E", fontSize: 12, marginTop: 12, textAlign: "center" }}>⚠️ {error}</div>}
          </div>
        </div>

        {/* Results Panel */}
        <div style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass-card" style={{ padding: 80, textAlign: "center" }}>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}
                  style={{ fontSize: 64, marginBottom: 20 }}>💰</motion.div>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Know Your Worth</div>
                <div style={{ color: "var(--text-secondary)", maxWidth: 320, margin: "0 auto", lineHeight: 1.6 }}>
                  Select your role and location to get real market salary data and your negotiation script.
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ fontSize: 48, marginBottom: 20 }}>🔍</motion.div>
                <div style={{ fontWeight: 700, color: "var(--text-secondary)" }}>Scanning 2025 market data...</div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Salary Range Hero */}
                <div className="glass-card" style={{ padding: 32, border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#10B981", marginBottom: 4 }}>{result.role} · {result.location}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{result.yoe} years experience · {result.salary_range?.currency}</div>
                    </div>
                    <div style={{
                      fontSize: 14, fontWeight: 900, padding: "6px 16px", borderRadius: 20,
                      background: result.market_trend === "growing" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                      color: result.market_trend === "growing" ? "#10B981" : "var(--text-muted)",
                    }}>
                      {result.market_trend === "growing" ? "📈 Growing Market" : result.market_trend === "stable" ? "📊 Stable Market" : "📉 Competitive"}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 28, textAlign: "center" }}>
                    {[
                      { label: "Minimum", val: result.salary_range?.min_lpa, color: "#F43F5E" },
                      { label: "Median", val: result.salary_range?.median_lpa, color: "#10B981" },
                      { label: "Maximum", val: result.salary_range?.max_lpa, color: "#FBBF24" },
                    ].map(item => (
                      <div key={item.label} style={{ padding: 16, borderRadius: 16, background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
                        <div style={{ fontSize: 28, fontWeight: 900, color: item.color, fontFamily: "var(--font-outfit)" }}>₹{item.val}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>{item.label} LPA</div>
                      </div>
                    ))}
                  </div>

                  <PercentileBar label="P25 (Entry)" val={result.market_percentiles?.p25} color="#F43F5E" />
                  <PercentileBar label="P50 (Median)" val={result.market_percentiles?.p50} color="#F59E0B" />
                  <PercentileBar label="P75 (Senior)" val={result.market_percentiles?.p75} color="#10B981" />
                  <PercentileBar label="P90 (Elite)" val={result.market_percentiles?.p90} color="#8B5CF6" />

                  {result.trend_note && (
                    <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      💡 {result.trend_note}
                    </div>
                  )}
                </div>

                {/* Top Companies */}
                {result.top_paying_companies?.length > 0 && (
                  <div className="glass-card" style={{ padding: 28 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 20 }}>🏢 TOP PAYING COMPANIES</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {result.top_paying_companies.map((co: any, i: number) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{co.company}</span>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 14, fontWeight: 900, color: "#10B981" }}>{co.range}</div>
                            {co.perks && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{co.perks}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Negotiation Script */}
                {result.negotiation_script && (
                  <div className="glass-card" style={{ padding: 28, border: "1px solid rgba(139,92,246,0.2)" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#8B5CF6", letterSpacing: 1, marginBottom: 20 }}>🎭 YOUR NEGOTIATION PLAYBOOK</div>
                    {[
                      { key: "opening", label: "Opening Move", icon: "1️⃣" },
                      { key: "counter_offer", label: "Counter Offer", icon: "2️⃣" },
                      { key: "close", label: "Closing Statement", icon: "3️⃣" },
                    ].map(({ key, label, icon }) => (
                      result.negotiation_script[key] && (
                        <div key={key} style={{ marginBottom: 16, padding: 16, borderRadius: 12, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)", position: "relative" }}>
                          <div style={{ fontSize: 11, fontWeight: 900, color: "#8B5CF6", marginBottom: 8 }}>{icon} {label.toUpperCase()}</div>
                          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, margin: 0, paddingRight: 32 }}>
                            "{result.negotiation_script[key]}"
                          </p>
                          <button onClick={() => copyText(result.negotiation_script[key], key)}
                            style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                            {copied === key ? <CheckCircle size={14} color="#10B981" /> : <Copy size={14} />}
                          </button>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Key Insights + Skill Boosters */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {result.key_insights?.length > 0 && (
                    <div className="glass-card" style={{ padding: 24 }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 16 }}>💡 KEY INSIGHTS</div>
                      {result.key_insights.map((ins: string, i: number) => (
                        <div key={i} style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.8)" }}>
                          → {ins}
                        </div>
                      ))}
                    </div>
                  )}
                  {result.skills_that_boost_salary?.length > 0 && (
                    <div className="glass-card" style={{ padding: 24 }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, marginBottom: 16 }}>⚡ SALARY-BOOSTING SKILLS</div>
                      {result.skills_that_boost_salary.map((skill: string, i: number) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FBBF24", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{skill}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
