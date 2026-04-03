"use client";

import { useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import confetti from "canvas-confetti";
import { activityApi, authApi } from "@/lib/api";
import {
  MessageSquare, Code, Target, Map, FileText,
  Rocket, Users, Trophy, Youtube, BarChart3, Gift, Award,
  Flame, Zap, Linkedin, Share2, MessageCircle, Terminal,
  CheckCircle2, Star, Sparkles, BrainCircuit, Lightbulb,
  LayoutDashboard, TrendingUp, ArrowRight, Share, MapPin, Clock, Link2
} from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import { Variants } from "framer-motion";
import dynamic from "next/dynamic";
import { ReviewForm } from "@/components/ReviewForm";


const ActivityMap = dynamic(() => import("@/components/dashboard/ActivityMap").then(mod => mod.ActivityMap), {
  ssr: false,
  loading: () => <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading Real-time Activity...</div>
});

import { MissionControl } from "@/components/dashboard/MissionControl";
import { RoutineCard } from "@/components/dashboard/RoutineCard";

const SkillRadar = dynamic(() => import("@/components/dashboard/SkillRadar").then(mod => mod.SkillRadar), { ssr: false });
const ReadinessCard = dynamic(() => import("@/components/dashboard/ReadinessCard").then(mod => mod.ReadinessCard), { ssr: false });
const NeuralStrategist = dynamic(() => import("@/components/dashboard/NeuralStrategist").then(mod => mod.NeuralStrategist), { ssr: false });

function LiveActivityFeed({ activities: initialActivities }: { activities: any[] }) {
  const [activities, setActivities] = useState<any[]>(initialActivities);

  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  useEffect(() => {
    if (activities.length === 0) return;
  // Removed shuffle interval to prevent CPU lag and "fake" updates.
  // Data is now static until the next manual refresh or socket update.
  }, [activities.length]);

  const getIcon = (type: string) => {
    switch (type) {
      case "code": return <Code size={14} color="#10B981" />;
      case "roadmap": return <Map size={14} color="#8B5CF6" />;
      case "interview": return <Target size={14} color="#F43F5E" />;
      case "level": return <Trophy size={14} color="#FFD93D" />;
      case "startup": return <Rocket size={14} color="#06B6D4" />;
      default: return <Sparkles size={14} color="#A78BFA" />;
    }
  };

  return (
    <div style={{ padding: "24px 28px", background: "rgba(255,255,255,0.015)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 10px #10B981" }} />
          <h3 style={{ fontSize: 13, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Global Live Feed</h3>
        </div>
        <span style={{ fontSize: 11, color: "var(--brand-primary)", fontWeight: 700, background: "rgba(124,58,237,0.1)", padding: "4px 10px", borderRadius: 12 }}>SYNCING</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, height: 260, overflowY: "auto" }}>
        {activities.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80, fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
            No recent activity sync found.
          </div>
        ) : (
          activities.map((act, i) => (
            <div
              key={act.id + i}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getIcon(act.type)}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)" }}>
                    <span style={{ fontWeight: 800, color: "white" }}>{act.user}</span> {act.action} <span style={{ fontWeight: 700, color: "var(--brand-primary)" }}>{act.target}</span>
                  </div>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", opacity: 0.6 }}>{act.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


const MODULES = [
  { id: "chat", title: "AI Learning Chat", desc: "Have a conversation with Tulasi AI to learn new concepts.", icon: <MessageSquare size={28} />, link: "/dashboard/chat", color: "#8B5CF6", span: 2 },
  { id: "interview", title: "Mock Interview", desc: "Live voice & chat simulation with an AI Hiring Manager.", icon: <Target size={28} />, link: "/dashboard/interview", color: "#06B6D4", span: 2 },
  { id: "flashcards", title: "Flashcard Studio", desc: "Master concepts with AI-powered 3D study decks.", icon: <BrainCircuit size={28} />, link: "/dashboard/flashcards", color: "#F43F5E", span: 1 },
  { id: "projects", title: "Project Ideas", desc: "Generate portfolio-ready SaaS project architectures.", icon: <Lightbulb size={28} />, link: "/dashboard/projects", color: "#FFD93D", span: 1 },
  { id: "roadmaps", title: "Career Roadmaps", desc: "Personalized week-by-week learning paths.", icon: <Map size={28} />, link: "/dashboard/roadmaps", color: "#8B5CF6", span: 1 },
  { id: "code", title: "Coding Arena", desc: "Practice Data Structures with real-time feedback.", icon: <Code size={28} />, link: "/dashboard/code", color: "#10B981", span: 1 },
  { id: "study", title: "Study Rooms", desc: "Join focus sessions with Pomodoro & live chat.", icon: <Users size={28} />, link: "/dashboard/study-rooms", color: "#EC4899", span: 1 },
  { id: "resume", title: "Resume Builder", desc: "Precision-engineered ATS bypass for engineers.", icon: <FileText size={28} />, link: "/dashboard/resume", color: "#3B82F6", span: 1 },
  { id: "startup", title: "Startup LAB", desc: "Ideate and generate full startup pitch decks.", icon: <Rocket size={28} />, link: "/dashboard/startup-lab", color: "#F97316", span: 1 },
  { id: "yt", title: "YouTube Learning", desc: "Curated masterclasses for high-end engineering.", icon: <Youtube size={28} />, link: "/dashboard/youtube-learning", color: "#FF0000", span: 1 },
  { id: "hackathon", title: "Hackathons", desc: "Find global AI & Web3 competitions.", icon: <Trophy size={28} />, link: "/dashboard/hackathons", color: "#EAB308", span: 1 },
  { id: "analytics", title: "Learning Sync", desc: "Track your XP velocity and learning patterns.", icon: <BarChart3 size={28} />, link: "/dashboard/analytics", color: "#4ECDC4", span: 1 },
  { id: "certs", title: "Certificates", desc: "Download verified learning credentials.", icon: <Award size={28} />, link: "/dashboard/certificates", color: "#34D399", span: 2 },
];

interface DashboardStats {
  streak: number;
  xp: number;
  level: number;
  problems_solved: number;
  videos_watched: number;
  hackathons_joined: number;
  invite_code: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Student";
  const statsFromRedux = useSelector((s: RootState) => s.ui.stats);
  const [localStats, setLocalStats] = useState<Partial<DashboardStats>>({
    problems_solved: 0, videos_watched: 0, hackathons_joined: 0, invite_code: ""
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Merge Redux stats with local dashboard-specific stats
  const stats: DashboardStats = {
    ...statsFromRedux,
    level: Number(statsFromRedux.level) || 1, // Fallback to 1 if level name is used
    problems_solved: localStats.problems_solved || 0,
    videos_watched: localStats.videos_watched || 0,
    hackathons_joined: localStats.hackathons_joined || 0,
    invite_code: localStats.invite_code || "TULASI25"
  };
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [dailyPlan, setDailyPlan] = useState<any[]>([]);
  const [userType, setUserType] = useState<string>("student");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [matchedInternships, setMatchedInternships] = useState<any[]>([]);
  const isFounder = session?.user?.email === "abishekramamoorthy22@gmail.com";

  const loadData = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const [statsData, lbData, meData, feedData, planData, matchData] = await Promise.all([
        activityApi.getStats(token).catch(() => null),
        activityApi.getLeaderboard(token).catch(() => null),
        authApi.me(token).catch(() => ({})),
        activityApi.getPublicFeed().catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:10000"}/api/next-action`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:10000"}/api/internships/matches`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => null)
      ]);
      if (statsData) {
        setLocalStats({
          problems_solved: (statsData as any).problems_solved || 0,
          videos_watched: (statsData as any).videos_watched || 0,
          hackathons_joined: (statsData as any).hackathons_joined || 0,
          invite_code: (meData as any)?.invite_code || "TULASI25"
        });
      }
      if (lbData?.leaderboard) setLeaderboard(lbData.leaderboard.slice(0, 5));
      if (feedData?.feed) setFeed(feedData.feed);
      if (planData?.actions) setDailyPlan(planData.actions.slice(0, 3)); 
      if (matchData?.matches) setMatchedInternships(matchData.matches);
      
      const me = meData as any;
      if (me?.user_type) setUserType(me.user_type);
      if (me?.is_onboarded === false) setNeedsOnboarding(true);

      // Removed auto-confetti to reduce main thread load and "fake" flair
    } catch (e) { /* silent */ }
  };

  useEffect(() => { loadData(); }, [session]);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0 } } // Instant entries
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.1, // Near-instant fade
        ease: "easeOut"
      } 
    }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container} style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 60 }}>

      {/* Dynamic Welcome Banner */}
      <motion.div variants={item} className="glass-card banner-card" style={{
        marginBottom: 40, border: "1px solid rgba(255,255,255,0.06)",
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(6,182,212,0.08) 100%)"
      }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -50, width: 300, height: 300, background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)", filter: "blur(50px)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: isFounder ? "#F59E0B" : "var(--brand-primary)", textTransform: "uppercase", letterSpacing: 2 }}>
              {isFounder ? "Vanguard Founder & Architect" : userType.replace("_", " ")}
            </span>
            <div style={{ height: 1, width: 40, background: "rgba(255,255,255,0.1)" }} />
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 12, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
            {isFounder ? "Commander of Innovation," : "Vanguard of Learning,"} <span className="gradient-text">{isFounder ? "Abishek R" : userName}</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-secondary)", marginBottom: 32, maxWidth: 680, lineHeight: 1.6 }}>
            The SaaS-native engine for engineering excellence. Access your high-fidelity modules
            and track your XP velocity below.
          </p>

          <div className="hero-buttons">
            <Link href="/dashboard/chat" style={{ flex: 1 }}>
              <button
                onClick={() => {
                  try {
                    const ctx = new window.AudioContext();
                    const osc = ctx.createOscillator();
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(600, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
                    osc.connect(ctx.destination);
                    osc.start(); osc.stop(ctx.currentTime + 0.1);
                  } catch (e) { }
                  confetti({ particleCount: 50, spread: 40, colors: ['#8B5CF6', '#ffffff'] });
                }}
                className="btn-primary" style={{ padding: "14px 28px", borderRadius: 14, fontSize: 15, display: "flex", alignItems: "center", gap: 8, fontWeight: 700, width: "100%" }}>
                Initiate New Chat <Sparkles size={16} />
              </button>
            </Link>
            <Link href="/dashboard/analytics" style={{ flex: 1 }}>
              <button className="btn-ghost" style={{ padding: "14px 28px", borderRadius: 14, fontSize: 15, display: "flex", alignItems: "center", gap: 8, fontWeight: 700, width: "100%" }}>
                Audit Stats <TrendingUp size={16} />
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Your Daily Path & Mission Control */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: 24, marginBottom: 40 }}>
        {/* Mission Control - Personalized AI Mission */}
        <motion.div variants={item} style={{ minHeight: 400 }}>
          <MissionControl token={typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""} />
        </motion.div>

        {/* Daily Routine - AI Schedule */}
        <motion.div variants={item} style={{ minHeight: 400 }}>
          <RoutineCard />
        </motion.div>
      </div>

      {/* Matched Opportunities */}
      {matchedInternships.length > 0 && (
        <motion.div variants={item} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 4, height: 24, background: "#10B981", borderRadius: 4 }} />
            <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px" }}>Matched Opportunities</h2>
          </div>
          <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none" }}>
            {matchedInternships.map((match: any, i: number) => (
              <div key={i} className="glass-card" style={{ minWidth: 320, padding: 24, flexShrink: 0, background: "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(255,255,255,0.02))", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "4px 10px", borderRadius: 12 }}>{match.match_score}% MATCH</span>
                  <div style={{ color: "var(--text-muted)" }}><Link2 size={14} /></div>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{match.internship.title}</h3>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-primary)", marginBottom: 12 }}>{match.internship.company}</div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 20, height: 36, overflow: "hidden" }}>{match.internship.description}</p>
                <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                   <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {match.internship.location || match.internship.mode}</span>
                   <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {match.internship.duration}</span>
                </div>
                <a href={match.internship.apply_link} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                   <button className="btn-primary" style={{ width: "100%", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 800 }}>Apply Now</button>
                </a>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Neural Intelligence Section */}
      <motion.div variants={item} style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 4, height: 24, background: "#8B5CF6", borderRadius: 4 }} />
          <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px" }}>Neural Intelligence</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          <div className="glass-card" style={{ minHeight: 420 }}>
            <SkillRadar token={typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""} />
          </div>
          <div className="glass-card" style={{ minHeight: 420 }}>
            <ReadinessCard token={typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""} />
          </div>
          <div className="glass-card" style={{ minHeight: 420, gridColumn: "span 1" }}>
            <NeuralStrategist token={typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""} />
          </div>
        </div>
      </motion.div>

      {/* High Density Grid */}
      <div className="dashboard-grid">

        {/* Real-time Stats Loop */}
        <motion.div variants={item} className="stat-card">
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
        <motion.div variants={item} className="stat-card">
          <TiltCard intensity={5} style={{ height: "100%" }}>
            <div className="glass-card" style={{ padding: 28, height: "100%" }}>
              <h3 style={{ fontSize: 13, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                <Trophy size={14} color="#FFD93D" /> Global Velocity
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {leaderboard.length > 0 ? leaderboard.map((u, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: "var(--brand-primary)", width: 14 }}>{i + 1}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>{u.xp} XP</span>
                  </div>
                )) : <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "10px 0" }}>Syncing global rankings...</div>}
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Global Live Feed */}
        <motion.div variants={item} className="stat-card">
          <TiltCard intensity={3} style={{ height: "100%" }}>
            <LiveActivityFeed activities={feed} />
          </TiltCard>
        </motion.div>

        {/* Gamified Referral Card */}
        <motion.div variants={item} className="stat-card">
          <TiltCard intensity={5} style={{ height: "100%" }}>
            <div className="glass-card" style={{
              padding: 28, height: "100%", display: "flex", flexDirection: "column",
              background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(16,185,129,0.05))",
              position: "relative", overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)", filter: "blur(40px)" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
                  <Gift size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>Earn +500 XP</h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Invite a friend to unlock more chats.</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", background: "rgba(0,0,0,0.2)", padding: 6, borderRadius: 12, border: "1px dashed rgba(255,255,255,0.15)" }}>
                <div style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 800, color: "white", letterSpacing: 2, fontFamily: "monospace" }}>
                  {stats.invite_code || "TULASI25"}
                </div>
                <button
                  onClick={() => {
                    const code = stats.invite_code || "TULASI25";
                    const text = `Hey! I'm using Tulasi AI to engineer my career and bypass the ATS. Use my invite code ${code} to get 500 XP instantly! Sign up here: https://tulasiai.vercel.app`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.8 }, colors: ['#10B981', '#ffffff', '#34D399'] });
                  }}
                  style={{
                    padding: "8px 16px", borderRadius: 8, background: "#10B981", color: "black",
                    fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer"
                  }}
                >
                  <Share size={14} /> Send
                </button>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Module Grid - Main */}
        {MODULES.map((mod) => (
          <motion.div key={mod.id} variants={item} className={`module-span-${mod.span}`}>
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

        {/* FEEDBACK MODULE */}
        <motion.div variants={item} className="module-span-2">
          <TiltCard intensity={5} style={{ height: "100%" }}>
            <div className="glass-card" style={{
              padding: 32, height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(6,182,212,0.05) 100%)",
              border: "1px solid rgba(168,85,247,0.2)"
            }}>
              <div>
                <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Share Your Feedback</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 500 }}>
                  Help us refine the Neural Engine. Submit a review and earn <span style={{ color: "var(--brand-primary)", fontWeight: 800 }}>+100 XP</span> for your contribution.
                </p>
              </div>
              <button 
                onClick={() => setShowReviewModal(true)}
                className="btn-primary" 
                style={{ padding: "14px 28px", borderRadius: 14, fontWeight: 800 }}
              >
                Submit Review
              </button>
            </div>
          </TiltCard>
        </motion.div>

      </div>

      {/* Activity Graph */}
      <motion.div variants={item}>
        <ActivityMap />
      </motion.div>

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

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ 
                position: "relative", zIndex: 101, width: "100%", maxWidth: 600,
                background: "#0B0E14", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 32, padding: "40px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
              }}
            >
              <ReviewForm onClose={() => setShowReviewModal(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <style>{`
        .dashboard-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); 
          gap: 24px; 
        }
        .stat-card { grid-column: span 1; }
        .module-span-2 { grid-column: span 2; }
        .module-span-1 { grid-column: span 1; }

        @media (max-width: 1100px) {
          .dashboard-grid { 
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
          }
          .module-span-2 { grid-column: span 1; }
        }

        @media (max-width: 850px) {
          .dashboard-grid { 
             grid-template-columns: 1fr; 
             gap: 16px;
          }
          .banner-card { padding: 40px 24px !important; }
          .hero-buttons { flex-direction: column; gap: 12px; }
          .module-span-2, .module-span-1 { grid-column: span 1; }
        }
      `}</style>
    </motion.div>
  );
}
