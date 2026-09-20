import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { subscriptionsApi, SubscriptionStatus } from "@/lib/api";
import { CheckCircle, XCircle, RefreshCw, AlertCircle } from "lucide-react";

export function MembershipCard() {
  const router = useRouter();
  const [sub, setSub] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    subscriptionsApi.getMySubscription().then(setSub).catch(() => {});
  }, []);

  if (!sub) return null;

  const isActive = sub.subscription_status === "active";
  const isAuthenticated = sub.subscription_status === "authenticated";
  const isPastDue = sub.subscription_status === "past_due" || sub.subscription_status === "halted";
  const isCancelled = sub.subscription_status === "cancelled" || sub.subscription_status === "expired";
  const isPending = sub.subscription_status === "pending";

  const hasMembership = isActive || isAuthenticated;

  if (!hasMembership && !isPastDue && !isPending && !isCancelled) return null;

  const statusBadge = () => {
    if (isActive) return (
      <span style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", padding: "4px 10px", borderRadius: 16, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
        <CheckCircle size={12} /> ACTIVE
      </span>
    );
    if (isAuthenticated) return (
      <span style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B", padding: "4px 10px", borderRadius: 16, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
        <AlertCircle size={12} /> AUTHENTICATING
      </span>
    );
    if (isPastDue) return (
      <span style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", padding: "4px 10px", borderRadius: 16, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
        <XCircle size={12} /> PAST DUE
      </span>
    );
    if (isCancelled) return (
      <span style={{ background: "rgba(107,114,128,0.1)", color: "#9CA3AF", padding: "4px 10px", borderRadius: 16, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
        <XCircle size={12} /> {sub.subscription_status.toUpperCase()}
      </span>
    );
    return null;
  };

  const leftBorderColor = isActive ? "#10B981" : isAuthenticated ? "#F59E0B" : isPastDue ? "#EF4444" : "#6B7280";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 24, position: "relative", overflow: "hidden", marginBottom: 24 }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: leftBorderColor }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>TULASIAI MEMBERSHIP</h2>

          {sub.membership_id && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 15, fontFamily: "monospace", color: "#06B6D4", letterSpacing: 1 }}>{sub.membership_id}</span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>
              {sub.plan?.name || "Free"}
            </span>
            {statusBadge()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
          {sub.plan && (
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              ₹{sub.plan.price} <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>/ month</span>
            </div>
          )}
          <button
            onClick={() => router.push("/dashboard/billing")}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}
          >
            Manage
          </button>
        </div>
      </div>

      {/* AutoPay + billing row */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 24, flexWrap: "wrap", fontSize: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw size={13} color={sub.auto_renew ? "#10B981" : "#6B7280"} />
          <span style={{ color: "rgba(255,255,255,0.5)" }}>AutoPay:</span>
          <span style={{ fontWeight: 600, color: sub.auto_renew ? "#10B981" : "#9CA3AF" }}>
            {sub.auto_renew ? "ON" : "OFF"}
          </span>
        </div>

        {sub.next_billing_at && sub.auto_renew && (
          <div>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Next billing: </span>
            <span style={{ fontWeight: 500 }}>
              {new Date(sub.next_billing_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              {sub.plan && <span style={{ color: "#06B6D4" }}> · ₹{sub.plan.price}</span>}
            </span>
          </div>
        )}

        {sub.ends_at && !sub.auto_renew && (
          <div>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Access until: </span>
            <span style={{ fontWeight: 500 }}>{new Date(sub.ends_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        )}

        {sub.provider_payment_method && (
          <div>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Method: </span>
            <span style={{ fontWeight: 500, textTransform: "uppercase" }}>{sub.provider_payment_method}</span>
          </div>
        )}
      </div>

      {/* Pending confirmation notice */}
      {isAuthenticated && (
        <div style={{ marginTop: 16, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: 12, fontSize: 13, color: "#F59E0B", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={14} />
          Mandate approved. Awaiting first payment confirmation — this usually takes a few minutes.
        </div>
      )}
    </motion.div>
  );
}
