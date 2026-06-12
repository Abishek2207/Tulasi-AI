"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import toast from "react-hot-toast";
import { paymentApi } from "@/lib/api";
import { CheckCircle, CreditCard, Loader2, Lock, ShieldCheck, X } from "lucide-react";

export default function BillingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const [showModal, setShowModal] = useState(false);
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success">("idle");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handleSubscribe = () => {
    setShowModal(true);
  };

  const processSimulatedPayment = async () => {
    if (!cardNumber || !expiry || !cvv) {
      toast.error("Please fill all card details.");
      return;
    }
    setPaymentState("processing");
    // Simulate network delay for realism
    await new Promise(r => setTimeout(r, 2000));
    
    try {
      const data = await paymentApi.simulatePayment();
      if (data.success) {
        setPaymentState("success");
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
        }, 2500);
      } else {
        toast.error((data as any).message || "Failed to complete transaction");
        setPaymentState("idle");
      }
    } catch (err) {
      toast.error("Network error during checkout");
      setPaymentState("idle");
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
            Upgrade to Pro
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ background: "#1E1E24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "32px", width: "100%", maxWidth: 420, position: "relative", boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}
            >
              {paymentState === "idle" && (
                <>
                  <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}><X size={20}/></button>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #8B5CF6, #D946EF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Lock size={20} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: "white" }}>Secure Checkout</h3>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Powered by TulasiPay Demo</p>
                    </div>
                  </div>
                  
                  <div style={{ padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 16, marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Pro Subscription</span>
                      <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>$9.99</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Total Due</span>
                      <span style={{ color: "white", fontWeight: 800, fontSize: 16 }}>$9.99</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>Card Number</label>
                      <div style={{ position: "relative" }}>
                        <CreditCard size={16} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: 12, top: 12 }} />
                        <input value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" style={{ width: "100%", padding: "10px 10px 10px 36px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", fontSize: 14, outline: "none", fontFamily: "monospace" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>Expiry Date</label>
                        <input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", fontSize: 14, outline: "none", textAlign: "center", fontFamily: "monospace" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>CVV</label>
                        <input value={cvv} onChange={e => setCvv(e.target.value)} type="password" placeholder="123" maxLength={4} style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", fontSize: 14, outline: "none", textAlign: "center", fontFamily: "monospace" }} />
                      </div>
                    </div>
                  </div>

                  <button onClick={processSimulatedPayment} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "white", color: "black", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <ShieldCheck size={18} /> Pay $9.99
                  </button>
                  <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 12 }}>This is a simulated secure checkout for demonstration purposes.</p>
                </>
              )}

              {paymentState === "processing" && (
                <div style={{ padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <Loader2 size={40} color="#8B5CF6" style={{ animation: "spin 1s linear infinite", marginBottom: 20 }} />
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8 }}>Processing Payment...</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>Please do not close this window or click back.</p>
                </div>
              )}

              {paymentState === "success" && (
                <div style={{ padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                    <CheckCircle size={60} color="#10B981" style={{ marginBottom: 20 }} />
                  </motion.div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Payment Successful!</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>Welcome to Tulasi AI Pro. Redirecting you...</p>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
