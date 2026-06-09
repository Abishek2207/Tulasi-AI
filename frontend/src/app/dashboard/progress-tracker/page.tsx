"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, Flame, Star, Trophy, Target, TrendingUp, 
  CheckCircle, Clock, Zap, FileText, Briefcase, Code, 
  Users, MessageSquare, ArrowRight, BrainCircuit, Sparkles, ChevronRight
} from "lucide-react";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
const METRICS = {
  skillsCompleted: 12,
  projectsBuilt: 4,
  resumeScore: 88, // out of 100
  resumeImprovement: "+15%",
  interviewScore: 76, // out of 100
  interviewImprovement: "+22%",
  applicationsSent: 24,
  hackathonsJoined: 2,
  weeklyConsistency: 85, // percentage
};

const GROWTH_DATA = [
  { week: "W1", score: 40 },
  { week: "W2", score: 45 },
  { week: "W3", score: 42 },
  { week: "W4", score: 55 },
  { week: "W5", score: 62 },
  { week: "W6", score: 70 },
  { week: "W7", score: 75 },
  { week: "W8", score: 82 },
];

const DAILY_MISSIONS = [
  { id: 1, task: "Complete 2 System Design Questions", xp: 50, category: "Tech", done: true },
  { id: 2, task: "Do a 20-min AI Mock Interview", xp: 100, category: "Interview", done: false },
  { id: 3, task: "Apply to 3 early-stage startups", xp: 30, category: "Career", done: false },
];

const WEEKLY_REPORT = {
  summary: "You had a highly productive week, boosting your interview score significantly. Consistency is key.",
  highlights: [
    "Aced the 'React System Design' mock interview.",
    "Resume ATS score jumped from 73 to 88.",
    "Maintained a 6-day coding streak."
  ],
  weaknesses: [
    "You skipped behavioral interview prep.",
    "No new GitHub commits in the last 3 days."
  ]
};

const AI_FEEDBACK = {
  coach: "Abishek's Neural Assistant",
  message: "Your technical skills are solidifying, but your behavioral responses need more STAR method structure. Let's focus on leadership questions this week.",
  nextAction: "Schedule a Behavioral Mock Interview focused on 'Conflict Resolution'."
};

