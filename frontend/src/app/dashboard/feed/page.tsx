"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Rocket, Zap } from "lucide-react";
import Link from "next/link";

export default function FeedPage() {
  return (
    <div style={{ 
      height: "calc(100vh - 100px)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: 24 
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: 600,
          textAlign: "center",
          padding: "60px 40px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 32,
          backdropFilter: "blur(20px)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Glow Effects */}
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 300, height: 300, background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        
        <div style={{ 
          width: 80, height: 80, borderRadius: 24, 
          background: "rgba(139,92,246,0.1)", 
          border: "1px solid rgba(139,92,246,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 32px",
          boxShadow: "0 0 30px rgba(139,92,246,0.2)"
        }}>
          <Rocket size={40} color="#8B5CF6" />
        </div>

        <h1 style={{ 
          fontSize: 42, fontWeight: 900, 
          background: "linear-gradient(to bottom, #fff, rgba(255,255,255,0.5))", 
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 16, letterSpacing: "-1.5px"
        }}>
          Neural Feed V5
        </h1>
        
        <div style={{ 
          display: "inline-flex", alignItems: "center", gap: 8, 
          padding: "6px 16px", borderRadius: 100,
          background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)",
          color: "#06B6D4", fontSize: 11, fontWeight: 900, 
          textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 24
        }}>
          <Zap size={14} fill="#06B6D4" /> Under Reconstruction
        </div>

        <p style={{ 
          fontSize: 16, color: "rgba(255,255,255,0.5)", 
          lineHeight: 1.6, marginBottom: 40, fontWeight: 500 
        }}>
          We&apos;re upgrading the Idea Engine to provide instantaneous neural synchronization and advanced collaborative filters. Tulasi AI V5 arriving very soon.
        </p>

        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "14px 28px", borderRadius: 16,
              background: "white", color: "black",
              border: "none", fontSize: 14, fontWeight: 800,
              cursor: "pointer", margin: "0 auto"
            }}
          >
            <ArrowLeft size={18} /> Return to Base
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
