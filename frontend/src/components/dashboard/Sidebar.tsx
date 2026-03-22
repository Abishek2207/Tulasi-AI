"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { TulasiLogo } from "@/components/TulasiLogo";
import { useState, useEffect } from "react";

import { 
  LayoutDashboard, MessageSquare, Target, Map, Rocket, 
  Code, Users, Trophy, BookOpen, Youtube, Building2, 
  FileText, Award, BarChart3, FileQuestion, MessageCircle, 
  Mail, Medal, User, Gift, CreditCard, Activity, Settings
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Core",
    items: [
      { icon: LayoutDashboard, name: "Dashboard",       href: "/dashboard" },
      { icon: MessageSquare,   name: "AI Chat",         href: "/dashboard/chat" },
      { icon: Target,          name: "Mock Interview",  href: "/dashboard/interview",      requiresPro: true },
      { icon: Map,             name: "Career Roadmaps", href: "/dashboard/career-roadmaps" },
      { icon: Rocket,           name: "Startup Lab",     href: "/dashboard/startup-lab" },
    ]
  },
  {
    label: "Learning",
    items: [
      { icon: Code,            name: "Code Practice",   href: "/dashboard/code" },
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
      { icon: FileText,        name: "Resume Builder",  href: "/dashboard/resume",          requiresPro: true },
      { icon: Award,           name: "Certificates",    href: "/dashboard/certificates" },
      { icon: BarChart3,       name: "Analytics",       href: "/dashboard/analytics" },
      { icon: FileQuestion,    name: "PDF Q&A",         href: "/pdf" },
    ]
  },
  {
    label: "Community",
    items: [
      { icon: MessageCircle,   name: "Group Chat",      href: "/dashboard/groups" },
      { icon: Mail,            name: "Messages",        href: "/dashboard/messages" },
      { icon: Medal,           name: "Leaderboard",     href: "/dashboard/leaderboard" },
    ]
  },
  {
    label: "Account",
    items: [
      { icon: User,            name: "Profile",         href: "/dashboard/profile" },
      { icon: Gift,            name: "Rewards Store",   href: "/dashboard/rewards" },
      { icon: CreditCard,      name: "Billing & Pro",   href: "/dashboard/billing" },
      { icon: Activity,        name: "API Status",      href: "/dashboard/api-status" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const sessionUser = session?.user as any;
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const readPro = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        setIsPro(!!stored.is_pro || !!sessionUser?.is_pro);
      } catch { setIsPro(false); }
    };
    readPro();
    const interval = setInterval(readPro, 2000);
    return () => clearInterval(interval);
  }, [sessionUser]);

  const user = sessionUser;

  return (
    <div style={{
      width: 260, height: "100vh",
      background: "linear-gradient(180deg, #09090f 0%, #0b0d14 100%)",
      borderRight: "1px solid rgba(255,255,255,0.04)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <motion.div whileHover={{ scale: 1.02 }} style={{ display: "flex", alignItems: "center", gap: 10 } as any}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(139,92,246,0.4)",
            flexShrink: 0
          }}>
            <TulasiLogo size={26} />
          </div>
          <div>
            <div style={{
              fontFamily: "var(--font-outfit)", fontWeight: 800, fontSize: 17,
              color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.1
            }}>
              Tulasi<span style={{ color: "#06B6D4" }}>AI</span>
            </div>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase",
              background: isPro ? "linear-gradient(90deg, #8B5CF6, #D946EF)" : "rgba(255,255,255,0.1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginTop: 2,
            }}>
              {isPro ? "Pro Plan" : "Free Plan"}
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
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const isLocked = item.requiresPro && !isPro;
              return (
                <motion.div key={item.href} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <Link href={item.href}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 9, marginBottom: 1,
                      textDecoration: "none",
                      color: active ? "#fff" : "rgba(255,255,255,0.45)",
                      background: active
                        ? "linear-gradient(90deg, rgba(139,92,246,0.18), rgba(6,182,212,0.06))"
                        : "transparent",
                      borderLeft: active ? "2px solid #8B5CF6" : "2px solid transparent",
                      transition: "all 0.15s ease",
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
                    }}><item.icon size={16} /></span>
                    <span style={{ flex: 1 }}>{item.name}</span>
                    {isLocked && (
                      <span style={{
                        fontSize: 9, padding: "2px 5px", borderRadius: 4,
                        background: "rgba(139,92,246,0.15)", color: "#8B5CF6", fontWeight: 700
                      }}>PRO</span>
                    )}
                    {active && (
                      <motion.div layoutId="sidebar-active-dot"
                        style={{ width: 5, height: 5, borderRadius: "50%", background: "#06B6D4", boxShadow: "0 0 8px #06B6D4" } as any}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ))}

        {user?.role === "admin" && (
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
      {user && (
        <div style={{ padding: "12px 12px 16px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 13, color: "white", flexShrink: 0,
              boxShadow: "0 0 12px rgba(139,92,246,0.3)",
            }}>
              {(user.name || user.email || "U")[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name || "Student"}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email}
              </div>
            </div>
            {isPro ? (
              <span style={{ fontSize: 10, padding: "3px 7px", borderRadius: 6, background: "linear-gradient(135deg,#8B5CF6,#D946EF)", color: "white", fontWeight: 700, whiteSpace: "nowrap" }}>PRO</span>
            ) : (
              <span style={{ fontSize: 10, padding: "3px 7px", borderRadius: 6, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Free</span>
            )}
          </div>

          {!isPro && user.role !== "admin" && (
            <Link href="/dashboard/billing" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              marginTop: 10, padding: "9px 12px", borderRadius: 9,
              background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08))",
              border: "1px solid rgba(139,92,246,0.2)",
              textDecoration: "none", fontSize: 12, color: "#8B5CF6", fontWeight: 600,
              transition: "all 0.2s ease",
            }}>
              Upgrade to Pro
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
