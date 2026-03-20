"use client";
import { useState, useEffect } from "react";
import { healthCheck } from "@/lib/api";
import { motion } from "framer-motion";

export function DebugPanel() {
  const [online, setOnline] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [lastError, setLastError] = useState("None");

  useEffect(() => {
    let _mounted = true;
    const checkStatus = async () => {
      try {
        await healthCheck();
        if (_mounted) { setOnline(true); setLastError("None"); }
      } catch (e: any) {
        if (_mounted) { setOnline(false); setLastError(e.message || "Offline"); }
      }
      if (_mounted) setHasToken(!!localStorage.getItem("token"));
    };

    checkStatus();
    const interval = setInterval(checkStatus, 15000); // 15s poll
    return () => { _mounted = false; clearInterval(interval); };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }} 
      animate={{ opacity: 0.9, scale: 1, y: 0 }}
      whileHover={{ opacity: 1, scale: 1.02 }}
      style={{ 
        position: "fixed", 
        bottom: 24, 
        right: 24, 
        background: "rgba(10, 10, 15, 0.85)", 
        backdropFilter: "blur(12px)", 
        border: "1px solid rgba(255,255,255,0.1)", 
        padding: "16px 20px", 
        borderRadius: 16, 
        zIndex: 9999, 
        fontSize: 13, 
        display: "flex", 
        flexDirection: "column", 
        gap: 8, 
        width: 260,
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
      }}
    >
      <div style={{ fontWeight: 800, color: "white", marginBottom: 6, letterSpacing: "1px", textTransform: "uppercase", fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>🛠 System Debug</span>
        {online && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#43E97B", boxShadow: "0 0 8px #43E97B" }} />}
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 6 }}>
        <span style={{ color: "var(--text-muted)" }}>API Status</span>
        <span style={{ color: online ? "#43E97B" : "#FF6B6B", fontWeight: 700 }}>
          {online ? "● RUNNING" : "● OFFLINE"}
        </span>
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 6 }}>
        <span style={{ color: "var(--text-muted)" }}>Token</span>
        <span style={{ color: hasToken ? "#43E97B" : "#FF6B6B", fontWeight: 700 }}>
          {hasToken ? "PRESENT" : "MISSING"}
        </span>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase" }}>Last Error</span>
        <span style={{ 
          color: lastError === "None" ? "#43E97B" : "#FF6B6B", 
          background: lastError === "None" ? "transparent" : "rgba(255,107,107,0.1)",
          padding: lastError === "None" ? 0 : "4px 8px",
          borderRadius: 6,
          fontSize: 12,
          wordBreak: "break-word"
        }}>
          {lastError}
        </span>
      </div>
    </motion.div>
  );
}
