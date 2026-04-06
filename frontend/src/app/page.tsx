"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TulasiLogo } from "@/components/TulasiLogo";
import {
  FileText, Target, Map, Code, Award, Trophy, Users,
  Sparkles, ArrowRight, Layout, BrainCircuit, Cpu, Menu, X,
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

const Zap = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 Z" />
  </svg>
);

const intelligencePillars = [
  { title: "ADAPTIVE SYNTHESIS", desc: "Complex career data parsed into actionable intuition.", icon: BrainCircuit, color: "#8B5CF6" },
  { title: "COGNITIVE MAPPING", desc: "Dynamic roadmaps that restructure in real-time.", icon: Map, color: "#06B6D4" },
  { title: "SIMULATION FIDELITY", desc: "Sub-millisecond feedback on MAANG-grade sims.", icon: Target, color: "#F43F5E" },
  { title: "GLOBAL NEXUS", desc: "Direct pipelines to frontier tech opportunities.", icon: Sparkles, color: "#10B981" },
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
        <span style={{ fontSize: size * 0.22, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 2.5, textTransform: "uppercase", marginTop: 2 }}>Orbit</span>
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
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  // 3D Dashboard Content Box
  const dashboardRotateX = useTransform(scrollYProgress, [0, 0.35], [45, 0]);
  const dashboardScale = useTransform(scrollYProgress, [0, 0.35], [0.85, 1]);
  const dashboardY = useTransform(scrollYProgress, [0, 0.4], [isMobile ? 100 : 250, 0]);
  const dashboardOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);

  return (
    <section ref={ref} style={{ height: "180vh", position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", perspective: 1200, perspectiveOrigin: "50% 0%" }}>
        
        {/* Deep Field Background Patterns */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
          <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.1 }} />
          <div className="bg-dot" style={{ position: "absolute", inset: 0, opacity: 0.15, transform: "scale(1.5)" }} />
          
          {/* Advanced Neural Background Nodes */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: -1 }}>
             {[...Array(20)].map((_, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1], x: Math.random() * 20 - 10, y: Math.random() * 20 - 10 }}
                 transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
                 style={{ 
                   position: "absolute", 
                   top: `${Math.random() * 60}%`, 
                   left: `${Math.random() * 100}%`,
                   width: 2, height: 2, 
                   background: "white", 
                   borderRadius: "50%",
                   boxShadow: "0 0 10px white"
                 }} 
               />
             ))}
          </div>

          {/* Technical Glows */}
          <div className="neural-pulse"
            style={{ position: "absolute", top: "-10%", left: "10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(138,92,246,0.15) 0%, transparent 70%)" }} />
          <div className="neural-pulse"
            style={{ position: "absolute", bottom: "0%", right: "5%", width: "45%", height: "45%", background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)", animationDelay: "2s" }} />
        </div>

        {/* Floating Title */}
        <motion.div style={{ y, opacity, position: "absolute", zIndex: 10, textAlign: "center", width: "100%", top: isMobile ? "12%" : "15%" }}>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            className="hero-title" style={{ fontSize: "clamp(48px, 9vw, 110px)", lineHeight: 0.9, letterSpacing: "-0.04em" }}>
            {["Architect", "Your", "Trajectory."].map((w, i) => (
              <motion.span key={i} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.2 + i * 0.1 }}
                style={{ display: isMobile ? "block" : "inline-block", marginRight: isMobile ? 0 : "0.2em" }} className={i === 2 ? "gradient-text" : ""}>{w}
              </motion.span>
            ))}
          </motion.h1>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
            style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", padding: "0 20px" }}>
            {["NEURAL CORE", "PROPRIETARY RAG", "QUANTUM ANALYSIS"].map((tag, i) => (
              <span key={tag} style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2, color: "var(--text-muted)", padding: "8px 16px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, background: "rgba(255,255,255,0.02)" }}>
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* 3D Dashboard Content Box */}
        <motion.div
           style={{
             rotateX: dashboardRotateX,
             scale: dashboardScale,
             y: dashboardY,
             opacity: dashboardOpacity,
             width: "min(95%, 1240px)",
             background: "rgba(9, 9, 11, 0.7)",
             backdropFilter: "blur(40px) saturate(220%)",
             border: "1px solid rgba(255,255,255,0.1)",
             borderRadius: 36,
             padding: "clamp(32px, 6vw, 80px)",
             position: "absolute",
             bottom: isMobile ? "5%" : "-10%",
             zIndex: 20,
             transformStyle: "preserve-3d",
             boxShadow: "0 -24px 120px rgba(0,0,0,0.95), inset 0 1px 2px rgba(255,255,255,0.1)",
             textAlign: "center",
             display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
           }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ marginBottom: 28, position: "relative" }}>
            <span className="animate-shimmer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 30, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#FFF", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2.5 }}>
              <Zap size={14} color="#0A84FF" /> TULASI AI INTELLIGENCE HUB
            </span>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontSize: "clamp(16px, 2.8vw, 22px)", color: "var(--text-secondary)", maxWidth: 780, margin: "0 auto 48px", lineHeight: 1.6, fontWeight: 500, padding: "0 4px" }}>
            Tulasi AI is the high-fidelity workspace for world-class engineers.
            Synthesize complexity into mastery with zero-latency career intelligence.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="hero-buttons" style={{ justifyContent: "center" }}>
            <Link href="/auth" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="btn-primary"
                style={{ padding: "20px 48px", fontSize: "clamp(16px, 2.2vw, 19px)", borderRadius: 18, fontWeight: 900, boxShadow: "0 20px 40px rgba(10, 132, 255, 0.2)", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, position: "relative", overflow: "hidden" }}>
                <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>INITIALIZE ACCESS <ArrowRight size={20} /></span>
                <div className="animate-shimmer" style={{ position: "absolute", inset: 0, opacity: 0.35 }} />
              </motion.button>
            </Link>
            <motion.a href="#reviews" className="animate-float" whileHover={{ scale: 1.02, y: -2 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "20px 40px", borderRadius: 18, textDecoration: "none", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "var(--text-primary)", fontWeight: 800, fontSize: "clamp(15px, 2vw, 17px)", boxSizing: "border-box" }}>
              Verified Reviews
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Floating background elements */}
        <div className="hide-mobile" style={{ position: "absolute", left: "8%", top: "35%", opacity: 0.4, zIndex: 5 }}>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity }} style={{ padding: "16px 24px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: "var(--brand-primary)", letterSpacing: 2 }}>ORBIT KNOWLEDGE GRAPH</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "white", marginTop: 4 }}>SYNCED</div>
          </motion.div>
        </div>
        <div className="hide-mobile" style={{ position: "absolute", right: "8%", top: "45%", opacity: 0.4, zIndex: 5 }}>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }} style={{ padding: "16px 24px", borderRadius: 16, background: "rgba(10,132,255,0.05)", border: "1px solid rgba(10,132,255,0.15)" }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: "#0A84FF", letterSpacing: 2 }}>USER TRAJECTORY DATA</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "white", marginTop: 4 }}>OPTIMIZED</div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

