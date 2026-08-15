"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, MessageSquare, BookOpen, Target, Briefcase, FileSearch, Send } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface AssistantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssistantSidebar({ isOpen, onClose }: AssistantSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [chatInput, setChatInput] = useState("");

  // Determine active context based on pathname
  let contextMode = "Chat";
  if (pathname.includes("/learn")) contextMode = "Learn";
  else if (pathname.includes("/practice")) contextMode = "Practice";
  else if (pathname.includes("/research")) contextMode = "Research";
  else if (pathname.includes("/ai-interview")) contextMode = "Career";
  else if (pathname.includes("/documents")) contextMode = "RAG Context";

  const modes = [
    { name: "Chat", icon: <MessageSquare size={16} />, path: "/dashboard/chat" },
    { name: "Learn", icon: <BookOpen size={16} />, path: "/dashboard/learn" },
    { name: "Practice", icon: <Target size={16} />, path: "/dashboard/practice" },
    { name: "Research", icon: <FileSearch size={16} />, path: "/dashboard/research" },
    { name: "Career GPS", icon: <Briefcase size={16} />, path: "/dashboard/research" },
  ];

  const handleAction = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
              zIndex: 9998
            }}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%", opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", top: 16, right: 16, bottom: 16, width: 380,
              background: "rgba(15,23,42,0.95)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)", zIndex: 9999,
              display: "flex", flexDirection: "column", overflow: "hidden"
            }}
          >
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #ec4899)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Sparkles size={16} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "white", letterSpacing: "0.02em" }}>Tulasi AI</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Context: {contextMode}</div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* Content (Modes Grid) */}
            <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              <h3 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Intelligence Modes</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {modes.map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAction(m.path)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12,
                      padding: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 16, cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  >
                    <div style={{ color: "rgba(255,255,255,0.8)" }}>{m.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{m.name}</div>
                  </button>
                ))}
              </div>
              
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>Pro Tip</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12 }}>
                  You can jump into Research Mode directly to calculate your Career GPS, or upload a document to unlock personalized RAG context.
                </p>
              </div>
            </div>

            {/* Quick Input Bar (Decorative for now, could route to chat) */}
            <div style={{ padding: 16, background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{
                display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 24, padding: "8px 12px 8px 16px"
              }}>
                <input
                  value={chatInput} onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask anything..."
                  style={{ flex: 1, background: "transparent", border: "none", color: "white", fontSize: 14, outline: "none", fontFamily: "var(--font-inter)" }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && chatInput.trim()) {
                      router.push(`/dashboard/chat?q=${encodeURIComponent(chatInput)}`);
                      onClose();
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (chatInput.trim()) {
                      router.push(`/dashboard/chat?q=${encodeURIComponent(chatInput)}`);
                      onClose();
                    }
                  }}
                  style={{
                    background: chatInput.trim() ? "#4F46E5" : "rgba(255,255,255,0.1)",
                    color: "white", border: "none", width: 32, height: 32, borderRadius: 16,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: chatInput.trim() ? "pointer" : "default", transition: "all 0.2s"
                  }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
