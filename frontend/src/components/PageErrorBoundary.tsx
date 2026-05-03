"use client";

import React from "react";
import Link from "next/link";

interface State { hasError: boolean; error: string }

export class PageErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message || "Unexpected error" };
  }

  componentDidCatch(error: Error) {
    console.error("[TulasiAI PageError]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "60vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 8 }}>
            Page Crashed — Reloading…
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24, maxWidth: 420 }}>
            {this.state.error}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => { this.setState({ hasError: false, error: "" }); window.location.reload(); }}
              style={{
                padding: "10px 24px", borderRadius: 10, background: "linear-gradient(135deg,#8B5CF6,#06B6D4)",
                color: "white", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer"
              }}
            >
              Reload Page
            </button>
            <Link href="/dashboard" style={{
              padding: "10px 24px", borderRadius: 10, background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)", color: "white",
              fontWeight: 700, fontSize: 14, textDecoration: "none"
            }}>
              Back to Dashboard
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
