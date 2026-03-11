"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["All", "System Design", "Algorithms", "AI & GenAI", "Behavioral"];

const VIDEOS = [
  {
    id: "SqqBgJvA9Z0",
    title: "System Design Interview: Design YouTube",
    channel: "System Design Interview",
    category: "System Design",
    duration: "45:12",
  },
  {
    id: "V_Pz-hM-cZ0",
    title: "Grokking the System Design Interview",
    channel: "ByteByteGo",
    category: "System Design",
    duration: "12:30",
  },
  {
    id: "zWg7U0OEAoE",
    title: "ChatGPT Architecture Explained",
    channel: "AI Explained",
    category: "AI & GenAI",
    duration: "22:15",
  },
  {
    id: "8hly31xKli0",
    title: "Algorithms: Graph Search, DFS and BFS",
    channel: "HackerRank",
    category: "Algorithms",
    duration: "16:45",
  },
  {
    id: "pTjQk93_nJk",
    title: "Amazon Leadership Principles Interview",
    channel: "Dan Croitor",
    category: "Behavioral",
    duration: "30:00",
  },
  {
    id: "q_BmsZJ8XQA",
    title: "Dynamic Programming - Learn to Solve Algorithmic Problems",
    channel: "freeCodeCamp",
    category: "Algorithms",
    duration: "5:10:00",
  }
];

export default function YouTubeLearningPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredVideos = VIDEOS.filter(v => activeCategory === "All" || v.category === activeCategory);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 16 }}>
          Tech <span className="gradient-text" style={{ background: "linear-gradient(135deg, #FF0000, #FF6B6B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Video Hub</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          Curated masterclasses and tutorials to accelerate your interview preparation and engineering skills.
        </p>
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "8px 20px", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeCategory === cat ? "rgba(255,0,0,0.15)" : "transparent",
              color: activeCategory === cat ? "#FFA2A2" : "var(--text-muted)",
              border: activeCategory === cat ? "1px solid #FF0000" : "1px solid rgba(255,255,255,0.1)"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 32 }}>
        <AnimatePresence>
          {filteredVideos.map(video => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
              className="dash-card"
              style={{ overflow: "hidden", padding: 0, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div style={{ position: "relative", paddingTop: "56.25%", width: "100%", background: "#000" }}>
                <iframe
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#FFA2A2", textTransform: "uppercase", letterSpacing: "1px" }}>{video.category}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 12 }}>{video.duration}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {video.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: "auto" }}>
                  by {video.channel}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredVideos.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60, color: "var(--text-muted)", fontSize: 16 }}>
            No videos found for this category.
          </div>
        )}
      </div>

    </div>
  );
}
