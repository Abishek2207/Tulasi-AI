"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import { AgentBadge } from "@/components/ui/AgentBadge";
import {
  Brain, Target, ChevronRight, ChevronDown,
  MessageCircle, Rocket, Zap, ArrowRight,
  TrendingUp, BriefcaseBusiness, Sparkles
} from "lucide-react";
import JarvisAssistant from "@/components/dashboard/JarvisAssistant";
import { DailyLearningWidget } from "@/components/dashboard/DailyLearningWidget";
import { MembershipCard } from "@/components/dashboard/MembershipCard";

// ── Hub & Agent Definitions (Consolidated per Phase 6 Rules) ───────────

const HUBS = [
  {
    id: "core-loop",
    icon: Target,
    title: "Primary Experience",
    tagline: "Your central intelligence loop for placement and growth.",
    color: "#10B981",
    gradient: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))",
    border: "rgba(16,185,129,0.3)",
    agents: [
      {
        id: "placement-readiness",
        title: "Placement Readiness",
        desc: "Check your readiness score based on verified database history and skill gaps.",
        icon: TrendingUp,
        link: "/dashboard/progress-tracker", // Reusing tracker as readiness for now
        badge: "live" as const,
        color: "#10B981",
      },
      {
        id: "job-match",
        title: "Smart Job Match",
        desc: "Real internships/jobs matched to your resume, skills, and location via SerpApi.",
        icon: BriefcaseBusiness,
        link: "/dashboard/job-internship-match",
        badge: "live" as const,
        color: "#3B82F6",
      },
      {
        id: "next-action",
        title: "Next Best Action",
        desc: "Your daily learning task driven by skill gaps and market intelligence.",
        icon: Rocket,
        link: "/dashboard/personalized-roadmap", // Leveraging roadmap infrastructure
        badge: "live" as const,
        color: "#F97316",
      },
      {
        id: "communication-coach",
        title: "Communication & Interview Coach",
        desc: "Live mock interviews with speech and video analysis for readiness.",
        icon: MessageCircle,
        link: "/dashboard/ai-interview",
        badge: "live" as const,
        color: "#6D28D9",
      },
    ],
  }
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24  } as any }
};

export default function StudentDashboard() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Engineer";
  const [openHub, setOpenHub] = useState<string | null>("core-loop"); // Open by default

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 100 }}
    >
      <motion.div variants={item}>
        <MembershipCard />
      </motion.div>

      {/* ── Jarvis Orchestration Layer ── */}
      <motion.div variants={item} style={{ marginBottom: 40 }}>
        <JarvisAssistant />
      </motion.div>

      {/* ── Header Area ── */}
      <motion.div variants={item} style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        marginBottom: 40, flexWrap: "wrap", gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "white", marginBottom: 6, fontFamily: "var(--font-outfit)", letterSpacing: "-0.02em" }}>
            Ready to crack it, <span style={{ color: "#10B981" }}>{userName}</span>?
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
            Your placement readiness loop based on real market intelligence.
          </p>
        </div>
        {!session?.user?.is_pro && (
          <Link href="/dashboard/upgrade" style={{ textDecoration: "none" }}>
            <div style={{
              padding: "10px 20px", borderRadius: 100,
              background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.1))",
              border: "1px solid rgba(245,158,11,0.2)",
              display: "flex", flexDirection: "column", gap: 2, cursor: "pointer",
              color: "#F59E0B",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={16} /> Upgrade to Pro</span>
              <span style={{ opacity: 0.6, fontSize: 13, fontWeight: 500 }}>Unlock real-time data & unlimited interviews</span>
            </div>
          </Link>
        )}
      </motion.div>

      {/* ── Daily Adaptive Learning Widget ── */}
      <motion.div variants={item}>
        <DailyLearningWidget />
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
          marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#10B981",
          textDecoration: "none", display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
        }}>
          View Readiness <ChevronRight size={13} />
        </Link>
      </motion.div>
    </motion.div>
  );
}
