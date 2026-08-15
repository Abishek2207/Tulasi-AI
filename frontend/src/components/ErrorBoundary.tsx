"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20, textAlign: "center", background: "#05070D", color: "white" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <AlertTriangle size={40} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Oops, something went wrong.</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 500, lineHeight: 1.6, marginBottom: 32 }}>
            The application encountered an unexpected error. Our engineering team has been notified.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "#4F46E5", border: "none", color: "white", padding: "12px 24px", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" }}
          >
            <RefreshCcw size={18} />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
