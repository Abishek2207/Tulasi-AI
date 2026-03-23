"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Key, AlertCircle, Terminal, X, Wifi, WifiOff } from "lucide-react";

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isApiOnline, setIsApiOnline] = useState<boolean | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ id: number; msg: string; time: string }[]>([]);

  useEffect(() => {
    // Check Token presence
    const checkToken = () => {
      if (typeof window !== "undefined") {
        setHasToken(!!localStorage.getItem("token"));
      }
    };
    checkToken();
    const tokenInterval = setInterval(checkToken, 2000);

    // Check API Status
    const checkApi = async () => {
      try {
        const res = await fetch("https://tulasiai.up.railway.app/api/health", { method: "GET" });
        setIsApiOnline(res.ok);
      } catch (e) {
        setIsApiOnline(false);
      }
    };
    checkApi();
    const apiInterval = setInterval(checkApi, 15000); // Ping every 15s

    // Intercept Console Errors
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      originalConsoleError.apply(console, args);
      const errText = args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ");
      setErrors(prev => [...prev.slice(-9), { 
        id: Date.now(), 
        msg: errText.substring(0, 100) + (errText.length > 100 ? "..." : ""),
        time: new Date().toLocaleTimeString('en-US', { hour12: false })
      }]);
    };

    return () => {
      clearInterval(tokenInterval);
      clearInterval(apiInterval);
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <>
      <motion.button 
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: "fixed", bottom: 20, left: 20, zIndex: 9998,
          width: 44, height: 44, borderRadius: 12, border: "1px solid rgba(255,107,157,0.3)",
          background: "rgba(9,9,11,0.8)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#FF6B9D", boxShadow: "0 4px 12px rgba(0,0,0,0.4)", cursor: "pointer"
        }}
      >
        <Terminal size={20} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -20, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -20, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: "fixed", bottom: 20, left: 20, zIndex: 9999,
              width: 320, background: "rgba(10,12,20,0.85)", backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16,
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)", overflow: "hidden",
              fontFamily: "var(--font-mono, monospace)"
            }}
          >
            {/* Header */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "white" }}>
                <Terminal size={14} color="#FF6B9D" /> Smart Debug
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Status Grid */}
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <Activity size={12} /> API Status
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: isApiOnline ? "#10B981" : "#F43F5E" }}>
                  {isApiOnline === null ? "..." : isApiOnline ? <><Wifi size={14} /> ONLINE</> : <><WifiOff size={14} /> OFFLINE</>}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <Key size={12} /> Auth Token
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: hasToken ? "#10B981" : "#F59E0B" }}>
                  {hasToken ? "PRESENT" : "MISSING"}
                </div>
              </div>
            </div>

            {/* Live Errors */}
            <div style={{ padding: "0 16px 16px" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={12} /> Live Error Stream
              </div>
              <div style={{ height: 120, background: "rgba(0,0,0,0.3)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)", padding: 8, overflowY: "auto", fontSize: 11, color: "#FB7185", display: "flex", flexDirection: "column", gap: 4 }}>
                {errors.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: 40 }}>No errors detected.</div>
                ) : (
                  errors.map(err => (
                    <div key={err.id} style={{ borderBottom: "1px solid rgba(244,63,94,0.1)", paddingBottom: 4 }}>
                      <span style={{ color: "var(--text-muted)", marginRight: 8 }}>[{err.time}]</span>
                      {err.msg}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
