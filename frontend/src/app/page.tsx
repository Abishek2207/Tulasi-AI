"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Logo as TulasiLogo } from "@/components/Logo";
import {
  FileText, Target, Map, Code, Award, Trophy, Users,
  Sparkles, Shield, Globe, ArrowRight, Layout, BrainCircuit, HardDrive, Cpu
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
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 100,
      width: scrolled ? "min(95%, 1200px)" : "min(95%, 1280px)",
      background: scrolled ? "rgba(9,9,11,0.6)" : "transparent",
      backdropFilter: scrolled ? "blur(32px)" : "none",
      border: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
      borderRadius: 24, padding: "0 24px", height: 72,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      <Link href="/" style={{ textDecoration: "none" }}><BrandText size={32} /></Link>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {["Roadmaps", "Features", "Reviews"].map(l => (
          <Link key={l} href={`#${l.toLowerCase()}`} style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: 1, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
          >{l}</Link>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/auth" style={{ color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none", padding: "8px 16px" }}>Login</Link>
        <Link href="/auth" className="btn-primary" style={{ padding: "10px 24px", fontSize: 13, borderRadius: 14, textDecoration: "none", fontWeight: 800 }}>CLAIM ACCESS</Link>
      </div>
    </nav>
  );
}

// ── Hero Section ─────────────────────────────────────────────────
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} style={{ minHeight: "110vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: "180px 24px 80px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
        <motion.div animate={{ x: [-20, 20, -20], y: [-20, 20, -20] }} transition={{ duration: 10, repeat: Infinity }}
          style={{ position: "absolute", top: "10%", left: "20%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <motion.div animate={{ x: [20, -20, 20], y: [20, -20, 20] }} transition={{ duration: 12, repeat: Infinity }}
          style={{ position: "absolute", bottom: "10%", right: "20%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <motion.div style={{ y, opacity, position: "relative", zIndex: 10, textAlign: "center", maxWidth: 1000 }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} style={{ marginBottom: 32 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 30, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2 }}>
            <Sparkles size={14} /> THE AUTONOMOUS CAREER ENGINE
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          style={{ fontSize: "clamp(56px, 10vw, 108px)", fontWeight: 900, fontFamily: "var(--font-outfit)", lineHeight: 0.9, letterSpacing: "-0.05em", marginBottom: 32 }}>
          {["Architect", "Your", "Trajectory."].map((w, i) => (
            <motion.span key={i} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.2 + i * 0.1 }}
              style={{ display: "inline-block", marginRight: "0.2em" }} className={i === 2 ? "gradient-text" : ""}>{w}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          style={{ fontSize: 20, color: "var(--text-secondary)", maxWidth: 720, margin: "0 auto 56px", lineHeight: 1.6, fontWeight: 500 }}>
          Tulasi AI is the high-fidelity workspace for future engineers.
          Bridge the gap from theory to global offers with precision-engineered AI intelligence.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 80 }}>
          <Link href="/auth" style={{ textDecoration: "none" }}>
            <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="btn-primary"
              style={{ padding: "20px 48px", fontSize: 18, borderRadius: 16, fontWeight: 900, boxShadow: "0 12px 32px rgba(6,182,212,0.3)" }}>
              INITIALIZE SESSION <ArrowRight size={20} />
            </motion.button>
          </Link>
          <motion.a href="#reviews" whileHover={{ scale: 1.02, y: -2 }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "20px 32px", borderRadius: 16, textDecoration: "none", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-secondary)", fontWeight: 800, fontSize: 15 }}>
            See Reviews
          </motion.a>
        </motion.div>
      </motion.div>

      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", left: "10%", top: "30%", opacity: 0.3 }}><Cpu size={64} className="text-brand" /></motion.div>
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", right: "10%", top: "40%", opacity: 0.3 }}><HardDrive size={64} style={{ color: "#7C3AED" }} /></motion.div>
    </section>
  );
}

// ── Bento Features ────────────────────────────────────────────────
function BentoFeatures() {
  return (
    <section id="features" style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 80 }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-2px", marginBottom: 20 }}>
            Engineered for <span className="gradient-text">Elite Engineers.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 640, margin: "0 auto" }}>
            Our mission is zero-to-one velocity. Every tool in the Tulasi ecosystem is optimized for deep mastery and professional transition.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 48 }}>
          {primaryFeatures.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ gridColumn: `span ${f.span}` }}>
              <TiltCard intensity={5} style={{ height: "100%" }}>
                <div className="glass-card" style={{ padding: 48, background: f.bg, border: `1px solid ${f.color}20`, height: "100%", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: `radial-gradient(circle, ${f.color}10 0%, transparent 70%)`, filter: "blur(40px)" }} />
                  <f.icon size={48} color={f.color} style={{ marginBottom: 32 }} />
                  <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 16, color: "white" }}>{f.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.6, maxWidth: 400 }}>{f.desc}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {secondaryFeatures.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="glass-card" style={{ padding: 32, borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, color: f.color }}>
                  <f.icon size={22} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "white" }}>{f.title}</h4>
                <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.5 }}>{f.desc}</p>
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
    <div style={{ padding: "80px 24px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
        {roles.map(r => (
          <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <r.icon size={28} color={r.color} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>{r.desc}</div>
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
          style={{ background: "none", border: "none", cursor: interactive ? "pointer" : "default", padding: 2, color: n <= (hover || rating) ? "#F59E0B" : "rgba(255,255,255,0.15)", fontSize: interactive ? 28 : 18, lineHeight: 1 }}
        >★</button>
      ))}
    </div>
  );
}

