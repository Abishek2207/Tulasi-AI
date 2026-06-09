"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { motion } from "framer-motion";
import { TulasiLogo } from "@/components/TulasiLogo";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { toggleSidebar } from "@/store/slices/uiSlice";

import {
  LayoutDashboard, MessageSquare, Target, Map, Rocket,
  FileText, CreditCard, TrendingUp, Bell,
  CircleHelp, Settings, FolderKanban, LayoutTemplate, BriefcaseBusiness
} from "lucide-react";

type NavItem = {
  icon: React.ComponentType<{ size?: number }>;
  name: string;
  href: string;
  badge?: string;
};

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "AI Core Agents",
    items: [
      { icon: LayoutDashboard,    name: "Dashboard",         href: "/dashboard/student" },
      { icon: MessageSquare,      name: "Career Copilot",    href: "/dashboard/career-copilot" },
      { icon: FileText,           name: "Resume Analyzer",   href: "/dashboard/resume-analyzer" },
      { icon: Map,                name: "Roadmap Agent",     href: "/dashboard/personalized-roadmap" },
      { icon: Target,             name: "AI Interviewer",    href: "/dashboard/ai-interview" },
      { icon: FolderKanban,       name: "Project Builder",   href: "/dashboard/project-builder" },
      { icon: BriefcaseBusiness,  name: "Job & Internship",  href: "/dashboard/job-internship-match" },
      { icon: Rocket,             name: "Hackathon Agent",   href: "/dashboard/hackathon-agent" },
      { icon: LayoutTemplate,     name: "Portfolio Builder", href: "/dashboard/portfolio-builder" },
      { icon: TrendingUp,         name: "Progress Tracker",  href: "/dashboard/progress-tracker" },
    ],
  },
  {
    label: "Account",
    items: [
      { icon: Bell,        name: "Notifications", href: "/dashboard/notifications" },
      { icon: CreditCard,  name: "Billing & Pro", href: "/dashboard/billing" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const currentUser = session?.user;

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      dispatch(toggleSidebar());
    }
  };

  return (
    <div style={{
      width: 280, height: "100vh",
      background: "rgba(10, 10, 15, 0.98)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      position: "relative"
    }} className="sidebar-container">
      {/* Premium Ambient Background */}
      <div className="bg-dot" style={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none" }} />
      <div className="neural-pulse" style={{ position: "absolute", top: "20%", left: "-20%", width: "100%", height: "40%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <Link href="/dashboard/student" style={{ textDecoration: "none" }}>
          <motion.div whileHover={{ scale: 1.02 }} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TulasiLogo size={40} glow showText={false} />
            <div>
              <div style={{
                fontFamily: "var(--font-outfit)", fontWeight: 900, fontSize: 18,
                color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.1
              }}>
                Tulasi<span style={{ color: "var(--brand-primary)" }}>AI</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
                Career OS
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px", scrollbarWidth: "none" }}>
        {NAV_SECTIONS.map(section => (
          <div key={section.label} style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
              color: "rgba(255,255,255,0.2)", padding: "0 8px", marginBottom: 6
            }}>
              {section.label}
            </div>
            {section.items.map((item: NavItem) => {
              const active = pathname === item.href || (item.href !== "/dashboard/student" && pathname.startsWith(item.href));
              return (
                <motion.div key={item.href} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <Link href={item.href}
                    onClick={handleLinkClick}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 10px", borderRadius: 10, marginBottom: 2,
                      textDecoration: "none",
                      color: active ? "#fff" : "rgba(255,255,255,0.45)",
                      background: active ? "rgba(139,92,246,0.1)" : "transparent",
                      borderLeft: active ? "3px solid #8B5CF6" : "3px solid transparent",
                      transition: "all 0.2s ease",
                      fontSize: 13, fontWeight: active ? 700 : 400,
                    }}
                    onMouseEnter={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)";
                      if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                      if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <span style={{
                      display: "flex", alignItems: "center", justifyContent: "center", width: 20, flexShrink: 0,
                      color: active ? "#8B5CF6" : "inherit",
                    }}>
                      {item.icon ? <item.icon size={16} /> : <CircleHelp size={16} />}
                    </span>
                    <span style={{ flex: 1 }}>{item.name}</span>
                    {item.badge && (
                      <span style={{
                        fontSize: 8, padding: "2px 5px", borderRadius: 4,
                        background: "rgba(249,115,22,0.2)", color: "#F97316", fontWeight: 900, letterSpacing: 0.5
                      }}>{item.badge}</span>
                    )}
                    {active && (
                      <motion.div layoutId="sidebar-active-dot"
                        style={{ width: 5, height: 5, borderRadius: "50%", background: "#06B6D4", boxShadow: "0 0 8px #06B6D4" }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ))}

        {(currentUser?.role === "admin" || currentUser?.email?.toLowerCase() === "abishekramamoorthy22@gmail.com") && (
          <div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "8px 0 12px" }} />
            <Link href="/admin" style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
              borderRadius: 9, textDecoration: "none", color: "#FF6B9D", fontSize: 13, fontWeight: 600,
              background: "rgba(255,107,157,0.06)",
            }}>
              <Settings size={14} />
              Admin Panel
              <span style={{ marginLeft: "auto", fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(255,107,157,0.15)", fontWeight: 700 }}>ADMIN</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User footer */}
      {currentUser && (
        <div style={{
          margin: "12px",
          padding: "14px 16px",
          borderRadius: 18,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: currentUser.avatar ? `url(${currentUser.avatar}) center/cover no-repeat` : "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 14, color: "white", flexShrink: 0,
              boxShadow: "0 6px 14px rgba(139,92,246,0.35)",
              overflow: "hidden"
            }}>
              {!currentUser.avatar && (currentUser.name || currentUser.email || "U")[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser.name || "Student"}
              </div>
              <div style={{ fontSize: 10, color: "rgba(16,185,129,0.9)", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                PRO
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @media (min-width: 1024px) {
          .sidebar-container {
            position: relative !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
