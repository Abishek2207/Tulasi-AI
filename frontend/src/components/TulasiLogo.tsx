"use client";

import { motion } from "framer-motion";
import { useState } from "react";

/**
 * TulasiLogo — single source of truth for the Tulasi AI logo.
 * Now using the Lotus Neural Design requested by the user.
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
  const [imageFailed, setImageFailed] = useState(false);
  const glowColor = isFounder
    ? "radial-gradient(circle at center, rgba(245,158,11,0.5) 0%, rgba(217,119,6,0.35) 35%, rgba(180,83,9,0.2) 65%, transparent 100%)"
    : "radial-gradient(circle at center, rgba(0,229,160,0.4) 0%, rgba(0,200,255,0.3) 30%, rgba(168,85,247,0.2) 65%, transparent 100%)";

  const effectiveBadge = isFounder ? "FOUNDER" : badge;

  const renderLogoIcon = () => (
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
      whileHover={{
        scale: 1.1,
        filter: "brightness(1.1) drop-shadow(0 0 15px rgba(0,229,160,0.5))",
      }}
      transition={{ type: "spring", stiffness: 350, damping: 15 }}
      animate={splash ? { 
        scale: [1, 1.05, 1],
      } : {}}
    >
      {imageFailed ? (
        <span
          aria-label="Tulasi AI Logo"
          role="img"
          style={{
            alignItems: "center",
            background: "linear-gradient(135deg, #00E5A0, #00C8FF 55%, #A855F7)",
            borderRadius: "10px",
            color: "#07110f",
            display: "flex",
            fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
            fontSize: size * 0.62,
            fontWeight: 950,
            height: size,
            justifyContent: "center",
            lineHeight: 1,
            width: size,
          }}
        >
          T
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo.png?v=20260611"
          alt="Tulasi AI Logo"
          width={size}
          height={size}
          onError={() => setImageFailed(true)}
          style={{
            width: size,
            height: size,
            objectFit: "contain",
            display: "block",
            borderRadius: "10px",
            flexShrink: 0,
          }}
        />
      )}
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
              background: glowColor,
              filter: "blur(20px)",
              zIndex: 0
            }}
          />
          {/* Outer rotating ring */}
          <motion.div
            style={{
              position: "absolute",
              inset: -size * 0.2,
              borderRadius: "50%",
              border: "1.5px solid transparent",
              backgroundImage: "linear-gradient(135deg, rgba(0,229,160,0.6), rgba(168,85,247,0.6), rgba(0,200,255,0.6))",
              backgroundOrigin: "border-box",
              backgroundClip: "border-box",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              zIndex: 1,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          {renderLogoIcon()}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
            fontWeight: 900,
            fontSize: size * 0.8,
            background: "linear-gradient(135deg, #ffffff 0%, #00E5A0 60%, #A855F7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.05em",
            textAlign: "center"
          }}
        >
          TulasiAI
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
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
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
        {renderLogoIcon()}
      </div>

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
                fontSize: size * 0.18,
                fontWeight: 900,
                color: isFounder ? "black" : "white",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                display: "inline-block",
                boxShadow: isFounder
                  ? "0 0 15px rgba(245,158,11,0.4)"
                  : "0 0 18px rgba(0,229,160,0.3)",
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