// ── Neural Engine Core (Consolidated High-Fidelity) ───
function NeuralEngineCore() {
  const steps = [
    { label: "ADAPTIVE SYNTHESIS", desc: "Tulasi parses your raw career data into actionable intuition instantly.", icon: Cpu, color: "#8B5CF6" },
    { label: "COGNITIVE MAPPING", desc: "Dynamic roadmaps that restructure based on your Tulasi skill profile.", icon: Target, color: "#06B6D4" },
    { label: "SIMULATION FIDELITY", desc: "Sub-millisecond feedback on MAANG-grade interviews in the Tulasi Lab.", icon: Code, color: "#F43F5E" },
    { label: "GLOBAL NEXUS", desc: "Direct pipelines connecting your verified Tulasi portfolio to frontier tech.", icon: Award, color: "#10B981" },
  ];
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto 80px", position: "relative", zIndex: 30, padding: "0 24px" }}>
      <div className="glass-card-premium" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 1, background: "rgba(255,255,255,0.04)", padding: 1, borderRadius: 24, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
        {steps.map((s, i) => (
          <motion.div key={s.label} 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 120, damping: 20 }}
            className="premium-glow" style={{ background: "rgba(9,9,11,0.85)", padding: "48px 32px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <s.icon size={28} color={s.color} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "white", letterSpacing: 2, marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, fontWeight: 500 }}>{s.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
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
            <motion.div key={f.id} 
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30, y: 20 }} 
              whileInView={{ opacity: 1, x: 0, y: 0 }} 
              viewport={{ once: true, margin: "-50px" }} 
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 15 }}
              className={`bento-item bento-span-${f.span}`}>
              <TiltCard intensity={5} style={{ height: "100%" }}>
                <div className="glass-card" style={{ padding: "clamp(24px, 4vw, 48px)", background: f.bg, border: `1px solid ${f.color}20`, height: "100%", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
                  <div className="animate-pulse-slow" style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: `radial-gradient(circle, ${f.color}10 0%, transparent 70%)`, filter: "blur(40px)" }} />
                  <f.icon size={40} color={f.color} style={{ marginBottom: 24 }} />
                  <h3 style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 900, marginBottom: 12, color: "white" }}>{f.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "clamp(13px, 1.5vw, 16px)", lineHeight: 1.6, maxWidth: 400 }}>{f.desc}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Secondary Features Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 24 }}>
          {secondaryFeatures.map((f, i) => (
            <motion.div key={f.title} 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 100, damping: 20 }}
              style={{ padding: "32px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", height: "100%", boxSizing: "border-box" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: "white" }}>
                <f.icon size={22} />
              </div>
              <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "white" }}>{f.title}</h4>
              <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.5 }}>{f.desc}</p>
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
    { name: "Software Engineer", desc: "Architecting high-scale systems and DS&A mastery.", icon: Code2, color: "#06B6D4" },
    { name: "Product Design", desc: "UX/UI strategy with high-fidelity simulation feedback.", icon: Layout, color: "#10B981" },
    { name: "ML Architect", desc: "Navigating the frontier of generative & predictive AI.", icon: BrainCircuit, color: "#8B5CF6" },
  ];
  return (
    <div style={{ padding: "80px 20px", background: "rgba(255,255,255,0.02)", position: "relative", overflow: "hidden" }}>
      <div className="bg-dot" style={{ position: "absolute", inset: 0, opacity: 0.1 }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: "var(--brand-primary)", letterSpacing: 3, marginBottom: 20, textTransform: "uppercase" }}>Specialized Intelligence</div>
        <div style={{ display: "flex", justifyContent: "center", gap: "clamp(24px, 5vw, 60px)", flexWrap: "wrap" }}>
          {roles.map(r => (
            <motion.div key={r.name} 
              whileHover={{ y: -8 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: 280, padding: "32px", borderRadius: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: `${r.color}15`, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${r.color}30` }}>
                <r.icon size={32} color={r.color} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "white", marginBottom: 6 }}>{r.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
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
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [fetchingReviews, setFetchingReviews] = useState(true);
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

    const loadReviews = async () => {
      try {
        const data = await reviewsApi.getReviews();
        setReviews(data || []);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setFetchingReviews(false);
      }
    };
    loadReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    const finalName = userName || form.name.trim();
    if (!finalName) return setFormError("Name is required.");
    if (!form.review.trim() || form.review.trim().length < 10) return setFormError("Review must be at least 10 characters long.");
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
      // Optimistically add the new review to the UI
      setReviews(prev => [newReview, ...prev].slice(0, 10));
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

        {/* Dynamic Reviews Display */}
        <div style={{ marginBottom: 64 }}>
          {fetchingReviews ? <div>Loading...</div> : reviews.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
              {reviews.map((r, i) => (
                <motion.div key={r.id || i}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 80, damping: 15 }}
                >
                  <TiltCard intensity={3} style={{ height: "100%" }}>
                    <div style={{ padding: 32, borderRadius: 32, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", height: "100%", display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div><h4 style={{ fontWeight: 800, fontSize: 18, color: "white" }}>{r.name}</h4>{r.role && <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{r.role}</span>}</div>
                        <StarRating rating={r.rating} />
                      </div>
                      <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6, flex: 1, fontStyle: "italic" }}>"{r.review}"</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "64px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px dashed rgba(255,255,255,0.1)" }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>No reviews yet</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 15 }}>Be the first to share your experience with Tulasi AI!</p>
            </div>
          )}
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

// ── CTA Section ──────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ padding: "120px 20px", position: "relative" }}>
       {/* Background Decoration */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
        <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.1 }} />
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 300, height: 300, background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 300, height: 300, background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)" }} />
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative" }}>
        <div className="neural-pulse" style={{ position: "absolute", inset: -100, background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)", zIndex: 0 }} />
        <div className="glass-card-premium" style={{ 
          padding: "clamp(48px, 10vw, 100px)", 
          textAlign: "center", 
          background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", 
          borderRadius: 56, 
          border: "1px solid rgba(255,255,255,0.1)", 
          position: "relative", 
          zIndex: 1, 
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6)"
        }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: "var(--brand-primary)", letterSpacing: 4, marginBottom: 24, textTransform: "uppercase" }}>A New Standard</div>
            <h2 style={{ fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 900, marginBottom: 28, letterSpacing: "-0.04em", lineHeight: 1.1 }}>Ready to transform your <span className="gradient-text">Trajectory?</span></h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "clamp(18px, 2.5vw, 22px)", maxWidth: 700, margin: "0 auto 56px", lineHeight: 1.6, fontWeight: 500 }}>
              Join the elite ecosystem of engineers operating at the frontier. Your personalized career engine is ready for initialization.
            </p>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth" style={{ textDecoration: "none" }}>
                <motion.button whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }} className="btn-primary" 
                  style={{ padding: "22px 56px", borderRadius: 22, fontSize: 18, fontWeight: 900, boxShadow: "0 25px 50px rgba(139,92,246,0.3)" }}>
                  GET LIFETIME ACCESS
                </motion.button>
              </Link>
              <Link href="/contact" style={{ textDecoration: "none" }}>
                <motion.button whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }} className="btn-ghost" 
                  style={{ padding: "22px 48px", borderRadius: 22, fontSize: 18, fontWeight: 900, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)" }}>
                  Talk to an Expert
                </motion.button>
              </Link>
            </div>
          </motion.div>
          <div className="animate-shimmer" style={{ position: "absolute", inset: 0, opacity: 0.1, pointerEvents: "none" }} />
        </div>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "100px 20px 60px", background: "rgba(0,0,0,0.8)", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="footer-grid" style={{ marginBottom: 80 }}>
          {/* LEFT: Logo + Tagline */}
          <div>
            <BrandText size={32} />
            <p style={{ color: "var(--text-secondary)", fontSize: 16, marginTop: 28, maxWidth: 360, lineHeight: 1.8 }}>
              Tulasi AI is an autonomous intelligence platform meticulously designed to close the gap between theoretical knowledge and global professional offers.
            </p>
            <div style={{ display: "flex", gap: 20, marginTop: 32 }}>
              {[
                { Icon: Instagram, href: "https://instagram.com/_.abi22._" },
                { Icon: Mail, href: "mailto:abishekramamoorthy22@gmail.com" },
                { Icon: Users, href: "https://github.com/Abishek2207" }
              ].map(({ Icon, href }, i) => (
                <motion.a key={i} whileHover={{ y: -4, color: "white" }} href={href} target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", transition: "color 0.2s" }}><Icon size={24} /></motion.a>
              ))}
            </div>
          </div>

          {/* CENTER: Product Links */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            <div>
              <h4 style={{ color: "white", fontWeight: 900, marginBottom: 24, fontSize: 12, textTransform: "uppercase", letterSpacing: 2.5 }}>Ecosystem</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { name: "Neural Roadmaps", href: "#roadmaps" },
                  { name: "Interview Lab", href: "/auth" },
                  { name: "Project Nexus", href: "/auth" },
                  { name: "DS&A Arena", href: "/auth" },
                  { name: "Knowledge Base", href: "/blog" }
                ].map(l => (
                  <Link key={l.name} href={l.href} style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 14, fontWeight: 600, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>{l.name}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: "white", fontWeight: 900, marginBottom: 24, fontSize: 12, textTransform: "uppercase", letterSpacing: 2.5 }}>Resources</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { name: "Documentation", href: "/about" },
                  { name: "API Status", href: "https://tulasi-ai-hycl.onrender.com/api" },
                  { name: "Changelog", href: "/blog" },
                  { name: "Community", href: "https://instagram.com/_.abi22._" },
                  { name: "Support", href: "/contact" }
                ].map(l => (
                  <Link key={l.name} href={l.href} style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 14, fontWeight: 600, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>{l.name}</Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Contact & Links */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
            <h4 style={{ color: "white", fontWeight: 900, marginBottom: 24, fontSize: 12, textTransform: "uppercase", letterSpacing: 2.5 }}>Secure Session</h4>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: 24, borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", width: "100%", maxWidth: 300 }}>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16, textAlign: "left" }}>Receive occasional intelligence updates from our founder.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input placeholder="Email" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 12px", color: "white", fontSize: 13, flex: 1, outline: "none" }} />
                <button style={{ background: "white", border: "none", borderRadius: 10, padding: "0 14px", color: "black", fontWeight: 900, fontSize: 12, cursor: "pointer" }}>JOIN</button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 10px #10B981" }} />
            <span style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 800, letterSpacing: 0.5 }}>TULASI ENGINE v3.1.2 — ALL SYSTEMS STABLE</span>
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 600, textAlign: "center" }}>
             Built with Precision by Abishek R • © 2026 Tulasi AI Labs. Zero-Knowledge Infrastructure Enabled.
          </span>
          <div style={{ display: "flex", gap: 32 }}>
             <Link href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13, fontWeight: 700, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>Privacy Policy</Link>
             <Link href="/terms" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13, fontWeight: 700, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>Terms of Service</Link>
             <Link href="/security" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13, fontWeight: 700, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>Security Architecture</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, opacity: 0.05, pointerEvents: "none", zIndex: 100, background: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEUAAAD///+l2Z/dAAAAAXRSTlMAQObYZgAAAAxJREFUCNdjYBgF6AAAAyAAAbe7v7sAAAAASUVORK5CYII=')" }} />
      <Navbar />
      <Hero />
      <NeuralEngineCore />
      <RoleSelector />
      <BentoFeatures />
      <ReviewsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
