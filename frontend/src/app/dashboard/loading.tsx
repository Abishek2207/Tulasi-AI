"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 40}}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(108,99,255,0.2)", borderTopColor: "#6C63FF" }}
      />
      <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Loading module...</p>
    </div>
  );
}
