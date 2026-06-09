"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Flame, Star, Trophy, Target, TrendingUp, CheckCircle, Clock, Zap, GitCommit, Award, ChevronRight } from "lucide-react";

const SKILLS = [
  { name: "Data Structures & Algorithms", level: 72, target: 90, category: "CS Core" },
  { name: "System Design", level: 45, target: 85, category: "CS Core" },
  { name: "React / Next.js", level: 88, target: 95, category: "Frontend" },
  { name: "Node.js / Express", level: 70, target: 85, category: "Backend" },
  { name: "PostgreSQL", level: 60, target: 80, category: "Backend" },
  { name: "Docker & DevOps", level: 38, target: 75, category: "Infrastructure" },
  { name: "Machine Learning", level: 30, target: 70, category: "AI/ML" },
];

const WEEKLY_ACTIVITY = [12, 8, 15, 6, 20, 14, 18];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const BADGES = [
  { icon: "🔥", label: "7-Day Streak", earned: true },
  { icon: "💡", label: "First Project", earned: true },
  { icon: "🎯", label: "DSA 50", earned: true },
  { icon: "🚀", label: "Deployed Live", earned: true },
  { icon: "🏆", label: "Mock Interview Ace", earned: false },
  { icon: "🌟", label: "100-Day Streak", earned: false },
];

const TASKS = [
  { task: "Complete 3 LeetCode medium problems", done: true, xp: 30 },
  { task: "Read System Design chapter: Load Balancers", done: true, xp: 20 },
  { task: "Push project commit to GitHub", done: true, xp: 15 },
  { task: "Complete today's mock interview question", done: false, xp: 40 },
  { task: "Update resume with latest project", done: false, xp: 25 },
];

export default function ProgressTrackerPage() {
  const [completedTasks, setCompletedTasks] = useState<number[]>([0, 1, 2]);

  const toggleTask = (i: number) => {
    setCompletedTasks(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const totalXP = TASKS.filter((_, i) => completedTasks.includes(i)).reduce((a, t) => a + t.xp, 0);
  const maxXP = TASKS.reduce((a, t) => a + t.xp, 0);

  const getSkillColor = (level: number) => level >= 75 ? "#10B981" : level >= 50 ? "#F59E0B" : "#F43F5E";
  const maxActivity = Math.max(...WEEKLY_ACTIVITY);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #6366F1, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(99,102,241,0.4)" }}>
          <BarChart3 size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>Progress Tracker</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Gamified skill mastery and daily momentum dashboard</p>
        </div>
      </div>

      {/* Top Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Current Streak", val: "14 days", icon: <Flame size={20} color="#F43F5E" />, accent: "#F43F5E" },
          { label: "Total XP", val: "4,820", icon: <Zap size={20} color="#F59E0B" />, accent: "#F59E0B" },
          { label: "Level", val: "Level 12", icon: <Star size={20} color="#8B5CF6" />, accent: "#8B5CF6" },
          { label: "Problems Solved", val: "143", icon: <Target size={20} color="#10B981" />, accent: "#10B981" },
        ].map((stat, i) => (
          <div key={i} style={{ padding: "20px", borderRadius: 20, background: "rgba(255,255,255,0.02)", border: `1px solid ${stat.accent}22`, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: `${stat.accent}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "white" }}>{stat.val}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* XP Progress Bar */}
      <div style={{ padding: 24, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={16} color="#F59E0B" /> Today&apos;s XP Progress
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#F59E0B" }}>{totalXP} / {maxXP} XP</div>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${(totalXP / maxXP) * 100}%` }} transition={{ duration: 1, ease: "easeOut" }}
            style={{ height: "100%", background: "linear-gradient(90deg, #F59E0B, #F97316)", borderRadius: 10 }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Skill Mastery */}
        <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color="#6366F1" /> Skill Mastery
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {SKILLS.map((skill) => (
              <div key={skill.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{skill.name}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>{skill.category}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: getSkillColor(skill.level) }}>{skill.level}%</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden", position: "relative" }}>
                  {/* Target marker */}
                  <div style={{ position: "absolute", left: `${skill.target}%`, top: 0, width: 2, height: "100%", background: "rgba(255,255,255,0.15)", zIndex: 2 }} />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} transition={{ duration: 1, ease: "easeOut" }}
                    style={{ height: "100%", background: getSkillColor(skill.level), borderRadius: 10 }} />
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3, textAlign: "right" }}>Target: {skill.target}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Activity + Badges */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Weekly Activity */}
          <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <GitCommit size={18} color="#10B981" /> This Week&apos;s Activity
            </h3>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 100 }}>
              {WEEKLY_ACTIVITY.map((val, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxActivity) * 80}px` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    style={{ width: "100%", borderRadius: 6, background: i === 6 ? "linear-gradient(180deg, #6366F1, #4F46E5)" : "rgba(99,102,241,0.25)" }}
                  />
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{DAYS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Award size={18} color="#F59E0B" /> Badges
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {BADGES.map((badge, i) => (
                <div key={i} style={{ padding: "14px 10px", borderRadius: 14, background: badge.earned ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${badge.earned ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)"}`, textAlign: "center", opacity: badge.earned ? 1 : 0.4 }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{badge.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: badge.earned ? "white" : "rgba(255,255,255,0.4)", lineHeight: 1.3 }}>{badge.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Tasks */}
      <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={18} color="#6366F1" /> Today&apos;s Tasks
          <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{completedTasks.length}/{TASKS.length} done</span>
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TASKS.map((task, i) => (
            <motion.div key={i} whileHover={{ x: 4 }}
              onClick={() => toggleTask(i)}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 16, background: completedTasks.includes(i) ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${completedTasks.includes(i) ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)"}`, cursor: "pointer", transition: "all 0.2s" }}>
              <CheckCircle size={20} color={completedTasks.includes(i) ? "#10B981" : "rgba(255,255,255,0.15)"} />
              <span style={{ flex: 1, fontSize: 14, color: completedTasks.includes(i) ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.85)", fontWeight: 500, textDecoration: completedTasks.includes(i) ? "line-through" : "none" }}>{task.task}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#F59E0B", background: "rgba(245,158,11,0.1)", padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(245,158,11,0.2)" }}>+{task.xp} XP</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
