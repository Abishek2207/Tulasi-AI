"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Logo as TulasiLogo } from "@/components/Logo";
import {
  FileText, Target, Map, Code, Award, Trophy, Users,
  Sparkles, ArrowRight, Layout, BrainCircuit, HardDrive, Cpu, Menu, X,
  Phone, Mail, Instagram
} from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import { reviewsApi, ReviewItem } from "@/lib/api";

const Code2 = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"/>
  </svg>
);

// ── Feature Data ────────────────────────────────────────────────
const primaryFeatures = [
  { id: "ai-tutor", title: "Autonomous AI Tutor", desc: "Context-aware mastery. Tulasi AI doesn't just answer; it architects your understanding with deep pedagogical memory.", icon: BrainCircuit, color: "#10B981", span: 2, bg: "rgba(16,185,129,0.05)" },
  { id: "pdf-iq", title: "PDF Intelligence", desc: "Ingest textbooks and documentation. Query the source with zero-latency RAG.", icon: FileText, color: "#06B6D4", span: 1, bg: "rgba(6,182,212,0.05)" },
  { id: "mock-sim", title: "Simulation Engine", desc: "High-fidelity mock interviews tailored to MAANG standard.", icon: Target, color: "#F43F5E", span: 1, bg: "rgba(244,63,94,0.05)" },
  { id: "architect", title: "Career Architect", desc: "Dynamic roadmaps that evolve with your progress. From Hello World to Senior Architect.", icon: Map, color: "#8B5CF6", span: 2, bg: "rgba(139,92,246,0.05)" },
];

const secondaryFeatures = [
  { icon: Code, title: "Coding Arena", desc: "Real-time feedback on complex DS&A.", color: "#F59E0B" },
  { icon: Award, title: "Verified Credentials", desc: "Earn proof-of-knowledge certificates.", color: "#10B981" },
  { icon: Trophy, title: "Hackathon Nexus", desc: "The pulse of global competitions.", color: "#06B6D4" },
  { icon: Users, title: "Study Clusters", desc: "Collaborative focus with Pomodoro sync.", color: "#F43F5E" },
];

// ── Shared Branding Component ────────────────────────────────────
function BrandText({ size = 40 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.3 }}>
      <TulasiLogo size={size * 1.3} showText={false} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <motion.span
          style={{
            fontFamily: "var(--font-outfit)", fontWeight: 900, fontSize: size * 0.65,
            color: "white", letterSpacing: "-1.5px", lineHeight: 1,
            background: "linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.4) 50%, #fff 100%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          animate={{ backgroundPosition: ["100% 0", "-100% 0"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          Tulasi<span style={{ color: "var(--brand-primary)" }}>AI</span>
        </motion.span>
        <span style={{ fontSize: size * 0.22, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 2.5, textTransform: "uppercase", marginTop: 2 }}>Orbit v2</span>
      </div>
    </div>
  );
}

