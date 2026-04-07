"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { MapPin, Briefcase, Clock, Zap, TrendingUp, Copy, CheckCircle, RefreshCw, Building2, Shield, Sparkles, ArrowUpRight } from "lucide-react";
import { AIResilienceWrapper } from "@/components/dashboard/AIResilienceWrapper";

import { API } from "@/lib/api";
const ROLES = ["Software Engineer", "AI Engineer", "ML Engineer", "Data Scientist", "Product Manager", "Frontend Developer", "Backend Developer", "DevOps Engineer", "Full Stack Developer", "AI Research Scientist", "Cybersecurity Engineer", "Cloud Architect"];
const LOCATIONS = ["Bangalore", "Hyderabad", "Chennai", "Pune", "Mumbai", "Delhi NCR", "Remote (India)", "USA", "UK", "Singapore"];

function getToken() { return typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""; }

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1200;
    const step = (end / duration) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.round(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display}{suffix}</span>;
}

function PercentileBar({ label, val, color, maxVal }: { label: string; val: number; color: string; maxVal: number }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ color }}>₹<AnimatedNumber value={val} /> LPA</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.04)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (val / maxVal) * 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ height: "100%", background: `linear-gradient(90deg, ${color}60, ${color})`, borderRadius: 10, boxShadow: `0 0 8px ${color}40` }} />
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
  const [retrying, setRetrying] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleAnalyze = async (isRetry = false) => {
    setLoading(true);
    if (!isRetry) setResult(null);
    setRetrying(false);
    try {
      const { chatApi, extractAndParseJson } = await import("@/lib/api");
      
      const message = `Analyze the salary for the role of ${role} in ${location} for someone with ${yoe} years of experience.
      Please provide a detailed salary report in the required JSON structure including market percentiles and top paying companies.`;

      const response = await chatApi.send(message, undefined, "salary_intel");
      
      const data = extractAndParseJson<any>(response.response, { 
        salary_range: { min_lpa: 0, median_lpa: 0, max_lpa: 0, currency: "INR", unit: "LPA" },
        market_percentiles: { p25: 0, p50: 0, p75: 0, p90: 0 },
        top_paying_companies: [],
        skills_that_boost_salary: []
      });
      
      if (!data || !data.salary_range) {
        throw new Error("Invalid salary data structure received.");
      }

      setResult(data);
    } catch (e: any) {
      console.error("[SalaryIntel] Analysis failed:", e);
      setRetrying(true);
    }
    setLoading(false);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const maxPct = result ? Math.max(result.market_percentiles?.p90 || 1, 1) : 1;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 80 }}>
      {/* Animated background glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.08, 0.04] }} transition={{ repeat: Infinity, duration: 9 }}
          style={{ position: "absolute", top: "5%", left: "15%", width: 600, height: 400, background: "radial-gradient(ellipse, #10B981 0%, transparent 70%)", filter: "blur(100px)" }} />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.03, 0.06, 0.03] }} transition={{ repeat: Infinity, duration: 11, delay: 4 }}
          style={{ position: "absolute", bottom: "15%", right: "10%", width: 400, height: 400, background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)", filter: "blur(90px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <motion.div
              animate={{ boxShadow: ["0 8px 20px rgba(16,185,129,0.3)", "0 8px 40px rgba(16,185,129,0.6)", "0 8px 20px rgba(16,185,129,0.3)"] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg, #10B981, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={22} color="white" />
            </motion.div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#10B981", textTransform: "uppercase", letterSpacing: 2 }}>Market Intelligence</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Real 2025 data · Negotiation playbook · Salary bands</div>
            </div>
          </div>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-2px", marginBottom: 10, lineHeight: 1 }}>
            Salary{" "}
            <span style={{ background: "linear-gradient(135deg, #10B981, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Intelligence</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 500 }}>
            Real market data + your personal negotiation playbook. Know exactly what to ask for — and how to get it.
          </p>
        </motion.div>

        <div className="mobile-stack" style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Input Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            style={{ width: "100%", maxWidth: 300, flexShrink: 0 }}>
            <div style={{ padding: 28, position: "sticky", top: 20, background: "rgba(255,255,255,0.02)", borderRadius: 28, border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 24, textTransform: "uppercase" }}>Configure Query</div>

              {/* Role */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 10, fontWeight: 900, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                  <Briefcase size={11} color="#10B981" /> Target Role
                </label>
                <select value={role} onChange={e => setRole(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 14, fontSize: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white", outline: "none", fontFamily: "inherit" }}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Location */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 10, fontWeight: 900, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                  <MapPin size={11} color="#10B981" /> Location
                </label>
                <select value={location} onChange={e => setLocation(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 14, fontSize: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white", outline: "none", fontFamily: "inherit" }}>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* YOE slider */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={11} color="#10B981" /> Experience</span>
                  <span style={{ color: "#10B981", fontSize: 14, fontFamily: "var(--font-mono)" }}>{yoe === 0 ? "Fresher" : `${yoe} yrs`}</span>
                </div>
                <input type="range" min={0} max={15} value={yoe} onChange={e => setYoe(+e.target.value)}
                  style={{ width: "100%", accentColor: "#10B981", cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>
                  <span>Fresher</span><span>15+ yrs</span>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(16,185,129,0.4)" }} whileTap={{ scale: 0.97 }}
                onClick={() => handleAnalyze()} disabled={loading}
                style={{ width: "100%", padding: "16px", borderRadius: 16, fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg, #10B981, #06B6D4)", border: "none", color: "white", cursor: loading ? "wait" : "pointer", boxShadow: "0 8px 24px rgba(16,185,129,0.3)" }}>
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                ) : <><Zap size={16} /> Analyze Market</>}
              </motion.button>
            </div>
          </motion.div>

          {/* Results Panel */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <AIResilienceWrapper
              loading={loading}
              retrying={retrying}
              result={result}
              onRetry={() => handleAnalyze(true)}
              title="Salary Intelligence Engine"
              subtitle={`Analyzing ${role} · ${location} · ${yoe === 0 ? "Fresher" : `${yoe} yrs exp`} 2025 Market Data`}
              color="#10B981"
              icon={<TrendingUp size={40} color="#10B981" />}
            >
              {/* Empty state (only shown when no result and not loading) */}
              {!result && !loading && !retrying && (
                <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{ padding: 80, textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3.5 }}
                    style={{ fontSize: 72, marginBottom: 24, display: "inline-block" }}>💰</motion.div>
                  <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, fontFamily: "var(--font-outfit)" }}>Know Your Worth</div>
                  <div style={{ color: "var(--text-secondary)", maxWidth: 320, margin: "0 auto", lineHeight: 1.7, fontSize: 15 }}>
                    Select your role and location to get real 2025 market salary data and your personalized negotiation playbook.
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
                    {["Salary Bands", "Negotiation Script", "Top Paying Cos"].map((tag, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>
                        <CheckCircle size={13} color="#10B981" /> {tag}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Actual Results Content */}
              {result && (
                <motion.div key="result-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                  {/* Salary Hero Card */}
                  <div style={{ padding: 32, background: "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(6,182,212,0.03))", borderRadius: 28, border: "1px solid rgba(16,185,129,0.2)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)", filter: "blur(40px)", zIndex: 0 }} />
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 900, color: "#10B981", marginBottom: 6 }}>{result.role} · {result.location}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{result.yoe === 0 ? "Fresher" : `${result.yoe} years experience`} · {result.salary_range?.currency}</div>
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          style={{
                            fontSize: 12, fontWeight: 900, padding: "8px 18px", borderRadius: 20,
                            background: result.market_trend === "growing" ? "rgba(16,185,129,0.15)" : result.market_trend === "stable" ? "rgba(251,191,36,0.12)" : "rgba(244,63,94,0.12)",
                            color: result.market_trend === "growing" ? "#10B981" : result.market_trend === "stable" ? "#FBBF24" : "#F43F5E",
                            border: `1px solid ${result.market_trend === "growing" ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`,
                            display: "flex", alignItems: "center", gap: 6
                          }}>
                          {result.market_trend === "growing" ? "📈 Growing" : result.market_trend === "stable" ? "📊 Stable" : "📉 Competitive"}
                        </motion.div>
                      </div>

                      {/* Big Numbers */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
                        {[
                          { label: "Minimum", val: result.salary_range?.min_lpa, color: "#F43F5E", icon: "📉" },
                          { label: "Median", val: result.salary_range?.median_lpa, color: "#10B981", icon: "📊" },
                          { label: "Maximum", val: result.salary_range?.max_lpa, color: "#FBBF24", icon: "📈" },
                        ].map((item, i) => (
                          <motion.div key={item.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.4 }}
                            style={{ padding: "20px 16px", borderRadius: 20, background: `${item.color}08`, border: `1px solid ${item.color}20`, textAlign: "center" }}>
                            <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
                            <div style={{ fontSize: 26, fontWeight: 900, color: item.color, fontFamily: "var(--font-outfit)", lineHeight: 1 }}>
                              ₹<AnimatedNumber value={item.val || 0} />
                            </div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label} LPA</div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Percentile Bars */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 16, textTransform: "uppercase" }}>Market Percentiles</div>
                        <PercentileBar label="P25 — Entry Level" val={result.market_percentiles?.p25 || 0} color="#F43F5E" maxVal={maxPct} />
                        <PercentileBar label="P50 — Market Median" val={result.market_percentiles?.p50 || 0} color="#F59E0B" maxVal={maxPct} />
                        <PercentileBar label="P75 — Senior Level" val={result.market_percentiles?.p75 || 0} color="#10B981" maxVal={maxPct} />
                        <PercentileBar label="P90 — Elite Percentile" val={result.market_percentiles?.p90 || 0} color="#8B5CF6" maxVal={maxPct} />
                      </div>

                      {result.trend_note && (
                        <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, display: "flex", gap: 10 }}>
                          <span>💡</span> {result.trend_note}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Companies */}
                  {result.top_paying_companies?.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      style={{ padding: 28, background: "rgba(255,255,255,0.02)", borderRadius: 28, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 20, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
                        <Building2 size={13} /> Top Paying Companies
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {result.top_paying_companies.map((co: any, i: number) => (
                          <motion.div key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ x: 4, borderColor: "rgba(16,185,129,0.3)" }}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", transition: "all 0.2s", cursor: "default" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏢</div>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: 14, color: "white" }}>{co.company}</div>
                                {co.perks && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{co.perks}</div>}
                              </div>
                            </div>
                            <div style={{ fontWeight: 900, fontSize: 14, color: "#10B981", display: "flex", alignItems: "center", gap: 4 }}>
                              {co.range} <ArrowUpRight size={13} />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Negotiation Playbook */}
                  {result.negotiation_script && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      style={{ padding: 28, background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(6,182,212,0.03))", borderRadius: 28, border: "1px solid rgba(139,92,246,0.2)" }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "#8B5CF6", letterSpacing: 1.5, marginBottom: 20, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
                        <Shield size={13} /> Your Negotiation Playbook
                      </div>
                      {[
                        { key: "opening", label: "Opening Move", icon: "1️⃣", color: "#8B5CF6" },
                        { key: "counter_offer", label: "Counter Offer", icon: "2️⃣", color: "#06B6D4" },
                        { key: "close", label: "Closing Statement", icon: "3️⃣", color: "#10B981" },
                      ].map(({ key, label, icon, color }, idx) => (
                        result.negotiation_script[key] && (
                          <motion.div key={key}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            style={{ marginBottom: 16, padding: "18px 20px", borderRadius: 16, background: `${color}06`, border: `1px solid ${color}15`, position: "relative" }}>
                            <div style={{ fontSize: 10, fontWeight: 900, color, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>{icon} {label}</div>
                            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.8, margin: 0, paddingRight: 36, fontStyle: "italic" }}>
                              "{result.negotiation_script[key]}"
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyText(result.negotiation_script[key], key)}
                              style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 6, borderRadius: 8, transition: "background 0.2s" }}>
                              {copied === key ? <CheckCircle size={16} color="#10B981" /> : <Copy size={16} />}
                            </motion.button>
                          </motion.div>
                        )
                      ))}
                    </motion.div>
                  )}

                  {/* Insights + Skills Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                    {result.key_insights?.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        style={{ padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 16, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                          <Sparkles size={11} /> Key Insights
                        </div>
                        {result.key_insights.map((ins: string, i: number) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                            style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 10, padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.8)", display: "flex", gap: 8 }}>
                            <span style={{ color: "#10B981", flexShrink: 0 }}>→</span> {ins}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                    {result.skills_that_boost_salary?.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                        style={{ padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 16, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                          <Zap size={11} /> Salary-Boosting Skills
                        </div>
                        {result.skills_that_boost_salary.map((skill: string, i: number) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.08 }}
                            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 14px", borderRadius: 12, background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.1)" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FBBF24", boxShadow: "0 0 8px #FBBF24", flexShrink: 0 }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{skill}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AIResilienceWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}
