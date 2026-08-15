"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdaptivePracticeWidget } from "@/components/dashboard/AdaptivePracticeWidget";

export default function PracticeDashboard() {
  const container: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item: any = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } };

  return (
    <motion.div
      initial="hidden" animate="show" variants={container}
      style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 80, paddingTop: 40 }}
    >
      {/* ── Header ── */}
      <motion.div variants={item} style={{ marginBottom: 40 }}>
        <Link href="/dashboard" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "rgba(255,255,255,0.5)", fontSize: 14, textDecoration: "none", marginBottom: 24,
          transition: "color 0.2s"
        }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 20,
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)",
          color: "#34D399", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em",
          textTransform: "uppercase", marginBottom: 18,
        }}>
          <Activity size={13} />
          Phase 4 Intelligence
        </div>

        <h1 style={{
          fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900, color: "white",
          letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14,
          fontFamily: "var(--font-outfit)",
        }}>
          Adaptive Practice Engine.
        </h1>

        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", maxWidth: 500, lineHeight: 1.6 }}>
          Deep learning requires active recall. The AI adapts question difficulty based on your previous answers and current mastery level.
        </p>
      </motion.div>

      {/* ── Widget ── */}
      <motion.div variants={item}>
        <AdaptivePracticeWidget />
      </motion.div>
      
    </motion.div>
  );
}