// ── Navbar ───────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", h);
      window.removeEventListener("resize", check);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const navLinks = ["Roadmaps", "Features", "Reviews"];

  return (
    <>
      <nav style={{
        position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 100,
        width: scrolled ? "min(95%, 1200px)" : "min(95%, 1280px)",
        background: scrolled ? "rgba(9,9,11,0.6)" : "transparent",
        backdropFilter: scrolled ? "blur(32px)" : "none",
        border: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        borderRadius: 24, padding: "0 16px", height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        boxSizing: "border-box",
      }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}><BrandText size={isMobile ? 24 : 28} /></Link>

        {!isMobile && (
          <>
            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              {navLinks.map(l => (
                <Link key={l} href={`#${l.toLowerCase()}`}
                  style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: 1, transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "white"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
                >{l}</Link>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Link href="/auth" style={{ color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none", padding: "8px 16px" }}>Login</Link>
              <Link href="/auth" className="btn-primary" style={{ padding: "10px 24px", fontSize: 13, borderRadius: 14, textDecoration: "none", fontWeight: 800 }}>CLAIM ACCESS</Link>
            </div>
          </>
        )}

        {isMobile && (
          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 12px", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
      </nav>

      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "fixed", top: 100, left: "50%", transform: "translateX(-50%)",
              zIndex: 99, width: "min(92%, 400px)",
              background: "rgba(9,9,11,0.95)", backdropFilter: "blur(32px)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20,
              padding: "24px 20px", display: "flex", flexDirection: "column", gap: 4,
            }}
          >
            {navLinks.map(l => (
              <Link key={l} href={`#${l.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                style={{ color: "var(--text-secondary)", fontSize: 16, fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: 1, padding: "14px 12px", borderRadius: 10, display: "block" }}
              >{l}</Link>
            ))}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
            <Link href="/auth" onClick={() => setMobileOpen(false)} style={{ color: "white", fontSize: 15, fontWeight: 700, textDecoration: "none", padding: "14px 12px", display: "block" }}>Login</Link>
            <Link href="/auth" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ padding: "14px 24px", fontSize: 14, borderRadius: 14, textDecoration: "none", fontWeight: 800, textAlign: "center", display: "block", marginTop: 4 }}>CLAIM ACCESS</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Hero Section ─────────────────────────────────────────────────
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} style={{ minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: "160px 20px 80px", overflow: "hidden", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
        <motion.div animate={{ x: [-20, 20, -20], y: [-20, 20, -20] }} transition={{ duration: 10, repeat: Infinity }}
          style={{ position: "absolute", top: "10%", left: "20%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <motion.div animate={{ x: [20, -20, 20], y: [20, -20, 20] }} transition={{ duration: 12, repeat: Infinity }}
          style={{ position: "absolute", bottom: "10%", right: "20%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <motion.div style={{ y, opacity, position: "relative", zIndex: 10, textAlign: "center", maxWidth: 1000, width: "100%" }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} style={{ marginBottom: 28 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 30, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2 }}>
            <Sparkles size={13} /> THE AUTONOMOUS CAREER ENGINE
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          style={{ fontSize: "clamp(42px, 9vw, 108px)", fontWeight: 900, fontFamily: "var(--font-outfit)", lineHeight: 0.95, letterSpacing: "-0.04em", marginBottom: 28, wordBreak: "break-word" }}>
          {["Architect", "Your", "Trajectory."].map((w, i) => (
            <motion.span key={i} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.2 + i * 0.1 }}
              style={{ display: "inline-block", marginRight: "0.2em" }} className={i === 2 ? "gradient-text" : ""}>{w}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          style={{ fontSize: "clamp(15px, 2.5vw, 20px)", color: "var(--text-secondary)", maxWidth: 720, margin: "0 auto 48px", lineHeight: 1.6, fontWeight: 500, padding: "0 4px" }}>
          Tulasi AI is the high-fidelity workspace for future engineers.
          Bridge the gap from theory to global offers with precision-engineered AI intelligence.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="hero-buttons" style={{ justifyContent: "center", marginBottom: 60 }}>
          <Link href="/auth" style={{ textDecoration: "none" }}>
            <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="btn-primary"
              style={{ padding: "18px 40px", fontSize: "clamp(15px, 2vw, 18px)", borderRadius: 16, fontWeight: 900, boxShadow: "0 12px 32px rgba(6,182,212,0.3)", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              INITIALIZE SESSION <ArrowRight size={18} />
            </motion.button>
          </Link>
          <motion.a href="#reviews" whileHover={{ scale: 1.02, y: -2 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "18px 32px", borderRadius: 16, textDecoration: "none", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-secondary)", fontWeight: 800, fontSize: "clamp(13px, 2vw, 15px)", boxSizing: "border-box" }}>
            See Reviews
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Floating icons — hidden on small screens to avoid overlap */}
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="hide-mobile" style={{ position: "absolute", left: "5%", top: "30%", opacity: 0.3 }}>
        <Cpu size={64} className="text-brand" />
      </motion.div>
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="hide-mobile" style={{ position: "absolute", right: "5%", top: "40%", opacity: 0.3 }}>
        <HardDrive size={64} style={{ color: "#7C3AED" }} />
      </motion.div>
    </section>
  );
}

// ── Bento Features ────────────────────────────────────────────────
function BentoFeatures() {
  return (
    <section id="features" style={{ padding: "80px 20px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-2px", marginBottom: 20 }}>
            Engineered for <span className="gradient-text">Elite Engineers.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "clamp(14px, 2vw, 18px)", maxWidth: 640, margin: "0 auto", padding: "0 8px" }}>
            Our mission is zero-to-one velocity. Every tool in the Tulasi ecosystem is optimized for deep mastery and professional transition.
          </p>
        </motion.div>

        {/* Primary Features — desktop: 3-col bento, mobile: single col */}
        <div className="bento-grid" style={{ marginBottom: 28 }}>
          {primaryFeatures.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`bento-item bento-span-${f.span}`}>
              <TiltCard intensity={5} style={{ height: "100%" }}>
                <div className="glass-card" style={{ padding: "clamp(24px, 4vw, 48px)", background: f.bg, border: `1px solid ${f.color}20`, height: "100%", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
                  <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: `radial-gradient(circle, ${f.color}10 0%, transparent 70%)`, filter: "blur(40px)" }} />
                  <f.icon size={40} color={f.color} style={{ marginBottom: 24 }} />
                  <h3 style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 900, marginBottom: 12, color: "white" }}>{f.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "clamp(13px, 1.5vw, 16px)", lineHeight: 1.6, maxWidth: 400 }}>{f.desc}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Secondary Features — auto-fill grid, wraps to 2 col on tablet, 1 col on mobile */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 20 }}>
          {secondaryFeatures.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="glass-card" style={{ padding: "clamp(20px, 3vw, 32px)", borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: f.color }}>
                  <f.icon size={22} />
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: "white" }}>{f.title}</h4>
                <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Role Selector ────────────────────────────────────────────────
function RoleSelector() {
  const roles = [
    { name: "Software Engineer", desc: "MAANG-level prep system.", icon: Code2, color: "#06B6D4" },
    { name: "Product Design", desc: "High-fidelity feedback loops.", icon: Layout, color: "#10B981" },
    { name: "ML Architect", desc: "Data-driven career paths.", icon: BrainCircuit, color: "#8B5CF6" },
  ];
  return (
    <div style={{ padding: "60px 20px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "center", gap: "clamp(20px, 4vw, 40px)", flexWrap: "wrap" }}>
        {roles.map(r => (
          <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <r.icon size={24} color={r.color} />
            <div>
              <div style={{ fontSize: "clamp(13px, 1.5vw, 16px)", fontWeight: 800 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Star Rating ──────────────────────────────────────────────────
function StarRating({ rating, interactive = false, onSet }: { rating: number; interactive?: boolean; onSet?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => interactive && onSet && onSet(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{ background: "none", border: "none", cursor: interactive ? "pointer" : "default", padding: "4px 2px", color: n <= (hover || rating) ? "#F59E0B" : "rgba(255,255,255,0.15)", fontSize: interactive ? 28 : 18, lineHeight: 1, minWidth: 32, minHeight: 32 }}
        >★</button>
      ))}
    </div>
  );
}

// ── Reviews Section ──────────────────────────────────────────────
function ReviewsSection() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "", review: "", rating: 0 });
  const [formError, setFormError] = useState("");
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Optionally fetch logged in user from localStorage if needed
    const stored = localStorage.getItem("token");
    if (stored) {
      try {
        const payload = JSON.parse(atob(stored.split(".")[1]));
        if (payload.sub) setUserName(payload.sub);
      } catch(e) {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    const finalName = userName || form.name.trim();
    if (!finalName) return setFormError("Name is required.");
    if (!form.review.trim()) return setFormError("Review is required.");
    if (form.rating === 0) return setFormError("Please select a star rating.");
    
    setSubmitting(true);
    try {
      const newReview = await reviewsApi.submitReview({
        name: finalName,
        email: form.email.trim() || undefined,
        role: form.role.trim() || undefined,
        review: form.review.trim(),
        rating: form.rating,
      });
      // We don't necessarily show the review publicly now as per instruction, 
      // but showing locally for feedback is okay.
      setForm({ name: "", email: "", role: "", review: "", rating: 0 });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err: any) {
      const msg = err.message || "Failed to submit. Please try again.";
      setFormError(msg);
      console.error("Submission Error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" style={{ padding: "80px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-2px", marginBottom: 20 }}>
            What Engineers <span className="gradient-text">Actually Say.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "clamp(14px, 2vw, 18px)", maxWidth: 560, margin: "0 auto" }}>
            Real feedback from real users. No fake testimonials, ever.
          </p>
        </motion.div>

        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "16px 0", fontSize: 16 }}>
          Reviews are actively moderated and reviewed by the administrative team.
        </div>

        {/* Write a Review Form */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="glass-card" style={{ maxWidth: 680, margin: "0 auto", padding: "clamp(24px, 5vw, 48px)", background: "rgba(255,255,255,0.02)", boxSizing: "border-box" }}>
            <h3 style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 900, marginBottom: 8, color: "white" }}>Write a Review</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28 }}>Your experience helps others make better decisions.</p>

            {submitted && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 14, padding: "14px 20px", marginBottom: 24, color: "#10B981", fontSize: 14, fontWeight: 700 }}>
                ✅ Thank you! Your review has been submitted.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Identity Row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Display Name *</label>
                  <input 
                    value={userName || form.name} 
                    onChange={e => !userName && setForm(f => ({ ...f, name: e.target.value }))}
                    readOnly={!!userName} 
                    placeholder="Your Name"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", color: userName ? "var(--text-muted)" : "white", fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" }} 
                  />
                  {userName && <span style={{ fontSize: 10, color: "var(--brand-primary)", fontWeight: 700 }}>Logged in</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Email Address (optional)</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" }} />
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Professional Role (optional)</label>
                <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Developer @ Meta"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Your Review *</label>
                <textarea value={form.review} onChange={e => setForm(f => ({ ...f, review: e.target.value }))} rows={4} placeholder="Share your experience with Tulasi AI..."
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 15, outline: "none", resize: "vertical", fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Rating *</label>
                <StarRating rating={form.rating} interactive onSet={r => setForm(f => ({ ...f, rating: r }))} />
              </div>

              {formError && <p style={{ color: "#F43F5E", fontSize: 13, fontWeight: 700, margin: 0 }}>{formError}</p>}

              <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary"
                style={{ padding: "16px 32px", borderRadius: 14, fontWeight: 900, fontSize: 15, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer", marginTop: 8 }}>
                {submitting ? "Submitting..." : `Submit Review →`}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "64px 20px 40px", background: "rgba(0,0,0,0.6)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* 3-col on desktop, stacks on mobile */}
        <div className="footer-grid" style={{ marginBottom: 48 }}>
          {/* LEFT: Logo + Tagline */}
          <div>
            <BrandText size={28} />
            <p style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 24, maxWidth: 340, lineHeight: 1.8 }}>
              Precision-engineered career intelligence for engineers.
            </p>
          </div>

          {/* CENTER: Product Links */}
          <div>
            <h4 style={{ color: "white", fontWeight: 900, marginBottom: 20, fontSize: 11, textTransform: "uppercase", letterSpacing: 2.5 }}>Product</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Roadmaps", href: "/dashboard/roadmap" },
                { label: "Career Chat", href: "/dashboard/chat" },
                { label: "Interviews", href: "/dashboard/interview" },
                { label: "Flashcards", href: "/dashboard/flashcards" },
              ].map(link => (
                <Link key={link.label} href={link.href}
                  style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "white"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                >{link.label}</Link>
              ))}
            </div>
          </div>

          {/* RIGHT: Contact & Status */}
          <div>
            <h4 style={{ color: "white", fontWeight: 900, marginBottom: 20, fontSize: 11, textTransform: "uppercase", letterSpacing: 2.5 }}>Contact & Status</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <a href="mailto:abishekramamoorthy22@gmail.com" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)", textDecoration: "none", fontSize: 14 }}>
                <Mail size={16} /> abishekramamoorthy22@gmail.com
              </a>
              <a href="tel:6369538345" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)", textDecoration: "none", fontSize: 14 }}>
                <Phone size={16} /> +91 63695 38345
              </a>
              <a href="https://www.instagram.com/_.abi22._/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)", textDecoration: "none", fontSize: 14 }}>
                <Instagram size={16} /> @_.abi22._
              </a>
            </div>
            
            <div style={{ padding: "20px 24px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981", flexShrink: 0 }}
                />
                <span style={{ fontSize: 11, fontWeight: 900, color: "#10B981", letterSpacing: 1, textTransform: "uppercase" }}>● ALL SYSTEMS OPERATIONAL</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["API", "Auth", "AI Engine", "Database"].map(s => (
                  <div key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s}</span>
                    <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700 }}>✓ Online</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>
            Founded &amp; Built by Abishek R • © 2026 Tulasi AI Labs
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main style={{ background: "#05070D", minHeight: "100vh", color: "white", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, opacity: 0.05, pointerEvents: "none", zIndex: 100, background: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEUAAAD///+l2Z/dAAAAAXRSTlMAQObYZgAAAAxJREFUCNdjYBgF6AAAAyAAAbe7v7sAAAAASUVORK5CYII=')" }} />
      <Navbar />
      <Hero />
      <RoleSelector />
      <BentoFeatures />
      <ReviewsSection />
      <Footer />
    </main>
  );
}
