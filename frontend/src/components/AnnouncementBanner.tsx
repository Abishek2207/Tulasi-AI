"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Announcement {
  id: string;
  message: string;
  type: string; // info | warning | success | error
  expires_at: string | null;
}

const COLORS = {
  info:    { bg: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.35)",   text: "#06B6D4",  icon: "ℹ️" },
  success: { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.35)",  text: "#10B981",  icon: "✅" },
  warning: { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.35)",  text: "#F59E0B",  icon: "⚠️" },
  error:   { bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.35)",   text: "#F43F5E",  icon: "🚨" },
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:10000";

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const fetch_ = async () => {
    try {
      const r = await fetch(`${API}/api/admin/announcements/public`);
      if (r.ok) {
        const d = await r.json();
        setAnnouncements(d.announcements || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetch_();
    const t = setInterval(fetch_, 60_000);
    return () => clearInterval(t);
  }, []);

  const visible = announcements.filter(a => !dismissed.has(a.id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: visible.length > 0 ? "8px 16px 0" : 0 }}>
      <AnimatePresence>
        {visible.map(a => {
          const c = COLORS[a.type as keyof typeof COLORS] || COLORS.info;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 10,
                background: c.bg, border: `1px solid ${c.border}`,
                backdropFilter: "blur(8px)",
              }}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>{c.icon}</span>
              <span style={{ flex: 1, fontSize: 13, color: c.text, fontWeight: 600, lineHeight: 1.4 }}>
                {a.message}
              </span>
              <button
                onClick={() => setDismissed(p => new Set([...p, a.id]))}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.3)", fontSize: 16, padding: "0 4px",
                  lineHeight: 1, flexShrink: 0,
                }}
              >
                ✕
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
