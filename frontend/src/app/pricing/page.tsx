"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { subscriptionsApi, CheckoutResponse } from "@/lib/api";
import { CheckCircle, Loader2, X, Shield, RefreshCw, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { TulasiLogo } from "@/components/TulasiLogo";

type RazorpayOptions = Record<string, unknown>;

// ─── Plan data ──────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "student",
    label: "Student",
    price: 500,
    color: "#10B981",
    border: "rgba(16,185,129,0.3)",
    gradient: "linear-gradient(180deg, rgba(16,185,129,0.08) 0%, rgba(255,255,255,0.02) 100%)",
    cta: "Start for ₹500/month",
    tagline: "For students preparing for internships and placements.",
    features: [
      "Placement Readiness",
      "Smart Job Match",
      "Next Best Action",
      "DSA/Coding Preparation",
      "Core CS Preparation",
      "AI/ML Career Preparation",
      "AI Interviewer",
      "Communication Coach",
      "Hackathon Presentation Coach",
      "Resume Intelligence",
      "Project Intelligence",
      "Skill Gap",
      "Personalized Learning",
      "Market Intelligence",
      "Jarvis",
      "Notifications",
      "Career Dashboard",
    ],
  },
  {
    id: "professional",
    label: "Working Professional",
    price: 700,
    color: "#06B6D4",
    border: "rgba(6,182,212,0.3)",
    gradient: "linear-gradient(180deg, rgba(6,182,212,0.1) 0%, rgba(255,255,255,0.02) 100%)",
    cta: "Start for ₹700/month",
    tagline: "For professionals growing their careers and staying relevant.",
    features: [
      "Career Health",
      "Career Risk Intelligence",
      "Career Growth",
      "Career Transition",
      "Skill Gap",
      "Smart Job Match",
      "Market Intelligence",
      "AI Interviewer",
      "Communication Coach",
      "Resume Intelligence",
      "Project/Career Intelligence",
      "Personalized Learning",
      "Jarvis",
      "Notifications",
      "Career Dashboard",
    ],
  },
];

// ─── Consent Modal ───────────────────────────────────────────────────────────

interface ConsentModalProps {
  plan: typeof PLANS[0];
  onConfirm: () => void;
  onCancel: () => void;
}

