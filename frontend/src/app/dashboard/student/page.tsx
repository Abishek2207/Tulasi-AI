"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import { AgentBadge } from "@/components/ui/AgentBadge";
import {
  Brain, Briefcase, Target, ChevronRight, ChevronDown,
  Code2, MessageCircle, Mic, Map, FileText, FolderGit2,
  Rocket, BriefcaseBusiness, LayoutTemplate, TrendingUp,
  ClipboardList, Sparkles, ArrowRight, Zap, Activity,
} from "lucide-react";

// ─── Hub & Agent Definitions ────────────────────────────────────────────────

const HUBS = [
  {
    id: "learn",
    icon: Brain,
    title: "Learn & Crack Interviews",
    tagline: "Master DSA, communication, and live mock interviews.",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.05))",
    border: "rgba(139,92,246,0.3)",
    agents: [
      {
        id: "dsa-agent",
        title: "DSA Agent",
        desc: "Personalized DSA plan, weak-area detection, and daily problems.",
        icon: Code2,
        link: "/dashboard/dsa-agent",
        badge: "beta" as const,
        color: "#8B5CF6",
      },
      {
        id: "communication-agent",
        title: "Communication Agent",
        desc: "Interview speaking prompts, grammar feedback, confidence score.",
        icon: Mic,
        link: "/dashboard/communication-agent",
        badge: "beta" as const,
        color: "#A78BFA",
      },
      {
        id: "ai-interview",
        title: "AI Interview Agent",
        desc: "Live mock interviews based on your role, resume, and target company.",
        icon: MessageCircle,
        link: "/dashboard/ai-interview",
        badge: "live" as const,
        color: "#6D28D9",
      },
    ],
  },
  {
    id: "career",
    icon: Briefcase,
    title: "Career Builder",
    tagline: "Build your roadmap, resume, projects, and hackathon strategy.",
    color: "#10B981",
    gradient: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))",
    border: "rgba(16,185,129,0.3)",
    agents: [
      {
        id: "roadmap",
        title: "Roadmap Agent",
        desc: "Real personalized roadmap based on year, skills, target role, and time.",
        icon: Map,
        link: "/dashboard/personalized-roadmap",
        badge: "live" as const,
        color: "#10B981",
      },
      {
        id: "resume",
        title: "Resume Agent",
        desc: "ATS-optimized resume builder from your real data.",
        icon: FileText,
        link: "/dashboard/resume-analyzer",
        badge: "live" as const,
        color: "#34D399",
      },
      {
        id: "project-builder",
        title: "Project Agent",
        desc: "Project recommendations based on your skill level and career goals.",
        icon: FolderGit2,
        link: "/dashboard/project-builder",
        badge: "live" as const,
        color: "#059669",
      },
      {
        id: "hackathon",
        title: "Hackathon Agent",
        desc: "Real live hackathons with deadlines, mode, and registration links.",
        icon: Rocket,
        link: "/dashboard/hackathon-agent",
        badge: "live" as const,
        color: "#F97316",
      },
    ],
  },
  {
    id: "opportunities",
    icon: Target,
    title: "Opportunities & Tracking",
    tagline: "Find real jobs, track applications, and build your portfolio.",
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.05))",
    border: "rgba(59,130,246,0.3)",
    agents: [
      {
        id: "job-match",
        title: "Job Match Agent",
        desc: "Real internships/jobs matched to your resume, skills, and location.",
        icon: BriefcaseBusiness,
        link: "/dashboard/job-internship-match",
        badge: "live" as const,
        color: "#3B82F6",
      },
      {
        id: "application-tracker",
        title: "Application Tracker",
        desc: "Track applied, shortlisted, interview, offer, and rejected stages.",
        icon: ClipboardList,
        link: "/dashboard/application-tracker",
        badge: "live" as const,
        color: "#60A5FA",
      },
      {
        id: "portfolio",
        title: "Portfolio Agent",
        desc: "Generate portfolio from your GitHub, resume, and real projects.",
        icon: LayoutTemplate,
        link: "/dashboard/portfolio-builder",
        badge: "beta" as const,
        color: "#A855F7",
      },
    ],
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Engineer";
  const [openHub, setOpenHub] = useState<string | null>(null);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } } };

  return (
    <motion.div
      initial="hidden" animate="show" variants={container}
      style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 80 }}
    >
      {/* ── Header ── */}
      <motion.div variants={item} style={{ marginBottom: 48, marginTop: 8 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 20,
          background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)",
          color: "#A78BFA", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em",
          textTransform: "uppercase", marginBottom: 18,
        }}>
          <Activity size={13} />
          Intelligent Career Infrastructure
        </div>

        <h1 style={{
          fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 900, color: "white",
          letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14,
          fontFamily: "var(--font-outfit)",
        }}>
          Continue Your Growth, {userName}.<br />
          <span style={{ color: "rgba(255,255,255,0.3)" }}>Choose your agent.</span>
        </h1>

        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", maxWidth: 500, lineHeight: 1.6 }}>
          Every agent works with real data only. No fake scores, no demo content.
          If a data source is missing, you&apos;ll see a clear prompt to connect it.
        </p>
      </motion.div>

      {/* ── Hub Cards ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {HUBS.map((hub) => {
          const isOpen = openHub === hub.id;
          const HubIcon = hub.icon;

          return (
            <motion.div key={hub.id} variants={item}>
              {/* Hub Header Card */}
              <div
                onClick={() => setOpenHub(isOpen ? null : hub.id)}
                style={{
                  padding: "28px 32px", borderRadius: isOpen ? "24px 24px 0 0" : 24,
                  background: isOpen ? hub.gradient : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isOpen ? hub.border : "rgba(255,255,255,0.06)"}`,
                  borderBottom: isOpen ? "none" : undefined,
                  cursor: "pointer", transition: "all 0.3s ease",
                  display: "flex", alignItems: "center", gap: 20,
                  userSelect: "none",
                }}
                onMouseEnter={e => {
                  if (!isOpen) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = hub.border;
                  }
                }}
                onMouseLeave={e => {
                  if (!isOpen) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  }
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 56, height: 56, borderRadius: 18, flexShrink: 0,
                  background: `${hub.color}15`, border: `1px solid ${hub.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 8px 24px ${hub.color}20`,
                }}>
                  <HubIcon size={28} color={hub.color} />
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: "white", marginBottom: 4, fontFamily: "var(--font-outfit)" }}>
                    {hub.title}
                  </h2>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                    {hub.tagline}
                  </p>
                </div>

                {/* Meta */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
                    {hub.agents.length} agents
                  </span>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown size={20} color="rgba(255,255,255,0.4)" />
                  </motion.div>
                </div>
              </div>

              {/* Expanded Sub-Agents Grid */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: 1,
                      background: hub.border,
                      borderRadius: "0 0 24px 24px",
                      overflow: "hidden",
                      border: `1px solid ${hub.border}`,
                      borderTop: "none",
                    }}
                  >
                    {hub.agents.map((agent) => {
                      const AgentIcon = agent.icon;
                      return (
                        <Link key={agent.id} href={agent.link} style={{ textDecoration: "none" }}>
                          <div
                            style={{
                              padding: "24px 28px", background: "rgba(10,10,12,0.95)",
                              transition: "all 0.2s ease", cursor: "pointer",
                              height: "100%", display: "flex", flexDirection: "column", gap: 14,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${agent.color}08`; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(10,10,12,0.95)"; }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                              <div style={{
                                width: 42, height: 42, borderRadius: 14,
                                background: `${agent.color}12`, border: `1px solid ${agent.color}25`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                <AgentIcon size={20} color={agent.color} />
                              </div>
                              <AgentBadge variant={agent.badge} />
                            </div>

                            <div>
                              <h3 style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 6 }}>
                                {agent.title}
                              </h3>
                              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                                {agent.desc}
                              </p>
                            </div>

                            <div style={{
                              marginTop: "auto", display: "flex", alignItems: "center", gap: 6,
                              fontSize: 12, fontWeight: 700, color: agent.color,
                              textTransform: "uppercase", letterSpacing: "0.06em",
                            }}>
                              Launch Agent <ArrowRight size={13} />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ── Bottom Tip ── */}
      <motion.div variants={item} style={{
        marginTop: 40, padding: "16px 24px", borderRadius: 16,
        background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Zap size={16} color="#F59E0B" />
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
          <strong style={{ color: "rgba(255,255,255,0.6)" }}>Real-data only platform.</strong>{" "}
          Agents display empty states when no verified data is available — never fake content.
        </p>
        <Link href="/dashboard/progress-tracker" style={{
          marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#8B5CF6",
          textDecoration: "none", display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
        }}>
          View Progress <ChevronRight size={13} />
        </Link>
      </motion.div>
    </motion.div>
  );
}
