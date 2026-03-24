"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Logo as TulasiLogo } from "@/components/Logo";
import { 
  Bot, FileText, Target, Map, Code, Award, Trophy, Users, 
  Check, Sparkles, ChevronRight, Zap, Shield, Globe, Terminal, Star, Briefcase,
  ArrowRight, Layout, BrainCircuit, Rocket, HardDrive, Cpu
} from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";

const Code2 = ({ size, color }: { size: number, color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"/>
  </svg>
);

// ── Feature Data (Bento Grid Style) ────────────────────────────────
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

// ── Shared Branding Component ─────────────────────────────────────
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
            WebkitTextFillColor: "transparent"
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
        {["Roadmaps", "Features", "Pricing"].map(l => (
          <Link key={l} href={`#${l.toLowerCase()}`} style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: 1, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
          >{l}</Link>
        ))}
        <Link href="/about" style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: 1, transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#A78BFA"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
        >About</Link>
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
      {/* Animated Mesh Gradients */}
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
             <motion.span 
               key={i} 
               initial={{ y: 40, opacity: 0 }} 
               animate={{ y: 0, opacity: 1 }} 
               transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.2 + i * 0.1 }}
               style={{ display: "inline-block", marginRight: "0.2em" }}
               className={i === 2 ? "gradient-text" : ""}
             >
               {w}
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
          <button className="btn-ghost" style={{ padding: "20px 40px", fontSize: 17, borderRadius: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontWeight: 800 }}>
            AUDIT THE PLATFORM
          </button>
          <motion.a
            href="https://wa.me/?text=Check%20out%20Tulasi%20AI%20%F0%9F%AA%B7%20%E2%80%94%20The%20AI%20that%20got%20me%20interview-ready%20for%20MAANG!%20https%3A//tulasiai.vercel.app"
            target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.04, y: -2 }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "20px 28px", borderRadius: 16, textDecoration: "none",
              background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.3)",
              color: "#25D366", fontWeight: 800, fontSize: 15,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Share
          </motion.a>
        </motion.div>
      </motion.div>


      {/* Floating Elements (Decorative) */}
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
            Our mission is zero-to-one velocity. Every tool in the Tulasi ecosystem 
            is optimized for deep mastery and professional transition.
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

        {/* Dynamic Secondary Features */}
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

// ── Role Selector (Sub-Hero) ─────────────────────────────────────
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

// ── Testimonials ─────────────────────────────────────────────────
function Testimonials() {
  const reviews = [
    { quote: "Tulasi AI completely re-engineered my interview mindset. I secured a Senior role at Stripe using the simulation engine.", author: "Arjun M.", title: "SDE @ Stripe" },
    { quote: "The roadmaps are surgical in their precision. It's like having a Principal Engineer as a personal mentor 24/7.", author: "Sarah L.", title: "CS Student at MIT" },
    { quote: "The most high-fidelity learning workspace I've ever encountered. The UX is genuinely at Apple's level.", author: "Chen W.", title: "Founding Engineer" },
  ];
  return (
    <section id="testimonials" style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 32 }}>
          {reviews.map((r, i) => (
            <TiltCard key={r.author}>
              <div className="glass-card" style={{ padding: 48, background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>{[1,2,3,4,5].map(n => <Star key={n} size={16} color="#F59E0B" fill="#F59E0B" />)}</div>
                <p style={{ fontSize: 18, color: "var(--text-primary)", lineHeight: 1.7, marginBottom: 40, fontWeight: 500 }}>"{r.quote}"</p>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 16 }}>
                   <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #06B6D4, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "white" }}>{r.author[0]}</div>
                   <div>
                     <h4 style={{ color: "white", fontWeight: 800, fontSize: 15 }}>{r.author}</h4>
                     <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{r.title}</span>
                   </div>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "80px 24px 40px", background: "rgba(0,0,0,0.5)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr", gap: 64, marginBottom: 80 }}>
        <div>
          <BrandText size={32} />
          <p style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 32, maxWidth: 360, lineHeight: 1.7 }}>
            Precision-engineered career intelligence for the next generation of engineers. 
            Accelerate your trajectory with high-fidelity autonomy.
          </p>
        </div>
        <div>
          <h4 style={{ color: "white", fontWeight: 800, marginBottom: 24, fontSize: 13, textTransform: "uppercase", letterSpacing: 2 }}>Product</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {["Roadmaps", "Career Chat", "Interviews", "Flashcards"].map(i => <Link key={i} href="#" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{i}</Link>)}
          </div>
        </div>
        <div>
          <h4 style={{ color: "white", fontWeight: 800, marginBottom: 24, fontSize: 13, textTransform: "uppercase", letterSpacing: 2 }}>Company</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {["Manifesto", "Engineering", "Privacy", "Terms"].map(i => <Link key={i} href="#" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{i}</Link>)}
          </div>
        </div>
        <div>
           <div style={{ padding: 24, background: "rgba(255,255,255,0.03)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h5 style={{ fontSize: 14, fontWeight: 900, marginBottom: 12 }}>SYSTEM STATUS</h5>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981" }}>ALL SYSTEMS OPERATIONAL</span>
              </div>
           </div>
        </div>
      </div>
      <div style={{ maxWidth: 1280, margin: "0 auto", paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700 }}>TULASI AI</span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>•</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Built by</span>
            <span style={{
              fontSize: 15, fontWeight: 900,
              background: "linear-gradient(90deg, #A78BFA, #22D3EE)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "-0.2px"
            }}>Abishek R</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#A78BFA", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", padding: "2px 8px", borderRadius: 6, letterSpacing: 1 }}>FOUNDER</span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>•</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700 }}>© 2026</span>
          </div>
        <div style={{ display: "flex", gap: 24, color: "var(--text-muted)" }}>
           <Link href="#" style={{ color: "var(--text-muted)" }}><Globe size={18} /></Link>
           <Link href="#" style={{ color: "var(--text-muted)" }}><Shield size={18} /></Link>
        </div>
      </div>
    </footer>
  );
}


// ── Main Page Component ──────────────────────────────────────────
export default function LandingPage() {
  return (
    <main style={{ background: "#05070D", minHeight: "100vh", color: "white", position: "relative" }}>
      {/* Apple-style Noise Texture */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none", zIndex: 50, background: "url('https://grainy-gradients.vercel.app/noise.svg')" }} />
      <Navbar />
      <Hero />
      <RoleSelector />
      <BentoFeatures />
      <Testimonials />
      <Footer />
    </main>
  );
}
