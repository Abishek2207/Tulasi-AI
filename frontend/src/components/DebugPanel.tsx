"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { healthCheck } from "@/lib/api";

export function DebugPanel() {
  const [status, setStatus] = useState<"connecting" | "online" | "offline">("connecting");
  const [hasToken, setHasToken] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await healthCheck();
        setStatus(res.status === "ok" ? "online" : "offline");
      } catch {
        setStatus("offline");
      }
      setHasToken(!!localStorage.getItem("token"));
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <motion.div
        layout
        initial={false}
        animate={{ width: isExpanded ? 220 : 48, height: isExpanded ? "auto" : 48 }}
        className="glass-card overflow-hidden"
        style={{ 
          padding: isExpanded ? "16px" : "0",
          background: "rgba(3, 7, 18, 0.8)",
          borderColor: status === "online" ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)",
          boxShadow: isExpanded ? "0 20px 50px rgba(0,0,0,0.5)" : "none",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}
      >
        {!isExpanded ? (
          <button 
            onClick={() => setIsExpanded(true)}
            className="w-full h-full flex items-center justify-center text-xl"
            title="Open Debug Panel"
          >
            {status === "online" ? "🟢" : status === "offline" ? "🔴" : "🟡"}
          </button>
        ) : (
          <>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Debug Engine</span>
              <button 
                onClick={() => setIsExpanded(false)}
                className="text-muted hover:text-white transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-secondary">Backend Hub</span>
                <span className={`badge ${status === "online" ? "badge-green" : status === "offline" ? "badge-pink" : "badge-yellow"}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                  {status.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-secondary">Session Token</span>
                <span className="text-xs font-bold" style={{ color: hasToken ? "var(--brand-green)" : "var(--brand-accent)" }}>
                  {hasToken ? "ACTIVE" : "MISSING"}
                </span>
              </div>

              <div className="pt-2 border-t border-white/5 mt-1">
                  <div className="text-[9px] text-muted leading-tight">
                      RAILWAY: tulasiai.up.railway.app<br/>
                      ENV: production
                  </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
