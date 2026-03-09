"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const mockHistory = [
  { id: "1", title: "React Hooks Deep Dive", messages: 12, date: "Today, 2:30 PM", preview: "We discussed useState, useEffect, and custom hooks..." },
  { id: "2", title: "Python Career Path", messages: 8, date: "Yesterday, 5:15 PM", preview: "Explored data science vs backend development path..." },
  { id: "3", title: "DSA Interview Prep", messages: 24, date: "Mar 5, 10:00 AM", preview: "Binary search, dynamic programming, graph algorithms..." },
  { id: "4", title: "Resume Review Session", messages: 6, date: "Mar 4, 3:45 PM", preview: "Improved professional summary and skill bullet points..." },
];

export default function HistoryPage() {
  const [selected, setSelected] = useState<typeof mockHistory[0] | null>(null);
  const [search, setSearch] = useState("");

  const filtered = mockHistory.filter(h => h.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "Outfit" }}>💬 Chat History</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>All your past AI conversations</p>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search conversations..." className="input-field" style={{ marginBottom: 24, maxWidth: 400 }} />

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((h, i) => (
            <motion.div key={h.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(selected?.id === h.id ? null : h)}
              style={{
                padding: "16px 20px",
                background: selected?.id === h.id ? "rgba(108,99,255,0.1)" : "var(--bg-card)",
                border: `1px solid ${selected?.id === h.id ? "rgba(108,99,255,0.3)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 14,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              whileHover={{ borderColor: "rgba(108,99,255,0.2)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{h.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{h.date}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.preview}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <span className="badge" style={{ background: "rgba(108,99,255,0.1)", color: "#6C63FF", border: "1px solid rgba(108,99,255,0.2)", fontSize: 10 }}>💬 {h.messages} messages</span>
              </div>
            </motion.div>
          ))}
        </div>

        {selected && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="stat-card" style={{ height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{selected.title}</h3>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>✕</button>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16 }}>{selected.preview}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ flex: 1, background: "linear-gradient(135deg,#6C63FF,#4ECDC4)", border: "none", borderRadius: 8, padding: "9px", color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Continue Chat</button>
              <button style={{ background: "transparent", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 8, padding: "9px 14px", color: "#FF6B6B", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>🗑</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
