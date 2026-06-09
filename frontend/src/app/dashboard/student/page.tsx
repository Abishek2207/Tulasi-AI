"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import { TiltCard } from "@/components/ui/TiltCard";
import {
  MessageSquare, Target, Map, FileText,
  Rocket, FolderKanban, BriefcaseBusiness, LayoutTemplate, TrendingUp,
  Sparkles, ArrowRight
} from "lucide-react";

const AGENTS = [
  { id: "career-copilot", title: "Career Copilot", desc: "Your personal AI guide navigating you to your dream role.", icon: <MessageSquare size={28} />, link: "/dashboard/career-copilot", color: "#8B5CF6" },
  { id: "resume-analyzer", title: "Resume Analyzer", desc: "Instantly parse and optimize your resume for ATS systems.", icon: <FileText size={28} />, link: "/dashboard/resume-analyzer", color: "#3B82F6" },
  { id: "roadmap", title: "Personalized Roadmap", desc: "Generate a custom, day-by-day technical learning path.", icon: <Map size={28} />, link: "/dashboard/personalized-roadmap", color: "#10B981" },
  { id: "interview", title: "AI Interviewer", desc: "Live mock interviews with an adaptive AI Hiring Manager.", icon: <Target size={28} />, link: "/dashboard/ai-interview", color: "#F43F5E" },
  { id: "project-builder", title: "Project Builder", desc: "Architecture, step-by-step guidance, and code scaffolds.", icon: <FolderKanban size={28} />, link: "/dashboard/project-builder", color: "#FFD93D" },
  { id: "job-match", title: "Job & Internship Match", desc: "AI algorithms match your skills to live opportunities.", icon: <BriefcaseBusiness size={28} />, link: "/dashboard/job-internship-match", color: "#06B6D4" },
  { id: "hackathon", title: "Hackathon Agent", desc: "Idea generation, team forming, and rapid prototyping.", icon: <Rocket size={28} />, link: "/dashboard/hackathon-agent", color: "#F97316" },
  { id: "portfolio", title: "Portfolio Builder", desc: "Auto-generate a stunning developer portfolio site.", icon: <LayoutTemplate size={28} />, link: "/dashboard/portfolio-builder", color: "#A855F7" },
  { id: "progress", title: "Progress Tracker", desc: "Quantify your growth with deep neural analytics.", icon: <TrendingUp size={28} />, link: "/dashboard/progress-tracker", color: "#EC4899" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Engineer";

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container} style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 60, position: "relative" }}>
      {/* Technical Background Elements */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.05 }} />
        <div className="bg-dot" style={{ position: "absolute", inset: 0, opacity: 0.1, transform: "scale(1.2)" }} />
        <div className="neural-pulse" style={{ position: "absolute", top: "10%", left: "5%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <motion.div variants={item} style={{ marginBottom: 40, marginTop: 20 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 20, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#A78BFA", fontSize: 13, fontWeight: 800, marginBottom: 16 }}>
            <Sparkles size={16} /> AI CAREER OS
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: "white", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 16, fontFamily: "var(--font-outfit)" }}>
            Welcome back, {userName}.<br/>
            <span style={{ color: "var(--text-muted)" }}>Which agent do you need today?</span>
          </h1>
        </motion.div>

        <div className="agents-grid">
          {AGENTS.map((agent) => (
            <motion.div key={agent.id} variants={item}>
              <TiltCard intensity={5} style={{ height: "100%" }}>
                <Link href={agent.link} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                  <div className="glass-card-premium" style={{
                    padding: 36, height: "100%", display: "flex", flexDirection: "column", transition: "all 0.4s var(--ease-premium)",
                    background: "rgba(255,255,255,0.02)", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)"
                  }} onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = `${agent.color}40`;
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 20, background: `${agent.color}15`, border: `1px solid ${agent.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center", color: agent.color, marginBottom: 28,
                      boxShadow: `0 12px 24px ${agent.color}20`
                    }}>
                      {React.cloneElement(agent.icon as any, { size: 32 })}
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, color: "white", fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px" }}>{agent.title}</h3>
                    <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 28, fontWeight: 500 }}>{agent.desc}</p>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 900, color: agent.color, textTransform: "uppercase", letterSpacing: 1.5 }}>
                      Initialize Agent <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .agents-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); 
          gap: 24px; 
        }

        @media (max-width: 768px) {
          .agents-grid { grid-template-columns: 1fr; gap: 16px; }
        }

        .glass-card-premium {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(24px) saturate(200%);
          -webkit-backdrop-filter: blur(24px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </motion.div>
  );
}
