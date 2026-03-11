"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COMPANIES = [
  {
    id: "google",
    name: "Google",
    color: "#4285F4",
    logo: "G",
    desc: "Renowned for algorithmic rigor. Expect dynamic programming, graphs, and deep computer science fundamentals.",
    pattern: "1 Phone Screen (45m) → 4-5 Onsite Loops (Coding, System Design, Googleyness)",
    coding: ["Word Search II", "Merge Intervals", "Longest Valid Parentheses", "Minimum Window Substring"],
    systemDesign: ["Design YouTube", "Design Google Docs", "Design Distributed Web Crawler"]
  },
  {
    id: "amazon",
    name: "Amazon",
    color: "#FF9900",
    logo: "A",
    desc: "Heavy emphasis on Leadership Principles (LPs) in every round, alongside Object-Oriented Design and scalable architectures.",
    pattern: "Online Assessment (OA) → 1 Phone Screen → 4 Onsite Loops (Bar Raiser round is critical)",
    coding: ["Number of Islands", "Two Sum", "LRU Cache", "Word Ladder"],
    systemDesign: ["Design Amazon Locker", "Design Shopping Cart Service", "Design E-commerce Checkout"]
  },
  {
    id: "meta",
    name: "Meta",
    color: "#0668E1",
    logo: "M",
    desc: "Fast-paced coding rounds where you are expected to solve 2 standard/medium problems optimally within 45 minutes.",
    pattern: "1 Phone Screen (Coding) → 4 Onsite Loops (2 Coding, 1 System Design, 1 Behavioral)",
    coding: ["Subarray Sum Equals K", "Valid Palindrome II", "Binary Tree Right Side View", "Dot Product of Two Sparse Vectors"],
    systemDesign: ["Design Facebook Newsfeed", "Design Instagram", "Design Web Sockets / Messenger"]
  },
  {
    id: "netflix",
    name: "Netflix",
    color: "#E50914",
    logo: "N",
    desc: "Unique culture evaluating highly experienced engineers. High focus on distributed systems, microservices, and extreme scale.",
    pattern: "1 Phone Screen → Take-home assignment (sometimes) → 4-5 Onsite Loops (Culture fit is huge)",
    coding: ["Group Anagrams", "Top K Frequent Elements", "Median of Two Sorted Arrays", "Merge K Sorted Lists"],
    systemDesign: ["Design Netflix Video Streaming", "Design Recommendation System", "Design CDN"]
  }
];

export default function CompanyPrepPage() {
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 16 }}>
          Company <span className="gradient-text" style={{ background: "linear-gradient(135deg, #FF9900, #4285F4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Interview Prep</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          Targeted preparation guides including interview patterns, common coding questions, and frequent system design topics.
        </p>
      </div>

      <div style={{ display: "flex", gap: 32 }}>
        
        {/* Left: Company List */}
        <div style={{ width: 300, display: "flex", flexDirection: "column", gap: 16 }}>
          {COMPANIES.map(comp => (
            <motion.div
              key={comp.id}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCompany(comp)}
              style={{
                background: selectedCompany.id === comp.id ? "rgba(255,255,255,0.05)" : "transparent",
                border: selectedCompany.id === comp.id ? `1px solid ${comp.color}` : "1px solid rgba(255,255,255,0.05)",
                padding: "20px", borderRadius: "16px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 16, transition: "all 0.2s"
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: comp.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "white" }}>
                {comp.logo}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{comp.name}</h3>
            </motion.div>
          ))}
        </div>

        {/* Right: Company Details */}
        <div className="dash-card" style={{ flex: 1, padding: 40, background: "rgba(255,255,255,0.02)", border: `1px solid ${selectedCompany.color}40` }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCompany.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: selectedCompany.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "white" }}>
                  {selectedCompany.logo}
                </div>
                <div>
                  <h2 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: "white" }}>{selectedCompany.name}</h2>
                </div>
              </div>

              <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 32, borderBottom: "1px solid var(--border)", paddingBottom: 32 }}>
                {selectedCompany.desc}
              </p>

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>📋 Interview Pattern</h3>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px 20px", borderRadius: 12, borderLeft: `4px solid ${selectedCompany.color}` }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "white" }}>{selectedCompany.pattern}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>👨‍💻 Frequent Coding</h3>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 12, padding: 0, margin: 0, listStyle: "none" }}>
                    {selectedCompany.coding.map((q, idx) => (
                      <li key={idx} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 8, fontSize: 14, color: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ color: selectedCompany.color, opacity: 0.8 }}>⚡</span> {q}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>🏗️ System Design</h3>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 12, padding: 0, margin: 0, listStyle: "none" }}>
                    {selectedCompany.systemDesign.map((topic, idx) => (
                      <li key={idx} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 8, fontSize: 14, color: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ color: selectedCompany.color, opacity: 0.8 }}>⚙️</span> {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
