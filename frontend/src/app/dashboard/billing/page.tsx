"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function BillingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const RENDER_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://tulasi-backend.onrender.com";
      const res = await fetch(`${RENDER_BACKEND_URL}/api/payment/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, credentials:"include", mode:"cors"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Payment Successful! You are now a PRO member! 🎉");
        
        // Trigger massive confetti
        import("canvas-confetti").then((confetti) => {
          confetti.default({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ["#8B5CF6", "#D946EF", "#06B6D4"] });
        });

        // Update local storage to force UI update immediately
        try {
           const stored = JSON.parse(localStorage.getItem("user") || "{}");
           stored.is_pro = true;
           localStorage.setItem("user", JSON.stringify(stored));
        } catch(e) {}

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } else {
        toast.error(data.detail || "Failed to initiate checkout");
        setLoading(false);
      }
    } catch (err) {
      toast.error("Network error during checkout");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>Upgrade to Tulasi AI Pro</h1>
        <p style={{ fontSize: 18, color: "var(--text-secondary)" }}>Supercharge your learning with unlimited AI tools.</p>
      </div>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
        
        {/* Free Plan */}
        <div className="glass-card" style={{ flex: 1, minWidth: 300, maxWidth: 400, padding: 40, borderTop: "4px solid var(--border)" }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Free</h3>
          <div style={{ fontSize: 40, fontWeight: 800, color: "var(--text-primary)", marginBottom: 24 }}>$0 <span style={{ fontSize: 16, color: "var(--text-muted)", fontWeight: 500 }}>/forever</span></div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 12 }}>
            <li>✅ 10 AI Chats per Day</li>
            <li>✅ Basic Dashboard</li>
            <li>✅ Public Leaderboard</li>
            <li style={{ opacity: 0.4 }}>❌ No Mock Interviews</li>
            <li style={{ opacity: 0.4 }}>❌ No Resume Analyzer</li>
          </ul>
          <button disabled style={{ width: "100%", padding: 14, borderRadius: 12, background: "var(--surface-hover)", color: "var(--text-muted)", fontWeight: 600, border: "none" }}>Current Plan</button>
        </div>

        {/* Pro Plan */}
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card" style={{ flex: 1, minWidth: 300, maxWidth: 400, padding: 40, borderTop: "4px solid #8B5CF6", position: "relative" }}>
          <div style={{ position: "absolute", top: -14, right: 30, background: "linear-gradient(135deg, #8B5CF6, #D946EF)", color: "white", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: "1px" }}>MOST POPULAR</div>
          <h3 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Pro</h3>
          <div style={{ fontSize: 40, fontWeight: 800, color: "var(--text-primary)", marginBottom: 24 }}>$9.99 <span style={{ fontSize: 16, color: "var(--text-muted)", fontWeight: 500 }}>/month</span></div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 12 }}>
            <li>✨ <strong>Unlimited</strong> AI Chats</li>
            <li>🚀 <strong>Unlimited</strong> Mock Interviews</li>
            <li>📄 <strong>Unlimited</strong> Deep Resume Analysis</li>
            <li>⚡ Priority GPT-4 / Gemini Access</li>
            <li>🎯 Access to Premium Hackathons</li>
          </ul>
          <button 
            onClick={handleSubscribe} 
            disabled={loading}
            style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(135deg, #8B5CF6, #D946EF)", color: "white", fontWeight: 700, border: "none", cursor: loading ? "wait" : "pointer" }}
          >
            {loading ? "Processing Secure Payment..." : "Upgrade to Pro"}
          </button>
        </motion.div>

      </div>
    </div>
  );
}
