"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { TulasiLogo } from "@/components/TulasiLogo";
import { useState, useEffect } from "react";

// Nav items — mark Pro-only features with requiresPro: true
const NAV_ITEMS = [
  { icon: "🏠", name: "Dashboard",       href: "/dashboard" },
  { icon: "📄", name: "Resume Builder",  href: "/dashboard/resume",           requiresPro: true },
  { icon: "💻", name: "Code Practice",   href: "/dashboard/code" },
  { icon: "🏢", name: "Company Prep",    href: "/dashboard/company-prep" },
  { icon: "🗺️", name: "Career Roadmaps", href: "/dashboard/career-roadmaps" },
  { icon: "📚", name: "Platform Guides", href: "/dashboard/platform-guides" },
  { icon: "▶️", name: "YouTube Hub",     href: "/dashboard/youtube-learning" },
  { icon: "🏆", name: "Hackathons",      href: "/dashboard/hackathons" },
  { icon: "🎯", name: "Mock Interview",  href: "/dashboard/interview",        requiresPro: true },
  { icon: "👥", name: "Study Rooms",     href: "/dashboard/study-rooms" },
  { icon: "💬", name: "Group Chat",      href: "/dashboard/groups" },
  { icon: "🤖", name: "AI Chat",         href: "/dashboard/chat" },
  { icon: "🎓", name: "Certificates",    href: "/dashboard/certificates" },
  { icon: "✉️", name: "Messages",        href: "/dashboard/messages" },
  { icon: "💡", name: "Startup Lab",     href: "/dashboard/startup-lab" },
  { icon: "📊", name: "Analytics",       href: "/dashboard/analytics" },
  { icon: "🥇", name: "Leaderboard",    href: "/dashboard/leaderboard" },
  { icon: "💳", name: "Billing & Pro",   href: "/dashboard/billing" },
  { icon: "🎁", name: "Rewards Store",   href: "/dashboard/rewards" },
  { icon: "👤", name: "Profile",         href: "/dashboard/profile" },
  { icon: "⚡", name: "API Status",      href: "/dashboard/api-status" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const sessionUser = session?.user as any;

  // Read is_pro from localStorage — updated immediately after Razorpay payment
  const [isPro, setIsPro] = useState(false);
  useEffect(() => {
    const readPro = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        setIsPro(!!stored.is_pro || !!sessionUser?.is_pro);
      } catch { setIsPro(false); }
    };
    readPro();
    // Poll every 2s so sidebar updates promptly after payment
    const interval = setInterval(readPro, 2000);
    return () => clearInterval(interval);
  }, [sessionUser]);

  const user = sessionUser;

  return (
    <div style={{
      width: 260, height: "100vh",
      background: "var(--bg-secondary)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Logo + Pro badge */}
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }} style={{ position: "relative", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" } as any}>
          <TulasiLogo size={40} style={{ filter: "drop-shadow(0 4px 12px rgba(78,205,196,0.3))" }} />
        </motion.div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginLeft: 4 }}>
          <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1 }}>
            Tulasi<span style={{ color: "#4ECDC4" }}>AI</span>
          </span>
          <span style={{ background: "linear-gradient(90deg, #6C63FF, #FF6B9D)", padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 800, color: "white", marginTop: 2, letterSpacing: "1px", textTransform: "uppercase" }}>
            {isPro ? "⚡ Pro" : "Free"}
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const isLocked = item.requiresPro && !isPro;
            return (
              <motion.div key={item.href} whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
                <Link href={item.href} className={`nav-link ${active ? "active" : ""}`}
                  style={{ 
                    position: "relative",
                    background: active ? "linear-gradient(90deg, rgba(139,92,246,0.1), transparent)" : "transparent",
                    transition: "all 0.2s ease",
                    borderLeft: active ? "3px solid #8B5CF6" : "3px solid transparent",
                    paddingLeft: active ? 17 : 20,
                    opacity: isLocked ? 0.6 : 1,
                  }}
                >
                  <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontWeight: active ? 600 : 400, color: active ? "#fff" : "var(--text-secondary)" }}>{item.name}</span>
                  {/* Pro lock badge */}
                  {isLocked && (
                    <span style={{ marginLeft: "auto", fontSize: 9, padding: "2px 5px", borderRadius: 4, background: "rgba(139,92,246,0.15)", color: "#8B5CF6", fontWeight: 700, letterSpacing: "0.5px" }}>PRO</span>
                  )}
                  {/* Active dot */}
                  {active && (
                    <motion.div layoutId="active-indicator"
                      style={{ position: "absolute", right: 10, width: 6, height: 6, borderRadius: "50%", background: "#06B6D4", boxShadow: "0 0 10px #06B6D4" } as any}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}

          {/* Admin link - only show for admin */}
          {user?.role === "admin" && (
            <Link href="/admin" className={`nav-link ${pathname.startsWith("/admin") ? "active" : ""}`}
              style={{ marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>⚙️</span>
              <span>Admin Panel</span>
              <span className="badge badge-pink" style={{ marginLeft: "auto", padding: "2px 8px", fontSize: 10 }}>ADMIN</span>
            </Link>
          )}
        </div>
      </nav>

      {/* User info */}
      {user && (
        <div style={{ padding: "16px 16px 20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: "white", flexShrink: 0 }}>
              {(user.name || user.email || "U")[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name || "Student"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email}
              </div>
            </div>
            {isPro ? (
              <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "linear-gradient(135deg, #8B5CF6, #D946EF)", color: "white", fontWeight: 700 }}>
                ⚡ PRO
              </span>
            ) : user.role === "admin" ? (
              <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "rgba(255,107,157,0.15)", color: "#FF6B9D", fontWeight: 700 }}>Admin</span>
            ) : (
              <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "rgba(67,233,123,0.15)", color: "#43E97B", fontWeight: 700 }}>Free</span>
            )}
          </div>
          {/* Pro upsell for free users */}
          {!isPro && user.role !== "admin" && (
            <Link href="/dashboard/billing" style={{ display: "block", marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(56,189,248,0.1))", border: "1px solid rgba(139,92,246,0.25)", textDecoration: "none", textAlign: "center", fontSize: 12, color: "#8B5CF6", fontWeight: 600 }}>
              ⚡ Upgrade to Pro
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
