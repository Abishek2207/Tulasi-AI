"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { icon: "🏠", name: "Dashboard", href: "/dashboard" },
  { icon: "📄", name: "Resume Builder", href: "/dashboard/resume" },
  { icon: "💻", name: "Code Practice", href: "/dashboard/code" },
  { icon: "🏢", name: "Company Prep", href: "/dashboard/company-prep" },
  { icon: "🗺️", name: "Career Roadmaps", href: "/dashboard/career-roadmaps" },
  { icon: "📚", name: "Platform Guides", href: "/dashboard/platform-guides" },
  { icon: "▶️", name: "YouTube Hub", href: "/dashboard/youtube-learning" },
  { icon: "🏆", name: "Hackathons", href: "/dashboard/hackathons" },
  { icon: "🎯", name: "Mock Interview", href: "/dashboard/interview" },
  { icon: "👥", name: "Study Rooms", href: "/dashboard/study-rooms" },
  { icon: "💬", name: "Group Chat", href: "/dashboard/groups" },
  { icon: "🤖", name: "AI Chat", href: "/dashboard/chat" },
  { icon: "🎓", name: "Certificates", href: "/dashboard/certificates" },
  { icon: "✉️", name: "Messages", href: "/dashboard/messages" },
  { icon: "💡", name: "Startup Lab", href: "/dashboard/startup-lab" },
  { icon: "📊", name: "Analytics", href: "/dashboard/analytics" },
  { icon: "🥇", name: "Leaderboard", href: "/dashboard/leaderboard" },
  { icon: "💳", name: "Billing & Pro", href: "/dashboard/billing" },
  { icon: "🎁", name: "Rewards Store", href: "/dashboard/rewards" },
  { icon: "👤", name: "Profile", href: "/dashboard/profile" },
  { icon: "⚡", name: "API Status", href: "/dashboard/api-status" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <div style={{
      width: 260, height: "100vh",
      background: "var(--bg-secondary)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }} style={{ position: "relative", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/images/logo-transparent.png" alt="Tulasi AI Pro" style={{ width: "120%", height: "120%", objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(78,205,196,0.3))" }} />
        </motion.div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginLeft: 4 }}>
          <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1 }}>
            Tulasi<span style={{ color: "#4ECDC4" }}>AI</span>
          </span>
          <span style={{ background: "linear-gradient(90deg, #6C63FF, #FF6B9D)", padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 800, color: "white", marginTop: 2, letterSpacing: "1px", textTransform: "uppercase" }}>
            Pro
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`}
                style={{ position: "relative" }}
              >
                <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                <span>{item.name}</span>
                {active && (
                  <motion.div layoutId="active-indicator"
                    style={{ position: "absolute", right: 10, width: 6, height: 6, borderRadius: "50%", background: "var(--brand-primary)" }}
                  />
                )}
              </Link>
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
            <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: user?.is_pro ? "linear-gradient(135deg, #8B5CF6, #D946EF)" : (user.role === "admin" ? "rgba(255,107,157,0.15)" : "rgba(67,233,123,0.15)"), color: user?.is_pro ? "white" : (user.role === "admin" ? "#FF6B9D" : "#43E97B"), fontWeight: 700 }}>
              {user.role === "admin" ? "Admin" : (user?.is_pro ? "PRO" : "Free")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