// ─── COMPONENT ─────────────────────────────────────────────────────────────
export default function ProgressTrackerPage() {
  const [missions, setMissions] = useState(DAILY_MISSIONS);
  const [activeTab, setActiveTab] = useState<"overview" | "report">("overview");

  const toggleMission = (id: number) => {
    setMissions(missions.map(m => m.id === id ? { ...m, done: !m.done } : m));
  };

  const totalXP = missions.filter(m => m.done).reduce((sum, m) => sum + m.xp, 0);
  const maxXP = missions.reduce((sum, m) => sum + m.xp, 0);
  const progressPercent = Math.round((totalXP / maxXP) * 100) || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(139,92,246,0.4)" }}>
          <TrendingUp size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>Progress Tracker</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Monitor your career velocity, daily missions, and AI feedback.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16 }}>
        {[
          { id: "overview", label: "Overview & Missions" },
          { id: "report", label: "Weekly AI Report" }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            style={{ padding: "10px 20px", borderRadius: 14, background: activeTab === t.id ? "rgba(139,92,246,0.1)" : "transparent", border: activeTab === t.id ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent", color: activeTab === t.id ? "#8B5CF6" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Top Metrics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { label: "Skills Completed", val: METRICS.skillsCompleted, icon: <Target size={18} color="#10B981" />, bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" },
              { label: "Projects Built", val: METRICS.projectsBuilt, icon: <Code size={18} color="#3B82F6" />, bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)" },
              { label: "Resume Score", val: `${METRICS.resumeScore}/100`, sub: METRICS.resumeImprovement, icon: <FileText size={18} color="#F59E0B" />, bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", subColor: "#10B981" },
              { label: "Interview Score", val: `${METRICS.interviewScore}/100`, sub: METRICS.interviewImprovement, icon: <MessageSquare size={18} color="#EC4899" />, bg: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.2)", subColor: "#10B981" },
              { label: "Applications", val: METRICS.applicationsSent, icon: <Briefcase size={18} color="#8B5CF6" />, bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)" },
              { label: "Hackathons", val: METRICS.hackathonsJoined, icon: <Users size={18} color="#F43F5E" />, bg: "rgba(244,63,94,0.1)", border: "rgba(244,63,94,0.2)" },
            ].map((stat, i) => (
              <div key={i} className="glass-card hover-lift" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: stat.bg, border: `1px solid ${stat.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {stat.icon}
                  </div>
                  {stat.sub && (
                    <div style={{ fontSize: 12, fontWeight: 800, color: stat.subColor, background: `${stat.subColor}20`, padding: "4px 8px", borderRadius: 8 }}>
                      ↗ {stat.sub}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 4 }}>{stat.val}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Career Growth Graph */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: 8 }}>
                  <TrendingUp size={18} color="#8B5CF6" /> Career Readiness Graph
                </h3>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Last 8 Weeks</div>
              </div>
              
              {/* Custom SVG Graph */}
              <div style={{ height: 200, width: "100%", position: "relative", paddingBottom: 20 }}>
                <svg width="100%" height="100%" viewBox="0 0 400 180" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((val, i) => (
                    <g key={i}>
                      <line x1="0" y1={180 - (val * 1.8)} x2="400" y2={180 - (val * 1.8)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <text x="0" y={180 - (val * 1.8) - 5} fill="rgba(255,255,255,0.3)" fontSize="10">{val}</text>
                    </g>
                  ))}
                  
                  {/* Area path */}
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  {/* Draw the line */}
                  <path 
                    d={`M 0,${180 - (GROWTH_DATA[0].score * 1.8)} ` + GROWTH_DATA.map((d, i) => `L ${i * (400 / 7)},${180 - (d.score * 1.8)}`).join(" ")}
                    fill="none" 
                    stroke="#8B5CF6" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Fill Area */}
                  <path 
                    d={`M 0,${180 - (GROWTH_DATA[0].score * 1.8)} ` + GROWTH_DATA.map((d, i) => `L ${i * (400 / 7)},${180 - (d.score * 1.8)}`).join(" ") + ` L 400,180 L 0,180 Z`}
                    fill="url(#colorScore)" 
                  />

                  {/* Data Points */}
                  {GROWTH_DATA.map((d, i) => (
                    <circle key={i} cx={i * (400 / 7)} cy={180 - (d.score * 1.8)} r="4" fill="#0A0A0C" stroke="#8B5CF6" strokeWidth="2" />
                  ))}
                </svg>
                
                {/* X Axis Labels */}
                <div style={{ display: "flex", justifyContent: "space-between", position: "absolute", bottom: -5, left: 0, right: 0, paddingLeft: 0 }}>
                  {GROWTH_DATA.map((d, i) => (
                    <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{d.week}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Missions */}
            <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: 8 }}>
                  <Target size={18} color="#F59E0B" /> Daily Missions
                </h3>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#F59E0B", background: "rgba(245,158,11,0.1)", padding: "4px 10px", borderRadius: 10 }}>
                  {progressPercent}% Complete
                </div>
              </div>

              <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5 }}
                  style={{ height: "100%", background: "linear-gradient(90deg, #F59E0B, #F97316)", borderRadius: 10 }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                {missions.map(m => (
                  <div key={m.id} onClick={() => toggleMission(m.id)}
                    style={{ padding: 16, borderRadius: 16, background: m.done ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${m.done ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${m.done ? "#10B981" : "rgba(255,255,255,0.2)"}`, background: m.done ? "#10B981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {m.done && <CheckCircle size={14} color="white" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: m.done ? "rgba(255,255,255,0.5)" : "white", textDecoration: m.done ? "line-through" : "none" }}>{m.task}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{m.category}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: m.done ? "rgba(16,185,129,0.6)" : "#F59E0B" }}>
                      +{m.xp} XP
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "report" && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="glass-card" style={{ padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <BrainCircuit size={28} color="#8B5CF6" />
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "white" }}>Weekly AI Diagnosis</h2>
              </div>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: 32 }}>
                "{WEEKLY_REPORT.summary}"
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ padding: 20, borderRadius: 16, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: "#10B981", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={16}/> Highlights</h4>
                  <ul style={{ margin: 0, paddingLeft: 16, color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.7 }}>
                    {WEEKLY_REPORT.highlights.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </div>
                
                <div style={{ padding: 20, borderRadius: 16, background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.15)" }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: "#F43F5E", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Target size={16}/> Areas to Improve</h4>
                  <ul style={{ margin: 0, paddingLeft: 16, color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.7 }}>
                    {WEEKLY_REPORT.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Action Card */}
            <div className="glass-card premium-glow" style={{ padding: 24, border: "1px solid rgba(139,92,246,0.3)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Next Recommended Action</div>
              <p style={{ fontSize: 15, color: "white", lineHeight: 1.5, marginBottom: 20 }}>{AI_FEEDBACK.nextAction}</p>
              <button className="btn-primary" style={{ width: "100%" }}>Take Action <ArrowRight size={16}/></button>
            </div>

            {/* Coach Feedback */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #2563EB)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BrainCircuit size={16} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{AI_FEEDBACK.coach}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Live Feedback</div>
                </div>
              </div>
              <div style={{ padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.03)", fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                {AI_FEEDBACK.message}
              </div>
            </div>
          </div>

        </motion.div>
      )}

    </motion.div>
  );
}
