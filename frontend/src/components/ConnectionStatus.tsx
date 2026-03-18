"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";

export function ConnectionStatus() {
  const [status, setStatus] = useState<"connected" | "reconnecting">("connected");
  const [show, setShow] = useState(false);

  useEffect(() => {
    let retryCount = 0;
    
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`);
        if (res.ok) {
          if (status === "reconnecting") {
            setStatus("connected");
            setTimeout(() => setShow(false), 3000); // Hide after 3s of success
          }
          retryCount = 0;
        } else {
          throw new Error("Health check failed");
        }
      } catch (err) {
        console.error("Backend connection failed:", err);
        setStatus("reconnecting");
        setShow(true);
        // Automatic retry logic
        retryCount++;
        if (retryCount < 5) {
          setTimeout(checkHealth, 5000 * retryCount); // Exponential backoff
        }
      }
    };

    // Initial check
    checkHealth();

    // Ping every 5 minutes to keep the Render backend awake
    const interval = setInterval(checkHealth, 300000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            padding: "8px 16px",
            borderRadius: "20px",
            background: status === "connected" ? "rgba(16, 185, 129, 0.9)" : "rgba(239, 68, 68, 0.9)",
            color: "white",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backdropFilter: "blur(4px)"
          }}
        >
          {status === "reconnecting" ? (
            <>
              <div className="spinner" style={{ width: 14, height: 14, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              Connecting to server...
            </>
          ) : (
            <>
              <span style={{ fontSize: "16px" }}>✓</span>
              Connected
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
