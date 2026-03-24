"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Terminal, ShieldAlert, X } from "lucide-react";

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("SYNCING");
  const [latency, setLatency] = useState(0);
  const [tokenStatus, setTokenStatus] = useState("MISSING");
  const [aiStatus, setAiStatus] = useState("FETCHING...");

  useEffect(() => {
    const checkSystem = async () => {
      const t = localStorage.getItem("token");
      setTokenStatus(t ? "VALID (JWT)" : "MISSING");

      const start = Date.now();
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "https://tulasiai.up.railway.app";
        const res = await fetch(`${API}/api/health`);
        const data = await res.json();
        setLatency(Date.now() - start);
        setStatus(res.ok ? "ONLINE" : "ERROR");
        setAiStatus(data.ai_configured ? "READY" : "MISSING KEYS");
      } catch (e) {
        setStatus("OFFLINE");
        setAiStatus("OFFLINE");
      }
    };

    checkSystem();
    const interval = setInterval(checkSystem, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Floating Trigger */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", bottom: 24, left: 24, zIndex: 9999,
          width: 48, height: 48, borderRadius: "50%",
          background: "var(--bg-glass)", backdropFilter: "blur(10px)",
          border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
          color: status === "ONLINE" ? "#10B981" : "#F43F5E",
          boxShadow: `0 0 20px ${status === "ONLINE" ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)"}`,
          cursor: "pointer"
        }}
      >
        <Activity size={20} />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -20, y: 20 }}
            style={{
              position: "fixed", bottom: 84, left: 24, zIndex: 9999,
              width: 320, background: "var(--bg-card)", backdropFilter: "blur(24px)",
              borderRadius: 16, border: "1px solid var(--border)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
              fontFamily: "var(--font-mono)", fontSize: 12
            }}
          >
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontWeight: 700 }}>
                <Terminal size={14} /> SYSTEM DEBUGGER
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>API STATUS:</span>
                <span style={{ color: status === "ONLINE" ? "#10B981" : "#F43F5E", fontWeight: 700 }}>{status}</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>LATENCY:</span>
                <span style={{ color: "var(--brand-secondary)", fontWeight: 700 }}>{latency > 0 ? `${latency}ms` : '---'}</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>AUTH TOKEN:</span>
                <span style={{ color: tokenStatus.includes("VALID") ? "#8B5CF6" : "var(--text-muted)", fontWeight: 700 }}>{tokenStatus}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>AI ENGINE:</span>
                <span style={{ color: aiStatus === "READY" ? "#06B6D4" : "#F43F5E", fontWeight: 700 }}>{aiStatus}</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>ENV:</span>
                <span style={{ color: "#F59E0B", fontWeight: 700 }}>PRODUCTION</span>
              </div>

              {status !== "ONLINE" && (
                 <div style={{ marginTop: 8, padding: 8, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 8, color: "#F43F5E", display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <ShieldAlert size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>Connection to Railway backend failed. Attempting reconnect...</span>
                 </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
