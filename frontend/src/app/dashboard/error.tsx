"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error("Dashboard feature error:", error);
  }, [error]);

  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 40 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ padding: 40, borderRadius: 24, textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Something went wrong!</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
          We encountered an issue loading this feature. Please try again.
        </p>
        <button 
          onClick={() => reset()}
          style={{ background: "var(--brand-primary)", color: "white", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 600, cursor: "pointer", width: "100%" }}
        >
          Try again
        </button>
      </motion.div>
    </div>
  );
}
