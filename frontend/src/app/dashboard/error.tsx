"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard module error:", error?.message, error?.stack);
  }, [error]);

  // Detect type of error for better messaging
  const isNetworkError =
    error?.message?.toLowerCase().includes("fetch") ||
    error?.message?.toLowerCase().includes("network") ||
    error?.message?.toLowerCase().includes("failed");

  const isAuthError =
    error?.message?.toLowerCase().includes("401") ||
    error?.message?.toLowerCase().includes("unauthorized") ||
    error?.message?.toLowerCase().includes("token");

  const getTitle = () => {
    if (isAuthError) return "Session Expired";
    if (isNetworkError) return "Connection Issue";
    return "Module Error";
  };

  const getMessage = () => {
    if (isAuthError)
      return "Your session has expired. Please sign in again to continue.";
    if (isNetworkError)
      return "Unable to reach the AI backend. Check your connection and retry.";
    return error?.message || "An unexpected error occurred loading this module.";
  };

  return (
    <div
      style={{
        height: "100%",
        minHeight: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: 40,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card"
        style={{
          padding: "40px 48px",
          borderRadius: 24,
          textAlign: "center",
          maxWidth: 440,
          border: "1px solid rgba(244,63,94,0.2)",
          background: "rgba(244,63,94,0.03)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: "rgba(244,63,94,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <AlertTriangle size={32} color="#F43F5E" />
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            marginBottom: 8,
            color: "white",
          }}
        >
          {getTitle()}
        </h2>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 14,
            marginBottom: 8,
            lineHeight: 1.6,
          }}
        >
          {getMessage()}
        </p>

        {process.env.NODE_ENV === "development" && error?.message && (
          <div
            style={{
              marginBottom: 24,
              padding: "10px 14px",
              background: "rgba(0,0,0,0.4)",
              borderRadius: 10,
              fontSize: 11,
              fontFamily: "monospace",
              color: "rgba(255,100,100,0.8)",
              textAlign: "left",
              maxHeight: 80,
              overflow: "auto",
            }}
          >
            {error.message}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            onClick={() => reset()}
            style={{
              flex: 1,
              background: "var(--brand-primary)",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <RefreshCw size={16} /> Retry
          </button>

          <Link href="/dashboard" style={{ flex: 1, textDecoration: "none" }}>
            <button
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                color: "var(--text-secondary)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "12px 20px",
                borderRadius: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Home size={16} /> Dashboard
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
