"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BrainCircuit, ChevronRight } from "lucide-react";
import { hackathonApi, Hackathon } from "@/lib/api";

export default function AIRecommender() {
  const [recs, setRecs] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  useEffect(() => {
    if (!token) return;
    hackathonApi.recommend(token)
      .then(data => setRecs(data.recommendations || []))
      .catch(() => setRecs([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading && recs.length === 0) return null;
  if (!loading && recs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card"
      style={{
        padding: "24px",
        background: "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(6,182,212,0.1) 100%)",
        border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: 24,
        marginBottom: 40,
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1 }}>
        <BrainCircuit size={120} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ 
          width: 32, height: 32, borderRadius: "50%", background: "var(--brand-primary)", 
          display: "flex", alignItems: "center", justifyContent: "center", color: "white" 
        }}>
          <Sparkles size={16} />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: "white" }}>AI Matchmaking</h3>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>We've found {recs.length} events that perfectly match your skill profile.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none" }}>
        {recs.map((h, i) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              minWidth: 280, padding: 16, borderRadius: 16, 
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              display: "flex", gap: 12, alignItems: "center", cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
            whileHover={{ y: -4, background: "rgba(255,255,255,0.05)" }}
          >
            <img src={h.image_url} style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "white", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: 160 }}>{h.title}</div>
              <div style={{ fontSize: 11, color: "var(--brand-primary)", fontWeight: 700 }}>{h.prize_pool}</div>
            </div>
            <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
