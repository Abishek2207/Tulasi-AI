"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { useSession } from "@/hooks/useSession";
import {
  Code2, ChevronRight, ExternalLink, CheckCircle2,
  Circle, BarChart3, Target, BookOpen, Zap, Lock,
} from "lucide-react";

const DSA_TOPICS = [
  { name: "Arrays & Strings",       slug: "arrays-strings",    done: 0, total: 20, lc: "https://leetcode.com/tag/array/" },
  { name: "Linked Lists",           slug: "linked-list",       done: 0, total: 15, lc: "https://leetcode.com/tag/linked-list/" },
  { name: "Stacks & Queues",        slug: "stack-queue",       done: 0, total: 12, lc: "https://leetcode.com/tag/stack/" },
  { name: "Trees & BST",            slug: "trees",             done: 0, total: 18, lc: "https://leetcode.com/tag/binary-tree/" },
  { name: "Graphs & BFS/DFS",       slug: "graphs",            done: 0, total: 16, lc: "https://leetcode.com/tag/graph/" },
  { name: "Dynamic Programming",    slug: "dp",                done: 0, total: 22, lc: "https://leetcode.com/tag/dynamic-programming/" },
  { name: "Heaps & Priority Queue", slug: "heap",              done: 0, total: 10, lc: "https://leetcode.com/tag/heap-priority-queue/" },
  { name: "Recursion & Backtracking",slug: "backtracking",     done: 0, total: 14, lc: "https://leetcode.com/tag/backtracking/" },
];

const DAILY_PROBLEMS = [
  { id: "two-sum",     title: "Two Sum",             difficulty: "Easy",   url: "https://leetcode.com/problems/two-sum/" },
  { id: "lru-cache",   title: "LRU Cache",           difficulty: "Medium", url: "https://leetcode.com/problems/lru-cache/" },
  { id: "word-ladder", title: "Word Ladder",         difficulty: "Hard",   url: "https://leetcode.com/problems/word-ladder/" },
];

const DIFF_COLOR: Record<string, string> = { Easy: "#10B981", Medium: "#F59E0B", Hard: "#F43F5E" };

export default function DSAAgentPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [solved, setSolved] = useState<Set<string>>(new Set());

  const hasProfile = user?.is_onboarded;
  const totalDone  = DSA_TOPICS.reduce((a, t) => a + t.done, 0);
  const totalProbs = DSA_TOPICS.reduce((a, t) => a + t.total, 0);

  const toggleSolved = (id: string) =>
    setSolved(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (!hasProfile) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60 }}>
        <Header />
        <EmptyState
          icon={Lock}
          title="Profile Required"
          description="Complete your onboarding profile first. The DSA Agent needs your year of study, current skill level, and target role to generate a real personalized plan."
          ctaLabel="Complete Profile →"
          ctaHref="/onboarding"
          accent="#8B5CF6"
        />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 80 }}>
      <Header />

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Topics Covered",   val: `${totalDone} / ${totalProbs}`, icon: <BarChart3 size={18} color="#8B5CF6" />, accent: "#8B5CF6" },
          { label: "Today's Streak",   val: "0 days",                       icon: <Zap size={18} color="#F59E0B" />,       accent: "#F59E0B" },
          { label: "Daily Solved",     val: `${solved.size} / 3`,           icon: <Target size={18} color="#10B981" />,    accent: "#10B981" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "20px 24px", borderRadius: 20,
            background: `${s.accent}08`, border: `1px solid ${s.accent}20`,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.accent}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "white" }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Data-source notice */}
      <div style={{
        padding: "12px 18px", borderRadius: 12, marginBottom: 28,
        background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
        display: "flex", alignItems: "center", gap: 10,
        fontSize: 13, color: "rgba(255,255,255,0.5)",
      }}>
        <BookOpen size={15} color="#F59E0B" />
        Problem tracking syncs when you connect your LeetCode profile. Progress below reflects your manual check-offs only.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        {/* Topic List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 4 }}>Topic Progress</h3>
          {DSA_TOPICS.map(topic => {
            const pct = topic.total ? Math.round((topic.done / topic.total) * 100) : 0;
            const barColor = pct >= 70 ? "#10B981" : pct >= 40 ? "#F59E0B" : "#8B5CF6";
            return (
              <div key={topic.slug} style={{
                padding: "16px 20px", borderRadius: 16,
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{topic.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{topic.done}/{topic.total}</span>
                    <a href={topic.lc} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, fontWeight: 700, color: "#8B5CF6", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}
                      onClick={e => e.stopPropagation()}>
                      Practice <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 6, transition: "width 0.5s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Daily Problems */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 12 }}>Today&apos;s Problems</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {DAILY_PROBLEMS.map(prob => {
              const done = solved.has(prob.id);
              return (
                <div key={prob.id} style={{
                  padding: "16px 18px", borderRadius: 16,
                  background: done ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${done ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)"}`,
                  transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.4 }}>{prob.title}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 800, color: DIFF_COLOR[prob.difficulty],
                      background: `${DIFF_COLOR[prob.difficulty]}15`, padding: "3px 8px", borderRadius: 6,
                    }}>{prob.difficulty}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <a href={prob.url} target="_blank" rel="noopener noreferrer" style={{
                      flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 12, fontWeight: 700,
                      textAlign: "center", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                      color: "#A78BFA", textDecoration: "none",
                    }}>
                      Solve →
                    </a>
                    <button onClick={() => toggleSolved(prob.id)} style={{
                      width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
                      background: done ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: done ? "#10B981" : "rgba(255,255,255,0.3)",
                    }}>
                      {done ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tip Card */}
          <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#A78BFA", marginBottom: 8 }}>🤖 AI Tip</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
              Based on industry patterns, DP and Graph problems appear most in FAANG interviews. Solve at least 3 problems per topic before moving on.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Header() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(139,92,246,0.35)" }}>
          <Code2 size={26} color="white" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "white" }}>DSA Agent</h1>
            <AgentBadge variant="beta" />
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Personalized DSA plan · Weak-area detection · Daily problems</p>
        </div>
      </div>
      <Link href="/dashboard/student" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
        ← Back
      </Link>
    </div>
  );
}
