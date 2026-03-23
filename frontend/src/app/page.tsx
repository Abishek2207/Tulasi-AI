"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { TulasiLogo } from "@/components/TulasiLogo";
import { 
  Bot, FileText, Target, Map, Code, Award, Trophy, Users, 
  Check, Sparkles, ChevronRight, Zap, Shield, Globe, Terminal, Star, Briefcase
} from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";

// ── Feature data ──────────────────────────────────────────────────
const features = [
  { icon: Bot, title: "AI RAG Chatbot", desc: "Context-aware AI tutor with memory. Ask anything — coding, career, concepts.", color: "#7C3AED" },
  { icon: FileText, title: "PDF Intelligence", desc: "Upload any PDF. Extract insights, summaries, and answers instantly.", color: "#06B6D4" },
  { icon: Target, title: "Mock Interviews", desc: "AI conducts real interviews, evaluates your answers, and gives feedback.", color: "#F43F5E" },
  { icon: Map, title: "Learning Roadmaps", desc: "Role-based paths for AI Engineer, Web Dev, Data Science, and more.", color: "#10B981" },
  { icon: Code, title: "Coding Practice Hub", desc: "Curated resources from LeetCode & Codeforces. Track progress.", color: "#F59E0B" },
  { icon: Award, title: "Certificate System", desc: "Upload your certs or earn Tulasi AI certificates by hitting milestones.", color: "#7C3AED" },
  { icon: Trophy, title: "Hackathon Hub", desc: "Discover 20+ handpicked hackathons — from SIH to GSoC.", color: "#06B6D4" },
  { icon: Users, title: "Group Study Rooms", desc: "Realtime collaborative study sessions with live chat.", color: "#F43F5E" },
];

// ── Shared Branding Component ─────────────────────────────────────
function BrandText({ size = 40 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.25 }}>
      <TulasiLogo size={size * 1.2} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginTop: 2 }}>
        <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 800, fontSize: size * 0.55, color: "white", letterSpacing: "-0.5px", lineHeight: 1 }}>
          Tulasi<span style={{ color: "#06B6D4" }}>AI</span>
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
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(9,9,11,0.8)" : "transparent",
      backdropFilter: scrolled ? "blur(24px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
      transition: "all 0.3s var(--ease-premium)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72, maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <Link href="/" style={{ textDecoration: "none" }}><BrandText size={36} /></Link>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Features", "Roadmaps", "Pricing"].map(l => (
            <Link key={l} href={`#${l.toLowerCase()}`} style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
            >{l}</Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/auth" style={{ color: "white", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Sign In</Link>
          <Link href="/auth" className="btn-primary" style={{ padding: "8px 20px", fontSize: 13, borderRadius: 12, textDecoration: "none" }}>Start Free</Link>
        </div>
      </div>
    </nav>
  );
}

