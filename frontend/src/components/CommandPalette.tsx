"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, BookOpen, Code, Target, Map, FileText,
  Rocket, Users, Trophy, Youtube, BarChart3, Award,
  Zap, Home, Search, X, ArrowRight, Command
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useCallback((path: string) => {
    router.push(path);
    setOpen(false);
    setQuery("");
  }, [router]);

  const COMMANDS: CommandItem[] = [
    { id: "dashboard", label: "Dashboard", description: "Your command center", icon: <Home size={18} />, color: "#8B5CF6", action: () => navigate("/dashboard"), keywords: ["home", "main"] },
    { id: "chat", label: "AI Chat", description: "Start a new AI conversation", icon: <MessageSquare size={18} />, color: "#8B5CF6", action: () => navigate("/dashboard/chat"), keywords: ["gpt", "gemini", "talk", "ask"] },
    { id: "interview", label: "Mock Interview", description: "Simulate a live interview", icon: <Target size={18} />, color: "#06B6D4", action: () => navigate("/dashboard/interview"), keywords: ["hire", "question", "voice", "practice"] },
    { id: "flashcards", label: "Flashcard Studio", description: "3D study deck creator", icon: <Zap size={18} />, color: "#F43F5E", action: () => navigate("/dashboard/flashcards"), keywords: ["study", "cards", "memory", "review"] },
    { id: "roadmaps", label: "Career Roadmaps", description: "Week-by-week learning paths", icon: <Map size={18} />, color: "#8B5CF6", action: () => navigate("/dashboard/roadmaps"), keywords: ["path", "plan", "learn", "guide"] },
    { id: "code", label: "Coding Arena", description: "Practice Data Structures", icon: <Code size={18} />, color: "#10B981", action: () => navigate("/dashboard/code"), keywords: ["dsa", "algorithm", "leetcode", "problem"] },
    { id: "pdf", label: "PDF Q&A", description: "Query your textbooks instantly", icon: <BookOpen size={18} />, color: "#F43F5E", action: () => navigate("/dashboard/pdf"), keywords: ["upload", "document", "summarize", "notes"] },
    { id: "resume", label: "Resume Builder", description: "ATS-optimised resume engine", icon: <FileText size={18} />, color: "#3B82F6", action: () => navigate("/dashboard/resume"), keywords: ["cv", "job", "ats", "linkedin"] },
    { id: "startup", label: "Startup Lab", description: "Generate pitch decks & ideas", icon: <Rocket size={18} />, color: "#F97316", action: () => navigate("/dashboard/startup-lab"), keywords: ["idea", "saas", "pitch", "business"] },
    { id: "study", label: "Study Rooms", description: "Focus sessions with Pomodoro", icon: <Users size={18} />, color: "#EC4899", action: () => navigate("/dashboard/study-rooms"), keywords: ["pomodoro", "focus", "group", "timer"] },
    { id: "hackathons", label: "Hackathons", description: "Find AI & Web3 competitions", icon: <Trophy size={18} />, color: "#EAB308", action: () => navigate("/dashboard/hackathons"), keywords: ["competition", "prize", "team", "hack"] },
    { id: "youtube", label: "YouTube Learning", description: "Curated engineering masterclasses", icon: <Youtube size={18} />, color: "#FF0000", action: () => navigate("/dashboard/youtube-learning"), keywords: ["video", "watch", "tutorial"] },
    { id: "analytics", label: "Analytics", description: "Your XP velocity & skill radar", icon: <BarChart3 size={18} />, color: "#4ECDC4", action: () => navigate("/dashboard/analytics"), keywords: ["stats", "progress", "chart", "xp"] },
    { id: "certs", label: "Certificates", description: "Download credentials", icon: <Award size={18} />, color: "#34D399", action: () => navigate("/dashboard/certificates"), keywords: ["certificate", "download", "proof"] },
  ];

  const filtered = query.trim()
    ? COMMANDS.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase()) ||
        (c.keywords || []).some(k => k.includes(query.toLowerCase()))
      )
    : COMMANDS;

  // Reset selected index when query changes
  useEffect(() => { setSelectedIndex(0); }, [query]);

  // Global keyboard listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery("");
      }
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Arrow key navigation + Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && filtered[selectedIndex]) { filtered[selectedIndex].action(); }
  };

  return (
    <>
      {/* Floating trigger hint (in TopBar area, rendered separately) */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setOpen(false); setQuery(""); }}
              style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
            />

            {/* Palette */}
            <motion.div
              key="palette"
              initial={{ opacity: 0, y: -24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              style={{
                position: "fixed", top: "15%", left: "50%", transform: "translateX(-50%)",
                zIndex: 10001, width: "90%", maxWidth: 640,
                background: "rgba(10, 10, 20, 0.97)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.1)",
                overflow: "hidden",
              }}
            >
              {/* Search input */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <Search size={18} color="rgba(255,255,255,0.3)" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search features, topics..."
                  style={{
                    flex: 1, background: "none", border: "none", outline: "none",
                    color: "white", fontSize: 16, fontWeight: 500,
                    fontFamily: "var(--font-inter)",
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <kbd style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>ESC</kbd>
                </div>
              </div>

              {/* Results */}
              <div style={{ maxHeight: 380, overflowY: "auto", padding: "8px 8px" }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                    No results for "{query}"
                  </div>
                ) : (
                  filtered.map((cmd, i) => (
                    <motion.div
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(i)}
                      initial={false}
                      animate={{ background: i === selectedIndex ? "rgba(139,92,246,0.1)" : "transparent" }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                        border: `1px solid ${i === selectedIndex ? "rgba(139,92,246,0.2)" : "transparent"}`,
                        marginBottom: 2,
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: `${cmd.color}18`,
                        border: `1px solid ${cmd.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: cmd.color,
                      }}>
                        {cmd.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{cmd.label}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{cmd.description}</div>
                      </div>
                      {i === selectedIndex && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <ArrowRight size={14} color="rgba(139,92,246,0.7)" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 16, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                <span><kbd style={{ marginRight: 4, padding: "1px 5px", borderRadius: 3, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>↑↓</kbd>Navigate</span>
                <span><kbd style={{ marginRight: 4, padding: "1px 5px", borderRadius: 3, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>↵</kbd>Open</span>
                <span><kbd style={{ marginRight: 4, padding: "1px 5px", borderRadius: 3, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>⌘K</kbd>Toggle</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
