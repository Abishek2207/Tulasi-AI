"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { activityApi } from "@/lib/api";

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = (session?.user as any)?.id;
  const token = "";

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await activityApi.getLeaderboard(token);
        setLeaderboard(data.leaderboard || []);
      } catch (e) {}
      setLoading(false);
    };
    fetchLeaderboard();
  }, [token]);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 60 }}>
      
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          style={{ fontSize: 64, marginBottom: 16 }}>🏆</motion.div>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: 12 }}>
          Global <span className="gradient-text">Leaderboard</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
          Top learners ranked by XP earned across all platform activities
        </p>
      </div>

      {/* Podium for Top 3 */}
      {!loading && leaderboard.length >= 3 && (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 16, marginBottom: 48, paddingBottom: 0 }}>
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((user, i) => {
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const heights = [160, 200, 140];
            const colors = ["#C0C0C0", "#FFD700", "#CD7F32"];
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * rank }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 160 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${colors[i]}40, ${colors[i]}80)`, border: `2px solid ${colors[i]}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: colors[i], marginBottom: 8, boxShadow: `0 0 20px ${colors[i]}40` }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 }}>{user.name}</div>
                <div style={{ fontSize: 13, color: colors[i], fontWeight: 700 }}>{user.xp} XP</div>
                <div style={{ marginTop: 12, width: "100%", height: heights[i], background: `linear-gradient(180deg, ${colors[i]}30 0%, ${colors[i]}10 100%)`, border: `1px solid ${colors[i]}40`, borderBottom: "none", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: colors[i] }}>#{rank}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full List */}
      <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>All Rankings</h2>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <div>Loading rankings...</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🏆</div>
            <div>No rankings yet. Start earning XP!</div>
          </div>
        ) : leaderboard.map((user, idx) => {
          const isCurrentUser = user.id === currentUserId;
          const isTop3 = idx < 3;
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              style={{
                display: "flex", alignItems: "center", padding: "16px 24px", gap: 16,
                background: isCurrentUser ? "rgba(108,99,255,0.08)" : "transparent",
                borderLeft: isCurrentUser ? "3px solid var(--brand-primary)" : "3px solid transparent",
                borderBottom: idx < leaderboard.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                transition: "background 0.2s",
              }}>
              {/* Rank */}
              <div style={{ width: 36, textAlign: "center", fontWeight: 900, fontSize: 18, color: isTop3 ? RANK_COLORS[idx] : "var(--text-muted)", flexShrink: 0 }}>
                {isTop3 ? ["🥇","🥈","🥉"][idx] : `#${idx + 1}`}
              </div>

              {/* Avatar */}
              {user.avatar ? (
                <img src={user.avatar} style={{ width: 42, height: 42, borderRadius: "50%" }} />
              ) : (
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: isTop3 ? `linear-gradient(135deg, ${RANK_COLORS[idx]}, ${RANK_COLORS[idx]}80)` : "linear-gradient(135deg, #6C63FF, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "white", flexShrink: 0 }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Name + Level */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: isCurrentUser ? "white" : "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                  {user.name}
                  {isCurrentUser && <span style={{ fontSize: 11, background: "var(--brand-primary)", color: "white", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>You</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Level {user.level}</div>
              </div>

              {/* XP */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: 17, color: isTop3 ? RANK_COLORS[idx] : "var(--brand-primary)" }}>
                  {(user.xp || 0).toLocaleString()} XP
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
