"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const MODULES = [
  { id: "chat", title: "AI Learning Chat", desc: "Have a conversation with Tulasi AI to learn new concepts.", icon: "💬", link: "/dashboard/chat", color: "#6C63FF", span: 2 },
  { id: "pdf", title: "PDF Q&A", desc: "Upload textbooks and query them instantly.", icon: "📚", link: "/dashboard/pdf", color: "#FF6B6B", span: 1 },
  { id: "code", title: "Coding Arena", desc: "Practice Data Structures & Algorithms with AI feedback.", icon: "💻", link: "/dashboard/code", color: "#4ECDC4", span: 1 },
  { id: "interview", title: "Mock Interviews", desc: "Live chat with an AI Hiring Manager.", icon: "🎯", link: "/dashboard/interview", color: "#FFD93D", span: 2 },
  { id: "roadmaps", title: "Career Roadmaps", desc: "Generate week-by-week learning paths.", icon: "🗺️", link: "/dashboard/roadmaps", color: "#A78BFA", span: 1 },
  { id: "resume", title: "Resume Builder", desc: "Craft an ATS-friendly A4 resume on the fly.", icon: "📄", link: "/dashboard/resume", color: "#43E97B", span: 1 },
  { id: "startup", title: "Startup LAB", desc: "Ideate and generate full startup pitch decks.", icon: "🚀", link: "/dashboard/startup-lab", color: "#FF8E53", span: 1 },
  { id: "study", title: "Study Rooms", desc: "Join live Pomodoro focus sessions.", icon: "👥", link: "/dashboard/study-rooms", color: "#FF9A9E", span: 1 },
  { id: "hackathon", title: "Hackathons", desc: "Find global AI & Web3 competitions.", icon: "🏆", link: "/dashboard/hackathons", color: "#FFD200", span: 1 },
  { id: "certs", title: "Certificates", desc: "Download verified learning credentials.", icon: "🎓", link: "/dashboard/certificates", color: "#84FAB0", span: 2 },
];

export default function DashboardHome() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Student";
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ streak: 0, problems_solved: 0, videos_watched: 0, hackathons_joined: 0 });

  useEffect(() => {
    setMounted(true);
    const fetchStats = async () => {
      try {
        const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/auth/token`, { credentials: "include" });
        const { token } = await tokenRes.json().catch(() => ({ token: null }));
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/activity/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) { /* silent */ }
    };
    fetchStats();
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      
      {/* Welcome Banner */}
      <div style={{ padding: "48px 40px", borderRadius: 32, background: "linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(78,205,196,0.1) 100%)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 48, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -50, right: 200, width: 300, height: 300, background: "radial-gradient(circle, rgba(78,205,196,0.2) 0%, transparent 70%)" }} />
        
        <div style={{ position: "relative", zIndex: 1, maxWidth: 600 }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 12, lineHeight: 1.2 }}>
            Welcome back, <span className="gradient-text" style={{ background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{userName}</span> ⚡️
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.5 }}>
            Your central command center for learning, coding, and career preparation. What are we building today?
          </p>
          
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/dashboard/roadmaps" style={{ textDecoration: "none" }}>
              <button className="btn btn-primary" style={{ background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", border: "none", padding: "14px 28px", borderRadius: 12, fontSize: 16, fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                Continue Learning <span style={{ fontSize: 20 }}>→</span>
              </button>
            </Link>
            <Link href="/dashboard/code" style={{ textDecoration: "none" }}>
              <button className="btn btn-secondary" style={{ padding: "14px 28px", borderRadius: 12, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
                Coding Practice <span style={{ fontSize: 20 }}>💻</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Activity Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 48 }}>
        <Link href="/dashboard/streak" style={{ textDecoration: "none" }}>
          <motion.div whileHover={{ scale: 1.02 }} className="dash-card" style={{ padding: 24, border: "1px solid rgba(255,107,107,0.2)", background: "rgba(255,107,107,0.02)", height: "100%", cursor: "pointer" }}>
             <div style={{ fontSize: 24, marginBottom: 8 }}>🔥</div>
             <div style={{ fontSize: 32, fontWeight: 800, color: "white", marginBottom: 4 }}>{stats.streak} Days</div>
             <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 600 }}>Current Streak</div>
          </motion.div>
        </Link>
        <Link href="/dashboard/code" style={{ textDecoration: "none" }}>
          <motion.div whileHover={{ scale: 1.02 }} className="dash-card" style={{ padding: 24, border: "1px solid rgba(78,205,196,0.2)", background: "rgba(78,205,196,0.02)", height: "100%", cursor: "pointer" }}>
             <div style={{ fontSize: 24, marginBottom: 8 }}>💻</div>
             <div style={{ fontSize: 32, fontWeight: 800, color: "white", marginBottom: 4 }}>{stats.problems_solved}<span style={{ fontSize: 16, color: "var(--text-muted)", marginLeft: 4 }}>/100</span></div>
             <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 600 }}>Problems Solved</div>
          </motion.div>
        </Link>
        <Link href="/dashboard/youtube-learning" style={{ textDecoration: "none" }}>
          <motion.div whileHover={{ scale: 1.02 }} className="dash-card" style={{ padding: 24, border: "1px solid rgba(108,99,255,0.2)", background: "rgba(108,99,255,0.02)", height: "100%", cursor: "pointer" }}>
             <div style={{ fontSize: 24, marginBottom: 8 }}>▶️</div>
             <div style={{ fontSize: 32, fontWeight: 800, color: "white", marginBottom: 4 }}>{stats.videos_watched}</div>
             <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 600 }}>Videos Watched</div>
          </motion.div>
        </Link>
        <Link href="/dashboard/hackathons" style={{ textDecoration: "none" }}>
          <motion.div whileHover={{ scale: 1.02 }} className="dash-card" style={{ padding: 24, border: "1px solid rgba(255,217,61,0.2)", background: "rgba(255,217,61,0.02)", height: "100%", cursor: "pointer" }}>
             <div style={{ fontSize: 24, marginBottom: 8 }}>🏆</div>
             <div style={{ fontSize: 32, fontWeight: 800, color: "white", marginBottom: 4 }}>{stats.hackathons_joined}</div>
             <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 600 }}>Hackathons Joined</div>
          </motion.div>
        </Link>
      </div>

      {/* Grid Quick Access */}
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#6C63FF" }}>❖</span> Explore Modules
      </h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
        {MODULES.map((mod, i) => (
          <Link href={mod.link} key={mod.id} style={{ textDecoration: "none", gridColumn: mod.span > 1 ? "span 2" : "span 1" }}>
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="dash-card"
              style={{ padding: 32, height: "100%", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.1)", background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, right: 0, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "0 0 0 100%" }} />
              
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 24, border: "1px solid rgba(255,255,255,0.1)", position: "relative", zIndex: 1 }}>
                {mod.icon}
              </div>
              
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 12, position: "relative", zIndex: 1 }}>{mod.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, position: "relative", zIndex: 1, paddingBottom: 32 }}>{mod.desc}</p>
              
              <div style={{ marginTop: "auto", position: "absolute", bottom: 32, left: 32, zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: mod.color, fontSize: 14, fontWeight: 700 }}>
                  Launch App <span>→</span>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

    </div>
  );
}
