import { TulasiLogo } from "@/components/TulasiLogo";

/**
 * Global Next.js loading page.
 * Shown during navigation while pages are loading.
 */
export default function GlobalLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#e2e8f0",
      }}
    >
      {/* Animated logo */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(124,58,237,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
          animation: "pulse-glow 2s ease-in-out infinite",
          boxShadow: "0 0 40px rgba(124,58,237,0.3)",
          border: "1px solid rgba(124,58,237,0.2)",
        }}
      >
        <TulasiLogo size={48} />
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 20px rgba(124,58,237,0.3); }
          50% { transform: scale(1.05); opacity: 1; box-shadow: 0 0 40px rgba(124,58,237,0.5); }
        }
      `}</style>

      <p
        style={{
          fontSize: "1.1rem",
          fontWeight: 600,
          letterSpacing: "0.05em",
          background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "0.5rem",
        }}
      >
        Tulasi AI
      </p>

      <p style={{ opacity: 0.45, fontSize: "0.85rem", letterSpacing: "0.03em" }}>
        Loading…
      </p>

      {/* Pulsing dots */}
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          marginTop: "1.5rem",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "rgba(167,139,250,0.7)",
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              display: "inline-block",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
