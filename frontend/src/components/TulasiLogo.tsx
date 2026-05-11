"use client";

import { motion } from "framer-motion";

/**
 * TulasiLogo — single source of truth for the Tulasi AI logo.
 * Now using the Minimalist Triangle Design requested by the user.
 * 
 * Design: White Triangle inside Black Circle inside White Outer Ring.
 */
export function TulasiLogo({
  className = "",
  size = 40,
  glow = true,
  showText = false,
  badge,
  isFounder = false,
  splash = false,
  style,
}: {
  className?: string;
  size?: number;
  glow?: boolean;
  showText?: boolean;
  badge?: string;
  isFounder?: boolean;
  splash?: boolean;
  style?: React.CSSProperties;
}) {
  const glowColor = isFounder
    ? "radial-gradient(circle at center, rgba(245,158,11,0.5) 0%, rgba(217,119,6,0.35) 35%, rgba(180,83,9,0.2) 65%, transparent 100%)"
    : "radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 50%, transparent 100%)";

  const effectiveBadge = isFounder ? "FOUNDER" : badge;

  const LogoIcon = () => (
    <motion.div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      animate={splash ? { 
        scale: [1, 1.05, 1],
      } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Outer White Ring */}
      <div style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        border: `${size * 0.05}px solid white`,
        zIndex: 1
      }} />

      {/* Inner Black Circle */}
      <div style={{
        position: "absolute",
        inset: size * 0.08,
        borderRadius: "50%",
        background: "#000",
        zIndex: 2
      }} />

      {/* Center White Triangle */}
      <svg 
        viewBox="0 0 100 100" 
        style={{ 
          width: "55%", 
          height: "55%", 
          position: "relative", 
          zIndex: 3,
        }}
      >
        <path 
          d="M50 22 L82 78 L18 78 Z" 
          fill="white" 
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );

  if (splash) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        gap: 32,
        ...style 
      }}>
        <div style={{ position: "relative" }}>
          {/* Ambient Glow */}
          <motion.div
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{
              position: "absolute",
              inset: -size * 0.4,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
              filter: "blur(20px)",
              zIndex: 0
            }}
          />
          <LogoIcon />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            fontFamily: "var(--font-outfit)",
            fontWeight: 900,
            fontSize: size * 0.8,
            color: "white",
            letterSpacing: "-0.05em",
            textAlign: "center"
          }}
        >
          Tulasi<span style={{ color: "var(--brand-primary)" }}>AI</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`tulasi-logo-root ${className}`}
      style={{ display: "flex", alignItems: "center", gap: size * 0.35, ...style }}
    >
      <div style={{ position: "relative" }}>
        {glow && (
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{
              position: "absolute",
              inset: -size * 0.3,
              borderRadius: "50%",
              background: glowColor,
              filter: "blur(15px)",
              pointerEvents: "none",
              zIndex: 0
            }}
          />
        )}
        <LogoIcon />
      </div>

      {showText && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
          <span
            style={{
              fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
              fontWeight: 900,
              fontSize: size * 0.55,
              color: "white",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Tulasi<span style={{ color: "var(--brand-primary)" }}>AI</span>
          </span>

          {effectiveBadge && (
            <span
              style={{
                marginTop: size * 0.1,
                background: isFounder
                  ? "#F59E0B"
                  : "rgba(255,255,255,0.1)",
                border: isFounder ? "none" : "1px solid rgba(255,255,255,0.2)",
                padding: `${size * 0.04}px ${size * 0.14}px`,
                borderRadius: size * 0.12,
                fontSize: size * 0.18,
                fontWeight: 900,
                color: isFounder ? "black" : "white",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                display: "inline-block",
                marginTop: 4
              }}
            >
              {effectiveBadge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function Logo({ size = 48, showText = true }: { size?: number; showText?: boolean }) {
  return <TulasiLogo size={size} showText={showText} glow />;
}
