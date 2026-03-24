"use client";

import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { activityApi } from "@/lib/api";
import { 
  MessageSquare, BookOpen, Code, Target, Map, FileText, 
  Rocket, Users, Trophy, Youtube, BarChart3, Gift, Award, 
  Flame, Zap, Linkedin, Share2, MessageCircle, Terminal, 
  CheckCircle2, Star, Sparkles, BrainCircuit, Lightbulb, 
  LayoutDashboard, TrendingUp, ArrowRight
} from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import { Variants } from "framer-motion";

const MODULES = [
  { id: "chat", title: "AI Learning Chat", desc: "Have a conversation with Tulasi AI to learn new concepts.", icon: <MessageSquare size={28} />, link: "/dashboard/chat", color: "#8B5CF6", span: 2 },
  { id: "interview", title: "Mock Interview", desc: "Live voice & chat simulation with an AI Hiring Manager.", icon: <Target size={28} />, link: "/dashboard/interview", color: "#06B6D4", span: 2 },
  { id: "flashcards", title: "Flashcard Studio", desc: "Master concepts with AI-powered 3D study decks.", icon: <BrainCircuit size={28} />, link: "/dashboard/flashcards", color: "#F43F5E", span: 1 },
  { id: "projects", title: "Project Ideas", desc: "Generate portfolio-ready SaaS project architectures.", icon: <Lightbulb size={28} />, link: "/dashboard/projects", color: "#FFD93D", span: 1 },
  { id: "roadmaps", title: "Career Roadmaps", desc: "Personalized week-by-week learning paths.", icon: <Map size={28} />, link: "/dashboard/roadmaps", color: "#8B5CF6", span: 1 },
  { id: "code", title: "Coding Arena", desc: "Practice Data Structures with real-time feedback.", icon: <Code size={28} />, link: "/dashboard/code", color: "#10B981", span: 1 },
  { id: "pdf", title: "PDF Q&A", desc: "Query your textbooks and papers instantly.", icon: <BookOpen size={28} />, link: "/dashboard/pdf", color: "#F43F5E", span: 1 },
  { id: "study", title: "Study Rooms", desc: "Join focus sessions with Pomodoro & live chat.", icon: <Users size={28} />, link: "/dashboard/study-rooms", color: "#EC4899", span: 1 },
  { id: "resume", title: "Resume Builder", desc: "Precision-engineered ATS bypass for engineers.", icon: <FileText size={28} />, link: "/dashboard/resume", color: "#3B82F6", span: 1 },
  { id: "startup", title: "Startup LAB", desc: "Ideate and generate full startup pitch decks.", icon: <Rocket size={28} />, link: "/dashboard/startup-lab", color: "#F97316", span: 1 },
  { id: "yt", title: "YouTube Learning", desc: "Curated masterclasses for high-end engineering.", icon: <Youtube size={28} />, link: "/dashboard/youtube-learning", color: "#FF0000", span: 1 },
  { id: "hackathon", title: "Hackathons", desc: "Find global AI & Web3 competitions.", icon: <Trophy size={28} />, link: "/dashboard/hackathons", color: "#EAB308", span: 1 },
  { id: "analytics", title: "Learning Sync", desc: "Track your XP velocity and learning patterns.", icon: <BarChart3 size={28} />, link: "/dashboard/analytics", color: "#4ECDC4", span: 1 },
  { id: "certs", title: "Certificates", desc: "Download verified learning credentials.", icon: <Award size={28} />, link: "/dashboard/certificates", color: "#34D399", span: 2 },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Student";
  const [stats, setStats] = useState({ streak: 0, xp: 0, level: 1, problems_solved: 0, videos_watched: 0, hackathons_joined: 0 });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
        const [statsData, lbData] = await Promise.all([
          activityApi.getStats(token).catch(() => null),
          activityApi.getLeaderboard(token).catch(() => null)
        ]);
        if (statsData) setStats(statsData as any);
        if (lbData?.leaderboard) setLeaderboard(lbData.leaderboard.slice(0, 5));
      } catch (e) { /* silent */ }
    };
    fetchStats();
  }, [session]);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container} style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 60 }}>
      
      {/* Dynamic Welcome Banner */}
      <motion.div variants={item} className="glass-card" style={{ 
        padding: "60px 48px", borderRadius: 32, marginBottom: 40, border: "1px solid rgba(255,255,255,0.06)", 
        position: "relative", overflow: "hidden", 
        background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(6,182,212,0.08) 100%)" 
      }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -50, width: 300, height: 300, background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)", filter: "blur(50px)" }} />
        
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
             <span style={{ fontSize: 13, fontWeight: 900, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: 2 }}>Command Center</span>
             <div style={{ height: 1, width: 40, background: "rgba(255,255,255,0.1)" }} />
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 12, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
            Vanguard of Learning, <span className="gradient-text">{userName}</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-secondary)", marginBottom: 32, maxWidth: 680, lineHeight: 1.6 }}>
            The SaaS-native engine for engineering excellence. Access your high-fidelity modules 
            and track your XP velocity below.
          </p>
          
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/dashboard/chat">
              <button className="btn-primary" style={{ padding: "14px 28px", borderRadius: 14, fontSize: 15, display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
                Initiate New Chat <Sparkles size={16} />
              </button>
            </Link>
            <Link href="/dashboard/analytics">
              <button className="btn-ghost" style={{ padding: "14px 28px", borderRadius: 14, fontSize: 15, display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
                Audit Stats <TrendingUp size={16} />
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* High Density Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        
        {/* Real-time Stats Loop */}
        <motion.div variants={item} style={{ gridColumn: "span 1" }}>
          <TiltCard intensity={5} style={{ height: "100%" }}>
            <div className="glass-card" style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Account Status</div>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#43E97B", boxShadow: "0 0 10px #43E97B" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                 <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "white" }}>{stats.level}</div>
                 <div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>Power Level {stats.level}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{stats.xp} Total XP Accumulated</div>
                 </div>
              </div>
              <div style={{ marginTop: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11, fontWeight: 900 }}>
                  <span style={{ color: "var(--text-muted)" }}>NEXT EVOLUTION</span>
                  <span style={{ color: "var(--brand-primary)" }}>{stats.xp % 500} / 500 XP</span>
                </div>
                <div style={{ height: 6, width: "100%", background: "rgba(0,0,0,0.3)", borderRadius: 10, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${((stats.xp % 500) / 500) * 100}%` }} style={{ height: "100%", background: "var(--brand-primary)", borderRadius: 10 }} />
                </div>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Global Leaderboard Snapshot */}
        <motion.div variants={item} style={{ gridColumn: "span 1" }}>
          <TiltCard intensity={5} style={{ height: "100%" }}>
            <div className="glass-card" style={{ padding: 28, height: "100%" }}>
               <h3 style={{ fontSize: 13, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                 <Trophy size={14} color="#FFD93D" /> Global Velocity
               </h3>
               <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                 {leaderboard.length > 0 ? leaderboard.map((u, i) => (
                   <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.03)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                         <span style={{ fontSize: 12, fontWeight: 900, color: "var(--brand-primary)", width: 14 }}>{i+1}</span>
                         <span style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>{u.xp} XP</span>
                   </div>
                 )) : <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "10px 0" }}>Syncing global rankings...</div>}
               </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Module Grid - Main */}
        {MODULES.map((mod) => (
          <motion.div key={mod.id} variants={item} style={{ gridColumn: `span ${mod.span}` }}>
            <TiltCard intensity={5} style={{ height: "100%" }}>
              <Link href={mod.link} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <div className="glass-card" style={{ 
                  padding: 32, height: "100%", display: "flex", flexDirection: "column", transition: "all 0.3s",
                  background: "rgba(255,255,255,0.02)"
                }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}>
                  <div style={{ 
                    width: 56, height: 56, borderRadius: 16, background: `${mod.color}15`, border: `1px solid ${mod.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", color: mod.color, marginBottom: 24,
                    boxShadow: `0 8px 16px ${mod.color}10`
                  }}>
                    {mod.icon}
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: "white", fontFamily: "var(--font-outfit)" }}>{mod.title}</h3>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>{mod.desc}</p>
                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: mod.color, textTransform: "uppercase", letterSpacing: 1 }}>
                    Deploy Sequence <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </TiltCard>
          </motion.div>
        ))}

      </div>

      {/* Mini Streak Tracker */}
      <motion.div variants={item} style={{ marginTop: 40 }} className="glass-card">
         <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
               <Flame size={20} color="#F43F5E" />
               <span style={{ fontSize: 14, fontWeight: 900 }}>{stats.streak} DAY STREAK</span>
            </div>
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Maintain consistency to unlock high-order AI models.</div>
         </div>
      </motion.div>

    </motion.div>
  );
}

