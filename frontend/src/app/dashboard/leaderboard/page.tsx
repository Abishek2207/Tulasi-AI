"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { activityApi } from "@/lib/api";
import { TiltCard } from "@/components/ui/TiltCard";

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const RANK_GLOWS = [
  "rgba(255, 215, 0, 0.4)",
  "rgba(192, 192, 192, 0.3)",
  "rgba(205, 127, 50, 0.3)"
];

interface LocalLeaderboardUser {
  id: number | string;
  name: string;
  xp: number;
  level: number;
  avatar?: string;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LocalLeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = (session?.user as any)?.id;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await activityApi.getLeaderboard(token);
        setLeaderboard((data.leaderboard as unknown as LocalLeaderboardUser[]) || []);
      } catch (e) {}
      setLoading(false);
    };
    fetchLeaderboard();
  }, [token]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60, position: "relative" }}>
      
      {/* Background Glow Mesh */}
      <div style={{ 
        position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", 
        width: "100%", height: 300, background: "radial-gradient(circle at center, rgba(124, 58, 237, 0.08) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: -1
      }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          style={{ fontSize: 64, marginBottom: 16 }}>🏆</motion.div>
        <h1 style={{ fontSize: 42, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 12, letterSpacing: "-1px" }}>
          Global <span className="gradient-text">Leaderboard</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
          The elite circle of Tulasi AI learners. Rank up by completing challenges and labs.
        </p>
      </div>

      {/* Podium for Top 3 */}
      {!loading && leaderboard.length >= 3 && (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 24, marginBottom: 64, perspective: 1000 }}>
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((user, i) => {
            if (!user) return <div key={i} style={{ width: 180 }} />;
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const heights = [160, 200, 140];
            const colors = RANK_COLORS[rank - 1];
            const glows = RANK_GLOWS[rank - 1];

            return (
              <TiltCard
                key={user.id as string}
                intensity={10}
                style={{ 
                  display: "flex", flexDirection: "column", alignItems: "center", width: 180,
                  background: `rgba(255,255,255,0.03)`, border: `1px solid ${colors}40`, padding: "20px 0 0" 
                }}>
                <div style={{ 
                  width: 64, height: 64, borderRadius: "50%", 
                  background: `linear-gradient(135deg, ${colors}40, ${colors}80)`, 
                  border: `2px solid ${colors}`, display: "flex", alignItems: "center", justifyContent: "center", 
                  fontWeight: 900, fontSize: 24, color: colors, marginBottom: 8, 
                  boxShadow: `0 0 30px ${glows}` 
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 4 }}>{user.name}</div>
                <div style={{ fontSize: 14, color: colors, fontWeight: 700 }}>{user.xp.toLocaleString()} XP</div>
                
                <div style={{ 
                  marginTop: 20, width: "100%", height: heights[i], 
                  background: `linear-gradient(180deg, ${colors}30 0%, transparent 100%)`, 
                  borderTop: `1px solid ${colors}40`, borderRadius: "12px 12px 0 0", 
                  display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 16 
                }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: colors, textShadow: `0 0 10px ${colors}80` }}>#{rank}</span>
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}

      {/* Full List */}
      <div className="glass-card" style={{ padding: 0, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.01)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>All Active Rankings</h2>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Total Players: {leaderboard.length}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <AnimatePresence>
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
                <div className="spinner" style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--brand-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                <div style={{ fontWeight: 600 }}>Syncing rankings...</div>
              </motion.div>
            ) : leaderboard.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏃‍♂️</div>
                <div style={{ fontWeight: 600 }}>The race hasn't started yet. Be the first to earn XP!</div>
              </motion.div>
            ) : leaderboard.map((user, idx) => {
              const isCurrentUser = user.id === currentUserId;
              const isTop3 = idx < 3;
              return (
                <motion.div
                  key={user.id as string}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    display: "flex", alignItems: "center", padding: "18px 32px", gap: 20,
                    background: isCurrentUser ? "rgba(124, 58, 237, 0.08)" : "transparent",
                    borderLeft: isCurrentUser ? "4px solid var(--brand-primary)" : "4px solid transparent",
                    borderBottom: idx < leaderboard.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                    transition: "all 0.2s"
                  }}>
                  {/* Rank */}
                  <div style={{ width: 40, textAlign: "center", fontWeight: 900, fontSize: 18, color: isTop3 ? RANK_COLORS[idx] : "var(--text-muted)", flexShrink: 0 }}>
                    {isTop3 ? ["🥇","🥈","🥉"][idx] : `#${idx + 1}`}
                  </div>

                  {/* Avatar Overlay */}
                  <div style={{ position: "relative" }}>
                    {user.avatar ? (
                      <img src={user.avatar as string} style={{ width: 48, height: 48, borderRadius: "50%", border: isTop3 ? `2px solid ${RANK_COLORS[idx]}` : "1px solid var(--border)" }} />
                    ) : (
                      <div style={{ 
                        width: 48, height: 48, borderRadius: "50%", 
                        background: isTop3 ? `linear-gradient(135deg, ${RANK_COLORS[idx]}, ${RANK_COLORS[idx]}80)` : "linear-gradient(135deg, #7C3AED, #06B6D4)", 
                        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "white", flexShrink: 0 
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isTop3 && (
                      <div style={{ position: "absolute", bottom: -2, right: -2, width: 18, height: 18, background: RANK_COLORS[idx], borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "2px solid #05070D" }}>⚡</div>
                    )}
                  </div>

                  {/* Name + Level */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: isCurrentUser ? "white" : "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                      {user.name}
                      {isCurrentUser && <span style={{ fontSize: 10, background: "var(--brand-primary)", color: "white", padding: "2px 10px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase" }}>YOU</span>}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "var(--text-muted)" }}>Level {user.level}</span>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-muted)" }} />
                      <span style={{ color: "var(--brand-green)" }}>Elite status</span>
                    </div>
                  </div>

                  {/* XP */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, fontSize: 18, color: isTop3 ? RANK_COLORS[idx] : "white" }}>
                      {(user.xp || 0).toLocaleString()} <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>XP</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      <style>{`
        .spinner { border-top-color: var(--brand-primary); }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
