"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const NAV_SECTIONS = [
    {
        label: "MAIN",
        items: [
            { href: "/dashboard", icon: "⊞", label: "Dashboard" },
            { href: "/chat", icon: "🤖", label: "AI Chatbot" },
        ],
    },
    {
        label: "LEARNING",
        items: [
            { href: "/coding", icon: "💻", label: "Coding Practice" },
            { href: "/interview", icon: "🎤", label: "Mock Interview" },
            { href: "/roadmap", icon: "🗺️", label: "Career Roadmap" },
            { href: "/notes", icon: "📝", label: "Notes" },
            { href: "/reels", icon: "📹", label: "Edu Reels" },
            { href: "/ai-knowledge", icon: "🧠", label: "AI Knowledge" },
        ],
    },
    {
        label: "CAREER",
        items: [
            { href: "/resume", icon: "📄", label: "Resume Builder" },
            { href: "/certificates", icon: "🏆", label: "Certificates" },
            { href: "/hackathons", icon: "🚀", label: "Hackathons" },
        ],
    },
    {
        label: "SOCIAL",
        items: [
            { href: "/group-study", icon: "👥", label: "Group Study" },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Guest Student";
    const initial = displayName[0]?.toUpperCase() || "G";

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid var(--border)" }}>
                <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: "rgba(255,255,255,0.03)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden", border: "1px solid var(--border)",
                    }}>
                        <img src="/logo.png" alt="TulasiAI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>TulasiAI</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: -1 }}>Edu Ecosystem</div>
                    </div>
                </Link>
            </div>

            {/* Streak bar */}
            <div style={{
                margin: "12px 12px",
                padding: "10px 14px",
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: 10,
                display: "flex", alignItems: "center", gap: 8,
            }}>
                <span style={{ fontSize: "1.3rem" }} className="animate-flame">🔥</span>
                <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fbbf24" }}>7 Day Streak!</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Keep it going</div>
                </div>
                <div style={{ marginLeft: "auto", fontWeight: 800, color: "#fbbf24", fontSize: "1.1rem" }}>7</div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "8px 10px" }}>
                {NAV_SECTIONS.map((section) => (
                    <div key={section.label} style={{ marginBottom: 16 }}>
                        <div style={{
                            fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)",
                            padding: "4px 8px 6px", letterSpacing: "0.08em",
                        }}>{section.label}</div>
                        {section.items.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <Link key={item.href} href={item.href} className={`nav-item ${isActive ? "active" : ""}`}>
                                    <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                    {isActive && <div style={{
                                        marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
                                        background: "var(--accent-purple)",
                                    }} />}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* User profile */}
            <div style={{
                padding: "12px 14px 14px",
                borderTop: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: 10,
            }}>
                <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "var(--gradient-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", fontWeight: 700, color: "white", flexShrink: 0,
                }}>{initial}</div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{user ? "Verified Account" : "Guest Mode"}</div>
                </div>
                {user ? (
                    <button onClick={() => supabase.auth.signOut()} style={{
                        marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-muted)",
                        background: "rgba(255,255,255,0.04)", padding: "4px 8px", borderRadius: 6,
                        border: "1px solid var(--border)", cursor: "pointer",
                    }}>Logout</button>
                ) : (
                    <Link href="/login" style={{
                        marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-muted)",
                        background: "rgba(255,255,255,0.04)", padding: "4px 8px", borderRadius: 6,
                        border: "1px solid var(--border)", cursor: "pointer", textDecoration: "none",
                    }}>Login</Link>
                )}
            </div>
        </aside>
    );
}
