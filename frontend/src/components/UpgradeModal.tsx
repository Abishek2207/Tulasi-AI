"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Zap, Shield, Clock, Award } from "lucide-react";
import { paymentApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import confetti from "canvas-confetti";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const router = useRouter();
  const { data: session, update } = useSession();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error("Could not load payment gateway.");

      const order = await paymentApi.createOrder();

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Tulasi AI",
        description: "Tulasi Pro - Monthly Subscription",
        order_id: order.order_id,
        handler: async function (response: any) {
          toast.loading("Verifying transaction securely...", { id: "verify" });
          try {
            const result = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (result.success) {
              toast.success("Payment successful! You are now a Pro member 🎉", { id: "verify" });
              
              // REVENUE SUCCESS CELEBRATION
              confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#7C3AED', '#06B6D4', '#10B981'] });
              
              await update(); // refresh NextAuth session
              onClose();
              router.refresh(); // force server components to re-read Pro status if any
            }
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed", { id: "verify" });
          }
        },
        prefill: {
          name: session?.user?.name || "User",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#7C3AED",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err: any) {
      toast.error(err.message || "Failed to initiate checkout");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
          style={{ width: "90%", maxWidth: 440, backgroundColor: "#0B0F19", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, overflow: "hidden", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
          
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#A1A1AA", cursor: "pointer", zIndex: 10 }}>
            <X size={16} />
          </button>

          {/* Header Gradient */}
          <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.1))", padding: "40px 32px 24px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
            <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(234, 179, 8, 0.15)", color: "#FBBF24", fontSize: 11, padding: "4px 10px", borderRadius: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", border: "1px solid rgba(234, 179, 8, 0.3)" }}>
              Limited Time Offer
            </div>
            
            <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #7C3AED, #06B6D4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 16px rgba(124,58,237,0.3)" }}>
              <Zap size={32} color="#fff" fill="#fff" />
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.5px" }}>Unlock Maximum Power</h2>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.5 }}>Join <strong style={{ color: "white" }}>1,000+ top engineers</strong> accelerating their careers with Tulasi Pro.</p>
          </div>

          {/* Features */}
          <div style={{ padding: 32 }}>
            
            {/* Social Proof & Value Banner */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, marginBottom: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
              <Clock size={20} color="#06B6D4" />
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Drop the tutorial hell. <strong style={{ color: "white" }}>Save 40+ hours/month</strong> of context-switching.
              </div>
            </div>

            {/* Billing Toggle (A/B Testing LTV) */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 4, marginBottom: 24, position: "relative" }}>
               <button onClick={() => setBillingCycle("monthly")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: billingCycle === "monthly" ? "rgba(255,255,255,0.1)" : "transparent", color: billingCycle === "monthly" ? "white" : "var(--text-muted)", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>Monthly</button>
               <button onClick={() => setBillingCycle("yearly")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: billingCycle === "yearly" ? "var(--gradient-primary)" : "transparent", color: billingCycle === "yearly" ? "white" : "var(--text-muted)", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                 Annually <span style={{ background: "rgba(255,255,255,0.2)", fontSize: 10, padding: "2px 6px", borderRadius: 20 }}>Save 30%</span>
               </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
              {[
                "Unlimited AI Chats & Memory",
                "Advanced Mock Interviews (Voice)",
                "Priority VIP Support",
                "Save Unlimited Resumes",
                "Exclusive Study Rooms & Hackathons"
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "var(--text-primary)" }}>
                  <CheckCircle size={18} color="#10B981" />
                  {text}
                </div>
              ))}
            </div>

            <button onClick={handleUpgrade} disabled={loading} style={{ width: "100%", padding: "16px 24px", background: "linear-gradient(135deg, #7C3AED, #06B6D4)", color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "all 0.2s", boxShadow: "0 10px 20px rgba(124, 58, 237, 0.3)", position: "relative", overflow: "hidden" }}>
              <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "50%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)", transform: "skewX(-20deg)" }} />
              {loading ? "Connecting securely..." : (billingCycle === "yearly" ? "Upgrade Now for ₹1999/yr" : "Upgrade Now for ₹249/mo")}
            </button>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 }}>
              <Shield size={14} color="var(--text-muted)" />
              <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", margin: 0 }}>256-bit encrypted payments by Razorpay</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
