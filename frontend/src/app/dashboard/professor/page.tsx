"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { motion } from "framer-motion";
import Link from "next/link";
import { activityApi, authApi, API } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  BookOpen, MessageSquare, BrainCircuit, FileText, Users,
  Award, TrendingUp, ArrowRight, Star, Lightbulb,
  Target, Rocket, BarChart3, Trophy, Flame, Globe
} from "lucide-react";
import { LiveAgentPrompt } from "@/components/dashboard/LiveAgentPrompt";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { SkillTracker } from "@/components/dashboard/SkillTracker";
import { MissionControl } from "@/components/dashboard/MissionControl";
import { RoutineCard } from "@/components/dashboard/RoutineCard";
import { AINameModal } from "@/components/dashboard/AINameModal";

const PROFESSOR_MODULES = [
  {
    id: "ai-research", title: "AI Research Assistant", icon: <BrainCircuit size={26} />,
    desc: "Generate research ideas, literature reviews, and paper outlines using AI.", link: "/dashboard/chat?mode=career_strategy", color: "#8B5CF6", badge: "HOT"
  },
  {
    id: "curriculum", title: "Curriculum Designer", icon: <BookOpen size={26} />,
    desc: "Design course syllabi, learning outcomes, and assessment frameworks.", link: "/dashboard/chat?mode=chat", color: "#10B981"
  },
  {
    id: "grant-writing", title: "Grant Writing AI", icon: <FileText size={26} />,
    desc: "Draft DST, UGC, and AICTE research proposals with AI guidance.", link: "/dashboard/chat?mode=career_strategy", color: "#F59E0B"
  },
  {
    id: "pedagogy", title: "Pedagogy Coach", icon: <Target size={26} />,
    desc: "Explore modern teaching methodologies: flipped classroom, PBL, Bloom's taxonomy.", link: "/dashboard/chat?mode=soft_skills", color: "#EC4899"
  },
  {
    id: "communication", title: "Academic Communication", icon: <MessageSquare size={26} />,
    desc: "Polish your paper writing, conference talk, and student mentoring language.", link: "/dashboard/chat?mode=communication", color: "#06B6D4"
  },
  {
    id: "soft-skills", title: "Leadership & Soft Skills", icon: <Star size={26} />,
    desc: "Build executive presence, conflict resolution, and departmental leadership skills.", link: "/dashboard/chat?mode=soft_skills", color: "#A855F7"
  },
  {
    id: "mock-interview", title: "PhD Viva / Interview Prep", icon: <Trophy size={26} />,
    desc: "Simulate PhD viva, faculty interview, or promotion committee sessions.", link: "/dashboard/interview", color: "#F43F5E"
  },
  {
    id: "roadmap", title: "Academic Career Roadmap", icon: <TrendingUp size={26} />,
    desc: "Plan your path from Assistant → Associate → Full Professor with AI strategy.", link: "/dashboard/roadmaps", color: "#34D399"
  },
  {
    id: "startup", title: "Research Commercialization", icon: <Rocket size={26} />,
    desc: "Incubate research into startups, products, and tech transfer opportunities.", link: "/dashboard/startup-lab", color: "#F97316"
  },
  {
    id: "analytics", title: "Learning Sync", icon: <BarChart3 size={26} />,
    desc: "Track your platform activity, XP velocity, and learning patterns.", link: "/dashboard/analytics", color: "#4ECDC4"
  },
];

const FOCUS_AREAS = [
  { label: "Research Publications", desc: "Write, structure, and submit high-impact journal papers.", icon: <FileText size={20} />, color: "#8B5CF6", href: "/dashboard/chat?mode=career_strategy" },
  { label: "Grant Writing", desc: "DST / UGC / AICTE / Fulbright proposals drafted with AI.", icon: <Award size={20} />, color: "#F59E0B", href: "/dashboard/chat?mode=career_strategy" },
  { label: "Student Project Supervision", desc: "Guide UG/PG dissertations, capstone projects, and research.", icon: <Users size={20} />, color: "#10B981", href: "/dashboard/chat" },
  { label: "Conference Preparation", desc: "Prepare abstract, slides, and presentation delivery.", icon: <Globe size={20} />, color: "#06B6D4", href: "/dashboard/chat?mode=communication" },
];

