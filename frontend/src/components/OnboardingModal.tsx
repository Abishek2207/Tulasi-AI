"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { X, Sparkles, User, Briefcase, GraduationCap, Code, Target, Rocket } from "lucide-react";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

const USER_TYPES = [
  { id: "1st_year", label: "1st Year Student", icon: <User size={24} />, desc: "Fresh start to programming", color: "#8B5CF6" },
  { id: "2nd_year", label: "2nd Year Student", icon: <Code size={24} />, desc: "Learning DSA & Web Dev", color: "#06B6D4" },
  { id: "3rd_year", label: "3rd Year Student", icon: <Briefcase size={24} />, desc: "Internships & Projects", color: "#10B981" },
  { id: "4th_year", label: "4th Year Student", icon: <Target size={24} />, desc: "Placements & System Design", color: "#F43F5E" },
  { id: "professional", label: "Working Professional", icon: <Rocket size={24} />, desc: "Upskilling & Role Switching", color: "#FFD93D" },
  { id: "professor", label: "Professor / Educator", icon: <GraduationCap size={24} />, desc: "Teaching & Mentoring", color: "#3B82F6" },
];


export function OnboardingModal() {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    // Show if user is logged in, but not onboarded
    if (session.user && !session.user.is_onboarded) {
      setTimeout(() => setVisible(true), 800);
    }
  }, [session]);

  const handleSubmit = async () => {
    if (!selectedType) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000"}/api/next-action/onboard`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_type: selectedType }),
        });
      }
      setVisible(false);
      // Reload dashboard fully to reflect new user type
      window.location.reload();
    } catch (e) {
      console.error("Onboarding failed", e);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 9990,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          style={{
            background: "#0B0E14",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 32, padding: "40px",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 80px rgba(139,92,246,0.15)",
            width: "100%", maxWidth: 800,
            textAlign: "center"
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ padding: 16, background: "rgba(139,92,246,0.1)", borderRadius: "50%", color: "#8B5CF6" }}>
              <Sparkles size={32} />
            </div>
          </div>
          
          <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 12 }}>
            Welcome to Tulasi AI
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 40 }}>
            To personalize your learning paths and recommendations, tell us where you are in your career journey.
          </p>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
            gap: 16, 
            marginBottom: 40 
          }}>
            {USER_TYPES.map((type) => (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType(type.id)}
                style={{
                  background: selectedType === type.id ? `${type.color}15` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selectedType === type.id ? type.color : "rgba(255,255,255,0.05)"}`,
                  borderRadius: 20, padding: 24,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                  cursor: "pointer", transition: "all 0.2s", color: "white"
                }}
              >
                <div style={{ color: type.color }}>{type.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{type.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{type.desc}</div>
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={selectedType ? { scale: 1.02 } : {}}
            whileTap={selectedType ? { scale: 0.98 } : {}}
            onClick={handleSubmit}
            disabled={!selectedType || loading}
            style={{
              padding: "16px 40px", borderRadius: 16,
              background: selectedType ? "linear-gradient(135deg, #8B5CF6, #06B6D4)" : "rgba(255,255,255,0.1)",
              color: selectedType ? "white" : "rgba(255,255,255,0.4)",
              fontSize: 16, fontWeight: 800, cursor: selectedType ? "pointer" : "not-allowed",
              border: "none", opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Personalizing Engine..." : "Setup My Path"}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
