"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { rewardApi, activityApi } from "@/lib/api";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Reward {
  id: number;
  name: string;
  description: string;
  cost_xp: number;
  category: string;
}

export default function RewardsStorePage() {
  const { data: session } = useSession();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [ownedBadges, setOwnedBadges] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redeeming, setRedeeming] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = (session?.user as any)?.accessToken;
      if (!token) return;
      
      const [rewardData, statsData] = await Promise.all([
        rewardApi.getRewards(token),
        activityApi.getStats(token)
      ]);
      
      setRewards(rewardData.rewards || []);
      setTotalXp((statsData as any).xp || 0);
      
      const badges = (statsData as any).badges || [];
      setOwnedBadges(new Set(badges.map((b: any) => b.name)));
    } catch (err: any) {
      setError("Failed to load rewards store.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const handleRedeem = async (rewardId: number, rewardName: string, cost: number) => {
    if (totalXp < cost) {
      alert("Not enough XP!");
      return;
    }
    
    setRedeeming(rewardId);
    try {
      const token = (session?.user as any)?.accessToken;
      const res = await rewardApi.redeem(rewardId, token);
      
      setTotalXp(res.remaining_xp);
      setOwnedBadges(prev => {
        const next = new Set(prev);
        next.add(rewardName);
        return next;
      });
      alert(res.message);
    } catch (err: any) {
      alert(err.message || "Failed to redeem reward");
    } finally {
      setRedeeming(null);
    }
  };

  const categories = ["all", ...Array.from(new Set(rewards.map(r => r.category)))];
  const [activeCategory, setActiveCategory] = useState("all");

  const categoryIcons: Record<string, string> = {
    "customization": "🎨",
    "feature": "🚀",
    "perk": "💎"
  };

  const filteredRewards = activeCategory === "all" ? rewards : rewards.filter(r => r.category === activeCategory);

  if (loading) return <div style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: 100 }}>Loading store...</div>;
  if (error) return <div style={{ color: "var(--danger)", textAlign: "center", marginTop: 100 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: 12 }}>
            Rewards <span className="gradient-text">Store</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
            Trade your hard-earned XP for exclusive platform perks and customizations.
          </p>
        </div>
        
        <div className="glass-card" style={{ padding: "12px 24px", borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,107,107,0.3)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>⚡</span>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Your Balance</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "white", fontFamily: "var(--font-display)" }}>{totalXp} XP</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            style={{ 
              padding: "8px 20px", 
              borderRadius: 20, 
              border: `1px solid ${activeCategory === cat ? "var(--brand-primary)" : "rgba(255,255,255,0.1)"}`,
              background: activeCategory === cat ? "rgba(124,58,237,0.1)" : "transparent",
              color: activeCategory === cat ? "white" : "var(--text-secondary)",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {cat === "all" ? "All Rewards" : <span style={{ textTransform: "capitalize" }}>{categoryIcons[cat] || "🏷️"} {cat}</span>}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        <AnimatePresence>
          {filteredRewards.map((reward) => {
            const isOwned = ownedBadges.has(reward.name);
            const canAfford = totalXp >= reward.cost_xp;
            
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={reward.id} 
                className="glass-card" 
                style={{ 
                  padding: 32, 
                  borderRadius: 24, 
                  background: isOwned ? "rgba(78, 205, 196, 0.05)" : "rgba(255,255,255,0.02)", 
                  border: `1px solid ${isOwned ? "rgba(78, 205, 196, 0.3)" : "rgba(255,255,255,0.06)"}`,
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {isOwned && (
                  <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(78, 205, 196, 0.2)", color: "#4ECDC4", padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 800 }}>
                    OWNED ✓
                  </div>
                )}
                
                <div style={{ fontSize: 40, marginBottom: 16 }}>{categoryIcons[reward.category] || "🎁"}</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{reward.name}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.5, marginBottom: 24, minHeight: 42 }}>
                  {reward.description}
                </p>
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, color: isOwned ? "var(--text-muted)" : canAfford ? "white" : "var(--danger)" }}>
                    <span>⚡</span> {reward.cost_xp} XP
                  </div>
                  
                  <button 
                    disabled={isOwned || !canAfford || redeeming === reward.id}
                    onClick={() => handleRedeem(reward.id, reward.name, reward.cost_xp)}
                    style={{ 
                      padding: "10px 20px", 
                      borderRadius: 12, 
                      border: "none", 
                      background: isOwned ? "rgba(255,255,255,0.1)" : canAfford ? "var(--brand-primary)" : "rgba(255,255,255,0.05)",
                      color: isOwned || !canAfford ? "var(--text-muted)" : "white",
                      fontWeight: 700,
                      cursor: (isOwned || !canAfford || redeeming === reward.id) ? "not-allowed" : "pointer",
                      transition: "0.2s"
                    }}
                  >
                    {redeeming === reward.id ? "Processing..." : isOwned ? "Equiped" : "Unlock"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {filteredRewards.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-secondary)" }}>
          No rewards found in this category.
        </div>
      )}
    </div>
  );
}
