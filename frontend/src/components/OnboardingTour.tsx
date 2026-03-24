"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { X, Sparkles, ArrowRight, BrainCircuit, Target, FileText } from "lucide-react";

const STEPS = [
  {
    icon: <Sparkles size={28} />,
    color: "#8B5CF6",
    title: "Welcome to Tulasi AI",
    desc: "Your AI-powered command centre for career acceleration. Every tool here is engineered to fast-track your journey to top-tier engineering roles.",
  },
  {
    icon: <BrainCircuit size={28} />,
    color: "#06B6D4",
    title: "AI Chat & Flashcards",
    desc: "Ask any engineering concept, generate 3D flashcard decks, and explore cross-domain insights—all synthesised by Gemini AI.",
  },
  {
    icon: <Target size={28} />,
    color: "#F43F5E",
    title: "Mock Interviews",
    desc: "Simulate real-time interviews at Google, Amazon, and more. Respond via text or voice. Get instant scored feedback, strengths, and improvements.",
  },
  {
    icon: <FileText size={28} />,
    color: "#FFD93D",
    title: "Resume Builder",
    desc: "Precision-engineer your resume with ATS bypass intelligence. Generate customised bullets, role-targeted summaries, and download a PDF instantly.",
  },
];

const ONBOARDING_KEY = "tulasi_onboarding_v1";

export function OnboardingTour() {
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!session) return;
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) {
      // Slight delay to let the dashboard paint first
      setTimeout(() => setVisible(true), 1200);
    }
  }, [session]);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else dismiss();
  };

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            style={{
              position: "fixed", inset: 0, zIndex: 9990,
              background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)"
            }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 9991, width: "90%", maxWidth: 500,
              background: "rgba(12, 12, 20, 0.97)",
              border: `1px solid ${current.color}30`,
              borderRadius: 28,
              padding: "48px 40px",
              boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 80px ${current.color}15`,
              textAlign: "center",
            }}
          >
            {/* Close */}
            <button
              onClick={dismiss}
              style={{
                position: "absolute", top: 20, right: 20,
                background: "rgba(255,255,255,0.05)", border: "none",
                color: "rgba(255,255,255,0.4)", cursor: "pointer",
                width: 32, height: 32, borderRadius: 8, display: "flex",
                alignItems: "center", justifyContent: "center"
              }}
            >
              <X size={14} />
            </button>

            {/* Icon */}
            <motion.div
              key={step}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              style={{
                width: 72, height: 72, borderRadius: 22,
                background: `${current.color}18`,
                border: `1px solid ${current.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: current.color, margin: "0 auto 28px",
                boxShadow: `0 8px 24px ${current.color}20`
              }}
            >
              {current.icon}
            </motion.div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px", marginBottom: 12 }}>
                  {current.title}
                </h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 36 }}>
                  {current.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
              {STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ width: i === step ? 24 : 8, background: i === step ? current.color : "rgba(255,255,255,0.15)" }}
                  transition={{ duration: 0.25 }}
                  style={{ height: 8, borderRadius: 4 }}
                />
              ))}
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={next}
              style={{
                width: "100%", padding: "16px", borderRadius: 16,
                background: `linear-gradient(135deg, ${current.color}, #06B6D4)`,
                border: "none", color: "white", fontSize: 15, fontWeight: 800,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: `0 8px 24px ${current.color}30`
              }}
            >
              {step < STEPS.length - 1 ? "Next" : "Launch Orbit 🚀"}
              {step < STEPS.length - 1 && <ArrowRight size={16} />}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
