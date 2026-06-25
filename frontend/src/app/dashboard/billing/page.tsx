"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import toast from "react-hot-toast";
import { CheckCircle, CreditCard, Loader2, Lock, ShieldCheck, X, Zap, Crown, Sparkles, Tag } from "lucide-react";
import { API_URL } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Plan {
  id: number;
  name: string;
  price: number;
  ai_requests_limit: number;
  resume_downloads_limit: number;
  features_json: string;
}

interface MySubscription {
  has_subscription: boolean;
  is_pro: boolean;
  plan: { name: string; price: number; ai_requests_limit: number } | null;
  subscription_status: string;
  ai_usage_today: number;
  started_at: string | null;
  ends_at: string | null;
}

// ─── Helper ─────────────────────────────────────────────────────────────────
const PLAN_ICONS: Record<string, string> = { Student: "🎓", Professional: "💼", Enterprise: "🏢" };
const PLAN_COLORS: Record<string, string> = { Student: "#8B5CF6", Professional: "#10B981", Enterprise: "#F59E0B" };

const feats = (json: string): string[] => {
  try { return JSON.parse(json); } catch { return []; }
};

export default function BillingPage() {
  const { data: session } = useSession();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const [plans, setPlans] = useState<Plan[]>([]);
  const [mySubscription, setMySubscription] = useState<MySubscription | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success">("idle");

  // Card inputs
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState<{ original_price: number; discounted_price: number; discount_percent: number } | null>(null);

  // Load plans and subscription on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
        const [plansRes, subRes] = await Promise.allSettled([
          fetch(`${API_URL}/api/subscriptions/plans`, { headers }),
          fetch(`${API_URL}/api/subscriptions/my-subscription`, { headers }),
        ]);

        if (plansRes.status === "fulfilled" && plansRes.value.ok) {
          const data = await plansRes.value.json();
          setPlans(Array.isArray(data) ? data : []);
        }
        if (subRes.status === "fulfilled" && subRes.value.ok) {
          setMySubscription(await subRes.value.json());
        }
      } catch (e) {
        console.error("Billing data load failed", e);
      } finally {
        setLoadingData(false);
      }
    };
    if (token) fetchData();
    else setLoadingData(false);
  }, [token]);

  const handleApplyCoupon = async () => {
    if (!couponCode || !selectedPlan) return;
    setCouponLoading(true);
    setCouponDiscount(null);
    try {
      const res = await fetch(`${API_URL}/api/subscriptions/apply-coupon`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, plan_name: selectedPlan.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid coupon");
      setCouponDiscount(data);
      toast.success(`${data.discount_percent}% discount applied!`);
    } catch (e: any) {
      toast.error(e.message || "Coupon invalid");
    } finally {
      setCouponLoading(false);
    }
  };

  const openModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setCouponCode("");
    setCouponDiscount(null);
    setPaymentState("idle");
    setShowModal(true);
  };

  const finalAmount = couponDiscount ? couponDiscount.discounted_price : selectedPlan?.price ?? 0;

  const processPayment = async () => {
    if (!cardNumber || !expiry || !cvv || !name) {
      toast.error("Please fill all card details.");
      return;
    }
    setPaymentState("processing");
    await new Promise(r => setTimeout(r, 2200));

    try {
      // Step 1: create checkout order
      const orderRes = await fetch(`${API_URL}/api/payments/checkout`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: selectedPlan!.id, coupon_code: couponCode || undefined }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.detail || "Checkout failed");

      // Step 2: simulate verify
      const verifyRes = await fetch(`${API_URL}/api/payments/verify`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_payment_id: `pay_${Date.now()}`,
          razorpay_order_id: orderData.order_id,
          razorpay_signature: "simulated_sig",
          plan_id: selectedPlan!.id,
          coupon_code: couponCode || undefined,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.detail || "Payment verification failed");

      setPaymentState("success");
      toast.success(`🎉 ${selectedPlan?.name} Plan activated!`);

      import("canvas-confetti").then(c => {
        c.default({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ["#8B5CF6", "#10B981", "#F59E0B"] });
      }).catch(() => {});

      // Refresh subscription data after 2.5s
      setTimeout(() => {
        setShowModal(false);
        setMySubscription(s => s ? { ...s, has_subscription: true, subscription_status: "active", plan: { name: selectedPlan!.name, price: selectedPlan!.price, ai_requests_limit: selectedPlan!.ai_requests_limit } } : s);
      }, 2500);
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
      setPaymentState("idle");
    }
  };

  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => v.replace(/\D/g, "").slice(0, 4).replace(/^(.{2})/, "$1/");

  const displayPlans = plans.length === 0 ? [
    { id: 1, name: "Student", price: 99, ai_requests_limit: 10, resume_downloads_limit: 5, features_json: '["Basic ATS Analysis","5 Resume Builds/mo","Mock Interviews (10/mo)","Career Roadmap Access"]' },
    { id: 2, name: "Professional", price: 249, ai_requests_limit: 50, resume_downloads_limit: 20, features_json: '["Advanced ATS Analysis","20 Resume Builds/mo","Unlimited Mock Interviews","Priority AI Access","LinkedIn Optimizer"]' },
    { id: 3, name: "Enterprise", price: 999, ai_requests_limit: 1000, resume_downloads_limit: 1000, features_json: '["Unlimited ATS","Unlimited Resumes","Dedicated API Access","Team Workspace","Custom Branding"]' },
  ] as Plan[] : plans;

  if (loadingData) return (
    <div style={{ display: "flex", minHeight: "60vh", alignItems: "center", justifyContent: "center" }}>
      <Loader2 size={36} color="#8B5CF6" className="animate-spin" />
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px", paddingBottom: 80 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 8 }}>
          Subscription & Billing
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Manage your plan and unlock the full power of TulasiAI.
        </p>
      </motion.div>

      {/* Current Status Banner */}
      {mySubscription && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="glass-card" style={{ padding: 24, marginBottom: 40, display: "flex", alignItems: "center", gap: 20, borderLeft: `4px solid ${mySubscription.has_subscription ? "#10B981" : "rgba(255,255,255,0.1)"}`, flexWrap: "wrap" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: mySubscription.has_subscription ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${mySubscription.has_subscription ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
            {mySubscription.has_subscription ? "👑" : "🆓"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 4 }}>
              {mySubscription.plan ? `${mySubscription.plan.name} Plan` : "Free Plan"}
              {mySubscription.has_subscription && <span style={{ marginLeft: 10, fontSize: 11, background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)", padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>ACTIVE</span>}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {mySubscription.plan
                ? `${mySubscription.plan.ai_requests_limit} AI requests/day · ${mySubscription.ai_usage_today} used today`
                : "Limited to free features · Upgrade to unlock everything"}
            </div>
          </div>
          {mySubscription.ends_at && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Renews</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{new Date(mySubscription.ends_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
            </div>
          )}
        </motion.div>
      )}

      {/* Plan Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 48 }}>
        {displayPlans.map((plan, i) => {
          const color = PLAN_COLORS[plan.name] || "#8B5CF6";
          const icon = PLAN_ICONS[plan.name] || "🚀";
          const isCurrentPlan = mySubscription?.plan?.name === plan.name;
          const isPro = plan.name === "Professional";

          return (
            <motion.div key={plan.id}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass-card"
              style={{ padding: 32, position: "relative", borderTop: `3px solid ${color}`, display: "flex", flexDirection: "column" }}>

              {isPro && <div style={{ position: "absolute", top: -12, right: 20, background: `linear-gradient(135deg, ${color}, #8B5CF6)`, color: "white", padding: "4px 14px", borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>MOST POPULAR</div>}

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}15`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{icon}</div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "white" }}>{plan.name}</h3>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Per month</div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: "white" }}>₹{plan.price}</span>
                <span style={{ fontSize: 14, color: "var(--text-muted)", marginLeft: 6 }}>/mo</span>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {feats(plan.features_json).map((f, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                    <CheckCircle size={14} color={color} style={{ flexShrink: 0 }} /> {f}
                  </li>
                ))}
                <li style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                  <CheckCircle size={14} color={color} style={{ flexShrink: 0 }} /> {plan.ai_requests_limit} AI requests/day
                </li>
              </ul>

              <button
                onClick={() => !isCurrentPlan && openModal(plan)}
                disabled={isCurrentPlan}
                style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: isCurrentPlan ? "default" : "pointer", fontWeight: 800, fontSize: 14, transition: "all 0.2s",
                  background: isCurrentPlan ? "rgba(255,255,255,0.06)" : `linear-gradient(135deg, ${color}, ${color}cc)`,
                  color: isCurrentPlan ? "var(--text-muted)" : "white",
                  boxShadow: isCurrentPlan ? "none" : `0 8px 24px ${color}40`,
                }}
              >
                {isCurrentPlan ? "✓ Current Plan" : `Upgrade to ${plan.name}`}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center", opacity: 0.5 }}>
        {["🔒 256-bit SSL Encryption", "✅ Cancel Anytime", "💳 Powered by Razorpay", "🔄 Instant Activation"].map(b => (
          <span key={b} style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>{b}</span>
        ))}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showModal && selectedPlan && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 24 }}
              style={{ background: "linear-gradient(145deg, #13141A, #0D0E14)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, padding: 36, width: "100%", maxWidth: 460, position: "relative", boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}
            >
              <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} />
              </button>

              {paymentState === "idle" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, ${PLAN_COLORS[selectedPlan.name] || "#8B5CF6"}, #8B5CF6)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Lock size={20} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: "white" }}>Secure Checkout</h3>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>TulasiAI · Powered by Razorpay</p>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div style={{ padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 14, marginBottom: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{selectedPlan.name} Plan (1 month)</span>
                      <span style={{ color: "white", fontWeight: 700 }}>₹{selectedPlan.price}</span>
                    </div>
                    {couponDiscount && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ color: "#10B981", fontSize: 13 }}>Coupon discount ({couponDiscount.discount_percent}%)</span>
                        <span style={{ color: "#10B981", fontWeight: 700 }}>−₹{(selectedPlan.price - couponDiscount.discounted_price).toFixed(0)}</span>
                      </div>
                    )}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "white", fontWeight: 800, fontSize: 15 }}>Total</span>
                      <span style={{ color: "white", fontWeight: 900, fontSize: 17 }}>₹{finalAmount.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Coupon Input */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <Tag size={14} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 12, top: 11 }} />
                      <input value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponDiscount(null); }} placeholder="Coupon code"
                        style={{ width: "100%", padding: "10px 10px 10px 32px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "white", fontSize: 13, outline: "none", fontFamily: "monospace" }} />
                    </div>
                    <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode}
                      style={{ padding: "10px 16px", borderRadius: 10, background: couponDiscount ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: couponDiscount ? "#10B981" : "white", fontSize: 13, cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {couponLoading ? <Loader2 size={14} className="animate-spin" /> : couponDiscount ? "✓ Applied" : "Apply"}
                    </button>
                  </div>

                  {/* Card Details */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Name on Card</label>
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your Full Name"
                        style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "white", fontSize: 14, outline: "none" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Card Number</label>
                      <div style={{ position: "relative" }}>
                        <CreditCard size={16} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 12, top: 12 }} />
                        <input value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} placeholder="0000 0000 0000 0000"
                          style={{ width: "100%", padding: "11px 14px 11px 36px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "white", fontSize: 14, outline: "none", fontFamily: "monospace" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Expiry</label>
                        <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY"
                          style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "white", fontSize: 14, outline: "none", textAlign: "center", fontFamily: "monospace" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>CVV</label>
                        <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,4))} type="password" placeholder="•••"
                          style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "white", fontSize: 14, outline: "none", textAlign: "center", fontFamily: "monospace" }} />
                      </div>
                    </div>
                  </div>

                  <motion.button whileTap={{ scale: 0.97 }} onClick={processPayment}
                    style={{ width: "100%", padding: "15px", borderRadius: 14, background: `linear-gradient(135deg, ${PLAN_COLORS[selectedPlan.name] || "#8B5CF6"}, #8B5CF6)`, color: "white", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 24px rgba(139,92,246,0.4)" }}>
                    <ShieldCheck size={18} /> Pay ₹{finalAmount.toFixed(0)} Securely
                  </motion.button>
                  <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 12 }}>Demo mode — no real charges will be made.</p>
                </>
              )}

              {paymentState === "processing" && (
                <div style={{ padding: "48px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ width: 56, height: 56, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8B5CF6", borderRadius: "50%", marginBottom: 24 }} />
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 8 }}>Verifying Payment…</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>Activating your subscription. Please wait.</p>
                </div>
              )}

              {paymentState === "success" && (
                <div style={{ padding: "48px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }}>
                    <CheckCircle size={72} color="#10B981" style={{ marginBottom: 20 }} />
                  </motion.div>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 8 }}>Payment Successful!</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
                    Welcome to TulasiAI {selectedPlan.name}! Your plan is now active.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