function ConsentModal({ plan, onConfirm, onCancel }: ConsentModalProps) {
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 1);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 40, maxWidth: 460, width: "100%", position: "relative" }}
      >
        <button onClick={onCancel} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `rgba(${plan.color === "#10B981" ? "16,185,129" : "6,182,212"},0.1)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <RefreshCw size={28} color={plan.color} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Monthly AutoPay</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Review your recurring payment details</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Plan</span>
            <span style={{ fontWeight: 600 }}>TulasiAI {plan.label}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Amount</span>
            <span style={{ fontWeight: 700, color: plan.color }}>₹{plan.price} / month</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Billing</span>
            <span style={{ fontWeight: 600 }}>Monthly (every 30 days)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>First charge</span>
            <span style={{ fontWeight: 600 }}>Today, ₹{plan.price}</span>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
          <strong style={{ color: "rgba(255,255,255,0.8)" }}>You are approving a monthly AutoPay mandate.</strong> ₹{plan.price} will be automatically charged every month using UPI AutoPay or your saved payment method. You can cancel anytime from your dashboard.
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: "14px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 2, padding: "14px", borderRadius: 12, background: plan.color, color: "white", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer" }}
          >
            Continue to UPI Payment
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Pending State Banner ────────────────────────────────────────────────────

function PendingBanner({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: 20, display: "flex", gap: 16, alignItems: "center" }}>
      <AlertCircle color="#F59E0B" size={24} />
      <div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Payment confirmation pending</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Your UPI payment is still being confirmed. Please don't pay again. This may take a few minutes.</div>
      </div>
      <button onClick={onRefresh} style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#F59E0B", padding: "8px 16px", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", fontSize: 13 }}>
        Refresh
      </button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PricingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [consentPlan, setConsentPlan] = useState<typeof PLANS[0] | null>(null);
  const [paymentPending, setPaymentPending] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Check if user returned from auth with pending plan
    const pendingPlan = localStorage.getItem("pending_checkout_plan");
    if (pendingPlan && status === "authenticated") {
      localStorage.removeItem("pending_checkout_plan");
      const plan = PLANS.find(p => p.id === pendingPlan);
      if (plan) setConsentPlan(plan);
    }
  }, [status]);

  const handlePlanClick = (plan: typeof PLANS[0]) => {
    if (status === "unauthenticated") {
      localStorage.setItem("pending_checkout_plan", plan.id);
      router.push("/auth?mode=register");
      return;
    }
    // Show consent modal first
    setConsentPlan(plan);
  };

  const handleConsentConfirm = async () => {
    if (!consentPlan) return;
    setConsentPlan(null);
    await initiateCheckout(consentPlan);
  };

  const initiateCheckout = async (plan: typeof PLANS[0]) => {
    if (loading) return;
    setLoading(true);
    setProcessingPlan(plan.id);

    try {
      // 1. Create Razorpay Subscription on backend
      const orderData: CheckoutResponse = await subscriptionsApi.checkout(plan.id);

      // 2. Open Razorpay Checkout with subscription_id (not order_id)
      //    Razorpay automatically shows UPI AutoPay mandate flow
      const options: RazorpayOptions = {
        key: orderData.key,
        subscription_id: orderData.subscription_id,  // KEY: subscription_id for recurring
        name: "TulasiAI",
        description: orderData.description,
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: { color: plan.color },
        // Tell Razorpay to show UPI as the first/preferred payment method
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [
                  { method: "upi" },
                ],
              },
            },
            sequence: ["block.upi"],
            preferences: { show_default_blocks: true },
          },
        },
        handler: async function (response: Record<string, string>) {
          // 3. Verify subscription mandate with backend
          toast.loading("Verifying payment mandate...", { id: "verify" });
          setPaymentPending(true);
          try {
            const verifyRes = await subscriptionsApi.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Mandate approved! 🎉 Activating your membership...", { id: "verify" });
            setPaymentPending(false);
            router.push(`/dashboard/billing?success=true&membership_id=${verifyRes.membership_id || ""}`);
          } catch (err: unknown) {
            setPaymentPending(false);
            const msg = err instanceof Error ? err.message : "Verification failed. Please contact support.";
            toast.error(msg, { id: "verify" });
          }
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RazorpayConstructor = (window as any).Razorpay;
      if (!RazorpayConstructor) {
        throw new Error("Razorpay script not loaded. Please refresh and try again.");
      }

      const rzp = new RazorpayConstructor(options);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on("payment.failed", function (response: any) {
        const reason = response?.error?.description || "Payment was not completed.";
        toast.error(reason);
        setPaymentPending(false);
      });

      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate checkout";
      toast.error(msg);
    } finally {
      setLoading(false);
      setProcessingPlan(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0A0A0A", position: "relative", overflow: "hidden", color: "white" }}>
      {/* Background */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "50%", background: "radial-gradient(ellipse at top, rgba(6,182,212,0.12), transparent 60%)" }} />
      </div>

      {/* Consent Modal */}
      <AnimatePresence>
        {consentPlan && (
          <ConsentModal
            plan={consentPlan}
            onConfirm={handleConsentConfirm}
            onCancel={() => setConsentPlan(null)}
          />
        )}
      </AnimatePresence>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>

        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <TulasiLogo size={48} glow />
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16, letterSpacing: "-1px" }}>
            Choose Your AI Career Partner
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", maxWidth: 560, margin: "0 auto 24px" }}>
            Monthly recurring membership. Cancel anytime.
          </p>

          {/* UPI badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 24, padding: "8px 20px" }}>
            <Shield size={16} color="#10B981" />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
              Pay securely with UPI · Google Pay · PhonePe · Paytm · BHIM
            </span>
          </div>
        </div>

        {/* Pending banner */}
        {paymentPending && (
          <div style={{ marginBottom: 32, maxWidth: 900, margin: "0 auto 32px" }}>
            <PendingBanner onRefresh={() => router.refresh()} />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 32, maxWidth: 900, margin: "0 auto" }}>
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: plan.id === "professional" ? 0.1 : 0 }}
              style={{ background: plan.gradient, border: `1px solid ${plan.border}`, borderRadius: 24, padding: 40, display: "flex", flexDirection: "column" }}
            >
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: plan.color }}>{plan.label}</h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, minHeight: 40 }}>{plan.tagline}</p>
              </div>

              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 800 }}>₹{plan.price}</span>
                <span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}> / month</span>
              </div>

              <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                <RefreshCw size={14} color={plan.color} />
                <span>Monthly AutoPay — cancel anytime</span>
              </div>

              <button
                onClick={() => handlePlanClick(plan)}
                disabled={loading}
                style={{
                  width: "100%", padding: 16, borderRadius: 12,
                  background: plan.color, color: "white",
                  fontWeight: 700, fontSize: 16, border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginBottom: 32,
                  display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
                  opacity: loading ? 0.7 : 1,
                  transition: "all 0.2s"
                }}
              >
                {processingPlan === plan.id
                  ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
                  : plan.cta
                }
              </button>

              {/* UPI apps note */}
              <div style={{ marginBottom: 24, padding: "12px 16px", background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
                Google Pay · PhonePe · Paytm · BHIM · other UPI apps
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                {plan.features.map(feat => (
                  <div key={feat} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                    <CheckCircle size={16} color={plan.color} style={{ flexShrink: 0 }} /> {feat}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust footer */}
        <div style={{ textAlign: "center", marginTop: 48, fontSize: 13, color: "rgba(255,255,255,0.4)", display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          <span>🔒 Payments secured by Razorpay</span>
          <span>🔄 Cancel anytime from dashboard</span>
          <span>📱 UPI AutoPay mandate required</span>
        </div>
      </div>
    </div>
  );
}
