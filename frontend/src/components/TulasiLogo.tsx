"use client";

import { motion } from "framer-motion";
import Image from "next/image";

/**
 * TulasiLogo — single source of truth for the Tulasi AI logo.
 * Used everywhere: TopBar, Sidebar, Auth, Loading, Landing page.
 *
 * Props:
 *  size       — px size of the logo image (default 40)
 *  glow       — show animated glow ring (default true)
 *  showText   — show "TulasiAI" wordmark next to logo (default false)
 *  badge      — optional badge text below wordmark e.g. "Platinum"
 *  className  — extra CSS class on wrapper
 *  style      — extra inline styles on wrapper
 */
export function TulasiLogo({
  className = "",
  size = 40,
  glow = true,
  showText = false,
  badge,
  isFounder = false,
  style,
}: {
  className?: string;
  size?: number;
  glow?: boolean;
  showText?: boolean;
  badge?: string;
  isFounder?: boolean;
  style?: React.CSSProperties;
}) {
  const glowColor = isFounder 
    ? "radial-gradient(circle at center, rgba(245,158,11,0.45) 0%, rgba(217,119,6,0.3) 35%, rgba(180,83,9,0.2) 65%, transparent 100%)"
    : "radial-gradient(circle at center, rgba(34,211,238,0.35) 0%, rgba(168,85,247,0.25) 35%, rgba(236,72,153,0.15) 65%, transparent 100%)";

  const effectiveBadge = isFounder ? "FOUNDER" : badge;
  return (
    <div
      className={`tulasi-logo-root ${className}`}
      style={{ display: "flex", alignItems: "center", gap: size * 0.35, ...style }}
    >
      {/* ── Image + glow wrapper ── */}
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        {/* Animated glow ring */}
        {glow && (
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              inset: -size * 0.2,
              borderRadius: "50%",
              background: glowColor,
              filter: `blur(${size * 0.25}px)`,
              pointerEvents: "none",
            }}
            animate={{
              scale: [1, 1.3, 1.1, 1.4, 1],
              opacity: [0.4, 0.7, 0.5, 0.65, 0.4],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Logo image with hover spring */}
        <motion.div
          whileHover={{
            scale: 1.08,
            filter: "brightness(1.15) drop-shadow(0 0 18px rgba(168,85,247,0.55))",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 16 }}
          style={{ position: "relative", zIndex: 1, width: size, height: size }}
        >
          <Image
            src="/images/logo.png"
            alt="Tulasi AI Lotus Logo"
            width={size}
            height={size}
            className="object-contain"
            style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.55))" }}
            priority
          />
        </motion.div>
      </div>

      {/* ── Optional wordmark ── */}
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
            Tulasi<span style={{ color: "#22D3EE" }}>AI v2</span>
          </span>

          {effectiveBadge && (
            <span
              style={{
                marginTop: size * 0.1,
                background: isFounder ? "#F59E0B" : "linear-gradient(135deg, #A855F7, #22D3EE)",
                padding: `${size * 0.04}px ${size * 0.14}px`,
                borderRadius: size * 0.12,
                fontSize: size * 0.2,
                fontWeight: 900,
                color: isFounder ? "black" : "white",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                boxShadow: isFounder ? "0 0 15px rgba(245,158,11,0.5)" : "0 0 18px rgba(168,85,247,0.5)",
                display: "inline-block",
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

/**
 * @deprecated Use TulasiLogo with showText prop instead.
 * Kept for backward compat with components that import { Logo }.
 */
export function Logo({ size = 48, showText = true }: { size?: number; showText?: boolean }) {
  return <TulasiLogo size={size} showText={showText} glow />;
}
