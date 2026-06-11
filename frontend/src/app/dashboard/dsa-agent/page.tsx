"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { useSession } from "@/hooks/useSession";
import { codeApi } from "@/lib/api";
import {
  Code2, ChevronRight, ExternalLink, CheckCircle2,
  Circle, BarChart3, Target, BookOpen, Zap, Lock, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

// Static definitions for visual structure since we don't have all subtopics from the API
const DSA_TOPICS_BASE = [
  { name: "Arrays & Strings",       slug: "Array",             lc: "https://leetcode.com/tag/array/" },
  { name: "Linked Lists",           slug: "Linked List",       lc: "https://leetcode.com/tag/linked-list/" },
  { name: "Stacks & Queues",        slug: "Stack",             lc: "https://leetcode.com/tag/stack/" },
  { name: "Trees & BST",            slug: "Tree",              lc: "https://leetcode.com/tag/binary-tree/" },
  { name: "Graphs & BFS/DFS",       slug: "Graph",             lc: "https://leetcode.com/tag/graph/" },
  { name: "Dynamic Programming",    slug: "Dynamic Programming", lc: "https://leetcode.com/tag/dynamic-programming/" },
];

const DIFF_COLOR: Record<string, string> = { Easy: "#10B981", Medium: "#F59E0B", Hard: "#F43F5E" };

export default function DSAAgentPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [dailyProblems, setDailyProblems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalProbs, setTotalProbs] = useState(0);
  const [totalDone, setTotalDone] = useState(0);
  const [loading, setLoading] = useState(true);

  const hasProfile = user?.is_onboarded;

  useEffect(() => {
    if (hasProfile && session?.token) {
        fetchData();
    }
  }, [hasProfile, session?.token]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const res = await codeApi.problems(undefined, undefined, undefined, session?.token);
        
        // Pick top 3 problems as "daily"
        if (res.problems) {
            setDailyProblems(res.problems.slice(0, 3));
        }
        
        setCategories(res.categories || []);
        setTotalProbs(res.total || 0);
        setTotalDone(res.solved_count || 0);
    } catch (error) {
        console.error("Failed to fetch DSA problems:", error);
        toast.error("Failed to load DSA problems from server");
    } finally {
        setLoading(false);
    }
  };

  const markProblemSolved = async (id: string) => {
    if (!session?.token) return;
    
    // Optimistic UI update
    setSolved(prev => {
        const n = new Set(prev);
        n.add(id);
        return n;
    });

    try {
        const res = await codeApi.markSolved(id, session.token);
        if (res.newly_solved) {
            setTotalDone(prev => prev + 1);
            toast.success(`You earned ${res.xp_earned} XP!`);
        }
    } catch (err: any) {
        // Revert on error
        setSolved(prev => {
            const n = new Set(prev);
            n.delete(id);
            return n;
        });
        toast.error(err.message || "Failed to mark problem as solved");
    }
  };

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
          { label: "Problems Solved",  val: loading ? "..." : `${totalDone} / ${totalProbs}`, icon: <BarChart3 size={18} color="#8B5CF6" />, accent: "#8B5CF6" },
          { label: "Current Streak",   val: `${user?.streak || 0} days`, icon: <Zap size={18} color="#F59E0B" />, accent: "#F59E0B" },
          { label: "Daily Target",     val: `${solved.size} / 3`, icon: <Target size={18} color="#10B981" />, accent: "#10B981" },
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
        background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)",
        display: "flex", alignItems: "center", gap: 10,
        fontSize: 13, color: "rgba(255,255,255,0.5)",
      }}>
        <BookOpen size={15} color="#8B5CF6" />
        Data is synced with Tulasi AI Code Backend. Click solve to run code against actual test cases!
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        {/* Topic List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 4 }}>Curriculum Focus</h3>
          {DSA_TOPICS_BASE.map(topic => {
            // Check if backend returned this category
            const isSupported = categories.includes(topic.slug);
            return (
              <div key={topic.slug} style={{
                padding: "16px 20px", borderRadius: 16,
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                opacity: isSupported ? 1 : 0.5
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{topic.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <a href={topic.lc} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, fontWeight: 700, color: "#8B5CF6", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}
                      onClick={e => e.stopPropagation()}>
                      Practice <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
                {!isSupported && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Pending content update</div>}
              </div>
            );
          })}
        </div>

        {/* Daily Problems */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 12 }}>Recommended For You</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {loading ? (
                <div style={{ padding: 24, textAlign: "center" }}>
                    <RefreshCw size={24} color="rgba(255,255,255,0.2)" className="animate-spin" style={{ animation: "spin 2s linear infinite" }} />
                </div>
            ) : dailyProblems.length === 0 ? (
                <div style={{ padding: 24, borderRadius: 16, background: "rgba(255,255,255,0.02)", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                    No problems available right now.
                </div>
            ) : dailyProblems.map(prob => {
              const done = solved.has(prob.id) || prob.is_solved;
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
                      fontSize: 10, fontWeight: 800, color: DIFF_COLOR[prob.difficulty] || "#F59E0B",
                      background: `${DIFF_COLOR[prob.difficulty] || "#F59E0B"}15`, padding: "3px 8px", borderRadius: 6,
                    }}>{prob.difficulty}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/code-editor?problem=${prob.id}`} style={{
                      flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 12, fontWeight: 700,
                      textAlign: "center", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                      color: "#A78BFA", textDecoration: "none",
                    }}>
                      Solve →
                    </Link>
                    <button onClick={() => !done && markProblemSolved(prob.id)} disabled={done} style={{
                      width: 36, height: 36, borderRadius: 10, border: "none", cursor: done ? "default" : "pointer",
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
              The daily problems above are tailored to your current skill level based on your performance. Keep your streak alive to earn double XP!
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
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Personalized DSA plan · Code editor sync · AI recommendations</p>
        </div>
      </div>
      <Link href="/dashboard/student" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
        ← Back
      </Link>
    </div>
  );
}
