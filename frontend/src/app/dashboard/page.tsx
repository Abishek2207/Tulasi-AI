"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { activityApi } from "@/lib/api";
import { 
  MessageSquare, BookOpen, Code, Target, Map, FileText, 
  Rocket, Users, Trophy, Youtube, BarChart3, Gift, Award, Flame, Zap, Linkedin, Share2, MessageCircle, Terminal, CheckCircle2, Star, Sparkles
} from "lucide-react";
import dynamic from "next/dynamic";

const TiltCard = dynamic(() => import("@/components/ui/TiltCard").then(mod => mod.TiltCard), { 
  ssr: false, 
  loading: () => <div style={{ height: 200, background: "rgba(255,255,255,0.02)", borderRadius: 24, animation: "pulse 2s infinite" }} /> 
});

const MODULES = [
  { id: "chat", title: "AI Learning Chat", desc: "Have a conversation with Tulasi AI to learn new concepts.", icon: <MessageSquare size={26} />, link: "/dashboard/chat", color: "#7C3AED", span: 2 },
  { id: "pdf", title: "PDF Q&A", desc: "Upload textbooks and query them instantly.", icon: <BookOpen size={26} />, link: "/dashboard/pdf", color: "#F43F5E", span: 1 },
  { id: "code", title: "Coding Arena", desc: "Practice Data Structures & Algorithms with AI feedback.", icon: <Code size={26} />, link: "/dashboard/code", color: "#06B6D4", span: 1 },
  { id: "interview", title: "Mock Interviews", desc: "Live chat with an AI Hiring Manager.", icon: <Target size={26} />, link: "/dashboard/interview", color: "#FBBF24", span: 2 },
  { id: "roadmaps", title: "Career Roadmaps", desc: "Generate week-by-week learning paths.", icon: <Map size={26} />, link: "/dashboard/roadmaps", color: "#8B5CF6", span: 1 },
  { id: "resume", title: "Resume Builder", desc: "Craft an ATS-friendly A4 resume on the fly.", icon: <FileText size={26} />, link: "/dashboard/resume", color: "#10B981", span: 1 },
  { id: "startup", title: "Startup LAB", desc: "Ideate and generate full startup pitch decks.", icon: <Rocket size={26} />, link: "/dashboard/startup-lab", color: "#F97316", span: 1 },
  { id: "study", title: "Study Rooms", desc: "Join live Pomodoro focus sessions.", icon: <Users size={26} />, link: "/dashboard/study-rooms", color: "#EC4899", span: 1 },
  { id: "hackathon", title: "Hackathons", desc: "Find global AI & Web3 competitions.", icon: <Trophy size={26} />, link: "/dashboard/hackathons", color: "#EAB308", span: 1 },
  { id: "yt", title: "YouTube Learning", desc: "Curated masterclasses for engineers.", icon: <Youtube size={26} />, link: "/dashboard/youtube-learning", color: "#FF0000", span: 1 },
  { id: "analytics", title: "Learning Analytics", desc: "Track your progress and XP velocity.", icon: <BarChart3 size={26} />, link: "/dashboard/analytics", color: "#4ECDC4", span: 1 },
  { id: "rewards", title: "Rewards Store", desc: "Redeem XP for exclusive platform perks.", icon: <Gift size={26} />, link: "/dashboard/rewards", color: "#FBBF24", span: 1 },
  { id: "certs", title: "Certificates", desc: "Download verified learning credentials.", icon: <Award size={26} />, link: "/dashboard/certificates", color: "#34D399", span: 2 },
];

interface LocalLeaderboardUser {
  id: number | string;
  name: string;
  avatar?: string;
  xp: number;
}

