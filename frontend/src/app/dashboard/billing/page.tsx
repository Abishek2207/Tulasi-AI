"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { subscriptionsApi, SubscriptionStatus, PaymentRecord } from "@/lib/api";
import { CheckCircle, Loader2, ArrowRight, XCircle, RefreshCw, AlertCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const justSubscribed = searchParams.get("success") === "true";

  useEffect(() => {
    if (status === "authenticated") {
      fetchSubscriptionData();
    }
  }, [status]);

  useEffect(() => {
    if (justSubscribed) {
      toast.success("Welcome to TulasiAI! 🎉 Your membership is active.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [justSubscribed]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subData, historyData] = await Promise.all([
        subscriptionsApi.getMySubscription(),
        subscriptionsApi.getPaymentHistory(),
      ]);
      setSubStatus(subData);
      setPaymentHistory(historyData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load subscription details.");
    } finally {
      setLoading(false);
    }
  };

  const copyMemberId = () => {
    if (subStatus?.membership_id) {
      navigator.clipboard.writeText(subStatus.membership_id);
      toast.success("Member ID copied to clipboard!");
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);
      const res = await subscriptionsApi.cancelSubscription(true);
      toast.success(res.message);
      setShowCancelModal(false);
      fetchSubscriptionData();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription.");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <Loader2 className="animate-spin" size={32} color="#06B6D4" />
      </div>
    );
  }

  const isActive = subStatus?.subscription_status === "active";
  const isAuthenticated = subStatus?.subscription_status === "authenticated";
  const isPastDue = subStatus?.subscription_status === "past_due" || subStatus?.subscription_status === "halted";
  const isCancelled = subStatus?.subscription_status === "cancelled" || subStatus?.subscription_status === "expired";
  const isPending = subStatus?.subscription_status === "pending";

  const hasMembership = isActive || isAuthenticated;
  
  const statusBadge = () => {
    if (isActive) return (
      <span style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
        <CheckCircle size={14} /> ACTIVE
      </span>
    );
    if (isAuthenticated) return (
      <span style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
        <AlertCircle size={14} /> AUTHENTICATING
      </span>
    );
    if (isPastDue) return (
      <span style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
        <XCircle size={14} /> PAST DUE
      </span>
    );
    if (isCancelled) return (
      <span style={{ background: "rgba(107,114,128,0.1)", color: "#9CA3AF", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
        <XCircle size={14} /> {subStatus?.subscription_status.toUpperCase()}
      </span>
    );
    return null;
  };

  const leftBorderColor = isActive ? "#10B981" : isAuthenticated ? "#F59E0B" : isPastDue ? "#EF4444" : "#6B7280";

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>My Membership</h1>
      <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 40 }}>Manage your TulasiAI career operating system membership.</p>

      {/* TULASIAI MEMBERSHIP CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 32, position: "relative", overflow: "hidden", marginBottom: 40 }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: (hasMembership || isPastDue || isCancelled) ? leftBorderColor : "transparent" }} />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>TULASIAI MEMBERSHIP</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24, fontWeight: 700 }}>
                {subStatus?.plan?.name || "Free"}
              </span>
              {statusBadge()}
            </div>
          </div>

          {subStatus?.plan?.price && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>₹{subStatus.plan.price}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>/ month</div>
            </div>
          )}
        </div>

        {subStatus?.membership_id && (
          <div style={{ background: "rgba(0,0,0,0.2)", padding: 20, borderRadius: 16, border: "1px dashed rgba(255,255,255,0.1)", marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Member ID</div>
              <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "monospace", color: "#06B6D4" }}>
                {subStatus.membership_id}
              </div>
            </div>
            <button onClick={copyMemberId} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>
              Copy
            </button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          {subStatus?.started_at && (
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Started At</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {new Date(subStatus.started_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          )}
          
          {(subStatus?.next_billing_at || subStatus?.ends_at) && (
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                {subStatus?.auto_renew ? "Next Billing Date" : "Access Until"}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {new Date(subStatus.auto_renew ? subStatus.next_billing_at! : subStatus.ends_at!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          )}
          
          {subStatus?.provider_payment_method && (
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Payment Method</div>
              <div style={{ fontSize: 14, fontWeight: 500, textTransform: "uppercase" }}>
                {subStatus.provider_payment_method}
              </div>
            </div>
          )}

          {(hasMembership || isPastDue) && (
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>AutoPay</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: subStatus?.auto_renew ? "#10B981" : "#9CA3AF", display: "flex", alignItems: "center", gap: 6 }}>
                <RefreshCw size={14} /> {subStatus?.auto_renew ? "ON" : "OFF"}
              </div>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: 16, fontSize: 14, color: "#F59E0B", display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <AlertCircle size={20} />
            <div>
              <strong>Payment Pending Confirmation</strong>
              <div style={{ fontSize: 13, marginTop: 4, color: "rgba(245,158,11,0.8)" }}>Your mandate is approved. We are waiting for the final confirmation from the payment provider. This usually takes a few minutes.</div>
            </div>
          </div>
        )}

        {!hasMembership && !isPastDue && !isPending && (
          <div style={{ background: "rgba(255,255,255,0.05)", padding: 24, borderRadius: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Unlock Premium Features</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Upgrade to Student or Professional to access AI tools.</div>
            </div>
            <button onClick={() => router.push("/pricing")} style={{ background: "#06B6D4", color: "white", padding: "10px 20px", borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer" }}>
              View Plans
            </button>
          </div>
        )}

        {(hasMembership || isPastDue) && subStatus?.auto_renew && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button 
              onClick={() => setShowCancelModal(true)}
              style={{ background: "none", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
              onMouseOut={e => e.currentTarget.style.background = "none"}
            >
              <Trash2 size={16} /> Cancel Subscription
            </button>
          </div>
        )}
      </motion.div>

      {/* PAYMENT HISTORY */}
      {paymentHistory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Payment History</h2>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
                  <th style={{ padding: "16px 20px", fontWeight: 500 }}>Date</th>
                  <th style={{ padding: "16px 20px", fontWeight: 500 }}>Amount</th>
                  <th style={{ padding: "16px 20px", fontWeight: 500 }}>Method</th>
                  <th style={{ padding: "16px 20px", fontWeight: 500, textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, i) => (
                  <tr key={payment.id} style={{ borderBottom: i !== paymentHistory.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <td style={{ padding: "16px 20px", color: "rgba(255,255,255,0.8)" }}>
                      {new Date(payment.paid_at || payment.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "16px 20px", fontWeight: 600 }}>
                      ₹{payment.amount}
                    </td>
                    <td style={{ padding: "16px 20px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                      {payment.payment_method || "—"}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <span style={{ 
                        background: payment.status === "paid" ? "rgba(16,185,129,0.1)" : payment.status === "failed" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", 
                        color: payment.status === "paid" ? "#10B981" : payment.status === "failed" ? "#EF4444" : "#F59E0B", 
                        padding: "4px 10px", borderRadius: 16, fontSize: 11, fontWeight: 700 
                      }}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 32, maxWidth: 400, width: "100%" }}
            >
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <AlertCircle size={24} color="#EF4444" />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Cancel Subscription?</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                  You will lose access to premium AI features at the end of your current billing cycle. AutoPay will be turned off.
                </p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelLoading}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  Keep It
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#EF4444", color: "white", fontSize: 14, fontWeight: 600, border: "none", cursor: cancelLoading ? "not-allowed" : "pointer", opacity: cancelLoading ? 0.7 : 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
                >
                  {cancelLoading ? <Loader2 size={16} className="animate-spin" /> : "Yes, Cancel"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
