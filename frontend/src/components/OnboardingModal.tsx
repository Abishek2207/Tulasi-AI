"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { X, Sparkles, User, Briefcase, GraduationCap, Code, Target, Rocket } from "lucide-react";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

const USER_TYPES = [
  { id: "1st_year", label: "1st Year Student", icon: <User size={24} />, desc: "Fresh start", color: "#8B5CF6" },
  { id: "2nd_year", label: "2nd Year Student", icon: <Code size={24} />, desc: "Learning DSA", color: "#06B6D4" },
  { id: "3rd_year", label: "3rd Year Student", icon: <Briefcase size={24} />, desc: "Internship hunt", color: "#10B981" },
  { id: "4th_year", label: "4th Year Student", icon: <Target size={24} />, desc: "Placement prep", color: "#F43F5E" },
  { id: "professional", label: "Professional", icon: <Rocket size={24} />, desc: "Upskilling", color: "#FFD93D" },
  { id: "professor", label: "Professor", icon: <GraduationCap size={24} />, desc: "Educator", color: "#3B82F6" },
];

const DEPTS = ["Computer Science", "Information Tech", "Electronics", "Mechanical", "Electrical", "Civil", "Other"];
const ROLES = ["Frontend Engineer", "Backend Developer", "Full Stack", "AI/ML Engineer", "Data Scientist", "DevOps", "Mobile Developer"];
const INTERESTS = ["LLMs", "Web3", "Cybersecurity", "Cloud Computing", "UI/UX", "System Design", "Game Dev"];

export function OnboardingModal() {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // State for all onboarding data
  const [data, setData] = useState({
    user_type: "",
    department: "",
    target_role: "",
    target_companies: [] as string[],
    interest_areas: [] as string[]
  });

  useEffect(() => {
    if (!session?.user) return;
    if (!session.user.is_onboarded) setVisible(true);
  }, [session]);

  const updateData = (key: string, val: any) => setData(prev => ({ ...prev, [key]: val }));
  const toggleItem = (key: "target_companies" | "interest_areas", val: string) => {
    setData(prev => {
      const list = [...prev[key]];
      const idx = list.indexOf(val);
      if (idx > -1) list.splice(idx, 1);
      else if (list.length < 5) list.push(val);
      return { ...prev, [key]: list };
    });
  };

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
      const res = await fetch(`${apiUrl}/api/next-action/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Onboarding synchronization failed. Our neural core might be under heavy load.");
      }

      const result = await res.json();
      if (result.user) localStorage.setItem("user", JSON.stringify(result.user));
      setVisible(false);
      window.location.href = "/dashboard";
    } catch (e: any) {
      console.error("Onboarding failed:", e);
      setError(e.message || "Connection timed out. Please try initializing again.");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, zIndex: 9990, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{ background: "#0B0E14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 32, padding: "40px", width: "100%", maxWidth: 640, position: "relative", overflow: "hidden" }}>
          
          {/* Progress Dots */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32 }}>
            {[0, 1, 2].map((s) => (
              <div key={s} style={{ width: s === step ? 24 : 8, height: 8, borderRadius: 4, background: s === step ? "#8B5CF6" : "rgba(255,255,255,0.1)", transition: "all 0.3s" }} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Identify Your Track</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Where are you in your engineering journey?</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {USER_TYPES.map(t => (
                    <button key={t.id} onClick={() => { updateData("user_type", t.id); setStep(1); }}
                      style={{ background: data.user_type === t.id ? `${t.color}15` : "rgba(255,255,255,0.03)", border: `1px solid ${data.user_type === t.id ? t.color : "rgba(255,255,255,0.05)"}`, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left", color: "white" }}>
                      <div style={{ color: t.color }}>{t.icon}</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13 }}>{t.label}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Career Ambition</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Define your domain and target specialization.</p>
                
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Primary Department</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {DEPTS.map(d => (
                      <button key={d} onClick={() => updateData("department", d)}
                        style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: data.department === d ? "#8B5CF6" : "transparent", color: "white", fontSize: 13, cursor: "pointer", transition: "0.2s" }}>{d}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Target specialization</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {ROLES.map(r => (
                      <button key={r} onClick={() => updateData("target_role", r)}
                        style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: data.target_role === r ? "#06B6D4" : "transparent", color: "white", fontSize: 13, cursor: "pointer", transition: "0.2s" }}>{r}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
                  <button onClick={() => setStep(0)} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white", fontWeight: 700, cursor: "pointer" }}>Back</button>
                  <button onClick={() => { if (data.department && data.target_role) setStep(2); }} disabled={!data.department || !data.target_role}
                    style={{ flex: 2, padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", color: "white", fontWeight: 800, cursor: "pointer", opacity: (!data.department || !data.target_role) ? 0.3 : 1 }}>Next Step</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Finalizing Baseline</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Select interest areas (Max 3) to seed your radar.</p>
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
                  {INTERESTS.map(i => (
                    <button key={i} onClick={() => toggleItem("interest_areas", i)}
                      style={{ padding: "10px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: data.interest_areas.includes(i) ? "#10B981" : "transparent", color: "white", fontSize: 13, cursor: "pointer", transition: "0.2s" }}>
                      {i} {data.interest_areas.includes(i) ? "✓" : "+"}
                    </button>
                  ))}
                </div>

                <div style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16, padding: "16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><Sparkles size={16} /></div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Onboarding bonus: <span style={{ color: "#8B5CF6" }}>+200 XP</span> will be granted upon completion.</div>
                </div>

                <button onClick={handleSubmit} disabled={loading || data.interest_areas.length === 0}
                  style={{ width: "100%", padding: "16px", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", color: "white", fontWeight: 800, cursor: "pointer", fontSize: 16, marginBottom: 12 }}>
                  {loading ? "Engaging Career Architect..." : "Architect My Future"}
                </button>
                {error && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: 13, color: "#F43F5E", textAlign: "center", fontWeight: 700, background: "rgba(244,63,94,0.1)", padding: "12px", borderRadius: 12, border: "1px solid rgba(244,63,94,0.15)" }}>
                    {error}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
