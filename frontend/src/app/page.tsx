"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { TulasiLogo } from "@/components/TulasiLogo";

// ── Feature data ──────────────────────────────────────────────────
const features = [
  { icon: "🤖", title: "AI RAG Chatbot", desc: "Context-aware AI tutor with memory. Ask anything — coding, career, concepts.", color: "#6C63FF" },
  { icon: "📄", title: "PDF Intelligence", desc: "Upload any PDF. Extract insights, summaries, and answers with AI.", color: "#4ECDC4" },
  { icon: "🎯", title: "Mock Interviews", desc: "AI conducts real interviews, evaluates your answers, and gives detailed feedback.", color: "#FF6B9D" },
  { icon: "🗺️", title: "Learning Roadmaps", desc: "Role-based paths for AI Engineer, Web Dev, Data Science, and more.", color: "#43E97B" },
  { icon: "💻", title: "Coding Practice Hub", desc: "Curated resources from LeetCode, HackerRank, Codeforces. Track progress.", color: "#FFD93D" },
  { icon: "📜", title: "Certificate System", desc: "Upload your certs or earn Tulasi AI certificates by hitting milestones.", color: "#6C63FF" },
  { icon: "🏆", title: "Hackathon Hub", desc: "Discover 20+ handpicked hackathons — from SIH to GSoC to MLH.", color: "#4ECDC4" },
  { icon: "👥", title: "Group Study Rooms", desc: "Realtime collaborative study sessions with live chat and shared resources.", color: "#FF6B9D" },
];

const roadmaps = [
  { icon: "🤖", title: "AI Engineer", color: "#6C63FF" },
  { icon: "🌐", title: "Web Developer", color: "#4ECDC4" },
  { icon: "📊", title: "Data Scientist", color: "#FF6B9D" },
  { icon: "🏆", title: "Competitive Programmer", color: "#43E97B" },
];

const testimonials = [
  { name: "Priya S.", college: "IIT Bombay", text: "Tulasi AI helped me crack my front-end internship at Microsoft. The mock interviews are incredible!", avatar: "P" },
  { name: "Arjun K.", college: "NIT Trichy", text: "The AI chatbot explains concepts better than my professors! And it's completely free.", avatar: "A" },
  { name: "Meera R.", college: "BITS Pilani", text: "I went from 0 to 1500 on LeetCode using the Competitive Programming roadmap. Life-changing.", avatar: "M" },
];

const stats = [
  { value: "100%", label: "Free for Students" },
  { value: "50K+", label: "Active Learners" },
  { value: "4.9★", label: "User Rating" },
  { value: "20+", label: "Hackathons Listed" },
];

// ── Logo component ───────────────────────────────────────────────
function TulasILogo({ size = 40 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.25 }}>
      <div style={{ position: "relative" }}>
        <TulasiLogo size={size * 1.5} style={{ filter: "drop-shadow(0 4px 12px rgba(78,205,196,0.3))" }} />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          style={{ position: "absolute", inset: "-20%", background: "radial-gradient(circle, rgba(108,99,255,0.4) 0%, transparent 70%)", zIndex: -1 }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 800, fontSize: size * 0.55, color: "white", letterSpacing: "-0.5px", lineHeight: 1 }}>
          Tulasi<span style={{ color: "#4ECDC4" }}>AI</span>
        </span>
        <span style={{ background: "linear-gradient(90deg, #6C63FF, #FF6B9D)", padding: "2px 6px", borderRadius: 4, fontSize: size * 0.22, fontWeight: 800, color: "white", marginTop: 2, letterSpacing: "1px", textTransform: "uppercase" }}>
          Pro
        </span>
      </div>
    </div>
  );
}

