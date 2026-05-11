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
 *  splash     — show full-screen login splash animation (default false)
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
    : "radial-gradient(circle at center, rgba(0,229,160,0.4) 0%, rgba(0,200,255,0.3) 30%, rgba(168,85,247,0.2) 65%, transparent 100%)";

  const effectiveBadge = isFounder ? "FOUNDER" : badge;

  if (splash) {
    // Full-screen animated login splash
    return (
      <div style={{ position: "relative", width: size, height: size }}>
        {/* Outer rotating ring */}
        <motion.div
          style={{
            position: "absolute",
            inset: -size * 0.35,
            borderRadius: "50%",
            border: "1.5px solid transparent",
            backgroundImage:
              "linear-gradient(135deg, rgba(0,229,160,0.6), rgba(168,85,247,0.6), rgba(0,200,255,0.6))",
            backgroundOrigin: "border-box",
            backgroundClip: "border-box",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        {/* Glow pulse */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: -size * 0.25,
            borderRadius: "50%",
            background: glowColor,
            filter: `blur(${size * 0.3}px)`,
            pointerEvents: "none",
          }}
          animate={{
            scale: [1, 1.4, 1.1, 1.5, 1],
            opacity: [0.5, 0.85, 0.6, 0.9, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Logo image */}
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            filter: [
              "drop-shadow(0 0 12px rgba(0,229,160,0.5))",
              "drop-shadow(0 0 28px rgba(168,85,247,0.8))",
              "drop-shadow(0 0 12px rgba(0,229,160,0.5))",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "relative", zIndex: 1, width: size, height: size }}
        >
          <Image
            src="/images/logo.png"
            alt="Tulasi AI Logo"
            width={size}
            height={size}
            className="object-contain"
            priority
          />
        </motion.div>
      </div>
    );
  }

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
              opacity: [0.4, 0.75, 0.5, 0.7, 0.4],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Logo image with hover spring */}
        <motion.div
          whileHover={{
            scale: 1.1,
            filter:
              "brightness(1.2) drop-shadow(0 0 20px rgba(0,229,160,0.6))",
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
            style={{ filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.6))" }}
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
              background: "linear-gradient(135deg, #ffffff 0%, #00E5A0 60%, #A855F7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            TulasiAI
          </span>

          {effectiveBadge && (
            <span
              style={{
                marginTop: size * 0.1,
                background: isFounder
                  ? "#F59E0B"
                  : "linear-gradient(135deg, #A855F7, #00E5A0)",
                padding: `${size * 0.04}px ${size * 0.14}px`,
                borderRadius: size * 0.12,
                fontSize: size * 0.2,
                fontWeight: 900,
                color: isFounder ? "black" : "white",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                boxShadow: isFounder
                  ? "0 0 15px rgba(245,158,11,0.5)"
                  : "0 0 18px rgba(0,229,160,0.4)",
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
