"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TulasiLogo } from "@/components/TulasiLogo";
import {
  FileText, Target, Map, Code, Award, Trophy, Users,
  Sparkles, ArrowRight, Layout, BrainCircuit, Cpu, Menu, X,
  Phone, Mail
} from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import { reviewsApi, ReviewItem } from "@/lib/api";
import { throttle, debounce } from "@/lib/utils";
import dynamic from "next/dynamic";

const NeuralEngineCore = dynamic(() => import("@/components/home/HomeSections").then(m => m.NeuralEngineCore), { ssr: true });
const BentoFeatures = dynamic(() => import("@/components/home/HomeSections").then(m => m.BentoFeatures), { ssr: true });
const RoleSelector = dynamic(() => import("@/components/home/HomeSections").then(m => m.RoleSelector), { ssr: true });
const ReviewsSection = dynamic(() => import("@/components/home/HomeSections").then(m => m.ReviewsSection), { ssr: true });
const CTASection = dynamic(() => import("@/components/home/HomeSections").then(m => m.CTASection), { ssr: true });
const Footer = dynamic(() => import("@/components/home/HomeSections").then(m => m.Footer), { ssr: true });


const Code2 = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"/>
  </svg>
);

// ── Feature Data ────────────────────────────────────────────────
const primaryFeatures = [
  { id: "ai-tutor", title: "AI Learning Mentor", desc: "Understand concepts, revise topics, and learn with personalized explanations.", icon: BrainCircuit, color: "#10B981", span: 2, bg: "rgba(16,185,129,0.05)" },
  { id: "pdf-iq", title: "Project Builder", desc: "Turn ideas into real projects with structured planning and guidance.", icon: FileText, color: "#06B6D4", span: 1, bg: "rgba(6,182,212,0.05)" },
  { id: "mock-sim", title: "Interview Practice Hub", desc: "Prepare for technical, HR, behavioral, and system design interviews.", icon: Target, color: "#F43F5E", span: 1, bg: "rgba(244,63,94,0.05)" },
  { id: "architect", title: "Professional Upskilling", desc: "Help working professionals adapt to AI tools, automation, and modern tech stacks.", icon: Map, color: "#8B5CF6", span: 2, bg: "rgba(139,92,246,0.05)" },
];

const secondaryFeatures = [
  { icon: Code, title: "DSA & Coding Lab", desc: "Practice coding problems with guided feedback and improvement plans.", color: "#F59E0B" },
  { icon: Award, title: "Verified Skills", desc: "Earn proof-of-knowledge certificates.", color: "#10B981" },
  { icon: Trophy, title: "Opportunity Discovery", desc: "Discover internships, jobs, hackathons, certifications, and career events.", color: "#06B6D4" },
  { icon: Users, title: "Professional Growth", desc: "Help working professionals adapt to AI tools, automation, and modern tech stacks.", color: "#F43F5E" },
];

const Zap = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 Z" />
  </svg>
);

const intelligencePillars = [
  { title: "SKILL INTELLIGENCE ENGINE", desc: "Complex career data parsed into actionable intuition.", icon: BrainCircuit, color: "#8B5CF6" },
  { title: "PERSONALIZED CAREER ROADMAPS", desc: "Dynamic roadmaps that restructure in real-time.", icon: Map, color: "#06B6D4" },
  { title: "INTERVIEW PRACTICE HUB", desc: "Sub-millisecond feedback on MAANG-grade sims.", icon: Target, color: "#F43F5E" },
  { title: "OPPORTUNITY HUB", desc: "Direct pipelines to frontier tech opportunities.", icon: Sparkles, color: "#10B981" },
];

// ── Shared Branding Component ────────────────────────────────────
const BrandText = React.memo(function BrandText({ size = 40 }: { size?: number }) {
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
            willChange: "background-position"
          }}
          animate={{ backgroundPosition: ["100% 0", "-100% 0"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          Tulasi<span style={{ color: "var(--brand-primary)" }}>AI</span>
        </motion.span>
        <span style={{ fontSize: size * 0.22, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 2.5, textTransform: "uppercase", marginTop: 2 }}>V1</span>
      </div>
    </div>
  );
});

