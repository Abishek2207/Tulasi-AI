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
  Code, Users, Trophy, BookOpen, Youtube, Building2, 
  FileText, Award, BarChart3, MessageCircle, 
  Mail, Medal, User, Gift, CreditCard, Activity, Settings, Lightbulb, BrainCircuit, Zap, CircleHelp, Layers, Compass
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Core",
    items: [
      { icon: LayoutDashboard, name: "Dashboard",       href: "/dashboard" },
      { icon: MessageSquare,   name: "AI Chat",         href: "/dashboard/chat" },
      { icon: Target,          name: "Mock Interview",  href: "/dashboard/interview",      requiresPro: true },
      { icon: Map,             name: "Career Roadmaps", href: "/dashboard/roadmaps" },
      { icon: Rocket,           name: "Startup Lab",     href: "/dashboard/startup-lab" },
    ]
  },
  {
    label: "Learning",
    items: [
      { icon: BrainCircuit,    name: "Flashcards",      href: "/dashboard/flashcards" },
      { icon: Code,            name: "Code Practice",   href: "/dashboard/code" },
      { icon: Layers,          name: "System Design",   href: "/dashboard/system-design" },
      { icon: Compass,         name: "Preparation Plan", href: "/dashboard/prep-plan" },
      { icon: Users,           name: "Study Rooms",     href: "/dashboard/study-rooms" },
      { icon: Trophy,          name: "Hackathons",      href: "/dashboard/hackathons" },
      { icon: BookOpen,        name: "Platform Guides", href: "/dashboard/platform-guides" },
      { icon: Youtube,         name: "YouTube Hub",     href: "/dashboard/youtube-learning" },
      { icon: Building2,       name: "Company Prep",    href: "/dashboard/company-prep" },
    ]
  },
  {
    label: "Tools",
    items: [
      { icon: Lightbulb,       name: "Project Ideas",   href: "/dashboard/projects" },
      { icon: FileText,        name: "Resume Builder",  href: "/dashboard/resume",          requiresPro: true },
      { icon: Award,           name: "Certificates",    href: "/dashboard/certificates" },
      { icon: BarChart3,       name: "Analytics",       href: "/dashboard/analytics" },
    ]
  },
  {
    label: "Community",
    items: [
      { icon: MessageCircle,   name: "Group Chat",      href: "/dashboard/groups" },
      { icon: Mail,            name: "Messages",        href: "mailto:support@tulasiai.com" },
      { icon: Medal,           name: "Leaderboard",     href: "/dashboard/leaderboard" },
    ]
  },
  {
    label: "Account",
    items: [
      { icon: User,            name: "Profile",         href: "/dashboard/profile" },
      { icon: Gift,            name: "Rewards Store",   href: "/dashboard/rewards" },
      { icon: CreditCard,      name: "Billing & Pro",   href: "/dashboard/billing" },
      { icon: Activity,        name: "API Status",      href: `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:10000"}/api/health` },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const sessionUser = session?.user;
  const [isPro, setIsPro] = useState(true);
  const [chatsUsed, setChatsUsed] = useState(0);

  useEffect(() => {
    setIsPro(true);
    setChatsUsed(0);
  }, [sessionUser]);

  const stats = useSelector((s: RootState) => s.ui.stats);
  const currentUser = sessionUser;
  const currentXp = stats?.xp ?? 0;
  const chatsUsedCurrent = chatsUsed;
  const chatLimit = 100 + Math.floor(currentXp / 100);
  const usagePercent = Math.min((chatsUsedCurrent / chatLimit) * 100, 100);

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      dispatch(toggleSidebar());
    }
  };


  const { sidebarOpen } = useSelector((s: RootState) => s.ui);

  return (
    <div style={{
      width: 280, height: "100vh",
      background: "rgba(10, 10, 15, 0.95)",
      borderRight: "1px solid rgba(255,255,255,0.08)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      position: "relative"
    }} className="sidebar-container">
      {/* Premium Ambient Background */}
      <div className="bg-dot" style={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none" }} />
      <div className="neural-pulse" style={{ position: "absolute", top: "20%", left: "-20%", width: "100%", height: "40%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => dispatch(toggleSidebar())}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: -1 }} 
        />
      )}
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <motion.div whileHover={{ scale: 1.02 }} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "linear-gradient(135deg, #A855F7, #22D3EE, #EC4899)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 25px rgba(168, 85, 247, 0.5)",
            flexShrink: 0
          }}>
            {TulasiLogo ? <TulasiLogo size={28} showText={false} /> : <div style={{width: 28, height: 28, background: "gray"}} />}
          </div>
          <div>
            <div style={{
              fontFamily: "var(--font-outfit)", fontWeight: 900, fontSize: 18,
              color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.1
            }}>
              Tulasi<span style={{ color: "var(--brand-primary)" }}>AI</span>
            </div>
            <div style={{ fontSize: 9, color: "var(--brand-primary)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.5, textShadow: "0 0 10px rgba(168, 85, 247, 0.4)" }}>
              Platinum Elite
            </div>
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px", scrollbarWidth: "none" }}>
        {NAV_SECTIONS.map(section => (
          <div key={section.label} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
              color: "rgba(255,255,255,0.2)", padding: "0 8px", marginBottom: 4
            }}>
              {section.label}
            </div>
            {section.items.map(item => {
              // Only show API Status for admins
              if (item.name === "API Status" && currentUser?.role !== "admin") return null;

              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const isLocked = item.requiresPro && !isPro;
              return (
                <motion.div key={item.href} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <Link href={item.href}
                    onClick={handleLinkClick}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 9, marginBottom: 1,
                      textDecoration: "none",
                      color: active ? "#fff" : "rgba(255,255,255,0.45)",
                      background: active
                        ? "rgba(139,92,246,0.08)"
                        : "transparent",
                      borderLeft: active ? "3px solid #8B5CF6" : "3px solid transparent",
                      backdropFilter: active ? "blur(10px)" : "none",
                      transition: "all 0.2s var(--ease-premium)",
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      opacity: isLocked ? 0.55 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
                      if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
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
                    {isLocked && (
                      <span style={{
                        fontSize: 9, padding: "2px 5px", borderRadius: 4,
                        background: "rgba(139,92,246,0.15)", color: "#8B5CF6", fontWeight: 700
                      }}>PRO</span>
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

        {(currentUser?.role === "admin" || currentUser?.email === "abishekramamoorthy22@gmail.com") && (
          <div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "8px 0 12px" }} />
            <Link href="/admin" style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
              borderRadius: 9, textDecoration: "none", color: "#FF6B9D", fontSize: 13, fontWeight: 600,
              background: "rgba(255,107,157,0.06)",
            }}>
              {Settings ? <Settings size={14} /> : <CircleHelp size={14} />}
              Admin Panel
              <span style={{ marginLeft: "auto", fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(255,107,157,0.15)", fontWeight: 700 }}>ADMIN</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Usage Limit Tracker — REMOVED FOR PLATINUM PRO UNLIMITED */}
      {/* { !isPro && ... } */}

      {/* User footer */}
      {currentUser && (
        <div className="glass-card-premium" style={{ 
          margin: "12px",
          padding: "16px", 
          borderRadius: 20,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 14,
              background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 15, color: "white", flexShrink: 0,
              boxShadow: "0 8px 16px rgba(139,92,246,0.4)",
            }}>
              {(currentUser.name || currentUser.email || "U")[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.3px" }}>
                {currentUser.name || "Student"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
                 {isPro ? "PLATINUM" : "FREE MEMBER"}
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
