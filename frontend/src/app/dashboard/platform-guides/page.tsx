"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GUIDES = [
  {
    id: "leetcode",
    name: "LeetCode",
    color: "#FFA116",
    logo: "💻",
    description: "The gold standard for technical interview preparation, especially for FAANG companies.",
    tips: [
      "Filter by company tags to study recent questions.",
      "Always read the discussion section for optimal solutions.",
      "Don't spend more than 45 minutes stuck on a single problem."
    ],
    paths: [
      { name: "Top Interview 150", desc: "A curated list of the most classic interview questions.", url: "https://leetcode.com/studyplan/top-interview-150/" },
      { name: "LeetCode 75", desc: "Essential questions for a solid foundation.", url: "https://leetcode.com/studyplan/leetcode-75/" }
    ]
  },
  {
    id: "gfg",
    name: "GeeksForGeeks",
    color: "#2F8D46",
    logo: "🤓",
    description: "Excellent resource for theoretical concepts, CS fundamentals, and standard algorithmic patterns.",
    tips: [
      "Use GFG primarily to learn new data structures from scratch.",
      "Read the editorial explanations before jumping to code.",
      "Great for practicing language-specific implementation details."
    ],
    paths: [
      { name: "Must Do Coding Questions", desc: "Topic-wise standard questions asked in product-based companies.", url: "https://practice.geeksforgeeks.org/explore?page=1&category[]=Arrays" },
      { name: "SDE Sheet", desc: "A comprehensive roadmap for Software Engineering interviews.", url: "https://www.geeksforgeeks.org/sde-sheet-a-complete-guide-for-sde-preparation/" }
    ]
  },
  {
    id: "hackerrank",
    name: "HackerRank",
    color: "#00EA64",
    logo: "🏆",
    description: "Best platform for beginners to learn language syntax and for participating in initial screening rounds.",
    tips: [
      "Complete the language proficiency badges (e.g., Python, SQL) to build confidence.",
      "Familiarize yourself with the environment as many companies use it for OAs.",
      "Focus on the Problem Solving section for algorithmic practice."
    ],
    paths: [
      { name: "Interview Preparation Kit", desc: "Challenges organized around core concepts.", url: "https://www.hackerrank.com/interview/interview-preparation-kit" },
      { name: "10 Days of JavaScript", desc: "Quick crash course on language fundamentals.", url: "https://www.hackerrank.com/domains/tutorials/10-days-of-javascript" }
    ]
  }
];

export default function PlatformGuidesPage() {
  const [activeTab, setActiveTab] = useState(GUIDES[0].id);

  const activeGuide = GUIDES.find(g => g.id === activeTab)!;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 16 }}>
          Platform <span className="gradient-text" style={{ background: "linear-gradient(135deg, #FF6B6B, #4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Mastery Guides</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          Learn how to effectively use the top coding platforms to maximize your interview success rate.
        </p>
      </div>

      <div className="mobile-stack" style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        
        {/* Left Nav */}
        <div style={{ width: "100%", maxWidth: 250, display: "flex", flexDirection: "column", gap: 12 }}>
          {GUIDES.map(guide => (
            <button
              key={guide.id}
              onClick={() => setActiveTab(guide.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", 
                borderRadius: 16, border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700,
                background: activeTab === guide.id ? `linear-gradient(135deg, rgba(255,255,255,0.1), transparent)` : "transparent",
                color: activeTab === guide.id ? "white" : "var(--text-muted)",
                boxShadow: activeTab === guide.id ? `inset 2px 0 0 ${guide.color}` : "none",
                transition: "all 0.2s ease"
              }}
            >
              <span style={{ fontSize: 24, filter: activeTab === guide.id ? "grayscale(0)" : "grayscale(1)", opacity: activeTab === guide.id ? 1 : 0.5 }}>{guide.logo}</span>
              {guide.name}
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="dash-card" style={{ flex: 1, padding: 32, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGuide.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: activeGuide.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                  {activeGuide.logo}
                </div>
                <div>
                  <h2 style={{ fontSize: 28, fontWeight: 800 }}>{activeGuide.name}</h2>
                </div>
              </div>

              <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid var(--border)" }}>
                {activeGuide.description}
              </p>

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>💡 Pro Tips for Practice</h3>
                <ul style={{ display: "flex", flexDirection: "column", gap: 12, padding: 0, margin: 0, listStyle: "none" }}>
                  {activeGuide.tips.map((tip, idx) => (
                    <li key={idx} style={{ display: "flex", gap: 12, fontSize: 15, color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>
                      <span style={{ color: activeGuide.color }}>✓</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                 <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>🗺️ Recommended Problem Paths</h3>
                 <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                   {activeGuide.paths.map((path, idx) => (
                     <a key={idx} href={path.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                       <div style={{ padding: 20, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = `rgba(${parseInt(activeGuide.color.slice(1,3), 16)},${parseInt(activeGuide.color.slice(3,5), 16)},${parseInt(activeGuide.color.slice(5,7), 16)}, 0.1)`} onMouseOut={e => e.currentTarget.style.background = "rgba(0,0,0,0.3)"}>
                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                           <h4 style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{path.name}</h4>
                           <span style={{ color: activeGuide.color }}>↗</span>
                         </div>
                         <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>{path.desc}</p>
                       </div>
                     </a>
                   ))}
                 </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