// ── Navbar ───────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = debounce(() => setIsMobile(window.innerWidth < 768), 100);
    setIsMobile(window.innerWidth < 768);
    const h = throttle(() => setScrolled(window.scrollY > 20), 100);
    window.addEventListener("scroll", h, { passive: true });
    window.addEventListener("resize", check, { passive: true });
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = debounce(() => setIsMobile(window.innerWidth < 768), 100);
    setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check, { passive: true });
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
             {mounted && [...Array(20)].map((_, i) => (
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
            {["Career", "Intelligence", "Platform."].map((w, i) => (
              <motion.span key={i} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.2 + i * 0.1 }}
                style={{ display: isMobile ? "block" : "inline-block", marginRight: isMobile ? 0 : "0.2em" }} className={i === 2 ? "gradient-text" : ""}>{w}
              </motion.span>
            ))}
          </motion.h1>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
            style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", padding: "0 20px" }}>
            {["AI CAREER INTELLIGENCE", "ADAPTIVE SKILL MAPPING", "PROFESSIONAL GROWTH"].map((tag, i) => (
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
              <Zap size={14} color="#0A84FF" /> TULASI AI CAREER PLATFORM
            </span>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontSize: "clamp(16px, 2.8vw, 22px)", color: "var(--text-secondary)", maxWidth: 780, margin: "0 auto 48px", lineHeight: 1.6, fontWeight: 500, padding: "0 4px" }}>
            Learn faster, build stronger skills, prepare for real opportunities, and stay relevant in a technology-driven career world.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="hero-buttons" style={{ justifyContent: "center" }}>
            <Link href="/auth" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="btn-primary"
                style={{ padding: "20px 48px", fontSize: "clamp(16px, 2.2vw, 19px)", borderRadius: 18, fontWeight: 900, boxShadow: "0 20px 40px rgba(10, 132, 255, 0.2)", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, position: "relative", overflow: "hidden" }}>
                <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>STUDENT MODE <ArrowRight size={20} /></span>
                <div className="animate-shimmer" style={{ position: "absolute", inset: 0, opacity: 0.35 }} />
              </motion.button>
            </Link>
            <Link href="/professional/onboarding" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                style={{ padding: "20px 48px", fontSize: "clamp(16px, 2.2vw, 19px)", borderRadius: 18, fontWeight: 900, background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#10B981", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, position: "relative", overflow: "hidden" }}>
                <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>PROFESSIONAL MODE <ArrowRight size={20} /></span>
                <div className="animate-shimmer" style={{ position: "absolute", inset: 0, opacity: 0.15 }} />
              </motion.button>
            </Link>
            <motion.a href="#reviews" className="animate-float" whileHover={{ scale: 1.02, y: -2 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "20px 40px", borderRadius: 18, textDecoration: "none", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "var(--text-primary)", fontWeight: 800, fontSize: "clamp(15px, 2vw, 17px)", boxSizing: "border-box" }}>
              Explore Platform
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Floating background elements */}
        <div className="hide-mobile" style={{ position: "absolute", left: "8%", top: "35%", opacity: 0.4, zIndex: 5 }}>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity }} style={{ padding: "16px 24px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: "var(--brand-primary)", letterSpacing: 2 }}>CAREER ROADMAPS</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "white", marginTop: 4 }}>SYNCED</div>
          </motion.div>
        </div>
        <div className="hide-mobile" style={{ position: "absolute", right: "8%", top: "45%", opacity: 0.4, zIndex: 5 }}>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }} style={{ padding: "16px 24px", borderRadius: 16, background: "rgba(10,132,255,0.05)", border: "1px solid rgba(10,132,255,0.15)" }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: "#0A84FF", letterSpacing: 2 }}>SKILL INTELLIGENCE</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "white", marginTop: 4 }}>OPTIMIZED</div>
          </motion.div>
        </div>

      </div>
    </section>
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