export default function ProfessorDashboard() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Professor";
  const statsFromRedux = useSelector((s: RootState) => s.ui.stats);
  const [profile, setProfile] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const isFounder = session?.user?.email?.toLowerCase() === "abishekramamoorthy22@gmail.com";

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    if (!token) return;

    fetch(`${API}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setProfile(d)).catch(() => null);

    activityApi.getLeaderboard(token).then((lb: any) => {
      if (lb?.leaderboard) setLeaderboard(lb.leaderboard.slice(0, 5));
    }).catch(() => null);
  }, [session]);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

  return (
    <motion.div initial="hidden" animate="show" variants={container}
      style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 60, position: "relative" }}>
      <AINameModal />

      {/* Background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "5%", left: "0%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Hero + Streak */}
        <motion.div variants={item} style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <LiveAgentPrompt userName={isFounder ? "Abishek R" : `Prof. ${userName}`} />
          </div>
          <StreakCard />
        </motion.div>

        {/* Professor Role Banner */}
        <motion.div variants={item} style={{
          marginBottom: 32, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: 20, padding: "20px 28px", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between"
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#F59E0B", marginBottom: 10 }}>
              🎓 Academic Intelligence Hub — {profile?.current_role || "Professor"}
              {profile?.company ? ` · ${profile.company}` : ""}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
              {["Research Publications", "Grant Proposals", "Curriculum Design", "Student Supervision", "Academic Career Growth"].map((b, i) => (
                <span key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>• {b}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <Link href="/dashboard/chat?mode=career_strategy" style={{ textDecoration: "none", background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", color: "#F59E0B", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 800 }}>Research AI</Link>
            <Link href="/dashboard/chat?mode=communication" style={{ textDecoration: "none", background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", color: "#F59E0B", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 800 }}>Academic Writing</Link>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={item} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 40 }}>
          {[
            { label: "XP Earned", value: statsFromRedux.xp?.toLocaleString() || "0", icon: <Flame size={18} color="#F59E0B" />, color: "#F59E0B" },
            { label: "Level", value: statsFromRedux.level || "Academic", icon: <Star size={18} color="#8B5CF6" />, color: "#8B5CF6" },
            { label: "Day Streak", value: `${statsFromRedux.streak || 0} days`, icon: <Trophy size={18} color="#10B981" />, color: "#10B981" },
          ].map((stat, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ background: `${stat.color}18`, borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "white" }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Bento Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 40 }}>
          {/* Mission Control */}
          <motion.div variants={item} style={{ gridColumn: "span 2", minHeight: 440 }}>
            <MissionControl token={typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""} />
          </motion.div>
          <motion.div variants={item} style={{ minHeight: 440 }}>
            <RoutineCard />
          </motion.div>

          {/* Skill Tracker */}
          <motion.div variants={item} style={{ gridColumn: "span 1" }}>
            <SkillTracker userType="professional" />
          </motion.div>

          {/* Focus Areas */}
          <motion.div variants={item} style={{ gridColumn: "span 2" }}>
            <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 28, padding: 28, height: "100%" }}>
              <h3 style={{ fontSize: 13, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Lightbulb size={14} color="#F59E0B" /> Academic Focus Areas
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {FOCUS_AREAS.map((fa, i) => (
                  <Link key={i} href={fa.href} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", background: `${fa.color}10`, border: `1px solid ${fa.color}25`, borderRadius: 14, transition: "all 0.2s" }}>
                    <div style={{ background: `${fa.color}20`, borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: fa.color, flexShrink: 0 }}>
                      {fa.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 2 }}>{fa.label}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{fa.desc}</div>
                    </div>
                    <ArrowRight size={16} color={fa.color} style={{ marginLeft: "auto", flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Module Grid */}
        <motion.div variants={item} style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "white", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <BookOpen size={20} color="#F59E0B" /> Academic Tools
          </h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, marginBottom: 40 }}>
          {PROFESSOR_MODULES.map((mod, i) => (
            <motion.div key={mod.id} variants={item}>
              <Link href={mod.link} style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 20, padding: "24px", height: "100%", cursor: "pointer",
                  transition: "all 0.2s", position: "relative", overflow: "hidden"
                }}>
                  {mod.badge && (
                    <span style={{ position: "absolute", top: 12, right: 12, background: `${mod.color}30`, color: mod.color, fontSize: 10, fontWeight: 900, padding: "3px 8px", borderRadius: 8, letterSpacing: 0.5 }}>{mod.badge}</span>
                  )}
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `${mod.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: mod.color, marginBottom: 16 }}>
                    {mod.icon}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 8 }}>{mod.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: 0 }}>{mod.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.div>
  );
}