// ── Hero section ─────────────────────────────────────────────────
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: "160px 24px 80px", overflow: "hidden" }}>
      {/* Premium Gradient Background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", top: "-20%", left: "-10%", width: "70%", height: "70%", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 60%)", filter: "blur(60px)" }} />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
             style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 60%)", filter: "blur(60px)" }} />
      </div>

      <motion.div style={{ y, opacity, position: "relative", zIndex: 10, textAlign: "center", maxWidth: 960 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#A78BFA", fontSize: 13, fontWeight: 600, marginBottom: 32 }}>
            <Sparkles size={14} /> Meet Tulasi AI 3.0
          </span>
        </motion.div>
        
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          style={{ fontSize: "clamp(48px, 8vw, 84px)", fontWeight: 900, fontFamily: "var(--font-outfit)", lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 24 }}>
          Your AI-Powered <br />
          <span className="gradient-text">Career Companion</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          style={{ fontSize: 20, color: "var(--text-secondary)", maxWidth: 640, margin: "0 auto 48px", lineHeight: 1.6 }}>
          Master the skills of tomorrow today. Chat with AI tutors, practice coding, ace mock interviews, and build your career portfolio — all in one premium workspace.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
          <Link href="/auth" style={{ textDecoration: "none" }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary"
              style={{ padding: "16px 36px", fontSize: 16, borderRadius: 14 }}>
              Start for Free <ChevronRight size={18} />
            </motion.button>
          </Link>
          <button className="btn-ghost" style={{ padding: "16px 36px", fontSize: 16, borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <Terminal size={18} opacity={0.7} /> View Live Demo
          </button>
        </motion.div>
      </motion.div>

      {/* Hero Mockup */}
      <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 1080, position: "relative", zIndex: 10, perspective: 1200 }}>
        <TiltCard>
          <div style={{ padding: 10, background: "rgba(255,255,255,0.03)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
            <div className="glass-card" style={{ height: 500, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* Window header */}
            <div style={{ height: 48, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 16px", gap: 8 }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)", margin: "0 auto" }}>tulasi.ai/dashboard</div>
            </div>
            {/* Mock Chat UI */}
            <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><Bot size={20} color="white" /></div>
                <div className="chat-bubble-ai" style={{ padding: "16px 20px", fontSize: 14, maxWidth: "80%", lineHeight: 1.6 }}>
                  Hello! I'm Tulasi AI. I can help you prepare for your technical interview at Google. Should we start with system design or data structures?
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, alignSelf: "flex-end", flexDirection: "row-reverse" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>U</div>
                <div className="chat-bubble-user" style={{ padding: "16px 20px", fontSize: 14, maxWidth: "80%", lineHeight: 1.6 }}>
                  Let's do a mock system design interview. How would you design a URL shortener like Bitly?
                </div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><Bot size={20} color="white" /></div>
                <div className="chat-bubble-ai" style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </TiltCard>
      </motion.div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────
function Features() {
  return (
    <section id="features" style={{ padding: "120px 24px", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 80 }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-1px", marginBottom: 20 }}>
            Everything you need to <span className="gradient-text">accelerate</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 600, margin: "0 auto" }}>
            A complete ecosystem designed to take you from learning concepts to landing offers.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }} style={{ height: "100%", perspective: 1200 }}>
              <TiltCard className="h-full">
                <div className="glass-card" style={{ padding: 32, cursor: "default", height: "100%" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}15`, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, color: f.color }}>
                    <f.icon size={24} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "white" }}>{f.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Use Cases ────────────────────────────────────────────────────
function UseCases() {
  const cases = [
    { role: "Software Engineers", desc: "Crush system design and algorithmic coding rounds with real-time AI mock interviews.", icon: Code, color: "#06B6D4" },
    { role: "University Students", desc: "Get personalized learning roadmaps to bridge the gap between academia and industry.", icon: FileText, color: "#10B981" },
    { role: "Startup Founders", desc: "Generate, evaluate, and refine your pitch deck ideas using the Startup Lab simulator.", icon: Zap, color: "#F59E0B" },
  ];
  return (
    <section id="use-cases" style={{ padding: "80px 24px", background: "url('/noise.png')", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
        {cases.map((c, i) => (
          <motion.div key={c.role} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
               style={{ padding: 32, background: "rgba(255,255,255,0.03)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
            <c.icon size={32} color={c.color} style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 12 }}>{c.role}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6 }}>{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Testimonials ─────────────────────────────────────────────────
function Testimonials() {
  const reviews = [
    { quote: "The mock interview AI completely changed my prep game. I landed a Senior SDE role at Amazon just weeks after using Tulasi.", author: "Priya S.", title: "SDE @ Amazon" },
    { quote: "I was stuck in tutorial hell until I used the personalized Roadmaps. The structured approach and live AI tutoring are unmatched.", author: "Ankit R.", title: "CS Student" },
    { quote: "Using the Chat feature internally feels just like Apple Messages. The UX is flawless and the answers are incredibly sharp.", author: "Michael T.", title: "Startup Founder" },
  ];
  return (
    <section id="testimonials" style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-1px", marginBottom: 20 }}>
            Loved by <span className="gradient-text">thousands</span>
          </h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {reviews.map((r, i) => (
            <TiltCard key={r.author}>
              <div className="glass-card" style={{ padding: 40, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>{[1,2,3,4,5].map(n => <Star key={n} size={16} color="#F59E0B" fill="#F59E0B" />)}</div>
                  <p style={{ fontSize: 16, color: "var(--text-primary)", lineHeight: 1.7, marginBottom: 32, fontStyle: "italic" }}>"{r.quote}"</p>
                </div>
                <div>
                  <h4 style={{ color: "white", fontWeight: 700, fontSize: 15 }}>{r.author}</h4>
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{r.title}</span>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ──────────────────────────────────────────────────────
function Pricing() {
  return (
    <section id="pricing" style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-1px", marginBottom: 20 }}>
            Simple, transparent <span className="gradient-text">pricing</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 18 }}>Always free for students. Go Pro for unlimited power.</p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
          {/* Free Tier */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card" style={{ padding: 48, position: "relative" }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "white", marginBottom: 8 }}>Free</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>Perfect for students getting started.</p>
            <div style={{ marginBottom: 32 }}><span style={{ fontSize: 48, fontWeight: 900, fontFamily: "var(--font-outfit)" }}>$0</span> <span style={{ color: "var(--text-secondary)" }}>/ forever</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
              {[ "Standard AI Chat (Flash)", "Access to Roadmaps", "Basic Study Rooms", "Hackathon Listings" ].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "var(--text-primary)" }}>
                  <Check size={16} color="#10B981" /> {t}
                </div>
              ))}
            </div>
            <Link href="/auth"><button className="btn-ghost" style={{ width: "100%", padding: 16, borderRadius: 12, fontSize: 15, cursor: "pointer" }}>Start Free</button></Link>
          </motion.div>

          {/* Pro Tier */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card" style={{ padding: 48, position: "relative", border: "1px solid var(--brand-primary)" }}>
            <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--gradient-primary)", color: "white", fontSize: 12, fontWeight: 800, padding: "4px 16px", borderRadius: 20, letterSpacing: "1px", textTransform: "uppercase" }}>Most Popular</div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "white", marginBottom: 8 }}>Pro</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>For serious engineers accelerating their career.</p>
            <div style={{ marginBottom: 32 }}><span style={{ fontSize: 48, fontWeight: 900, fontFamily: "var(--font-outfit)", color: "var(--brand-secondary)" }}>₹249</span> <span style={{ color: "var(--text-secondary)" }}>/ month</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
              {[ "Advanced AI Models (Pro)", "Unlimited Mock Interviews", "Premium ATS Resume Builder", "Priority Support" ].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "var(--text-primary)" }}>
                  <Zap size={16} color="#7C3AED" /> {t}
                </div>
              ))}
            </div>
            <Link href="/auth"><button className="btn-primary" style={{ width: "100%", padding: 16, borderRadius: 12, fontSize: 15, cursor: "pointer" }}>Upgrade to Pro</button></Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "64px 24px 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 64 }}>
        <div>
          <BrandText size={32} />
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 24, maxWidth: 300, lineHeight: 1.6 }}>
            The premier AI learning ecosystem designed to help you master tech skills, crack interviews, and build your career portfolio.
          </p>
        </div>
        <div>
          <h4 style={{ color: "white", fontWeight: 700, marginBottom: 20 }}>Product</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href="#" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Features</Link>
            <Link href="#" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Pricing</Link>
            <Link href="#" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Roadmaps</Link>
          </div>
        </div>
        <div>
          <h4 style={{ color: "white", fontWeight: 700, marginBottom: 20 }}>Company</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href="/blog" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Blog & Resources</Link>
            <Link href="/contact" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Contact Support</Link>
            <Link href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Terms of Service</Link>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>© 2026 Tulasi AI. All rights reserved.</span>
        <div style={{ display: "flex", gap: 16, color: "var(--text-muted)" }}>
          <Globe size={18} />
          <Shield size={18} />
        </div>
      </div>
    </footer>
  );
}

// ── Main Layout ──────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <UseCases />
      <Features />
      <Testimonials />
      <Pricing />
      <Footer />
    </main>
  );
}
