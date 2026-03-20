"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [tokenStatus, setTokenStatus] = useState<"present" | "missing">("missing");
  const [lastLog, setLastLog] = useState<string>("No recent API calls.");

  useEffect(() => {
    // 1. Check Token
    const t = localStorage.getItem("token");
    setTokenStatus(t ? "present" : "missing");

    // 2. Poll API Health
    const checkApi = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || "https://tulasiai.up.railway.app";
        const res = await fetch(`${url}/api/health`);
        setApiStatus(res.ok ? "online" : "offline");
      } catch {
        setApiStatus("offline");
      }
    };
    checkApi();
    const iv = setInterval(checkApi, 10000); // Check every 10s

    // 3. Intercept console.error to catch the last network error
    const ogError = console.error;
    console.error = (...args: any[]) => {
      ogError(...args);
      const msg = args.map(a => typeof a === "string" ? a : JSON.stringify(a)).join(" ");
      if (msg.toLowerCase().includes("fail") || msg.toLowerCase().includes("error")) {
        setLastLog(msg.substring(0, 100)); // Truncate
      }
    };

    return () => {
      clearInterval(iv);
      console.error = ogError;
    };
  }, []);

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 99999 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              background: "rgba(10, 10, 15, 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              padding: 16,
              width: 320,
              marginBottom: 12,
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              color: "white",
              fontFamily: "monospace",
              fontSize: 12
            } as any}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 }}>
              <span style={{ fontWeight: 800, color: "#9B95FF" }}>⚙️ SYSTEM DEBUG</span>
              <button 
                onClick={() => setIsOpen(false)} 
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}
              >×</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>API Status:</span>
                <span style={{ 
                  color: apiStatus === "online" ? "#43E97B" : apiStatus === "offline" ? "#FF6B6B" : "#FFD93D", 
                  fontWeight: 700 
                }}>
                  {apiStatus === "online" ? "🟢 ONLINE" : apiStatus === "offline" ? "🔴 OFFLINE" : "🟡 PINGING..."}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Token Auth:</span>
                <span style={{ 
                  color: tokenStatus === "present" ? "#43E97B" : "#FF6B6B", 
                  fontWeight: 700 
                }}>
                  {tokenStatus === "present" ? "🔒 INJECTED" : "⚠️ MISSING"}
                </span>
              </div>
              
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Last Captured Error:</span>
                <div style={{ 
                  background: "rgba(255,107,107,0.1)", 
                  color: "#FF6B6B", 
                  padding: "8px", 
                  borderRadius: 6, 
                  wordBreak: "break-all",
                  border: "1px solid rgba(255,107,107,0.2)"
                }}>
                  {lastLog}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 50, height: 50, borderRadius: 25,
          background: apiStatus === "online" ? "linear-gradient(135deg, #10B981, #047857)" : "linear-gradient(135deg, #EF4444, #B91C1C)",
          border: "2px solid rgba(255,255,255,0.2)",
          color: "white", fontSize: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          float: "right"
        } as any}
      >
        🐞
      </motion.button>
    </div>
  );
}
