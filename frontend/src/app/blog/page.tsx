"use client";

import Link from "next/link";
import { TulasiLogo } from "@/components/TulasiLogo";
import { ArrowLeft, Target, Map } from "lucide-react";
import { motion } from "framer-motion";

export default function BlogHome() {
  const posts = [
    {
      title: "How to Ace Your Technical Screen with AI Interview Prep",
      excerpt: "Technical interviews at FAANG companies are notoriously difficult. Learn how our advanced AI Mock Interview simulator evaluates system design and algorithmic complexity in real-time.",
      cat: "Interview Prep",
      icon: Target,
      color: "#F43F5E"
    },
    {
      title: "Building the Perfect Career with an AI Roadmap Generator 2026",
      excerpt: "Don't get stuck in tutorial hell. Discover how role-playing AI models can map out exactly what you need to learn week-by-week to land your dream Software Engineering role.",
      cat: "Career Growth",
      icon: Map,
      color: "#10B981"
    },
    {
      title: "Ultimate 2026 AI Interview Questions for Google",
      excerpt: "A comprehensive teardown of exactly what Google evaluators are looking for, mapped across Systems Architecture, DP algorithms, and Behavioral Leadership Principles.",
      cat: "FAANG Prep",
      icon: Target,
      color: "#06B6D4"
    },
    {
      title: "How to Secure a Job at Google (The 2026 Playbook)",
      excerpt: "Step-by-step strategies for getting your resume past the strict ATS filters, landing the initial recruiter screen, and dominating the 5-round onsite loop.",
      cat: "Career Growth",
      icon: Map,
      color: "#7C3AED"
    }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "var(--font-inter)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px" }}>
        
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", textDecoration: "none", marginBottom: 48, fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div style={{ marginBottom: 64, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}><TulasiLogo size={64} /></div>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, fontFamily: "var(--font-display)", letterSpacing: "-1px", marginBottom: 16 }}>
            The <span className="gradient-text">Tulasi AI</span> Blog
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            Mastering algorithms, conquering interviews, and building the internet. Insights from the Tulasi engineering team.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 32 }}>
           {posts.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: 32, cursor: "pointer", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: `radial-gradient(circle at top right, ${p.color}15, transparent 70%)` }} />
                
                <span style={{ display: "inline-block", background: `${p.color}20`, color: p.color, borderRadius: 12, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 20, padding: "4px 12px" }}>
                  {p.cat}
                </span>

                <h2 style={{ fontSize: 24, fontWeight: 800, color: "white", marginBottom: 16, lineHeight: 1.4 }}>{p.title}</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>{p.excerpt}</p>
                
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "white", fontWeight: 700, fontSize: 14 }}>
                  Read Article →
                </div>
              </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}
