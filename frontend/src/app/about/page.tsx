"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Github, Linkedin, Globe, Code2, Zap, Users, Award, Target, ArrowRight } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";

const STATS = [
  { label: "AI Modules", value: "12+" },
  { label: "Features Built", value: "50+" },
  { label: "Lines of Code", value: "25K+" },
  { label: "Global Users", value: "Growing" },
];

const STACK = [
  { name: "Next.js 16", color: "#fff", cat: "Frontend" },
  { name: "FastAPI", color: "#009688", cat: "Backend" },
  { name: "Gemini AI", color: "#4285F4", cat: "AI Engine" },
  { name: "Railway", color: "#8B5CF6", cat: "Infrastructure" },
  { name: "Vercel", color: "#fff", cat: "Deployment" },
  { name: "PostgreSQL", color: "#336791", cat: "Database" },
  { name: "Framer Motion", color: "#d259ff", cat: "Animation" },
  { name: "TypeScript", color: "#3178C6", cat: "Language" },
];

const TIMELINE = [
  { date: "Mar 2026", event: "Tulasi AI v1.0 launched — AI Chat + Mock Interviews", icon: "🚀" },
  { date: "Mar 2026", event: "12 AI modules built: Roadmaps, Flashcards, Startup Lab, PDF Q&A", icon: "⚡" },
  { date: "Mar 2026", event: "Apple-level UI overhaul — Neural Logo + Bento Dashboard", icon: "🍎" },
  { date: "Mar 2026", event: "Production hardening — CORS, JWT auth, keep-alive cron", icon: "🛡️" },
  { date: "Now", event: "Platform expanding with community and analytics features", icon: "💎" },
];

export default function AboutPage() {
  return (
    <main style={{ background: "#05070D", minHeight: "100vh", color: "white", padding: "0 24px 80px" }}>
      {/* Hero */}
      <div style={{ maxWidth: 960, margin: "0 auto", paddingTop: 80, textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: 40 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 8 }}>
              ← Back to Tulasi AI
            </span>
          </Link>

          {/* Creator Card */}
          <div style={{
            width: 110, height: 110, borderRadius: 32, margin: "0 auto 32px",
            background: "linear-gradient(135deg, #A78BFA, #22D3EE)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 48, fontWeight: 900, color: "white",
            boxShadow: "0 0 60px rgba(167,139,250,0.4)",
          }}>
            A
          </div>

          <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-2px", marginBottom: 16, lineHeight: 1.05 }}>
            Built by{" "}
            <span style={{
              background: "linear-gradient(90deg, #A78BFA, #22D3EE)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              Abishek R
            </span>
          </h1>

          <p style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", maxWidth: 600, margin: "0 auto 16px", lineHeight: 1.7 }}>
            Engineering student turned full-stack architect. Built Tulasi AI from scratch
            to give every student a senior engineer in their pocket — 24/7.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
            <a href="https://github.com/Abishek2207" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.05 }} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 12,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "white", cursor: "pointer", fontSize: 14, fontWeight: 700
              }}>
                <Github size={18} /> GitHub
              </motion.button>
            </a>
            <a href="https://www.linkedin.com/in/abishek-r" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.05 }} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 12,
                background: "rgba(10,102,194,0.15)", border: "1px solid rgba(10,102,194,0.3)",
                color: "#60A5FA", cursor: "pointer", fontSize: 14, fontWeight: 700
              }}>
                <Linkedin size={18} /> LinkedIn
              </motion.button>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 960, margin: "80px auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24 }}>
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <TiltCard intensity={5}>
              <div style={{ padding: 28, textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 36, fontWeight: 900, background: "linear-gradient(90deg, #A78BFA, #22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* Mission */}
      <div style={{ maxWidth: 960, margin: "80px auto 0" }}>
        <div style={{ padding: "60px 48px", borderRadius: 28, background: "linear-gradient(135deg, rgba(167,139,250,0.06), rgba(34,211,238,0.06))", border: "1px solid rgba(167,139,250,0.15)" }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 24, letterSpacing: "-1px" }}>
            The Mission 🎯
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.7)", maxWidth: 720 }}>
            Every student deserves access to the same career-accelerating tools that top engineers at MAANG companies use.
            Tulasi AI was built to democratize career intelligence — giving every student, regardless of background or institution,
            a powerful AI mentor that's available 24/7, never judges, and gets sharper with every session.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.7)", maxWidth: 720, marginTop: 20 }}>
            From mock interviews to startup pitches, resume analysis to career roadmaps — every feature was built from scratch,
            with precision, by one engineer who believed the gap between "student" and "engineer" was bridgeable with the right tools.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ maxWidth: 960, margin: "80px auto 0" }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 40, letterSpacing: "-1px" }}>Build Timeline 🏗️</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {TIMELINE.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <div style={{ display: "flex", gap: 24, alignItems: "center", padding: "20px 28px", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 28 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#A78BFA", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>{t.date}</div>
                  <div style={{ fontSize: 15, color: "white", fontWeight: 600 }}>{t.event}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div style={{ maxWidth: 960, margin: "80px auto 0" }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 40, letterSpacing: "-1px" }}>Tech Stack ⚡</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {STACK.map((s) => (
            <div key={s.name} style={{
              padding: "10px 18px", borderRadius: 12,
              background: `${s.color}12`, border: `1px solid ${s.color}30`,
              display: "flex", flexDirection: "column", gap: 2
            }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: s.color }}>{s.name}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>{s.cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ maxWidth: 960, margin: "80px auto 0", textAlign: "center" }}>
        <h2 style={{ fontSize: 40, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 24, letterSpacing: "-1px" }}>
          Ready to Engineer Your Future?
        </h2>
        <Link href="/auth">
          <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(167,139,250,0.3)" }} style={{
            padding: "18px 48px", borderRadius: 16, fontSize: 18, fontWeight: 900,
            background: "linear-gradient(135deg, #A78BFA, #22D3EE)",
            color: "white", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 10, margin: "0 auto"
          }}>
            Start Free Today <ArrowRight size={20} />
          </motion.button>
        </Link>
      </div>
    </main>
  );
}
