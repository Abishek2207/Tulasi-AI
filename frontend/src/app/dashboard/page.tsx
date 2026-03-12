"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const MODULES = [
  { id: "chat", title: "AI Learning Chat", desc: "Have a conversation with Tulasi AI to learn new concepts.", icon: "💬", link: "/dashboard/chat", color: "#7C3AED", span: 2 },
  { id: "pdf", title: "PDF Q&A", desc: "Upload textbooks and query them instantly.", icon: "📚", link: "/dashboard/pdf", color: "#F43F5E", span: 1 },
  { id: "code", title: "Coding Arena", desc: "Practice Data Structures & Algorithms with AI feedback.", icon: "💻", link: "/dashboard/code", color: "#06B6D4", span: 1 },
  { id: "interview", title: "Mock Interviews", desc: "Live chat with an AI Hiring Manager.", icon: "🎯", link: "/dashboard/interview", color: "#FBBF24", span: 2 },
  { id: "roadmaps", title: "Career Roadmaps", desc: "Generate week-by-week learning paths.", icon: "🗺️", link: "/dashboard/roadmaps", color: "#8B5CF6", span: 1 },
  { id: "resume", title: "Resume Builder", desc: "Craft an ATS-friendly A4 resume on the fly.", icon: "📄", link: "/dashboard/resume", color: "#10B981", span: 1 },
  { id: "startup", title: "Startup LAB", desc: "Ideate and generate full startup pitch decks.", icon: "🚀", link: "/dashboard/startup-lab", color: "#F97316", span: 1 },
  { id: "study", title: "Study Rooms", desc: "Join live Pomodoro focus sessions.", icon: "👥", link: "/dashboard/study-rooms", color: "#EC4899", span: 1 },
  { id: "hackathon", title: "Hackathons", desc: "Find global AI & Web3 competitions.", icon: "🏆", link: "/dashboard/hackathons", color: "#EAB308", span: 1 },
  { id: "certs", title: "Certificates", desc: "Download verified learning credentials.", icon: "🎓", link: "/dashboard/certificates", color: "#34D399", span: 2 },
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
        const token = (session?.user as any)?.accessToken;
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000"}/api/activity/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) { /* silent */ }
    };
    fetchStats();
  }, [session]);

  if (!mounted) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container} style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      
      {/* Welcome Banner */}
      <motion.div variants={item} className="glass-card" style={{ padding: "54px 48px", borderRadius: 32, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 48, position: "relative", overflow: "hidden", background: "rgba(124,58,237,0.04)" }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 450, height: 450, background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -80, left: 100, width: 350, height: 350, background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)" }} />
        
        <div style={{ position: "relative", zIndex: 1, maxWidth: 650 }}>
          <h1 style={{ fontSize: 44, fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: 16, lineHeight: 1.15, letterSpacing: "-1px" }}>
            Welcome back, <span className="gradient-text">{userName}</span> ⚡️
          </h1>
          <p style={{ fontSize: 19, color: "var(--text-secondary)", marginBottom: 36, lineHeight: 1.6, fontWeight: 450 }}>
            Your central command center for learning, coding, and career preparation. What masterpiece are we building today?
          </p>
          
          <div style={{ display: "flex", gap: 18 }}>
            <Link href="/dashboard/roadmaps" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="btn-primary" style={{ padding: "16px 32px", fontSize: 16, borderRadius: 16 }}>
                Continue My Journey <span style={{ fontSize: 20 }}>→</span>
              </motion.button>
            </Link>
            <Link href="/dashboard/code" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.05, y: -2, background: "rgba(255,255,255,0.08)" }} whileTap={{ scale: 0.95 }} className="btn-ghost" style={{ padding: "16px 32px", borderRadius: 16, fontSize: 16 }}>
                Algorithm Arena <span style={{ fontSize: 20 }}>💻</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Activity Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginBottom: 54 }}>
        {[
          { icon: "🔥", val: `${stats.streak} Days`, label: "Current Streak", link: "/dashboard/streak", border: "rgba(244,63,94,0.2)" },
          { icon: "💻", val: `${stats.problems_solved}/100`, label: "Problems Solved", link: "/dashboard/code", border: "rgba(6,182,212,0.2)" },
          { icon: "▶️", val: stats.videos_watched, label: "Videos Watched", link: "/dashboard/youtube-learning", border: "rgba(124,58,237,0.2)" },
          { icon: "🏆", val: stats.hackathons_joined, label: "Competitions", link: "/dashboard/hackathons", border: "rgba(251,191,36,0.2)" }
        ].map((stat, i) => (
          <motion.div key={i} variants={item} whileHover={{ y: -6, scale: 1.02 }} className="glass-card" style={{ padding: 28, borderColor: stat.border, background: "rgba(255,255,255,0.02)", height: "100%", cursor: "pointer" }}>
             <Link href={stat.link} style={{ textDecoration: "none" }}>
               <div style={{ fontSize: 28, marginBottom: 12 }}>{stat.icon}</div>
               <div style={{ fontSize: 34, fontWeight: 900, color: "white", marginBottom: 6, fontFamily: "var(--font-display)" }}>{stat.val}</div>
               <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{stat.label}</div>
             </Link>
          </motion.div>
        ))}
      </div>

      {/* Grid Quick Access */}
      <motion.h2 variants={item} style={{ fontSize: 28, fontWeight: 800, marginBottom: 32, display: "flex", alignItems: "center", gap: 14, fontFamily: "var(--font-display)" }}>
        <span style={{ color: "var(--brand-primary)", fontSize: 32 }}>❖</span> Explore Learning Modules
      </motion.h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 28 }}>
        {MODULES.map((mod, i) => (
          <motion.div 
            key={mod.id}
            variants={item}
            whileHover={{ y: -8, scale: 1.02 }}
            style={{ gridColumn: mod.span > 1 ? "span 2" : "span 1" }}
          >
            <Link href={mod.link} style={{ textDecoration: "none", height: "100%", display: "block" }}>
              <div 
                className="glass-card"
                style={{ padding: 36, height: "100%", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", position: "relative", overflow: "hidden" }}
              >
                <div style={{ position: "absolute", top: 0, right: 0, width: 180, height: 180, background: `radial-gradient(circle at top right, ${mod.color}15, transparent 70%)`, borderRadius: "0 0 0 100%" }} />
                
                <div style={{ width: 72, height: 72, borderRadius: 24, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 28, border: "1px solid rgba(255,255,255,0.08)", position: "relative", zIndex: 1, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>
                  {mod.icon}
                </div>
                
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "white", marginBottom: 14, position: "relative", zIndex: 1, fontFamily: "var(--font-display)" }}>{mod.title}</h3>
                <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, position: "relative", zIndex: 1, paddingBottom: 40, fontWeight: 400 }}>{mod.desc}</p>
                
                <div style={{ marginTop: "auto", position: "absolute", bottom: 36, left: 36, zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: mod.color, fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Launch Module <span>→</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

    </motion.div>
  );
}