// ── Navbar ───────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(6,6,15,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        padding: "0 40px", height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: 1400, margin: "0 auto",
        transition: "all 0.4s ease",
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <TulasILogo size={40} />
      </Link>

      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {["Features", "Roadmaps", "Hackathons", "Pricing"].map(l => (
          <button key={l} style={{
            background: "transparent", border: "none", color: "rgba(255,255,255,0.55)",
            fontSize: 14, fontWeight: 500, padding: "8px 16px", cursor: "pointer",
            borderRadius: 8, transition: "color 0.2s", fontFamily: "var(--font-sans)",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "white"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
          >{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/auth" style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
          Sign In
        </Link>
        <Link href="/auth" className="btn-primary" style={{ padding: "10px 22px", fontSize: 14, borderRadius: 12 }}>
          Start Free →
        </Link>
      </div>
    </motion.nav>
  );
}

// ── Hero section ─────────────────────────────────────────────────
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const op = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "120px 24px 80px" }}>
      <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.6 }} />
      <div className="orb orb-purple" style={{ width: 700, height: 700, top: -150, left: "-5%", opacity: 0.35 }} />
      <div className="orb orb-teal" style={{ width: 500, height: 500, bottom: -100, right: "-5%", opacity: 0.25, animationDelay: "4s" }} />
      <div className="orb orb-pink" style={{ width: 300, height: 300, top: "40%", right: "15%", opacity: 0.15, animationDelay: "8s" }} />

      <motion.div style={{ y, opacity: op, position: "relative", zIndex: 1, textAlign: "center", maxWidth: 960 }}>

        {/* Free badge */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, type: "spring" }}>
          <span className="badge badge-green" style={{ marginBottom: 28, display: "inline-flex", padding: "8px 20px", fontSize: 13 }}>
            🎓 100% FREE for Students — No Credit Card Required
          </span>
        </motion.div>

        {/* Logo in hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
          style={{ width: 88, height: 88, margin: "0 auto", marginBottom: 32, borderRadius: 24, padding: 8, background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))", boxShadow: "0 0 40px rgba(108,99,255,0.2), inset 0 0 0 1px rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          
          <div style={{ position: "absolute", inset: -20, background: "radial-gradient(circle, rgba(78,205,196,0.3) 0%, transparent 70%)", zIndex: -1, filter: "blur(20px)", borderRadius: "50%" }} />
          <TulasiLogo size={80} style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }} />
        </motion.div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.8, type: "spring" }}
          style={{ fontSize: "clamp(42px, 8vw, 88px)", fontWeight: 900, fontFamily: "var(--font-outfit)", lineHeight: 1.04, marginBottom: 28, letterSpacing: "-3px", color: "white" }}
        >
          Free AI Learning<br />
          <motion.span
            animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ background: "linear-gradient(90deg, #6C63FF, #FF6B9D, #4ECDC4, #43E97B, #6C63FF)", backgroundSize: "300% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
          >
            Platform for Students
          </motion.span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", maxWidth: 640, margin: "0 auto 52px", lineHeight: 1.7, fontWeight: 400 }}
        >
          Your AI-powered educational companion. Chat with AI tutors, practice coding, ace interviews, and build your career — all at <strong style={{ color: "white" }}>zero cost</strong>.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}
        >
          <Link href="/auth">
            <motion.button whileHover={{ scale: 1.05, boxShadow: "0 24px 64px rgba(108,99,255,0.55)" }} whileTap={{ scale: 0.97 }}
              className="btn-primary" style={{ padding: "18px 44px", fontSize: 17, borderRadius: 16 }}>
              Start Learning Free 🚀
            </motion.button>
          </Link>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="btn-ghost" style={{ padding: "18px 36px", fontSize: 17, borderRadius: 16 }}>
            ▶ Watch Demo
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
          style={{ display: "flex", gap: 56, justifyContent: "center", flexWrap: "wrap" }}
        >
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 34, fontWeight: 900, fontFamily: "var(--font-outfit)", background: "linear-gradient(135deg,#6C63FF,#4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Dashboard Preview */}
      <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 1 }}
        className="float-anim"
        style={{ marginTop: 80, width: "100%", maxWidth: 1000, borderRadius: 24, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(17,17,40,0.85)", backdropFilter: "blur(20px)", boxShadow: "0 40px 120px rgba(108,99,255,0.22)", position: "relative", zIndex: 1 }}
      >
        <div style={{ padding: "16px 20px 0", display: "flex", gap: 6, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}
          <div style={{ flex: 1, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 2 }}>tulasi.ai/dashboard</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", height: 340 }}>
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
            {[{ icon: "🤖", label: "AI Chat", active: true }, { icon: "📄", label: "PDF Q&A" }, { icon: "💻", label: "Code Practice" }, { icon: "🎯", label: "Mock Interview" }, { icon: "🗺️", label: "Roadmaps" }, { icon: "🏆", label: "Hackathons" }].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: item.active ? "rgba(108,99,255,0.2)" : "transparent", border: item.active ? "1px solid rgba(108,99,255,0.3)" : "1px solid transparent", color: item.active ? "#9B95FF" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500 }}>
                <span>{item.icon}</span>{item.label}
              </div>
            ))}
          </div>
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6C63FF,#4ECDC4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>🤖</div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px 16px 16px 16px", padding: "12px 16px", fontSize: 13, color: "rgba(255,255,255,0.8)", flex: 1, lineHeight: 1.6 }}>
                👋 Hello! I&apos;m Tulasi AI — your personal learning assistant. I can help you with programming, algorithms, interview prep, and career guidance. What would you like to learn today?
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ background: "linear-gradient(135deg,#6C63FF,#4ECDC4)", padding: "12px 16px", borderRadius: "16px 16px 4px 16px", fontSize: 13, color: "white", maxWidth: "70%" }}>
                Can you explain how to implement a binary search tree in Python?
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6C63FF,#4ECDC4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>🤖</div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px 16px 16px 16px", padding: "12px 16px", fontSize: 13, color: "rgba(255,255,255,0.8)", flex: 1, lineHeight: 1.6 }}>
                Great choice! A BST is a tree where each node has at most 2 children. Left child &lt; parent &lt; right child. Here&apos;s a Python implementation...
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────
function Features() {
  return (
    <section id="features" style={{ padding: "120px 24px", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 72 }}>
          <span className="badge badge-primary" style={{ marginBottom: 20, display: "inline-flex", padding: "8px 20px" }}>🚀 Platform Features</span>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-1.5px", marginBottom: 20 }}>
            Everything a student needs to <span className="gradient-text">excel</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 560, margin: "0 auto" }}>
            A complete AI-powered learning ecosystem. Completely free. No credit card. No limits.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="dash-card"
              style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${f.color}, transparent)` }} />
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}22`, border: `1px solid ${f.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 18 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "white" }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Roadmaps preview ─────────────────────────────────────────────
function RoadmapsSection() {
  return (
    <section style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ background: "var(--gradient-card)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: 32, padding: "60px 48px", position: "relative", overflow: "hidden" }}>
          <div className="orb orb-purple" style={{ width: 400, height: 400, top: -100, right: -100, opacity: 0.15 }} />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 52 }}>
            <span className="badge badge-teal" style={{ marginBottom: 20, display: "inline-flex", padding: "8px 20px" }}>🗺️ Learning Roadmaps</span>
            <h2 style={{ fontSize: "clamp(29px, 4vw, 48px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-1px" }}>
              Structured paths to your <span className="gradient-text">dream job</span>
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20, position: "relative" }}>
            {roadmaps.map((r, i) => (
              <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.04, y: -6 }}
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${r.color}30`, borderRadius: 20, padding: 28, cursor: "pointer", textAlign: "center" }}
              >
                <div style={{ fontSize: 48, marginBottom: 14 }}>{r.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: r.color }}>{r.title}</div>
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/auth" className="btn-primary" style={{ padding: "14px 36px", fontSize: 15, display: "inline-flex" }}>
              Explore Roadmaps →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Social proof ─────────────────────────────────────────────────
