"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Next.js error boundary — shown when any page throws an unhandled error.
 * Never shows a blank page.
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#e2e8f0",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>

        <h1
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
            fontWeight: 700,
            marginBottom: "0.5rem",
            background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            maxWidth: "480px",
            opacity: 0.65,
            lineHeight: 1.6,
            marginBottom: "0.5rem",
            fontSize: "0.95rem",
          }}
        >
          An unexpected error occurred. Our team has been notified.
        </p>

        {error.message && (
          <code
            style={{
              display: "block",
              maxWidth: "480px",
              padding: "0.75rem 1rem",
              margin: "0.75rem 0 1.5rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "0.5rem",
              fontSize: "0.8rem",
              color: "#fca5a5",
              wordBreak: "break-word",
            }}
          >
            {error.message}
          </code>
        )}

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "0.65rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "white",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(124,58,237,0.4)",
            }}
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              padding: "0.65rem 1.5rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "transparent",
              color: "#e2e8f0",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go home
          </button>
        </div>

        <p style={{ marginTop: "2rem", opacity: 0.35, fontSize: "0.75rem" }}>
          Tulasi AI • {error.digest ? `Error ID: ${error.digest}` : ""}
        </p>
      </body>
    </html>
  );
}