export default function DashboardHome() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Student";
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ streak: 0, xp: 0, level: 1, problems_solved: 0, videos_watched: 0, hackathons_joined: 0 });
  const [leaderboard, setLeaderboard] = useState<LocalLeaderboardUser[]>([]);

  useEffect(() => {
    setMounted(true);
    const fetchStats = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
                
        const [statsData, lbData] = await Promise.all([
          activityApi.getStats(token).catch(() => null),
          activityApi.getLeaderboard(token).catch(() => null)
        ]);
        
        if (statsData) setStats(statsData as any as typeof stats);
        if (lbData) setLeaderboard((lbData.leaderboard as any as LocalLeaderboardUser[]) || []);
      } catch (e) { /* silent */ }
    };
    fetchStats();
  }, [session]);

  if (!mounted) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container} style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      
      {/* Welcome Banner */}
      <motion.div variants={item} className="glass-card" style={{ padding: "54px 48px", borderRadius: 32, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 48, position: "relative", overflow: "hidden", background: "rgba(124,58,237,0.04)" }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 450, height: 450, background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -80, left: 100, width: 350, height: 350, background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)" }} />
        
        <div style={{ position: "relative", zIndex: 1, maxWidth: 650 }}>
          <h1 style={{ fontSize: 44, fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: 16, lineHeight: 1.15, letterSpacing: "-1px" }}>
            Welcome back, <span className="gradient-text">{userName}</span> <Zap size={32} style={{ display: "inline", marginBottom: -4 }} color="#06B6D4" />
          </h1>
          <p style={{ fontSize: 19, color: "var(--text-secondary)", marginBottom: 36, lineHeight: 1.6, fontWeight: 450 }}>
            Your central command center for learning, coding, and career preparation. What masterpiece are we building today?
          </p>
          
          <div style={{ display: "flex", gap: 18 }}>
            <Link href="/dashboard/roadmaps" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="btn-primary" style={{ padding: "16px 32px", fontSize: 16, borderRadius: 16, display: "flex", alignItems: "center", gap: 8 }}>
                Continue My Journey <Rocket size={18} />
              </motion.button>
            </Link>
            <Link href="/dashboard/code" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.05, y: -2, background: "rgba(255,255,255,0.08)" }} whileTap={{ scale: 0.95 }} className="btn-ghost" style={{ padding: "16px 32px", borderRadius: 16, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                Algorithm Arena <Terminal size={18} />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Grid Container */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, marginBottom: 54, alignItems: "start" }}>
        
        {/* Left Column: Progress & Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Gamification XP Bar */}
          <motion.div variants={item} className="glass-card" style={{ padding: 28, background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #FF6B6B, #4ECDC4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800 }}>
                  {stats.level}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Level {stats.level}</h3>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{stats.xp} Total XP</div>
                </div>
              </div>
              <div style={{ color: "var(--brand-primary)", fontWeight: 700, fontSize: 15 }}>
                {(stats.xp % 500)} / 500 XP to Level {stats.level + 1}
              </div>
            </div>
            
            <div style={{ width: "100%", height: 12, borderRadius: 10, background: "rgba(0,0,0,0.3)", overflow: "hidden" }}>
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${((stats.xp % 500) / 500) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ height: "100%", background: "linear-gradient(90deg, #4ECDC4, #FF6B6B)", borderRadius: 10 }}
              />
            </div>
          </motion.div>

          {/* Activity Overview */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {[
              { icon: <Flame size={24} color="#F43F5E" />, val: `${stats.streak} Days`, label: "Current Streak", link: "/dashboard/streak", border: "rgba(244,63,94,0.2)" },
              { icon: <Code size={24} color="#06B6D4" />, val: stats.problems_solved, label: "Problems Solved", link: "/dashboard/code", border: "rgba(6,182,212,0.2)" },
              { icon: <Youtube size={24} color="#7C3AED" />, val: stats.videos_watched, label: "Videos Watched", link: "/dashboard/youtube-learning", border: "rgba(124,58,237,0.2)" },
              { icon: <Trophy size={24} color="#FBBF24" />, val: stats.hackathons_joined, label: "Competitions", link: "/dashboard/hackathons", border: "rgba(251,191,36,0.2)" }
            ].map((stat, i) => (
              <motion.div key={i} variants={item} whileHover={{ y: -4, scale: 1.03 }} style={{ height: "100%", perspective: 1200 }}>
                <TiltCard className="h-full">
                  <div className="glass-card" style={{ padding: 24, paddingBottom: 20, borderColor: stat.border, background: "rgba(255,255,255,0.02)", cursor: "pointer", borderRadius: 20, height: "100%" }}>
                    <Link href={stat.link} style={{ textDecoration: "none" }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4, fontFamily: "var(--font-display)" }}>{stat.val}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{stat.label}</div>
                    </Link>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>

          {/* Viral Referral & LinkedIn Loop */}
          <motion.div variants={item} className="glass-card" style={{ padding: 24, background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(124, 58, 237, 0.1))", borderRadius: 24, border: "1px solid rgba(59, 130, 246, 0.3)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ background: "linear-gradient(135deg, #0077B5, #25D366)", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Share2 size={18} color="white" /></div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "white" }}>Refer & Earn Free AI Chats</h3>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                Share your journey on LinkedIn or invite friends with code <strong style={{ color: "white", background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 6 }}>{(session?.user as { id?: number, email?: string, name?: string, accessToken?: string })?.id ? `TULASI-${((session?.user as { id?: number })?.id?.toString() || '').substring(0,4)}` : "TUL-2026"}</strong>. Get +500 XP and permanently expand your Daily Chat limit!
              </p>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
              <button 
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=https://tulasiai.vercel.app&summary=I%20am%20accelerating%20my%20software%20engineering%20career%20on%20Tulasi%20AI.%20Join%20me%20and%20use%20my%20invite%20code%20for%20exclusive%20bonuses!`, "_blank")}
                className="btn-primary" 
                style={{ background: "#0077B5", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 16px", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 8px 16px rgba(0, 119, 181, 0.3)" }}
              >
                <Linkedin size={15} /> LinkedIn
              </button>
              
              <button 
                onClick={() => window.open(`https://api.whatsapp.com/send?text=I%20am%20accelerating%20my%20software%20engineering%20career%20on%20Tulasi%20AI.%20Join%20me%20and%20use%20my%20invite%20code%20for%20exclusive%20bonuses!%20https://tulasiai.vercel.app`, "_blank")}
                className="btn-primary" 
                style={{ background: "#25D366", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 16px", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 8px 16px rgba(37, 211, 102, 0.3)", color: "white" }}
              >
                <MessageCircle size={15} /> WhatsApp
              </button>
            </div>
          </motion.div>

        </div>

        {/* Right Column: Leaderboard */}
        <motion.div variants={item} className="glass-card" style={{ padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)", height: "100%" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            <Trophy size={20} color="#FBBF24" /> Global Leaderboard
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {leaderboard.slice(0, 5).map((user, idx) => (
              <div key={user.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 28, fontWeight: 800, color: idx < 3 ? "var(--brand-primary)" : "var(--text-secondary)", fontSize: 15 }}>
                    #{idx + 1}
                  </div>
                  {user.avatar ? (
                    <img src={user.avatar as string} style={{ width: 34, height: 34, borderRadius: "50%", background: "#222" }} />
                  ) : (
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                </div>
                <div style={{ fontSize: 13, color: "var(--brand-primary)", fontWeight: 700 }}>
                  {user.xp} XP
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: 20 }}>Loading Rank...</div>}
            
            <Link href="/dashboard/leaderboard" style={{ textDecoration: "none", marginTop: 8 }}>
              <button style={{ width: "100%", padding: "10px", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                View Full Rankings
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Grid Quick Access */}
      <motion.h2 variants={item} style={{ fontSize: 28, fontWeight: 800, marginBottom: 32, display: "flex", alignItems: "center", gap: 14, fontFamily: "var(--font-display)" }}>
        <Sparkles size={28} color="var(--brand-primary)" /> Explore Learning Modules
      </motion.h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 28 }}>
        {MODULES.map((mod, i) => (
          <motion.div 
            key={mod.id}
            variants={item}
            whileHover={{ y: -8, scale: 1.03 }}
            style={{ gridColumn: mod.span > 1 ? "span 2" : "span 1", perspective: 1200 }}
          >
            <TiltCard style={{ height: "100%" }}>
              <Link href={mod.link} style={{ textDecoration: "none", height: "100%", display: "block" }}>
                <div 
                  className="glass-card"
                  style={{ padding: 36, height: "100%", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", position: "relative", overflow: "hidden" }}
                >
                  <div style={{ position: "absolute", top: 0, right: 0, width: 180, height: 180, background: `radial-gradient(circle at top right, ${mod.color}15, transparent 70%)`, borderRadius: "0 0 0 100%" }} />
                  
                  <div style={{ width: 72, height: 72, borderRadius: 24, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 28, border: "1px solid rgba(255,255,255,0.08)", position: "relative", zIndex: 1, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>
                    {mod.icon}
                  </div>
                  
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: "white", marginBottom: 14, position: "relative", zIndex: 1, fontFamily: "var(--font-display)" }}>{mod.title}</h3>
                  <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, position: "relative", zIndex: 1, paddingBottom: 40, fontWeight: 400 }}>{mod.desc}</p>
                  
                  <div style={{ marginTop: "auto", position: "absolute", bottom: 36, left: 36, zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: mod.color, fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Launch Module <span>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </TiltCard>
          </motion.div>
        ))}
      </div>

    </motion.div>
  );
}
