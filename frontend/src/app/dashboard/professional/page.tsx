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
    id: "upskill",
    icon: Brain,
    title: "Upskilling & System Design",
    tagline: "Master System Design, Architecture, and advanced engineering concepts.",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.05))",
    border: "rgba(139,92,246,0.3)",
    agents: [
      {
        id: "system-design",
        title: "System Design Agent",
        desc: "Interactive system design architecture reviews and mock interviews.",
        icon: LayoutTemplate,
        link: "/dashboard/system-design",
        badge: "beta" as const,
        color: "#8B5CF6",
      },
      {
        id: "code-review",
        title: "Code Review Agent",
        desc: "Advanced code review, refactoring, and performance optimization.",
        icon: Code2,
        link: "/dashboard/code-review",
        badge: "live" as const,
        color: "#A78BFA",
      },
    ],
  },
  {
    id: "career-growth",
    icon: TrendingUp,
    title: "Career Growth & Leadership",
    tagline: "Plan your next promotion, manage teams, and build leadership skills.",
    color: "#10B981",
    gradient: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))",
    border: "rgba(16,185,129,0.3)",
    agents: [
      {
        id: "promotion-strategist",
        title: "Promotion Strategist",
        desc: "Build a roadmap to your next level (SDE II, Senior, Staff, etc).",
        icon: TrendingUp,
        link: "/dashboard/promotion-strategist",
        badge: "live" as const,
        color: "#10B981",
      },
      {
        id: "leadership-coach",
        title: "Leadership Coach",
        desc: "Handle 1:1s, team conflicts, and cross-functional communication.",
        icon: MessageCircle,
        link: "/dashboard/leadership-coach",
        badge: "beta" as const,
        color: "#34D399",
      },
    ],
  },
  {
    id: "opportunities",
    icon: Target,
    title: "Lateral Moves & Offers",
    tagline: "Find senior roles, negotiate offers, and pivot your career.",
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.05))",
    border: "rgba(59,130,246,0.3)",
    agents: [
      {
        id: "senior-job-match",
        title: "Senior Job Match",
        desc: "Exclusive lateral roles matched to your experience and target compensation.",
        icon: BriefcaseBusiness,
        link: "/dashboard/senior-job-match",
        badge: "live" as const,
        color: "#3B82F6",
      },
      {
        id: "offer-negotiator",
        title: "Offer Negotiator",
        desc: "Simulated compensation negotiation to maximize your next offer.",
        icon: Briefcase,
        link: "/dashboard/offer-negotiator",
        badge: "beta" as const,
        color: "#60A5FA",
      },
    ],
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProfessionalDashboard() {
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

        {(!session?.user?.is_pro) && (
          <Link href="/dashboard/billing" style={{ textDecoration: "none" }}>
            <div style={{
              marginTop: 24, padding: "12px 20px", borderRadius: 14, display: "inline-flex", alignItems: "center", gap: 10,
              background: "linear-gradient(135deg, rgba(234,179,8,0.15), rgba(234,179,8,0.05))",
              border: "1px solid rgba(234,179,8,0.3)", color: "#FBBF24", fontWeight: 700, fontSize: 14,
              boxShadow: "0 8px 24px rgba(234,179,8,0.15)", cursor: "pointer", transition: "transform 0.2s"
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={16} /> Upgrade to Pro</span>
              <span style={{ opacity: 0.6, fontSize: 13, fontWeight: 500 }}>Unlock real-time data & unlimited interviews</span>
            </div>
          </Link>
        )}
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
