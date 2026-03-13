"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { healthCheck } from "@/lib/api";

export function BackendBanner() {
  const [status, setStatus] = useState<"checking" | "down" | "up">("checking");
  const [show, setShow] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setStatus("checking");
    try {
      await healthCheck();
      setStatus("up");
      setShow(false);
    } catch (e) {
      setStatus("down");
      setShow(true);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "var(--card-bg)",
            borderBottom: "1px solid var(--border-color)",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          }}
        >
          <AlertCircle size={20} style={{ color: "var(--accent-red)" }} />
          <span style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
            The backend server is waking up (this takes ~50s on free hosting).
          </span>
          <button
            onClick={checkHealth}
            disabled={status === "checking"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--primary-color)",
              color: "black",
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              cursor: status === "checking" ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
              opacity: status === "checking" ? 0.7 : 1,
            }}
          >
            <RefreshCw size={14} className={status === "checking" ? "animate-spin" : ""} />
            {status === "checking" ? "Pinging..." : "Check Again"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
