"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { activityApi } from "@/lib/api";

const REWARD_ITEMS = [
  { id: 1, name: "Premium Resume Review", description: "Get your resume heavily reviewed by a FAANG engineer.", cost: 5000, icon: "📄", color: "#6C63FF", bg: "rgba(108,99,255,0.1)" },
  { id: 2, name: "1-on-1 Mentorship (30m)", description: "A private 30-minute career guidance session with an expert.", cost: 12000, icon: "🤝", color: "#4ECDC4", bg: "rgba(78,205,196,0.1)" },
  { id: 3, name: "Profile 'Pro' Badge", description: "Unlock a shiny PRO badge next to your name on the Leaderboard.", cost: 2500, icon: "⭐", color: "#FFD93D", bg: "rgba(255,217,61,0.1)" },
  { id: 4, name: "Early Access to Beta Features", description: "Get access to upcoming AI models and prep tools before anyone else.", cost: 1500, icon: "🚀", color: "#FF6B6B", bg: "rgba(255,107,107,0.1)" },
  { id: 5, name: "Custom Avatar Frame", description: "Stand out with a glowing neon avatar frame on your profile.", cost: 3000, icon: "🖼️", color: "#A78BFA", bg: "rgba(167,139,250,0.1)" },
  { id: 6, name: "Mock Interview Bypass", description: "Skip the queue and get priority scheduling for human mock interviews.", cost: 8000, icon: "🎯", color: "#F97316", bg: "rgba(249,115,22,0.1)" },
];

export default function RewardsPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken;
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (token) {
      activityApi.getStats(token).then(data => {
        setXp(data.xp || 0);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [token]);

  const handleRedeem = (item: any) => {
    if (xp < item.cost) return;
    setRedeeming(item.id);
    
    // Simulate API call for redemption
    setTimeout(() => {
      setXp(prev => prev - item.cost);
      setSuccessMsg(`Successfully redeemed: ${item.name}! Check your email for details.`);
      setRedeeming(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: 8 }}>
            Rewards <span className="gradient-text">Store</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
            Spend your hard-earned XP on exclusive perks and career boosts.
          </p>
        </div>

        <div className="dash-card" style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, border: "1px solid rgba(108,99,255,0.3)", background: "rgba(108,99,255,0.05)" }}>
          <div style={{ fontSize: 32 }}>⚡</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>Your XP Balance</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--brand-primary)" }}>
              {loading ? "..." : xp.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ padding: "16px 24px", background: "rgba(67, 233, 123, 0.15)", border: "1px solid rgba(67, 233, 123, 0.4)", color: "#43E97B", borderRadius: 12, fontWeight: 700, marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>🎉</span> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        {REWARD_ITEMS.map((item, i) => {
          const canAfford = xp >= item.cost;
          const isRedeeming = redeeming === item.id;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="dash-card" style={{ display: "flex", flexDirection: "column", padding: 28, position: "relative", overflow: "hidden", border: canAfford ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.03)", opacity: canAfford ? 1 : 0.6 }}>
              
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: item.color, filter: "blur(50px)", opacity: 0.15 }} />

              <div style={{ width: 56, height: 56, borderRadius: 16, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: item.color, marginBottom: 20 }}>
                {item.icon}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>{item.name}</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 24, flex: 1 }}>
                {item.description}
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 18, color: canAfford ? "var(--brand-primary)" : "var(--text-muted)" }}>
                  ⚡ {item.cost.toLocaleString()}
                </div>
                
                <button
                  onClick={() => handleRedeem(item)}
                  disabled={!canAfford || redeeming !== null}
                  style={{
                    padding: "10px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: canAfford && !redeeming ? "pointer" : "not-allowed", transition: "all 0.2s",
                    background: isRedeeming ? "var(--brand-primary)" : canAfford ? item.color : "rgba(255,255,255,0.05)",
                    color: canAfford ? "white" : "var(--text-muted)",
                    border: canAfford ? `1px solid ${item.color}` : "1px solid transparent",
                    boxShadow: canAfford && !isRedeeming ? `0 4px 14px ${item.color}40` : "none",
                  }}>
                  {isRedeeming ? "Processing..." : canAfford ? "Redeem" : "Locked"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