function Testimonials() {
  return (
    <section style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-1px", marginBottom: 16 }}>
            Students love <span className="gradient-text">Tulasi AI</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 17 }}>Real stories from real students across India.</p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className="glass-card" style={{ padding: 32 }}
            >
              <div style={{ fontSize: 24, color: "#FFD93D", marginBottom: 16 }}>★★★★★</div>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>&ldquo;{t.text}&rdquo;</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "white" }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.college}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ──────────────────────────────────────────────────────────
function CTA() {
  return (
    <section style={{ padding: "140px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="orb orb-purple" style={{ width: 900, height: 900, top: "50%", left: "50%", marginTop: -450, marginLeft: -450, opacity: 0.12, filter: "blur(120px)" }} />
      <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
        style={{ maxWidth: 820, margin: "0 auto", background: "linear-gradient(180deg, rgba(17,17,40,0.9) 0%, rgba(6,6,15,0.95) 100%)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 40, padding: "80px 48px", position: "relative", boxShadow: "0 40px 100px rgba(108,99,255,0.2), inset 0 1px 0 rgba(255,255,255,0.08)" }}
      >
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 88, height: 88, borderRadius: 24, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, margin: "0 auto 36px", boxShadow: "0 20px 60px rgba(108,99,255,0.5)" }}
        >🚀</motion.div>
        <h2 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 24, lineHeight: 1.1, letterSpacing: "-1.5px" }}>
          Start your learning<br /><span className="gradient-text-brand">journey today — free</span>
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 18, marginBottom: 48, maxWidth: 540, margin: "0 auto 48px", lineHeight: 1.65 }}>
          Join 50,000+ students using Tulasi AI to learn faster and land their dream jobs. Always free for students.
        </p>
        <Link href="/auth">
          <motion.button whileHover={{ scale: 1.06, boxShadow: "0 24px 64px rgba(108,99,255,0.6)" }} whileTap={{ scale: 0.97 }}
            className="btn-primary" style={{ padding: "20px 56px", fontSize: 18, borderRadius: 18 }}>
            Join Tulasi AI — It&apos;s Free →
          </motion.button>
        </Link>
        <div style={{ marginTop: 24, color: "var(--text-muted)", fontSize: 13 }}>No credit card · No signup limits · Free forever for students</div>
      </motion.div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "48px 40px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
        <TulasILogo size={36} />
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          {[{ label: "Docs", href: "#" }, { label: "API", href: "#" }, { label: "Privacy", href: "#" }, { label: "Terms", href: "#" }, { label: "Contact", href: "#" }].map(l => (
            <a key={l.label} href={l.href} style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = "white"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
            >{l.label}</a>
          ))}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>© 2026 Tulasi AI · Built for Students</div>
      </div>
    </footer>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <Features />
      <RoadmapsSection />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
