"use client";

import { useState } from "react";
import { useBackendWake } from "@/hooks/useBackendWake";

/**
 * BackendBanner — shows a floating banner when the Render backend is waking up.
 *
 * Usage: Place in the root layout. It self-manages visibility.
 */
export function BackendBanner() {
  const { isOnline, isChecking, wakeNow } = useBackendWake();
  const [dismissed, setDismissed] = useState(false);

  // Show banner only when offline and not dismissed
  if (isOnline || dismissed) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.875rem 1.25rem",
        borderRadius: "0.75rem",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        border: "1px solid rgba(139, 92, 246, 0.4)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.15)",
        color: "#e2e8f0",
        fontSize: "0.875rem",
        fontFamily: "Inter, system-ui, sans-serif",
        maxWidth: "min(90vw, 480px)",
        backdropFilter: "blur(12px)",
        animation: "slideUp 0.3s ease-out",
      }}
    >
      {/* Pulsing indicator */}
      <span
        style={{
          display: "inline-block",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: isChecking ? "#f59e0b" : "#ef4444",
          flexShrink: 0,
          boxShadow: isChecking
            ? "0 0 0 3px rgba(245,158,11,0.3)"
            : "0 0 0 3px rgba(239,68,68,0.3)",
          animation: "pulse 1.5s infinite",
        }}
      />

      <span style={{ flex: 1, lineHeight: 1.4 }}>
        {isChecking ? (
          <>
            <strong style={{ color: "#f59e0b" }}>Connecting…</strong>
            <br />
            <span style={{ opacity: 0.7, fontSize: "0.8rem" }}>Waking up backend server</span>
          </>
        ) : (
          <>
            <strong style={{ color: "#f87171" }}>Backend offline</strong>
            <br />
            <span style={{ opacity: 0.7, fontSize: "0.8rem" }}>
              Server may be waking from sleep (Render free tier)
            </span>
          </>
        )}
      </span>

      {/* Wake API button */}
      <button
        onClick={wakeNow}
        disabled={isChecking}
        style={{
          padding: "0.4rem 0.9rem",
          borderRadius: "0.5rem",
          border: "1px solid rgba(139, 92, 246, 0.6)",
          background: isChecking ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.25)",
          color: "#a78bfa",
          cursor: isChecking ? "not-allowed" : "pointer",
          fontSize: "0.8rem",
          fontWeight: 600,
          transition: "all 0.2s",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          if (!isChecking) {
            (e.target as HTMLButtonElement).style.background = "rgba(139,92,246,0.4)";
          }
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.background = isChecking
            ? "rgba(139,92,246,0.1)"
            : "rgba(139,92,246,0.25)";
        }}
      >
        {isChecking ? "Checking…" : "Wake API"}
      </button>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss banner"
        style={{
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          border: "none",
          background: "transparent",
          color: "rgba(226,232,240,0.4)",
          cursor: "pointer",
          fontSize: "1rem",
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ×
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
