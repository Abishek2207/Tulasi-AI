"use client";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "80vh" }}>
      <motion.div 
        animate={{ opacity: [0.2, 0.5, 0.2] }} 
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} 
        style={{ width: "35%", height: 38, background: "rgba(255,255,255,0.08)", borderRadius: 12, marginBottom: 8 } as any} 
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
        {[1,2,3,4,5,6].map(i => (
          <motion.div 
            key={i}
            animate={{ opacity: [0.15, 0.4, 0.15] }} 
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.1 }} 
            style={{ height: 220, background: "rgba(255,255,255,0.05)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.02)" } as any}
          />
        ))}
      </div>
    </div>
  );
}
