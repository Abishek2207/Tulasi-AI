"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";

const PRICING_PLANS = [
  {
    name: "Platinum Pro",
    price: "$0",
    desc: "Community Edition — Unlimited access for everyone.",
    features: [
      "Unlimited AI Chats (Neural Intelligence)",
      "Advanced ATS Resume Scanning",
      "Unlimited Mock Interviews",
      "Priority Startup Lab access",
      "Complete Learning Modules"
    ],
    buttonText: "Account Active",
    popular: true,
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(56,189,248,0.05))",
    border: "1px solid rgba(139, 92, 246, 0.5)"
  }
];

export default function PricingPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      <UpgradeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-1px", marginBottom: 16 }}>
            Simple, transparent <span className="gradient-text">pricing</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "clamp(16px, 2vw, 18px)", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
            Unlock your full potential with Tulasi AI Pro. Ace your interviews and craft perfect resumes.
          </p>
        </motion.div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 30, alignItems: "center" }}>
        {PRICING_PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            whileHover={{ y: -8, boxShadow: plan.popular ? "0 30px 60px -12px rgba(139, 92, 246, 0.3)" : "0 20px 40px -12px rgba(0,0,0,0.5)" }}
            style={{
              position: "relative", background: plan.gradient, border: plan.border, borderRadius: 24,
              padding: 40, overflow: "hidden", backdropFilter: "blur(20px)",
              transform: plan.popular ? "scale(1.05)" : "scale(1)", zIndex: plan.popular ? 10 : 1
            }}
          >
            {plan.popular && (
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg, #8B5CF6, #38BDF8)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 16px", borderRadius: "0 0 12px 12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Most Popular
              </div>
            )}
            
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{plan.name}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24, height: 40 }}>{plan.desc}</p>
            
            <div style={{ marginBottom: 32, display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 48, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-2px" }}>{plan.price}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => plan.popular && setModalOpen(true)}
              style={{
                width: "100%", padding: "16px", borderRadius: 12, border: plan.popular ? "none" : "1px solid var(--border)",
                background: plan.popular ? "linear-gradient(135deg, #8B5CF6, #38BDF8)" : "rgba(255,255,255,0.05)",
                color: plan.popular ? "#fff" : "var(--text-primary)", fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 32,
                boxShadow: plan.popular ? "0 8px 20px rgba(139, 92, 246, 0.4)" : "none", transition: "0.2s"
              }}
            >
              {plan.buttonText}
            </motion.button>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {plan.features.map((feat, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "var(--text-secondary)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={plan.popular ? "#38BDF8" : "var(--text-muted)"} strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {feat}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
