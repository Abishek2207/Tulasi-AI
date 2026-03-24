"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { paymentApi } from "@/lib/api";
import toast from "react-hot-toast";

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

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    const toastId = toast.loading("Preparing checkout...");

    try {
      // 1️⃣ Load Razorpay checkout.js script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Failed to load Razorpay checkout. Check your internet connection.");
      }

      // 2️⃣ Create order on backend
      const order = await paymentApi.createOrder();
      toast.dismiss(toastId);

      // 3️⃣ Get user info from localStorage for prefill
      const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
      })();

      // 4️⃣ Open Razorpay checkout popup
      const rzp = new window.Razorpay({
        key:         order.key_id,
        amount:      order.amount,
        currency:    order.currency,
        name:        "Tulasi AI",
        description: "Pro Plan — Unlimited AI, Interviews & Resume",
        order_id:    order.order_id,
        prefill: {
          email: storedUser.email || "",
          name:  storedUser.name  || "",
        },
        theme: { color: "#8B5CF6" },

        handler: async (response: RazorpayPaymentResponse) => {
          // 5️⃣ Verify payment signature on backend (HMAC-SHA256)
          const verifyToastId = toast.loading("Verifying payment...");
          try {
            const result = await paymentApi.verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });

            if (result.success && result.is_pro) {
              // 6️⃣ Update user in localStorage so Pro badge shows immediately
              const updatedUser = { ...storedUser, is_pro: true };
              localStorage.setItem("user", JSON.stringify(updatedUser));

              toast.dismiss(verifyToastId);
              toast.success("🎉 You are now a Pro member!", { duration: 5000 });
              onUpgradeSuccess?.();
              onClose();
            } else {
              throw new Error("Verification failed. Contact support.");
            }
          } catch (err: unknown) {
      const error = err as Error;
            toast.dismiss(verifyToastId);
            toast.error(error.message || "Payment verification failed.");
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.dismiss();
          },
        },
      });

      rzp.open();
    } catch (err: unknown) {
      const error = err as Error;
      toast.dismiss(toastId);
      toast.error(error.message || "Payment failed. Try again.");
      setLoading(false);
    }
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

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleUpgrade} disabled={loading}
          style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer",
            background: "linear-gradient(135deg, #8B5CF6, #38BDF8)", color: "#fff", fontSize: 16, fontWeight: 600,
            boxShadow: "0 8px 20px rgba(139, 92, 246, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading
            ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block", width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }} />
            : "⚡ Upgrade to Pro — ₹100/mo"
          }
        </motion.button>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
          🔒 Secure Checkout via Razorpay · Cancel anytime
        </p>
      </motion.div>
    </div>
  );
}
