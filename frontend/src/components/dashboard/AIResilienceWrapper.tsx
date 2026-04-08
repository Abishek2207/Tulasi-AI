"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Zap, Sparkles, BrainCircuit, Cpu, AlertCircle } from "lucide-react";

interface AIResilienceWrapperProps {
  loading: boolean;
  retrying: boolean;
  result: any;
  onRetry: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  fallbackIcon?: string;
  color?: string;
  retrySeconds?: number;
}

export function AIResilienceWrapper({
  loading,
  retrying,
  result,
  onRetry,
  children,
  title = "Intelligence Hub",
  subtitle = "Scanning market data...",
  icon,
  fallbackIcon = "🧠",
  color = "#8B5CF6",
  retrySeconds = 5
}: AIResilienceWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      {/* Loading State: Premium Neural Scanning */}
      {loading && !retrying && (
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          style={{
            padding: "80px 40px",
            textAlign: "center",
            background: "rgba(255,255,255,0.02)",
            borderRadius: 32,
            border: `1px solid ${color}20`,
            backdropFilter: "blur(20px)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Background pulses */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ repeat: Infinity, duration: 3 }}
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at center, ${color}30 0%, transparent 70%)`,
              zIndex: 0
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 32px" }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "3px solid transparent",
                  borderTopColor: color,
                  borderRightColor: "#06B6D4"
                }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                style={{
                  position: "absolute",
                  inset: 10,
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderBottomColor: color,
                  opacity: 0.5
                }}
              />
              <div style={{
                position: "absolute",
                inset: 15,
                borderRadius: "50%",
                background: `${color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32
              }}>
                {loading ? (
                   <motion.div
                     animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                     transition={{ repeat: Infinity, duration: 4 }}
                   >
                     {icon || <BrainCircuit size={40} color={color} />}
                   </motion.div>
                ) : fallbackIcon}
              </div>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 900, color: "white", marginBottom: 8, fontFamily: "var(--font-outfit)" }}>
              {title}
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 32 }}>
              {subtitle}
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={{
                    height: [4, 16, 4],
                    opacity: [0.3, 1, 0.3],
                    background: [color, "#06B6D4", color]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    delay: i * 0.15
                  }}
                  style={{ width: 4, borderRadius: 2 }}
                />
              ))}
            </div>
            
            <div style={{ marginTop: 24, fontSize: 10, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase" }}>
              Verifying Neural Weights
            </div>
          </div>
        </motion.div>
      )}

      {/* Retrying State: Countdown Component */}
      {retrying && !loading && (
        <motion.div
          key="retrying"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 32,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <RetryCountdownComponent seconds={retrySeconds} onRetry={onRetry} color={color} />
        </motion.div>
      )}

      {/* Children: Always render when not loading and not retrying */}
      {/* (handles both empty state and result state from within the page) */}
      {!loading && !retrying && (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: "100%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RetryCountdownComponent({ seconds, onRetry, color }: { seconds: number; onRetry: () => void; color: string }) {
  const [count, setCount] = useState(seconds);
  const onRetryRef = useRef(onRetry);
  useEffect(() => { onRetryRef.current = onRetry; });
  
  useEffect(() => {
    if (count <= 0) {
      onRetryRef.current();
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]); // ← onRetry intentionally excluded via ref to prevent infinite loop

  const progress = ((seconds - count) / seconds) * 100;

  return (
    <div style={{ padding: "60px 40px", textAlign: "center" }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        style={{ display: "inline-block", marginBottom: 20 }}
      >
        <RefreshCw size={36} color={color} />
      </motion.div>
      
      <div style={{ fontSize: 18, fontWeight: 900, color: "white", marginBottom: 8, fontFamily: "var(--font-outfit)" }}>
        Synchronizing Neural Intelligence...
      </div>
      <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>
        Auto-retrying in <span style={{ color, fontWeight: 900 }}>{count}s</span>
      </div>
      
      <div style={{ 
        height: 4, 
        background: "rgba(255,255,255,0.06)", 
        borderRadius: 10, 
        overflow: "hidden", 
        maxWidth: 200, 
        margin: "0 auto 28px" 
      }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          style={{ 
            height: "100%", 
            background: `linear-gradient(90deg, ${color}, #06B6D4)`, 
            borderRadius: 10 
          }}
        />
      </div>
      
      <button
        onClick={onRetry}
        style={{
          padding: "12px 32px",
          borderRadius: 14,
          background: `${color}15`,
          border: `1px solid ${color}30`,
          color: color,
          fontWeight: 800,
          fontSize: 14,
          cursor: "pointer",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = `${color}25`)}
        onMouseLeave={(e) => (e.currentTarget.style.background = `${color}15`)}
      >
        Retry Now
      </button>
    </div>
  );
}
