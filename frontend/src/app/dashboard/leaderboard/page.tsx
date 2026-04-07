"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { activityApi } from "@/lib/api";
import { TiltCard } from "@/components/ui/TiltCard";
import confetti from "canvas-confetti";

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
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userContext, setUserContext] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = (session?.user as any)?.id;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await activityApi.getLeaderboard(token);
        setLeaderboard(data.leaderboard || []);
        setUserContext(data.user_context || null);
      } catch (e) {}
      setLoading(false);
    };
    fetchLeaderboard();
  }, [token]);

  const handleShare = async () => {
    if (!userContext) return;
    
    // 🎉 Confetti Celebration
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#7C3AED", "#06B6D4", "#F43F5E", "#FFD700"]
    });

    const shareText = `🚀 I just reached Rank #${userContext.rank} on Tulasi AI with ${userContext.xp.toLocaleString()} XP! 🔥 Join the elite circle of learners at Tulasi AI. @TulasiAI #TulasiAI #LearningGoal`;
    const shareUrl = "https://tulasiai.in";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Tulasi AI Progress",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        alert("Status copied to clipboard! 🚀 Share it on your socials.");
      } catch (err) {
        console.error("Clipboard failed:", err);
      }
    }
  };

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

      {/* Podium for Top 3 — Hidden on small mobile, simplified on tablets */}
      {!loading && leaderboard.length >= 3 && (
        <div className="podium-container">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((user, i) => {
            if (!user) return <div key={i} className="podium-placeholder" />;
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const colors = RANK_COLORS[rank - 1];
            const glows = RANK_GLOWS[rank - 1];

            return (
              <motion.div
                key={user.id as string}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rank * 0.1 }}
                className={`podium-item item-rank-${rank}`}
              >
                <TiltCard
                  intensity={10}
                  className="podium-card"
                  style={{ 
                    border: rank === 1 ? `2px solid ${colors}` : `1px solid ${colors}40`, 
                    boxShadow: rank === 1 ? `0 0 40px ${glows}` : "none"
                  }}>
                  <div className="podium-avatar-wrapper">
                    <div className="podium-avatar" style={{ 
                      background: `linear-gradient(135deg, ${colors}40, ${colors}80)`, 
                      border: `2px solid ${colors}`, boxShadow: `0 0 20px ${glows}` 
                    }}>
                      {user.avatar ? <img src={user.avatar} className="avatar-img" /> : user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="podium-rank-badge" style={{ background: colors }}>{rank}</div>
                  </div>
                  <div className="podium-name">{user.name}</div>
                  <div className="podium-xp" style={{ color: colors }}>{user.xp.toLocaleString()} XP</div>
                  
                  <div className="podium-base" style={{ 
                    background: `linear-gradient(180deg, ${colors}15 0%, transparent 100%)`, 
                    borderTop: `1px solid ${colors}30`
                  }}>
                    <span className="base-rank-text" style={{ color: colors }}>#{rank}</span>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full List */}
      <div className="glass-card" style={{ padding: 0, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.01)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Top 10 Global Rankings</h2>
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
            ) : leaderboard.slice(0, 10).map((user, idx) => {
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
                      {user.is_pro && <span style={{ fontSize: 9, background: "rgba(167,139,250,0.15)", color: "#A78BFA", padding: "2px 8px", borderRadius: 4, fontWeight: 900, letterSpacing: 1 }}>PRO 👑</span>}
                      {isCurrentUser && <span style={{ fontSize: 10, background: "var(--brand-primary)", color: "white", padding: "2px 10px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase" }}>YOU</span>}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2, display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: "var(--text-muted)" }}>Level {user.level}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#F59E0B", fontWeight: 700 }}>
                         <span>🔥 {user.streak}d streak</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#10B981", fontWeight: 700 }}>
                         <span>💻 {user.problems_solved} solved</span>
                      </div>
                    </div>
                  </div>

                  {/* XP */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, fontSize: 18, color: isTop3 ? RANK_COLORS[idx] : "var(--text-primary)" }}>
                      {(user.xp || 0).toLocaleString()} <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>XP</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {/* Your Rank — shown when current user is outside top 10 */}
            {!loading && userContext && userContext.rank > 10 && (() => {
              const meInList = leaderboard.find((u: any) => u.id === currentUserId);
              if (!meInList) return null;
              return (
                <>
                  <div style={{ padding: "10px 32px", borderTop: "1px dashed rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                    <span>···</span><span>Your Rank</span><span>···</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", padding: "18px 32px", gap: 20, background: "rgba(124, 58, 237, 0.08)", borderLeft: "4px solid var(--brand-primary)" }}>
                    <div style={{ width: 40, textAlign: "center", fontWeight: 900, fontSize: 18, color: "var(--brand-primary)", flexShrink: 0 }}>#{userContext.rank}</div>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "white", flexShrink: 0 }}>
                      {meInList.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                        {meInList.name}
                        <span style={{ fontSize: 10, background: "var(--brand-primary)", color: "white", padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>YOU</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Level {meInList.level} · 🔥 {meInList.streak}d · 💻 {meInList.problems_solved} solved</div>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 18, color: "var(--text-primary)" }}>
                      {(meInList.xp || 0).toLocaleString()} <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>XP</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>

      {/* User Spotlight (Sticky) */}
      {userContext && (
        <motion.div 
           initial={{ y: 100 }} animate={{ y: 0 }}
           className="glass-card"
           style={{ 
             position: "sticky", bottom: 20, left: 0, right: 0, zIndex: 10,
             background: "rgba(15,15,30,0.95)", backdropFilter: "blur(20px)",
             border: "1px solid var(--brand-primary)", padding: "16px 24px",
             borderRadius: 24, marginTop: 40, boxShadow: "0 -20px 40px rgba(0,0,0,0.5)"
           }}
        >
           <div className="spotlight-container" style={{ display: "flex", alignItems: "center", gap: 20 }}>
             <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--brand-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>
                #{userContext.rank}
             </div>
             <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 }}>Your Global Status</div>
                <div className="spotlight-stats" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                   <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>{userContext.xp.toLocaleString()} <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Total XP</span></div>
                   <div className="spotlight-divider" style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
                   <div style={{ fontSize: 14, fontWeight: 700, color: "#F59E0B" }}>🔥 {userContext.streak} Day Continuous Sync</div>
                   <div className="spotlight-divider" style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
                   <div style={{ fontSize: 14, fontWeight: 700, color: "#10B981" }}>💻 {userContext.problems_solved} Logic Gates Breached</div>
                </div>
             </div>
             <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="btn-primary spotlight-button" style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 800 }}
             >
                Share Status 🚀
             </motion.button>
           </div>
        </motion.div>
      )}

      <style>{`
        .spinner { border-top-color: var(--brand-primary); }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        .podium-container { display: flex; align-items: flex-end; justify-content: center; gap: 24px; margin-bottom: 80px; perspective: 1000px; }
        .podium-placeholder { width: 180px; }
        .podium-item { display: flex; flex-direction: column; align-items: center; }
        .podium-card { display: flex; flex-direction: column; align-items: center; width: 190px; background: rgba(255,255,255,0.02); padding: 24px 0 0; border-radius: 24px; }
        .podium-avatar-wrapper { position: relative; margin-bottom: 12px; }
        .podium-avatar { border-radius: 50%; display: flex; alignItems: center; justify-content: center; font-weight: 900; color: white; }
        .item-rank-1 .podium-avatar { width: 80px; height: 80px; font-size: 32px; }
        .item-rank-2 .podium-avatar, .item-rank-3 .podium-avatar { width: 64px; height: 64px; font-size: 24px; }
        .avatar-img { width: 100%; height: 100%; border-radius: 50%; }
        .podium-rank-badge { position: absolute; bottom: -5px; right: -5px; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; color: #000; border: 3px solid #05070D; }
        .podium-name { font-size: 18px; font-weight: 900; color: white; margin-bottom: 4px; }
        .podium-xp { font-size: 14px; font-weight: 800; margin-bottom: 20px; }
        .podium-base { width: 100%; border-radius: 12px 12px 24px 24px; display: flex; align-items: flex-start; justify-content: center; padding-top: 16px; min-height: 100px; }
        .item-rank-1 .podium-base { min-height: 180px; }
        .item-rank-2 .podium-base { min-height: 140px; }
        .item-rank-3 .podium-base { min-height: 120px; }
        .base-rank-text { font-size: 44px; font-weight: 950; opacity: 0.5; }

        @media (max-width: 850px) {
          .podium-container {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
            padding: 0 20px;
          }
          .podium-card {
            width: 100% !important;
            flex-direction: row !important;
            padding: 16px 24px !important;
            border-radius: 16px !important;
            align-items: center !important;
          }
          .podium-base { display: none !important; }
          .podium-avatar-wrapper { margin-bottom: 0 !important; margin-right: 16px; }
          .podium-avatar { width: 50px !important; height: 50px !important; font-size: 18px !important; }
          .podium-name { margin-bottom: 0 !important; flex: 1; }
          .podium-xp { margin-bottom: 0 !important; font-size: 16px !important; }
          
          .spotlight-container {
            flex-direction: column !important;
            gap: 16px !important;
            align-items: flex-start !important;
            text-align: left;
          }
          .spotlight-stats {
            flex-wrap: wrap !important;
            gap: 12px !important;
          }
          .spotlight-divider { display: none !important; }
          .spotlight-button { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
