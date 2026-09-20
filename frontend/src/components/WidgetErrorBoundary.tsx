"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[WidgetErrorBoundary] Caught error:", error, errorInfo);
  }

  public reset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-black/20 border border-red-500/20 rounded-xl h-full min-h-[150px] text-center">
          <AlertCircle className="w-8 h-8 text-red-500/70 mb-3" />
          <h3 className="text-sm font-semibold text-red-400 mb-1">
            {this.props.fallbackMessage || "Failed to load module"}
          </h3>
          <p className="text-xs text-white/50 max-w-[250px] truncate mb-4" title={this.state.error?.message}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={this.reset}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
          >
            <RefreshCcw size={12} />
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
