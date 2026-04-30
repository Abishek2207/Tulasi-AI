"use client";

import React from "react";

import { useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import confetti from "canvas-confetti";
import { activityApi, authApi, API, getCached } from "@/lib/api";
import { Skeleton, BentoSkeleton } from "@/components/ui/Skeleton";
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
import { LiveAgentPrompt } from "@/components/dashboard/LiveAgentPrompt";

const ActivityMap = dynamic(() => import("@/components/dashboard/ActivityMap").then(mod => mod.ActivityMap), {
  ssr: false,
  loading: () => <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading Real-time Activity...</div>
});

import { MissionControl } from "@/components/dashboard/MissionControl";
import { RoutineCard } from "@/components/dashboard/RoutineCard";
import { AINameModal } from "@/components/dashboard/AINameModal";
import { SkillTracker } from "@/components/dashboard/SkillTracker";
import { RoadmapWidget } from "@/components/dashboard/RoadmapWidget";
import { SalaryGrowthPanel } from "@/components/dashboard/SalaryGrowthPanel";
import { StreakCard } from "@/components/dashboard/StreakCard";

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
  // ─── Optimistic State Initialization via Cache ─────────────────────
  const [leaderboard, setLeaderboard] = useState<any[]>(() => getCached<any[]>("leaderboard") || []);
  const [feed, setFeed] = useState<any[]>(() => getCached<any[]>("public_feed") || []);
  const [dailyPlan, setDailyPlan] = useState<any[]>(() => getCached<any[]>("next-action") || []);
  const [userType, setUserType] = useState<string>("student");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [matchedInternships, setMatchedInternships] = useState<any[]>(() => getCached<any[]>("internships/matches") || []);
  const [isLoading, setIsLoading] = useState(true);
  const isFounder = session?.user?.email?.toLowerCase() === "abishekramamoorthy22@gmail.com";

  const loadData = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    if (!token) return;

    // 1. Fetch Auth & Stats (Critical for Identity)
    authApi.me(token).then((me: any) => {
      if (me?.user_type) setUserType(me.user_type);
      if (me?.is_onboarded === false) setNeedsOnboarding(true);
      if (me?.invite_code) setLocalStats(prev => ({ ...prev, invite_code: me.invite_code }));
    }).catch(() => null);

    activityApi.getStats(token).then((s: any) => {
      if (s) setLocalStats(prev => ({
        ...prev,
        problems_solved: s.problems_solved || 0,
        videos_watched: s.videos_watched || 0,
        hackathons_joined: s.hackathons_joined || 0,
      }));
    }).catch(() => null);

    // 2. Fetch Social & Feed (Parallel but Decoupled)
    activityApi.getLeaderboard(token).then(lb => {
      if (lb?.leaderboard) setLeaderboard(lb.leaderboard.slice(0, 5));
    }).catch(() => null);

    activityApi.getPublicFeed().then(f => {
      if (f?.feed) setFeed(f.feed);
    }).catch(() => null);

    // 3. AI Insights & Internships (Decoupled)
    fetch(`${API}/api/next-action`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d?.actions) setDailyPlan(d.actions.slice(0, 3)); })
      .catch(() => null);

    fetch(`${API}/api/internships/matches`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(m => { if (m?.matches) setMatchedInternships(m.matches); })
      .catch(() => null)
      .finally(() => setIsLoading(false));
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
    <motion.div initial="hidden" animate="show" variants={container} style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 60, position: "relative" }}>
      <AINameModal />
      
      {/* Technical Background Elements */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.05 }} />
        <div className="bg-dot" style={{ position: "absolute", inset: 0, opacity: 0.1, transform: "scale(1.2)" }} />
        <div className="neural-pulse" style={{ position: "absolute", top: "10%", left: "5%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />
        <div className="neural-pulse" style={{ position: "absolute", bottom: "10%", right: "5%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)", animationDelay: "2s" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Dynamic Gemini-Style Live Agent + Streak Stats */}
        <motion.div variants={item} style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <LiveAgentPrompt userName={isFounder ? "Abishek R" : userName} />
          </div>
          <StreakCard />
        </motion.div>

        {/* ── Professional Role Banner ── */}
        {(() => {
          const profRole = (session?.user as any)?.profile?.current_role || "";
          const profExp = (session?.user as any)?.profile?.experience_years || 0;
          return (
            <motion.div variants={item} style={{
              marginBottom: 32, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: 20, padding: "20px 28px", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between"
            }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#10b981", marginBottom: 10 }}>
                  💼 Professional Growth Hub
                  {profRole ? ` — ${profRole}` : ""}
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
                  {["System Design", "Salary Negotiation", "Leadership Skills", "Cloud Certifications", "AI Upskilling"].map((b, i) => (
                    <span key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>• {b}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                <Link href="/dashboard/resume" style={{ textDecoration: "none", background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", color: "#10b981", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 800 }}>Resume AI</Link>
                <Link href="/dashboard/salary-intel" style={{ textDecoration: "none", background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", color: "#10b981", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 800 }}>Salary Intel</Link>
                <Link href="/dashboard/chat?mode=career_strategy" style={{ textDecoration: "none", background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", color: "#10b981", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 800 }}>Career Strategy</Link>
              </div>
            </motion.div>
          );
        })()}

        {/* ── Desktop: Bento Hub | Mobile: Vertical Stack ── */}
        <div className="bento-hub-grid" style={{ marginBottom: 40 }}>
          {/* Mission Control - Personalized AI Mission */}
          <motion.div variants={item} className="bento-span-2" style={{ minHeight: 440 }}>
            <MissionControl token={typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""} />
          </motion.div>

          {/* Daily Routine - AI Schedule */}
          <motion.div variants={item} className="bento-span-1" style={{ minHeight: 440 }}>
            <RoutineCard />
          </motion.div>

          {/* ── NEW: Injected AI Roadmap (Professional) ── */}
          <motion.div variants={item} className="bento-span-2">
            <RoadmapWidget userType="professional" />
          </motion.div>

          {/* ── NEW: Injected Skill Progression (Professional) ── */}
          <motion.div variants={item} className="bento-span-1">
            <SkillTracker userType="professional" />
          </motion.div>

          {/* Leaderboard Snapshot (Desktop Only in Hub) */}
          <motion.div variants={item} className="desktop-only bento-span-1" style={{ minHeight: 440 }}>
            <div className="glass-card-premium" style={{ padding: 28, height: "100%", background: "rgba(255,255,255,0.015)", borderRadius: 32, border: "1px solid rgba(255,255,255,0.04)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <Trophy size={14} color="#FFD93D" /> Global Velocity
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {leaderboard.length > 0 ? leaderboard.map((u, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: "#8B5CF6", width: 14 }}>{i + 1}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{u.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)" }}>{u.xp} XP</span>
                  </div>
                )) : <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "20px 0", textAlign: "center" }}>Syncing rankings...</div>}
              </div>
              <div style={{ marginTop: "auto", paddingTop: 20 }}>
                 <Link href="/dashboard/leaderboard" style={{ textDecoration: "none", color: "#8B5CF6", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}>Full Arena <ArrowRight size={14} /></Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── NEW: Salary Growth & Career Intelligence Panel ── */}
        <motion.div variants={item} style={{ marginBottom: 32 }}>
          <SalaryGrowthPanel
            role={session?.user && (session.user as any)?.profile?.current_role}
            experience={(session?.user as any)?.profile?.experience_years}
          />
        </motion.div>

        {/* ── Mobile: Quick Action Ribbon ── */}
        <div className="mobile-only" style={{ marginBottom: 40, overflowX: "auto", display: "flex", gap: 12, paddingBottom: 8, scrollbarWidth: "none" }}>
          {MODULES.slice(0, 6).map(mod => (
            <Link key={mod.id} href={mod.link} style={{ textDecoration: "none", flexShrink: 0 }}>
              <div style={{ padding: "12px 20px", borderRadius: 16, background: `${mod.color}15`, border: `1px solid ${mod.color}30`, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ color: mod.color }}>{React.cloneElement(mod.icon as any, { size: 18 })}</div>
                <span style={{ fontSize: 13, fontWeight: 800, color: "white", whiteSpace: "nowrap" }}>{mod.title.split(" ")[0]}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Matched Opportunities */}
        {matchedInternships.length > 0 && (
          <motion.div variants={item} style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 4, height: 24, background: "#10B981", borderRadius: 4 }} />
              <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px" }}>Matched Opportunities</h2>
              <span className="badge-green" style={{ marginLeft: "auto" }}>NEW MATCHES</span>
            </div>
            <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none" }}>
              {matchedInternships.map((match: any, i: number) => (
                <div key={i} className="glass-card-premium" style={{ minWidth: 340, padding: 28, flexShrink: 0, background: "rgba(16,185,129,0.03)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 28 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "6px 12px", borderRadius: 30, border: "1px solid rgba(16,185,129,0.2)" }}>{match.match_score}% MATCH</span>
                    <div style={{ color: "var(--text-muted)" }}><Link2 size={16} /></div>
                  </div>
                  <h3 style={{ fontSize: 19, fontWeight: 900, marginBottom: 6, color: "white" }}>{match.internship.title}</h3>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--brand-primary)", marginBottom: 16 }}>{match.internship.company}</div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24, height: 42, overflow: "hidden" }}>{match.internship.description}</p>
                  <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                     <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}><MapPin size={14} /> {match.internship.location || match.internship.mode}</span>
                     <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}><Clock size={14} /> {match.internship.duration}</span>
                  </div>
                  <a href={match.internship.apply_link} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                     <button className="btn-primary" style={{ width: "100%", padding: "14px", borderRadius: 14, fontSize: 14, fontWeight: 900 }}>INITIALIZE APPLICATION</button>
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Neural Intelligence Section */}
        <motion.div variants={item} style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 4, height: 24, background: "#8B5CF6", borderRadius: 4 }} />
            <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px" }}>Neural Intelligence</h2>
          </div>
          <div className="intelligence-grid">
            <div className="glass-card-premium" style={{ minHeight: 440, borderRadius: 32 }}>
              <SkillRadar token={typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""} />
            </div>
            <div className="glass-card-premium" style={{ minHeight: 440, borderRadius: 32 }}>
              <ReadinessCard token={typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""} />
            </div>
            <div className="glass-card-premium" style={{ minHeight: 440, borderRadius: 32 }}>
              <NeuralStrategist token={typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""} />
            </div>
          </div>
        </motion.div>

        {/* High Density Grid */}
        <div className="dashboard-main-grid">

          {/* Account Velocity */}
          <motion.div variants={item} className="stat-card">
            <TiltCard intensity={5} style={{ height: "100%" }}>
              <div className="glass-card-premium" style={{ padding: 32, height: "100%", display: "flex", flexDirection: "column", gap: 20, borderRadius: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 2 }}>System Status</div>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 10px #10B981" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 24, background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "white", boxShadow: "0 12px 24px rgba(139,92,246,0.3)" }}>{stats.level}</div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "white" }}>Tier {stats.level} Engineer</div>
                    <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>{stats.xp} Accumulated XP</div>
                  </div>
                </div>
                <div style={{ marginTop: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12, fontWeight: 900 }}>
                    <span style={{ color: "var(--text-muted)", letterSpacing: 1 }}>EVOLUTION PROGRESS</span>
                    <span style={{ color: "var(--brand-primary)" }}>{stats.xp % 500} / 500</span>
                  </div>
                  <div style={{ height: 8, width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${((stats.xp % 500) / 500) * 100}%` }} style={{ height: "100%", background: "linear-gradient(90deg, #8B5CF6, #06B6D4)", borderRadius: 10 }} />
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div variants={item} className="stat-card">
            <TiltCard intensity={3} style={{ height: "100%" }}>
              <div className="glass-card-premium" style={{ height: "100%", borderRadius: 32, overflow: "hidden" }}>
                <LiveActivityFeed activities={feed} />
              </div>
            </TiltCard>
          </motion.div>

          {/* Referral Power-up */}
          <motion.div variants={item} className="stat-card">
            <TiltCard intensity={5} style={{ height: "100%" }}>
              <div className="glass-card-premium" style={{
                padding: 32, height: "100%", display: "flex", flexDirection: "column", borderRadius: 32,
                background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(255,255,255,0.01))",
                position: "relative", overflow: "hidden", border: "1px solid rgba(16,185,129,0.2)"
              }}>
                <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)", filter: "blur(40px)" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981", boxShadow: "0 8px 16px rgba(16,185,129,0.1)" }}>
                    <Gift size={26} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 19, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>XP Multiplier</h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Invite colleagues for +500 XP.</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto", background: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 16, border: "1px dashed rgba(255,255,255,0.15)" }}>
                  <div style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 900, color: "white", letterSpacing: 3, fontFamily: "var(--font-mono)" }}>
                    {stats.invite_code || "TULASI25"}
                  </div>
                  <button
                    onClick={() => {
                      const code = stats.invite_code || "TULASI25";
                      const text = `Hey! I'm using Tulasi AI to engineer my career and bypass the ATS. Use my invite code ${code} to get 500 XP instantly! Sign up here: https://tulasiai.in`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                      confetti({ particleCount: 150, spread: 80, origin: { y: 0.8 }, colors: ['#10B981', '#ffffff', '#34D399'] });
                    }}
                    style={{
                      padding: "10px 18px", borderRadius: 12, background: "#10B981", color: "black",
                      fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", gap: 8, border: "none", cursor: "pointer"
                    }}
                  >
                    <Share size={16} /> SEND
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
                  <div className="glass-card-premium" style={{
                    padding: 36, height: "100%", display: "flex", flexDirection: "column", transition: "all 0.4s var(--ease-premium)",
                    background: "rgba(255,255,255,0.015)", borderRadius: 32, border: "1px solid rgba(255,255,255,0.04)"
                  }} onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = `${mod.color}40`;
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.015)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)";
                  }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 20, background: `${mod.color}10`, border: `1px solid ${mod.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center", color: mod.color, marginBottom: 28,
                      boxShadow: `0 12px 24px ${mod.color}15`
                    }}>
                      {React.cloneElement(mod.icon as any, { size: 32 })}
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, color: "white", fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px" }}>{mod.title}</h3>
                    <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 28, fontWeight: 500 }}>{mod.desc}</p>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 900, color: mod.color, textTransform: "uppercase", letterSpacing: 1.5 }}>
                      Initialize Sequence <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}

          {/* Feedback Section */}
          <motion.div variants={item} className="module-span-2">
            <TiltCard intensity={5} style={{ height: "100%" }}>
              <div className="glass-card-premium" style={{
                padding: 40, height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(6,182,212,0.05) 100%)",
                border: "1px solid rgba(139,92,246,0.2)", borderRadius: 32
              }}>
                <div style={{ maxWidth: "65%" }}>
                  <h3 style={{ fontSize: 26, fontWeight: 900, marginBottom: 10, color: "white", letterSpacing: "-0.5px" }}>Refine the Neural Engine</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.6, fontWeight: 500 }}>
                    Your feedback drives our proprietary intelligence patterns. Contribute and earn <span style={{ color: "#8B5CF6", fontWeight: 900 }}>+100 XP</span> instantly.
                  </p>
                </div>
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="btn-primary" 
                  style={{ padding: "16px 32px", borderRadius: 16, fontWeight: 900, fontSize: 15, boxShadow: "0 15px 30px rgba(139,92,246,0.3)" }}
                >
                  Submit Intelligence
                </button>
              </div>
            </TiltCard>
          </motion.div>

        </div>

        {/* Global Activity Map */}
        <motion.div variants={item} style={{ marginTop: 48 }}>
           <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 4, height: 24, background: "#06B6D4", borderRadius: 4 }} />
            <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px" }}>Global Neural Connectivity</h2>
          </div>
          <div className="glass-card-premium" style={{ borderRadius: 32, overflow: "hidden" }}>
            <ActivityMap />
          </div>
        </motion.div>

        {/* Mini Streak Tracker */}
        <motion.div variants={item} style={{ marginTop: 48 }}>
           <div className="glass-card-premium" style={{ borderRadius: 24, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(20px, 5vw, 48px)", padding: "24px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Flame size={24} color="#F43F5E" />
                <span style={{ fontSize: 16, fontWeight: 900, color: "white", letterSpacing: 1 }}>{stats.streak} DAY NEURAL STREAK</span>
              </div>
              <div className="desktop-only" style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
              <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500, textAlign: "center" }}>Maintain sequence synchronization to unlock high-order planetary models.</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)" }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ 
                position: "relative", zIndex: 101, width: "100%", maxWidth: 640,
                background: "#08080A", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 40, padding: "clamp(24px, 6vw, 48px)", boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8)"
              }}
            >
              <ReviewForm onClose={() => setShowReviewModal(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .bento-hub-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .intelligence-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .dashboard-main-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); 
          gap: 24px; 
        }
        .stat-card { grid-column: span 1; }
        .module-span-2 { grid-column: span 2; }
        .module-span-1 { grid-column: span 1; }
        .bento-span-2 { grid-column: span 2; }
        .bento-span-1 { grid-column: span 1; }

        @media (max-width: 1280px) {
          .bento-hub-grid { grid-template-columns: repeat(2, 1fr); }
          .intelligence-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .dashboard-main-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
          .intelligence-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 850px) {
          .bento-hub-grid { grid-template-columns: 1fr; gap: 16px; }
          .dashboard-main-grid { grid-template-columns: 1fr; gap: 16px; }
          .module-span-2, .module-span-1, .bento-span-2, .bento-span-1 { grid-column: span 1; }
        }

        .glass-card-premium {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(24px) saturate(200%);
          -webkit-backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card-premium:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-4px);
        }
      `}</style>
    </motion.div>
  );
}
