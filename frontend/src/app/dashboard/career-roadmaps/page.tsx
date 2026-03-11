"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ROADMAPS = [
  {
    id: "swe",
    title: "Software Engineer",
    color: "#4ECDC4",
    desc: "The standard path to becoming a generalist SWE at top tech companies.",
    skills: ["Data Structures & Algorithms", "System Design", "Backend APIs", "Frontend Basics", "Databases (SQL/NoSQL)"],
    projects: [
      "RESTful API with authentication",
      "Full-stack E-commerce store",
      "Real-time chat application"
    ],
    milestones: [
      { name: "Master core language (Python/Java/C++)", duration: "1 month" },
      { name: "Complete LeetCode Blind 75", duration: "2 months" },
      { name: "Build 2 full-stack projects", duration: "1.5 months" },
      { name: "Study System Design (Grokking)", duration: "3 weeks" },
      { name: "Mock Interviews & Apply", duration: "Ongoing" }
    ]
  },
  {
    id: "ai",
    title: "AI Engineer",
    color: "#6C63FF",
    desc: "Focus on implementing LLMs, RAG architectures, and traditional machine learning pipelines.",
    skills: ["Python", "PyTorch / TensorFlow", "Vector Databases", "LangChain", "Hugging Face"],
    projects: [
      "Document Q&A bot (RAG)",
      "Image classification pipeline",
      "Custom fine-tuned LLM"
    ],
    milestones: [
      { name: "Linear Algebra & Probability", duration: "3 weeks" },
      { name: "ML Algorithms (Scikit-learn)", duration: "1 month" },
      { name: "Deep Learning basics (PyTorch)", duration: "1 month" },
      { name: "LLMs, Transformers & Prompt Engineering", duration: "1 month" },
      { name: "Deploy full RAG application", duration: "1 month" }
    ]
  },
  {
    id: "frontend",
    title: "Frontend Developer",
    color: "#FF6B6B",
    desc: "Specialize in building beautiful, accessible, and performant user interfaces.",
    skills: ["HTML/CSS/JS", "React / Next.js", "State Management", "CSS Frameworks", "Web Performance"],
    projects: [
      "Responsive portfolio website",
      "Dashboard with complex state",
      "PWA with offline support"
    ],
    milestones: [
      { name: "Advanced JS & DOM Manipulation", duration: "1 month" },
      { name: "React fundamentals & Hooks", duration: "3 weeks" },
      { name: "Next.js & SSR/SSG", duration: "1 month" },
      { name: "CSS mastery (Tailwind, Animations)", duration: "3 weeks" },
      { name: "Web Accessibility & Testing", duration: "3 weeks" }
    ]
  }
];

export default function CareerRoadmapsPage() {
  const [activeTab, setActiveTab] = useState(ROADMAPS[0].id);
  const activeRoadmap = ROADMAPS.find(r => r.id === activeTab)!;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 16 }}>
          Career <span className="gradient-text" style={{ background: "linear-gradient(135deg, #FF6B6B, #4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Roadmaps</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          Step-by-step guides to mastering the skills needed for top tech roles.
        </p>
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        
        {/* Left Nav */}
        <div style={{ width: 250, display: "flex", flexDirection: "column", gap: 12 }}>
          {ROADMAPS.map(roadmap => (
            <button
              key={roadmap.id}
              onClick={() => setActiveTab(roadmap.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", 
                borderRadius: 16, border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700,
                background: activeTab === roadmap.id ? `rgba(${parseInt(roadmap.color.slice(1,3), 16)},${parseInt(roadmap.color.slice(3,5), 16)},${parseInt(roadmap.color.slice(5,7), 16)}, 0.1)` : "transparent",
                color: activeTab === roadmap.id ? "white" : "var(--text-muted)",
                boxShadow: activeTab === roadmap.id ? `inset 3px 0 0 ${roadmap.color}` : "none",
                transition: "all 0.2s ease"
              }}
            >
              {roadmap.title}
            </button>
          ))}
          
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)", textAlign: "center" }}>
             <a href="/dashboard/roadmaps" style={{ color: "#4ECDC4", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
               ✨ Generate Custom AI Roadmap
             </a>
          </div>
        </div>

        {/* Right Content */}
        <div className="dash-card" style={{ flex: 1, padding: 40, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRoadmap.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: activeRoadmap.color }}>{activeRoadmap.title}</h2>
              <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 32 }}>
                {activeRoadmap.desc}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
                {/* Skills */}
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 24, borderRadius: 16, border: "1px solid var(--border)" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>🛠️ Required Skills</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {activeRoadmap.skills.map(s => (
                       <span key={s} style={{ padding: "4px 12px", background: "rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 24, borderRadius: 16, border: "1px solid var(--border)" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>🚀 Projects to Build</h3>
                  <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                    {activeRoadmap.projects.map(p => (
                       <li key={p} style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                         <span style={{ color: activeRoadmap.color }}>👉</span> {p}
                       </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Milestones Timeline */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 24 }}>🛣️ Step-by-Step Path</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 16, borderLeft: `2px solid ${activeRoadmap.color}`, paddingLeft: 24, marginLeft: 12 }}>
                  {activeRoadmap.milestones.map((m, idx) => (
                    <div key={idx} style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: -31, top: 4, width: 12, height: 12, borderRadius: "50%", background: "var(--background)", border: `2px solid ${activeRoadmap.color}` }} />
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 4 }}>{m.name}</h4>
                      <span style={{ fontSize: 12, color: activeRoadmap.color, fontWeight: 600, background: `rgba(${parseInt(activeRoadmap.color.slice(1,3), 16)},${parseInt(activeRoadmap.color.slice(3,5), 16)},${parseInt(activeRoadmap.color.slice(5,7), 16)}, 0.1)`, padding: "2px 8px", borderRadius: 4 }}>
                        Time: {m.duration}
                      </span>
                    </div>
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
