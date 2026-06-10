"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  accent?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
  accent = "#8B5CF6",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center",
        padding: "64px 32px", gap: 20,
        borderRadius: 24,
        background: "rgba(255,255,255,0.01)",
        border: "1px dashed rgba(255,255,255,0.08)",
        minHeight: 320,
      }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: 24,
        background: `${accent}12`, border: `1px solid ${accent}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={32} color={accent} strokeWidth={1.5} />
      </div>

      <div style={{ maxWidth: 400 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 10 }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
          {description}
        </p>
      </div>

      {(ctaLabel && (ctaHref || onCtaClick)) && (
        ctaHref ? (
          <a href={ctaHref} target="_blank" rel="noopener noreferrer" style={{
            padding: "12px 28px", borderRadius: 14,
            background: `${accent}18`, border: `1px solid ${accent}35`,
            color: accent, fontWeight: 700, fontSize: 14,
            textDecoration: "none", cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = `${accent}28`)}
          onMouseLeave={e => (e.currentTarget.style.background = `${accent}18`)}
          >
            {ctaLabel}
          </a>
        ) : (
          <button onClick={onCtaClick} style={{
            padding: "12px 28px", borderRadius: 14,
            background: `${accent}18`, border: `1px solid ${accent}35`,
            color: accent, fontWeight: 700, fontSize: 14, cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = `${accent}28`)}
          onMouseLeave={e => (e.currentTarget.style.background = `${accent}18`)}
          >
            {ctaLabel}
          </button>
        )
      )}
    </motion.div>
  );
}
