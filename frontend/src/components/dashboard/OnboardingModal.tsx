"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";
import { ArrowRight, CheckCircle2, GraduationCap, Briefcase, Code } from "lucide-react";
import confetti from "canvas-confetti";

interface OnboardingModalProps {
  onComplete: () => void;
}

const USER_TYPES = [
  { id: "1st_year", label: "1st Year Student", icon: <GraduationCap size={20} />, desc: "Focus on basics and early exploration" },
  { id: "2nd_year", label: "2nd Year Student", icon: <Code size={20} />, desc: "Focus on DSA and development" },
  { id: "3rd_year", label: "3rd Year Student", icon: <Code size={20} />, desc: "Focus on core tech and internships" },
  { id: "4th_year", label: "4th Year Student", icon: <Briefcase size={20} />, desc: "Focus on placements & system design" },
  { id: "professional", label: "Working Professional", icon: <Briefcase size={20} />, desc: "Focus on upskilling & transitions" },
];

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    const token = localStorage.getItem("token") || "";
    try {
      await fetch(`${API_URL}/api/auth/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_type: selected }),
      });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setTimeout(onComplete, 800);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }} />

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ position: "relative", zIndex: 1001, width: "100%", maxWidth: 640, background: "#0B0E14", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 24, padding: 40, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
        
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 className="hero-title" style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>
            Welcome to <span className="gradient-text">Tulasi AI</span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 400, margin: "0 auto" }}>
            To personalize your learning path, action items, and mock interviews, please tell us where you are in your journey.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginBottom: 32 }}>
          {USER_TYPES.map(type => {
            const isSelected = selected === type.id;
            return (
              <motion.button key={type.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelected(type.id)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 16, padding: 20, borderRadius: 16, cursor: "pointer", textAlign: "left",
                  background: isSelected ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isSelected ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.05)"}`,
                  position: "relative", overflow: "hidden"
                }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: isSelected ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.06)", color: isSelected ? "#A78BFA" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {type.icon}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: isSelected ? "white" : "var(--text-primary)", marginBottom: 4 }}>{type.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{type.desc}</div>
                </div>
                {isSelected && (
                  <div style={{ position: "absolute", top: 16, right: 16 }}>
                    <CheckCircle2 size={20} color="#A78BFA" />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={!selected || loading}
          className="btn-primary" style={{ width: "100%", padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: !selected ? 0.5 : 1 }}>
          {loading ? "Personalizing Platform..." : <>Start My Journey <ArrowRight size={20} /></>}
        </motion.button>
        
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--text-muted)" }}>
          You can always update this later in your profile settings.
        </div>
      </motion.div>
    </div>
  );
}
