"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Sparkles, Code, Terminal, Target, Briefcase, CalendarDays, CheckCircle, Shield, BrainCircuit, PenTool, GitBranch, ArrowRight, BookOpen } from "lucide-react";

const GOALS = [
  { id: "ai", label: "AI Engineer", icon: <BrainCircuit size={18} /> },
  { id: "ds", label: "Data Scientist", icon: <Target size={18} /> },
  { id: "fs", label: "Full Stack Developer", icon: <Code size={18} /> },
  { id: "pm", label: "Product Manager", icon: <Briefcase size={18} /> },
  { id: "cs", label: "Cybersecurity", icon: <Shield size={18} /> },
  { id: "devops", label: "DevOps Engineer", icon: <Terminal size={18} /> },
  { id: "switch", label: "Career Switch", icon: <GitBranch size={18} /> },
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const TIMELINES = ["3 Months", "6 Months"];

interface RoadmapData {
  timeline: {
    week: number;
    title: string;
    focus: string;
    days: { day: number; task: string }[];
  }[];
  skills: { category: string; items: string[] }[];
  projects: { phase: string; title: string; desc: string }[];
  interviewPrep: string[];
  resumeMilestones: string[];
}

export default function PersonalizedRoadmapPage() {
  const [phase, setPhase] = useState<"input" | "loading" | "dashboard">("input");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [timeline, setTimeline] = useState("3 Months");
  const [activeTab, setActiveTab] = useState<"timeline" | "skills" | "projects" | "prep">("timeline");
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);

  const generate = async () => {
    if (!goal) return;
    setPhase("loading");
    await new Promise(r => setTimeout(r, 2500));
    
    setRoadmap({
      timeline: [
        {
          week: 1, title: "Foundation Basics", focus: "Language syntax, basic data structures",
          days: [
            { day: 1, task: "Set up development environment and IDE" },
            { day: 2, task: "Learn variables, loops, and control flow" },
            { day: 3, task: "Understand Arrays, Strings, and basic manipulation" },
            { day: 4, task: "Solve 5 easy algorithmic problems" },
            { day: 5, task: "Learn basic Git commands (commit, push, branch)" },
            { day: 6, task: "Build a simple CLI calculator" },
            { day: 7, task: "Review week 1 concepts and rest" }
          ]
        },
        {
          week: 2, title: "Core Architecture", focus: "APIs, HTTP, and Server logic",
          days: [
            { day: 8, task: "Learn how the web works (HTTP/HTTPS, DNS)" },
            { day: 9, task: "Set up a basic web server" },
            { day: 10, task: "Understand REST API principles" },
            { day: 11, task: "Create your first GET and POST endpoints" },
            { day: 12, task: "Learn about JSON data structures" },
            { day: 13, task: "Connect your server to a mock frontend" },
            { day: 14, task: "Deploy server to a free tier platform" }
          ]
        },
        {
          week: 3, title: "Database Integration", focus: "SQL vs NoSQL, basic queries",
          days: [
            { day: 15, task: "Understand relational vs non-relational DBs" },
            { day: 16, task: "Set up a local PostgreSQL or MongoDB instance" },
            { day: 17, task: "Learn basic CRUD operations" },
            { day: 18, task: "Integrate database with your web server" },
            { day: 19, task: "Learn about indexing and query optimization basics" },
            { day: 20, task: "Implement basic authentication (JWT)" },
            { day: 21, task: "Build a complete backend for a To-Do app" }
          ]
        },
        {
          week: 4, title: "Project & Portfolio", focus: "Putting it all together",
          days: [
            { day: 22, task: "Plan architecture for Milestone Project 1" },
            { day: 23, task: "Build database schema and API endpoints" },
            { day: 24, task: "Implement business logic and error handling" },
            { day: 25, task: "Write unit tests for critical functions" },
            { day: 26, task: "Write documentation (README, API docs)" },
            { day: 27, task: "Deploy complete project to production" },
            { day: 28, task: "Update Resume and LinkedIn with new project" }
          ]
        }
      ],
      skills: [
        { category: "Core Languages", items: ["Python", "JavaScript/TypeScript", "SQL"] },
        { category: "Frameworks & Tools", items: ["React", "Node.js", "Docker", "Git"] },
        { category: "Computer Science", items: ["Data Structures", "Algorithms", "System Design"] }
      ],
      projects: [
        { phase: "Month 1: Foundation", title: "CLI Task Manager", desc: "Build a command-line application using file I/O to solidify core programming logic." },
        { phase: "Month 2: Integration", title: "RESTful API Platform", desc: "Develop a robust backend service with authentication, database integration, and deployed endpoints." },
        { phase: "Month 3: Capstone", title: "Full-Stack AI Application", desc: "Integrate a 3rd-party AI API into a full-stack web app, handle state management, and deploy with CI/CD." }
      ],
      interviewPrep: [
        "Master Big O Notation (Time/Space complexity)",
        "Practice Top 50 LeetCode patterns (Sliding Window, Two Pointers, BFS/DFS)",
        "Prepare Behavioral STAR stories for past challenges",
        "Understand basic System Design trade-offs (Monolith vs Microservices)"
      ],
      resumeMilestones: [
        "Week 4: Add 'Technical Skills' section based on Month 1 learnings.",
        "Week 8: Add the Integration Project with quantifiable metrics.",
        "Week 12: Complete resume overhaul, adding Capstone Project and linking GitHub."
      ]
    });
    setPhase("dashboard");
  };

  const selectedGoalName = GOALS.find(g => g.id === goal)?.label;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #10B981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(16,185,129,0.4)" }}>
          <Map size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px", fontFamily: "var(--font-outfit)" }}>Personalized Roadmap</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 2 }}>Dynamic career planning built for your skill level</p>
        </div>
      </div>

      {phase === "input" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ padding: 32, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16 }}>Select Career Goal</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
              {GOALS.map(g => (
                <button key={g.id} onClick={() => setGoal(g.id)}
                  style={{ padding: "14px", borderRadius: 16, border: `2px solid ${goal === g.id ? "#10B981" : "rgba(255,255,255,0.08)"}`, background: goal === g.id ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}>
                  <span style={{ color: goal === g.id ? "#10B981" : "rgba(255,255,255,0.4)" }}>{g.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: goal === g.id ? "white" : "rgba(255,255,255,0.6)" }}>{g.label}</span>
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 12 }}>Current Skill Level</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setLevel(l)}
                      style={{ padding: "12px", borderRadius: 12, border: `1px solid ${level === l ? "#10B981" : "rgba(255,255,255,0.08)"}`, background: level === l ? "rgba(16,185,129,0.1)" : "transparent", color: level === l ? "#10B981" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 12 }}>Timeline Strategy</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {TIMELINES.map(t => (
                    <button key={t} onClick={() => setTimeline(t)}
                      style={{ padding: "12px", borderRadius: 12, border: `1px solid ${timeline === t ? "#10B981" : "rgba(255,255,255,0.08)"}`, background: timeline === t ? "rgba(16,185,129,0.1)" : "transparent", color: timeline === t ? "#10B981" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                      {t} {t === "3 Months" ? "(Sprint)" : "(Deep Dive)"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={generate} disabled={!goal}
              style={{ width: "100%", padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #10B981, #059669)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: !goal ? 0.5 : 1, boxShadow: !goal ? "none" : "0 14px 28px rgba(16,185,129,0.3)" }}>
              <Sparkles size={20} /> Generate Personalized Roadmap
            </button>
          </div>
        </motion.div>
      )}

      {phase === "loading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid rgba(16,185,129,0.2)", borderTopColor: "#10B981" }} />
          </motion.div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Architecting Your Future...</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Building a custom {timeline.toLowerCase()} plan for {selectedGoalName}.</p>
        </div>
      )}

      {phase === "dashboard" && roadmap && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Header Metadata */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(16,185,129,0.2)" }}>{selectedGoalName}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>{level}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>{timeline}</span>
            </div>
            <button onClick={() => setPhase("input")} style={{ padding: "8px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Reconfigure
            </button>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.08)", overflowX: "auto" }}>
            {[
              { id: "timeline", label: "Roadmap Timeline", icon: <CalendarDays size={16} /> },
              { id: "skills", label: "Required Skills", icon: <Target size={16} /> },
              { id: "projects", label: "Recommended Projects", icon: <Briefcase size={16} /> },
              { id: "prep", label: "Interview & Resume", icon: <PenTool size={16} /> },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                style={{ padding: "10px 18px", borderRadius: 14, background: activeTab === tab.id ? "rgba(16,185,129,0.1)" : "transparent", border: activeTab === tab.id ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent", color: activeTab === tab.id ? "#10B981" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              
              {/* TIMELINE TAB */}
              {activeTab === "timeline" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
                  {roadmap.timeline.map((week) => (
                    <div key={week.week} style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: `1px solid ${expandedWeek === week.week ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.06)"}`, transition: "all 0.3s" }}>
                      <div onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: "#10B981", marginBottom: 6, textTransform: "uppercase", letterSpacing: "1px" }}>Week {week.week}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 4 }}>{week.title}</div>
                          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Focus: {week.focus}</div>
                        </div>
                        <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <motion.div animate={{ rotate: expandedWeek === week.week ? 90 : 0 }}><ArrowRight size={18} color="white" /></motion.div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedWeek === week.week && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                            <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 12 }}>
                              {week.days.map(d => (
                                <div key={d.day} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                  <div style={{ padding: "4px 8px", borderRadius: 8, background: "rgba(16,185,129,0.1)", color: "#10B981", fontSize: 11, fontWeight: 800, minWidth: 50, textAlign: "center", marginTop: 2 }}>Day {d.day}</div>
                                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{d.task}</div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}

              {/* SKILLS TAB */}
              {activeTab === "skills" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                  {roadmap.skills.map((skillGroup, i) => (
                    <div key={i} style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <BookOpen size={18} color="#10B981" /> {skillGroup.category}
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {skillGroup.items.map(item => (
                          <div key={item} style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 500, display: "flex", alignItems: "center", gap: 10 }}>
                            <CheckCircle size={16} color="rgba(255,255,255,0.2)" /> {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PROJECTS TAB */}
              {activeTab === "projects" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {roadmap.projects.map((proj, i) => (
                    <div key={i} style={{ padding: 28, borderRadius: 24, background: "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(255,255,255,0.01))", border: "1px solid rgba(16,185,129,0.15)" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#10B981", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>{proj.phase}</div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 12 }}>{proj.title}</h3>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{proj.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* INTERVIEW & RESUME TAB */}
              {activeTab === "prep" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                      <Target size={20} color="#F59E0B" /> Interview Topics
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {roadmap.interviewPrep.map((prep, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", marginTop: 8 }} />
                          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{prep}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                      <PenTool size={20} color="#3B82F6" /> Resume Milestones
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {roadmap.resumeMilestones.map((milestone, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <CheckCircle size={18} color="#3B82F6" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{milestone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
