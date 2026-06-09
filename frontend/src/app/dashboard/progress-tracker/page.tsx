"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target, BookOpen, Trophy, Clock, CheckCircle2, Flame, Award } from "lucide-react";

const STATS = [
  { label: "Learning Streak", value: "14 Days", icon: <Flame size={18} color="#F97316" />, color: "#F97316" },
  { label: "Skills Mastered", value: "8/24", icon: <Award size={18} color="#8B5CF6" />, color: "#8B5CF6" },
  { label: "Hours Learned", value: "120h", icon: <Clock size={18} color="#06B6D4" />, color: "#06B6D4" },
  { label: "Global Rank", value: "Top 12%", icon: <Trophy size={18} color="#F59E0B" />, color: "#F59E0B" },
];

const SKILLS = [
  { name: "React.js", progress: 85, color: "#06B6D4" },
  { name: "Node.js", progress: 60, color: "#10B981" },
  { name: "System Design", progress: 30, color: "#8B5CF6" },
  { name: "Algorithms", progress: 45, color: "#F59E0B" },
];

export default function ProgressTrackerPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #10B981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(16,185,129,0.4)" }}>
          <TrendingUp size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px", fontFamily: "var(--font-outfit)" }}>Progress Tracker</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Monitor your journey to becoming a top-tier engineer</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {STATS.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            style={{ padding: "20px", borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase" }}>{stat.label}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "white" }}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Skill Progress */}
          <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <Target size={18} color="#10B981" /> Skill Mastery Map
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {SKILLS.map((skill, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{skill.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: skill.color }}>{skill.progress}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 10, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${skill.progress}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                      style={{ height: "100%", background: skill.color, borderRadius: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Achievements */}
          <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <Trophy size={18} color="#F59E0B" /> Recent Milestones
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { title: "React Fundamentals Completed", date: "Today", icon: <CheckCircle2 size={20} color="#10B981" /> },
                { title: "First AI Project Generated", date: "Yesterday", icon: <CheckCircle2 size={20} color="#10B981" /> },
                { title: "ATS Score > 80 achieved", date: "3 days ago", icon: <CheckCircle2 size={20} color="#10B981" /> },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px", borderRadius: 16, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)" }}>
                  {m.icon}
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{m.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Next Actions */}
          <div style={{ padding: 24, borderRadius: 24, background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(255,255,255,0.02))", border: "1px solid rgba(139,92,246,0.2)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={16} color="#8B5CF6" /> Next Recommended Action
            </h2>
            <div style={{ padding: "16px", borderRadius: 16, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 6 }}>Mock Interview</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, marginBottom: 16 }}>You've hit 85% in React. It's time to test your knowledge with the AI Interviewer.</p>
              <button style={{ width: "100%", padding: "12px", borderRadius: 12, background: "#8B5CF6", color: "white", fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer" }}>
                Start Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
