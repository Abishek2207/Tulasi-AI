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
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.75rem",
          marginBottom: "1.5rem",
          animation: "spin 1.5s linear infinite",
          boxShadow: "0 0 30px rgba(124,58,237,0.5)",
        }}
      >
        🌿
      </div>

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
