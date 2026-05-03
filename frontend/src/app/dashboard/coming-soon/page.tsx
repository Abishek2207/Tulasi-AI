"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Construction } from "lucide-react";

export default function ComingSoonPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const feature = searchParams?.get("feature") || "This Feature";

  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          maxWidth: 480,
          width: "100%",
          padding: 40,
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Glow Effects */}
        <div style={{ position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)", width: 150, height: 150, background: "rgba(139,92,246,0.3)", filter: "blur(50px)", borderRadius: "50%" }} />
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ width: 80, height: 80, margin: "0 auto 24px", background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <Construction size={32} color="#8B5CF6" />
        </motion.div>

        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.5px" }}>
          {feature} <span className="gradient-text">is Brewing</span>
        </h1>
        
        <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          We are currently building this premium module to give you the best experience. The AI models are training as we speak!
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.back()}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "white",
            padding: "10px 24px",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        >
          <ArrowLeft size={16} /> Go Back
        </motion.button>
      </motion.div>
    </div>
  );
}
