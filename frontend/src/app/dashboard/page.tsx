"use client";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

const STATS = [
    { label: "XP Points", value: "1,240", icon: "⚡", color: "#7c3aed", bg: "rgba(124,58,237,0.12)" },
    { label: "Day Streak", value: "7", icon: "🔥", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    { label: "Problems Solved", value: "48", icon: "✅", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    { label: "Interviews Done", value: "5", icon: "🎤", color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
];

const MODULES = [
    { href: "/chat", icon: "🤖", title: "AI RAG Chatbot", desc: "Upload PDFs, ask questions, get step-by-step AI answers with memory", color: "#7c3aed", tag: "Popular" },
    { href: "/coding", icon: "💻", title: "Coding Practice", desc: "Solve DSA, AI & Web problems in Monaco Editor with instant feedback", color: "#2563eb", tag: "LeetCode-style" },
    { href: "/interview", icon: "🎤", title: "Mock Interview", desc: "AI conducts technical interviews, scores your answers & gives feedback", color: "#ec4899", tag: "AI Powered" },
    { href: "/roadmap", icon: "🗺️", title: "Career Roadmap", desc: "Step-by-step guided paths for AI Engineer, Full Stack Dev & more", color: "#10b981", tag: "6 Roles" },
    { href: "/resume", icon: "📄", title: "Resume Builder", desc: "Build your resume with ATS score checker and PDF export", color: "#f59e0b", tag: "ATS Checker" },
    { href: "/notes", icon: "📝", title: "Notes (NotebookLM)", desc: "Markdown notes with AI summaries, flashcards and quiz generation", color: "#06b6d4", tag: "AI Notes" },
    { href: "/reels", icon: "📹", title: "Edu Reels", desc: "Short-form educational video feed with likes, saves and personalization", color: "#8b5cf6", tag: "New" },
    { href: "/group-study", icon: "👥", title: "Group Study", desc: "Create study batches, group chat via WebSocket, shared problem solving", color: "#ef4444", tag: "Live" },
    { href: "/certificates", icon: "🏆", title: "Certificates", desc: "Upload & tag your certificates, add skills directly to your resume", color: "#f59e0b", tag: "Portfolio" },
    { href: "/hackathons", icon: "🚀", title: "Hackathons & Internships", desc: "Track upcoming hackathons, internship listings with calendar integration", color: "#10b981", tag: "Tracker" },
    { href: "/ai-knowledge", icon: "🧠", title: "AI Knowledge Hub", desc: "Learn RAG, LLM, LangChain, LlamaIndex and vector databases in your language", color: "#3b82f6", tag: "Multilingual" },
];

const RECENT_ACTIVITY = [
    { icon: "✅", text: "Solved 'Two Sum' (Easy)", time: "2h ago", color: "#10b981" },
    { icon: "🤖", text: "Asked AI: 'Explain transformers'", time: "3h ago", color: "#7c3aed" },
    { icon: "🎤", text: "Mock Interview: Frontend Dev", time: "Yesterday", color: "#ec4899" },
    { icon: "📝", text: "Created note: 'BERT Architecture'", time: "2d ago", color: "#06b6d4" },
];

const LEADERBOARD = [
    { rank: 1, name: "Priya R.", xp: 3200, badge: "🥇" },
    { rank: 2, name: "Arun K.", xp: 2870, badge: "🥈" },
    { rank: 3, name: "Sneha M.", xp: 2540, badge: "🥉" },
    { rank: 4, name: "You", xp: 1240, badge: "⭐", isUser: true },
];

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ... (STATS, MODULES, etc. keep same)

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        fetchUser();
    }, []);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Student";

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                {/* Header */}
                <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                            Good Morning, <span className="gradient-text">{displayName}! 👋</span>
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                            {user ? "Welcome back to your personalized learning path." : "Ready to learn something amazing today? You have a 7-day streak!"}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn-primary" onClick={() => window.location.href = "/chat"}>
                            🤖 Ask TulasiAI
                        </button>
                        <Link href="/coding" style={{
                            padding: "10px 18px", borderRadius: 10, border: "1px solid var(--border)",
                            color: "var(--text-primary)", textDecoration: "none", fontSize: "0.9rem",
                            fontWeight: 600, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 6,
                        }}>💻 Practice</Link>
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
                    {STATS.map((s) => (
                        <div key={s.label} className="stat-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: s.bg, display: "flex", alignItems: "center",
                                justifyContent: "center", fontSize: "1.3rem", flexShrink: 0,
                            }}>{s.icon}</div>
                            <div>
                                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 28 }}>

                    {/* Modules Grid */}
                    <div>
                        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
                            🧩 All Features
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                            {MODULES.map((m) => (
                                <Link key={m.href} href={m.href} style={{ textDecoration: "none" }}>
                                    <div className="feature-card" style={{ borderTop: `2px solid ${m.color}22` }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                            <span style={{ fontSize: "1.6rem" }}>{m.icon}</span>
                                            <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>{m.tag}</span>
                                        </div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{m.title}</div>
                                        <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{m.desc}</div>
                                        <div style={{ marginTop: 12, fontSize: "0.75rem", color: m.color, fontWeight: 600 }}>Open →</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* Leaderboard */}
                        <div className="glass-card" style={{ padding: 20 }}>
                            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
                                🏆 Leaderboard
                            </h3>
                            {LEADERBOARD.map((u) => (
                                <div key={u.rank} style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "8px 10px", borderRadius: 8, marginBottom: 6,
                                    background: u.isUser ? "rgba(124,58,237,0.1)" : "transparent",
                                    border: u.isUser ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent",
                                }}>
                                    <span style={{ fontSize: "1rem" }}>{u.badge}</span>
                                    <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: u.isUser ? 700 : 500, color: u.isUser ? "#a78bfa" : "var(--text-primary)" }}>{u.name}</span>
                                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>{u.xp.toLocaleString()} XP</span>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div className="glass-card" style={{ padding: 20 }}>
                            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
                                ⚡ Recent Activity
                            </h3>
                            {RECENT_ACTIVITY.map((a, i) => (
                                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: 8, background: `${a.color}15`,
                                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", flexShrink: 0,
                                    }}>{a.icon}</div>
                                    <div>
                                        <div style={{ fontSize: "0.78rem", color: "var(--text-primary)", lineHeight: 1.4 }}>{a.text}</div>
                                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 2 }}>{a.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Daily goal */}
                        <div className="glass-card" style={{ padding: 20 }}>
                            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>🎯 Daily Goal</h3>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 12 }}>3/5 tasks completed today</p>
                            <div className="progress-bar" style={{ marginBottom: 10 }}>
                                <div className="progress-fill" style={{ width: "60%" }} />
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>2 more tasks to maintain your streak!</div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
