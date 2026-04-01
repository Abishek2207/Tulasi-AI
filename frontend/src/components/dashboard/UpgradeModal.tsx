"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { paymentApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Copy } from "lucide-react";

// ── Razorpay type declarations (checkout.js is loaded at runtime) ──────────
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { email: string; name: string };
  theme: { color: string };
  handler: (response: RazorpayPaymentResponse) => void;
  modal: { ondismiss: () => void };
}
interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance {
  open: () => void;
}

/** Dynamically load Razorpay checkout.js from CDN */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function UpgradeModal({ isOpen, onClose, onUpgradeSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [refStats, setRefStats] = useState<{
    invite_code: string;
    total_referrals: number;
    referrals_needed_for_pro: number;
  } | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://tulasi-ai-wgwl.onrender.com"}/api/users/referrals`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => res.json())
      .then(data => setRefStats(data))
      .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    toast.success("All features are already unlocked for you!");
    onClose();
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(12px)"
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          background: "linear-gradient(145deg, rgba(20,20,25,0.9), rgba(10,10,15,0.95))",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
          borderRadius: 24, padding: "clamp(24px, 5vw, 40px)",
          maxWidth: 480, width: "90%", position: "relative", overflow: "hidden"
        }}
      >
        {/* Glow orb */}
        <div style={{
          position: "absolute", top: -50, right: -50, width: 150, height: 150,
          background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
          filter: "blur(20px)", borderRadius: "50%", pointerEvents: "none"
        }} />

        <button onClick={onClose} style={{
          position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none",
          width: 32, height: 32, borderRadius: "50%", color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s"
        }}>✕</button>

        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, fontFamily: "var(--font-display)" }}>
          Unlock <span className="gradient-text">Pro</span> Power
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 28, lineHeight: 1.6, fontSize: 15 }}>
          You get <strong style={{ color: "white" }}>100 free chats/day</strong> and a basic Resume Builder for free.
          Upgrade to Pro for unlimited everything + advanced AI features.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
          {/* Free tier summary */}
          <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#10B981", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>✅ Included Free</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>100 AI chats/day · Basic Resume Builder · All 12 Learning Modules</div>
          </div>
          {/* Pro features */}
          <div style={{ fontSize: 12, fontWeight: 800, color: "#A78BFA", textTransform: "uppercase", letterSpacing: 1, marginTop: 4, marginBottom: 2 }}>⚡ Pro Unlocks</div>
          {[
            "Unlimited AI Chats — No Daily Cap",
            "Advanced ATS Resume Scanner & Tailoring",
            "Unlimited Deep-Dive Mock Interviews",
            "Priority Support & Zero Ads"
          ].map((feature, i) => (
            <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "#E2E8F0" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#A78BFA" }}>✓</div>
              {feature}
            </motion.div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleUpgrade}
            style={{
              width: "100%", maxWidth: 320, padding: "16px", borderRadius: 14, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #8B5CF6, #38BDF8)", color: "#fff", fontSize: 16, fontWeight: 600,
              boxShadow: "0 8px 20px rgba(139, 92, 246, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              margin: "0 auto"
            }}
          >
            "Getting Started"
          </motion.button>
        </div>

        {/* ── REFERRAL UI ───────────────────────────── */}
        {refStats && (
          <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 24 }}>
            <div style={{ width: "100%", maxWidth: 360, padding: "16px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                <span>🎁 Refer 10 friends, Get 2 Mos Free</span>
                <span style={{ color: "#A78BFA" }}>{refStats.total_referrals}/10</span>
              </div>
              
              {/* Progress bar */}
              <div style={{ height: 6, width: "100%", background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ 
                  height: "100%", 
                  width: `${Math.min(100, (refStats.total_referrals / 10) * 100)}%`, 
                  background: "linear-gradient(90deg, #8B5CF6, #38BDF8)",
                  borderRadius: 3 
                }} />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, padding: "8px 12px", background: "rgba(0,0,0,0.4)", borderRadius: 8, fontSize: 13, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)" }}>
                  {refStats.invite_code}
                </div>
               <button 
                  onClick={() => {
                    navigator.clipboard.writeText(refStats.invite_code);
                    toast.success("Invite code copied!");
                  }}
                  style={{ padding: "0 12px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, color: "white", cursor: "pointer" }}
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ──────────────────────────────────────────── */}

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
          🔒 Secure Checkout via Razorpay · Cancel anytime
        </p>
      </motion.div>
    </div>
  );
}
