"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { activityApi } from "@/lib/api";

export function ActivityMap() {
  const [data, setData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      if (!token) return;
      try {
        const res = await activityApi.getAnalytics(token);
        if (res?.time_series) {
          // Map XP to 0-3 levels
          const mapped = res.time_series.map(d => {
            const val = d?.xp ?? 0;
            if (val > 500) return 3;
            if (val > 200) return 2;
            if (val > 0) return 1;
            return 0;
          });
          // Pad or slice to 147 (21x7)
          const padded = [...Array(Math.max(0, 147 - mapped.length)).fill(0), ...mapped].slice(-147);
          setData(padded);
        }
      } catch (e) {}
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const getColor = (level: number) => {
    switch (level) {
      case 1: return "rgba(139, 92, 246, 0.3)";
      case 2: return "rgba(139, 92, 246, 0.6)";
      case 3: return "rgba(6, 182, 212, 1)";
      default: return "rgba(255, 255, 255, 0.03)";
    }
  };

  if (loading) return <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, fontSize: 13, color: "var(--text-muted)" }}>Syncing activity engine...</div>;

  return (
    <div className="glass-card" style={{ padding: "28px", background: "rgba(255,255,255,0.01)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Activity Engine</h3>
          <p style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>Your engagement trajectory over the last 147 days.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>
          <span>Less</span>
          <div style={{ display: "flex", gap: 3 }}>
            {[0, 1, 2, 3].map(lvl => (
              <div key={lvl} style={{ width: 12, height: 12, borderRadius: 3, background: getColor(lvl) }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 10 }}>
        {Array.from({ length: 21 }).map((_, colIndex) => (
          <div key={colIndex} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {Array.from({ length: 7 }).map((_, rowIndex) => {
              const itemIndex = colIndex * 7 + rowIndex;
              const level = data[itemIndex] || 0;
              return (
                <motion.div
                  key={rowIndex}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: itemIndex * 0.002 }}
                  whileHover={{ scale: 1.3, zIndex: 10, outline: "1px solid rgba(255,255,255,0.3)" }}
                  style={{
                    width: 14, height: 14, borderRadius: 3, cursor: "pointer",
                    background: getColor(level),
                    boxShadow: level > 1 ? `0 0 10px ${getColor(level)}` : "none"
                  }}
                  title={`Activity Level: ${level}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
