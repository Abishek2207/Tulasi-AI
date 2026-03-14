"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global ErrorBoundary — wraps the app to catch unexpected React errors
 * and show a friendly UI instead of a blank crash page.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to monitoring in production (e.g. Sentry) — not just console
    if (process.env.NODE_ENV === "production") {
      // Future: Sentry.captureException(error, { extra: info });
    }
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 16, fontFamily: "Inter, system-ui, sans-serif",
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
            Something went wrong
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", maxWidth: 360, margin: 0 }}>
            This page encountered an unexpected error. Try refreshing — your data is safe.
          </p>
          <button
            onClick={this.reset}
            style={{
              marginTop: 8, padding: "10px 24px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #6C63FF, #4F46E5)", color: "white",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
