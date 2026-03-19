"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { authApi } from "@/lib/api";
import { TulasiLogo } from "@/components/TulasiLogo";

// TulasILogo Pro - with the leaf/circuit design and Pro badge
function TulasiLogoPro() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", marginBottom: 36 }}>
      <div style={{ position: "relative" }}>
        <TulasiLogo size={64} style={{ filter: "drop-shadow(0 10px 30px rgba(78,205,196,0.3))" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 800, fontSize: 26, color: "white", letterSpacing: "-0.5px", lineHeight: 1 }}>
          Tulasi<span style={{ color: "#4ECDC4" }}>AI</span>
        </span>
        <span style={{ 
          background: "linear-gradient(90deg, #6C63FF, #FF6B9D)", 
          padding: "2px 8px", 
          borderRadius: 4, 
          fontSize: 10, 
          fontWeight: 800, 
          color: "white", 
          marginTop: 4,
          letterSpacing: "1px",
          textTransform: "uppercase"
        }}>
          Pro
        </span>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [oAuthLoading, setOAuthLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/dashboard");
      }
    } else {
      try {
        const res = await authApi.register(email, password, name);
        // If the request succeeds, it returns the token and user. If it fails, our fetchWithRetry helper throws an Error.
        await signIn("credentials", { email, password, redirect: false });
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message || "Registration failed");
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0B0C10", display: "flex", position: "relative", overflow: "hidden" }}>
      
      {/* Left side - Illustration/Brand (Visible on desktop) */}
      <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", padding: "60px", justifyContent: "space-between", "@media (max-width: 900px)": { display: "none" } } as any}>
        <div style={{ zIndex: 10, position: "relative" }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              &larr; Back to website
            </span>
          </Link>
        </div>
        
        <div style={{ zIndex: 10, position: "relative", maxWidth: 480 }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, fontFamily: "var(--font-outfit)", color: "white", lineHeight: 1.1, marginBottom: 24 }}>
            Shape your future with <span style={{ color: "#4ECDC4" }}>AI</span>.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.6 }}>
            Join thousand of students building their careers with Tulasi AI Pro. Access advanced roadmaps, mock interviews, and personalized feedback.
          </p>
        </div>

        {/* Abstract Background Elements */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", zIndex: 0 }}>
          <div style={{ position: "absolute", width: "150%", height: "150%", top: "-25%", left: "-25%", background: "radial-gradient(circle at 30% 70%, rgba(78,205,196,0.15), transparent 40%)" }} />
          <div style={{ position: "absolute", width: "150%", height: "150%", top: "-25%", left: "-25%", background: "radial-gradient(circle at 70% 30%, rgba(108,99,255,0.15), transparent 40%)" }} />
          {/* Grid lines */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "linear-gradient(to bottom, transparent, black, transparent)", WebkitMaskImage: "linear-gradient(to right, black, transparent)" }} />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#111218", position: "relative", zIndex: 1, boxShadow: "-20px 0 60px rgba(0,0,0,0.5)" }}>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
          style={{ width: "100%", maxWidth: 420, padding: "0 32px" }}
        >
          <TulasiLogoPro />

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 8, fontFamily: "var(--font-outfit)" }}>
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              {isLogin ? "Enter your details to access your dashboard." : "Join Tulasi AI Pro for free today."}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* OAuth Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
              <button type="button" onClick={() => { setOAuthLoading("google"); signIn("google", { callbackUrl: "/dashboard" }); }}
                disabled={oAuthLoading !== null}
                style={{ background: "#1A1C23", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px", color: "white", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: oAuthLoading !== null ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { if(oAuthLoading === null) e.currentTarget.style.background = "#23252E"}}
                onMouseLeave={e => { if(oAuthLoading === null) e.currentTarget.style.background = "#1A1C23"}}
              >
                {oAuthLoading === "google" ? (
                  <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                ) : (
                  <img src="https://authjs.dev/img/providers/google.svg" width={18} height={18} alt="Google" />
                )}
                Google
              </button>
              <button type="button" onClick={() => { setOAuthLoading("github"); signIn("github", { callbackUrl: "/dashboard" }); }}
                disabled={oAuthLoading !== null}
                style={{ background: "#1A1C23", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px", color: "white", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: oAuthLoading !== null ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { if(oAuthLoading === null) e.currentTarget.style.background = "#23252E"}}
                onMouseLeave={e => { if(oAuthLoading === null) e.currentTarget.style.background = "#1A1C23"}}
              >
                {oAuthLoading === "github" ? (
                  <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                ) : (
                  <img src="https://authjs.dev/img/providers/github.svg" width={18} height={18} alt="GitHub" style={{ filter: "invert(1)" }} />
                )}
                GitHub
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 500, textTransform: "uppercase" }}>Or continue with email</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" required 
                    style={{ width: "100%", background: "#1A1C23", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", color: "white", fontSize: 14, outline: "none", transition: "all 0.2s" }}
                    onFocus={e => e.target.style.borderColor = "#4ECDC4"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required 
                style={{ width: "100%", background: "#1A1C23", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", color: "white", fontSize: 14, outline: "none", transition: "all 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#4ECDC4"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Password</label>
                {isLogin && <a href="#" style={{ fontSize: 12, color: "#4ECDC4", textDecoration: "none" }}>Forgot password?</a>}
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required 
                style={{ width: "100%", background: "#1A1C23", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", color: "white", fontSize: 14, outline: "none", transition: "all 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#4ECDC4"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#FF8585", display: "flex", gap: 8, alignItems: "center" }}
                >
                  <span style={{ fontSize: 16 }}>⚠️</span> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              style={{ width: "100%", background: "white", color: "#111", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 8, display: "flex", justifyContent: "center", alignItems: "center", transition: "all 0.2s" }}
            >
              {loading ? (
                <div style={{ width: 20, height: 20, border: "2px solid rgba(0,0,0,0.1)", borderTopColor: "black", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              ) : isLogin ? "Sign In" : "Create Account"}
            </motion.button>
          </form>

          <div style={{ textAlign: "center", marginTop: 32, fontSize: 14, color: "var(--text-secondary)" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(""); }} style={{ background: "transparent", border: "none", color: "white", fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 4 }}>
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
