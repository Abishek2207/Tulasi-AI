"use client";

type BadgeVariant = "live" | "beta" | "connect" | "needs-profile" | "coming-soon";

const CONFIG: Record<BadgeVariant, { label: string; dot: boolean; color: string; bg: string; border: string }> = {
  live:           { label: "Live",                dot: true,  color: "#10B981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)" },
  beta:           { label: "Beta",                dot: false, color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
  connect:        { label: "Connect Data Source", dot: false, color: "#F43F5E", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.25)"  },
  "needs-profile":{ label: "Needs Profile Data",  dot: false, color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)" },
  "coming-soon":  { label: "Coming Soon",         dot: false, color: "#64748B", bg: "rgba(100,116,139,0.1)",border: "rgba(100,116,139,0.25)"},
};

interface AgentBadgeProps {
  variant: BadgeVariant;
  size?: "sm" | "md";
}

export function AgentBadge({ variant, size = "sm" }: AgentBadgeProps) {
  const c = CONFIG[variant];
  const fontSize = size === "md" ? 13 : 11;
  const padding  = size === "md" ? "5px 12px" : "3px 9px";

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding, borderRadius: 20,
      fontSize, fontWeight: 700, letterSpacing: "0.3px",
      color: c.color, background: c.bg, border: `1px solid ${c.border}`,
    }}>
      {c.dot && (
        <span style={{
          width: 6, height: 6, borderRadius: "50%", background: c.color,
          boxShadow: `0 0 6px ${c.color}`,
          animation: "agentPulse 2s ease-in-out infinite",
          display: "inline-block", flexShrink: 0,
        }} />
      )}
      {c.label}
      <style>{`
        @keyframes agentPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </span>
  );
}