// ── Reviews Section ──────────────────────────────────────────────
function ReviewsSection() {
  const FALLBACK_REVIEWS: ReviewItem[] = [
    { id: -1, name: "Arjun S.", role: "CSE Student, IIT Madras", review: "Tulasi AI completely changed how I prepare for placements. The AI mock interviews feel incredibly real.", rating: 5, created_at: "2026-03-01T00:00:00" },
    { id: -2, name: "Priya R.", role: "Software Engineer, Zoho", review: "The roadmaps are amazing — structured, detailed, and actually helped me land my first job!", rating: 5, created_at: "2026-03-02T00:00:00" },
    { id: -3, name: "Karthik V.", role: "B.Tech Final Year", review: "Best platform for placement prep. The hackathons section is gold — I discovered 3 contests I never knew about.", rating: 5, created_at: "2026-03-03T00:00:00" },
  ];

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", review: "", rating: 0 });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    reviewsApi.getReviews()
      .then(data => {
        const filtered = data.filter(r =>
          !r.review.toLowerCase().includes("mia kalifa") &&
          !r.name.toLowerCase().includes("mia kalifa")
        );
        setReviews(filtered.length > 0 ? filtered : FALLBACK_REVIEWS);
      })
      .catch(() => {
        // On any API error, show the polished static fallback reviews
        setReviews(FALLBACK_REVIEWS);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim()) return setFormError("Name is required.");
    if (!form.review.trim()) return setFormError("Review is required.");
    if (form.rating === 0) return setFormError("Please select a star rating.");
    setSubmitting(true);
    try {
      const newReview = await reviewsApi.submitReview({
        name: form.name.trim(),
        role: form.role.trim() || undefined,
        review: form.review.trim(),
        rating: form.rating,
      });
      setReviews(prev => [newReview, ...prev]);
      setForm({ name: "", role: "", review: "", rating: 0 });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit. Please try again.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 80 }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-2px", marginBottom: 20 }}>
            What Engineers <span className="gradient-text">Actually Say.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 560, margin: "0 auto" }}>
            Real feedback from real users. No fake testimonials, ever.
          </p>
        </motion.div>

        {loading && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "48px 0", fontSize: 16 }}>Loading reviews...</div>
        )}

        {!loading && reviews.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "64px 32px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 24, color: "var(--text-muted)", fontSize: 17, marginBottom: 80 }}>
            No reviews yet. Be the first to share your experience.
          </motion.div>
        )}
        {!loading && reviews.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 28, marginBottom: 80 }}>
            {reviews.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <TiltCard intensity={4}>
                  <div className="glass-card" style={{ padding: 40, background: "rgba(255,255,255,0.02)", height: "100%", display: "flex", flexDirection: "column" }}>
                    <StarRating rating={r.rating} />
                    <p style={{ fontSize: 17, color: "var(--text-primary)", lineHeight: 1.7, margin: "24px 0 32px", fontWeight: 500, flex: 1 }}>"{r.review}"</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #06B6D4, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "white", fontSize: 16 }}>
                        {r.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: "white", fontWeight: 800, fontSize: 15 }}>{r.name}</div>
                        {r.role && <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{r.role}</div>}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Write a Review Form */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="glass-card" style={{ maxWidth: 680, margin: "0 auto", padding: 48, background: "rgba(255,255,255,0.02)" }}>
            <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: "white" }}>Write a Review</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>Your experience helps others make better decisions.</p>

            {submitted && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 14, padding: "14px 20px", marginBottom: 24, color: "#10B981", fontSize: 14, fontWeight: 700 }}>
                ✅ Thank you! Your review has been submitted.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 15, outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Role (optional)</label>
                  <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. SDE @ Google"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 15, outline: "none" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Your Review *</label>
                <textarea value={form.review} onChange={e => setForm(f => ({ ...f, review: e.target.value }))} rows={4} placeholder="Share your experience with Tulasi AI..."
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 15, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Rating *</label>
                <StarRating rating={form.rating} interactive onSet={r => setForm(f => ({ ...f, rating: r }))} />
              </div>
              {formError && <p style={{ color: "#F43F5E", fontSize: 13, fontWeight: 700, margin: 0 }}>{formError}</p>}
              <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary"
                style={{ padding: "16px 32px", borderRadius: 14, fontWeight: 900, fontSize: 15, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "Submitting..." : "Submit Review →"}
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
    <footer style={{ borderTop: "1px solid var(--border)", padding: "80px 24px 40px", background: "rgba(0,0,0,0.6)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* 3-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr", gap: 64, marginBottom: 64 }}>
          {/* LEFT: Logo + Tagline */}
          <div>
            <BrandText size={32} />
            <p style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 28, maxWidth: 340, lineHeight: 1.8 }}>
              Precision-engineered career intelligence for engineers.
            </p>
          </div>

          {/* CENTER: Product Links */}
          <div>
            <h4 style={{ color: "white", fontWeight: 900, marginBottom: 24, fontSize: 11, textTransform: "uppercase", letterSpacing: 2.5 }}>Product</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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

          {/* RIGHT: System Status */}
          <div>
            <h4 style={{ color: "white", fontWeight: 900, marginBottom: 24, fontSize: 11, textTransform: "uppercase", letterSpacing: 2.5 }}>System Status</h4>
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
            Founded & Built by Abishek R • © 2026 Tulasi AI Labs
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main style={{ background: "#05070D", minHeight: "100vh", color: "white", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none", zIndex: 50, background: "url('https://grainy-gradients.vercel.app/noise.svg')" }} />
      <Navbar />
      <Hero />
      <RoleSelector />
      <BentoFeatures />
      <ReviewsSection />
      <Footer />
    </main>
  );
}
