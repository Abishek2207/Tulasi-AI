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
        background: "radial-gradient(circle at center, #0B0E14 0%, #05070A 100%)",
        fontFamily: "var(--font-outfit), Inter, system-ui, sans-serif",
        color: "#e2e8f0",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background Ambient Glows */}
      <div style={{ position: "absolute", top: "20%", left: "15%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "15%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />

      {/* Animated logo container */}
      <div
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "32px",
          background: "rgba(255,255,255,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "2rem",
          animation: "lotus-pulse 3s ease-in-out infinite",
          boxShadow: "0 0 60px rgba(168, 85, 247, 0.2)",
          border: "1px solid rgba(255,255,255,0.08)",
          position: "relative",
          zIndex: 10
        }}
      >
        <TulasiLogo size={56} />
      </div>

      <style>{`
        @keyframes lotus-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 30px rgba(168, 85, 247, 0.2); border-color: rgba(255,255,255,0.08); }
          50% { transform: scale(1.08); opacity: 1; box-shadow: 0 0 70px rgba(34, 211, 238, 0.4); border-color: rgba(34, 211, 238, 0.3); }
        }
      `}</style>

      <div style={{ textAlign: "center", zIndex: 10 }}>
        <p
          style={{
            fontSize: "1.4rem",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            background: "linear-gradient(90deg, #A855F7, #22D3EE, #10B981, #A855F7)",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite",
            marginBottom: "0.5rem",
          }}
        >
          Tulasi AI
        </p>

        <p style={{ opacity: 0.5, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "white" }}>
          Initializing Neural Engine
        </p>
      </div>

      {/* Loading bar */}
      <div
        style={{
          width: "200px",
          height: "2px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "4px",
          marginTop: "2.5rem",
          overflow: "hidden",
          position: "relative",
          zIndex: 10
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, #A855F7, #22D3EE, transparent)",
            animation: "progress-shimmer 2s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes progress-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
      `}</style>
    </div>
  );
}
