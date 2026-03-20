"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function DebugPanel() {
  const [apiStatus, setApiStatus] = useState("LOADING");
  const [tokenStatus, setTokenStatus] = useState("LOADING");
  const [lastError, setLastError] = useState("None");

  useEffect(() => {
    const checkStatus = async () => {
      // 1. Check token
      const token = localStorage.getItem("token");
      setTokenStatus(token ? "PRESENT" : "MISSING");

      // 2. Check API
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://tulasiai.up.railway.app";
        const parsedUrl = backendUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
        
        const res = await fetch(`${parsedUrl}/api/health`);
        if (res.ok) {
          setApiStatus("ONLINE");
        } else {
          setApiStatus("OFFLINE");
          setLastError(`HTTP ${res.status}`);
        }
      } catch (err: any) {
        setApiStatus("OFFLINE");
        setLastError(err.message || "Network Error");
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: "rgba(0, 0, 0, 0.8)",
        border: "1px solid #333",
        padding: "1rem",
        borderRadius: "8px",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: "12px",
        zIndex: 9999,
        pointerEvents: "none",
        backdropFilter: "blur(4px)"
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#fff" }}>🛠️ System Debug</div>
      <div>API: <span style={{ color: apiStatus === "ONLINE" ? "#0f0" : "#f00" }}>{apiStatus}</span></div>
      <div>TOKEN: <span style={{ color: tokenStatus === "PRESENT" ? "#0f0" : "#fba31a" }}>{tokenStatus}</span></div>
      <div>LAST ERROR: <span style={{ color: lastError === "None" ? "#aaa" : "#f00" }}>{lastError}</span></div>
    </motion.div>
  );
}
