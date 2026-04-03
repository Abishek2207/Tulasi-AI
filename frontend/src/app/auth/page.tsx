"use client";

import { useState } from "react";
import { signIn } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { authApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { TulasiLogo } from "@/components/TulasiLogo";
import toast from "react-hot-toast";


// Password Strength Utility
function getPasswordStrength(pwd: string) {
  if (!pwd) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pwd.length > 5) score++;
  if (pwd.length > 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  
  if (score <= 2) return { score, label: "Weak", color: "#FF5F57" };
  if (score <= 4) return { score, label: "Good", color: "#FEBC2E" };
  return { score, label: "Strong", color: "#28C840" };
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [oAuthLoading, setOAuthLoading] = useState<string | null>(null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tulasiai.vercel.app";
  const router = useRouter();

  const handleGoogleLogin = async () => {
    if (oAuthLoading) return;
    setOAuthLoading("google");
    try {
      console.log("[Auth] Triggering Supabase Google OAuth...");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Must match the Authorized Redirect URI set in Google Cloud Console
          // and the Supabase Auth → Providers → Google → Redirect URL
          redirectTo: `${appUrl}/auth/callback`,
        },
      });
      if (error) {
        console.error("[Auth] Google OAuth error:", error.message);
        toast.error("Google sign-in failed: " + error.message);
        setOAuthLoading(null);
      }
      // On success Supabase redirects the browser — no further code runs here
    } catch (err: any) {
      console.error("[Auth Error] Unexpected Google OAuth failure:", err);
      toast.error("Unexpected authentication error. Please try again.");
      setOAuthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      try {
        console.log("[Auth] Attempting login for:", email);
        // Call backend directly first to get token, then sync to NextAuth session
        const data = await authApi.login(email, password);
        console.log("[Auth] Login successful. Saving token.");
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        // Token saved. UseSession will read it.
        window.dispatchEvent(new Event("tulasi-auth-change"));
        router.push("/dashboard");
      } catch (err: unknown) {
        const error = err as Error;
        const msg = error.message || "Invalid email or password.";
        console.error("[Auth Error] Login completely failed:", error);
        setError(msg);
        toast.error(msg);
      }
    } else {
      try {
        console.log("[Auth] Attempting registration for:", email);
        const data = await authApi.register(email, password, name, inviteCode);
        console.log("[Auth] Registration successful. Saving token.");
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        // Token saved. UseSession will read it.
        window.dispatchEvent(new Event("tulasi-auth-change"));
        router.push("/dashboard");
      } catch (err: unknown) {
        const error = err as Error;
        const msg = error.message || "Registration failed.";
        console.error("[Auth Error] Registration completely failed:", error);
        setError(msg);
        toast.error(msg);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0B0C10", display: "flex", position: "relative", overflow: "hidden" }}>
      
      {/* Left side - Illustration/Brand (Visible on desktop) */}
      <div className="auth-left-panel" style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", padding: "60px", justifyContent: "space-between" }}>
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
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          style={{ width: "100%", maxWidth: 420, padding: "0 32px" }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
            style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}
          >
            <TulasiLogo size={64} showText glow />
          </motion.div>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 8, fontFamily: "var(--font-outfit)" }}>
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              {isLogin ? "Enter your details to access your dashboard." : "Join Tulasi AI Pro for free today."}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* OAuth Buttons completely disabled 
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
              ... Google ...
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>...</div> 
            */}

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: "auto", scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }} transition={{ bounce: 0 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 8, transition: "color 0.2s" }}>Full Name</label>
                  <motion.input whileFocus={{ scale: 1.02 }} value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" required 
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 18px", color: "white", fontSize: 15, outline: "none", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)" }}
                    onFocus={e => { e.target.style.borderColor = "#4ECDC4"; e.target.style.background = "rgba(78,205,196,0.05)" }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.03)" }}
                  />

                  <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", display: "block", marginTop: 20, marginBottom: 8, transition: "color 0.2s" }}>Invite Code (Optional)</label>
                  <motion.input whileFocus={{ scale: 1.02 }} value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="e.g. A1B2C3D4" 
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 18px", color: "white", fontSize: 15, outline: "none", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)", textTransform: "uppercase" }}
                    onFocus={e => { e.target.style.borderColor = "#8B5CF6"; e.target.style.background = "rgba(139,92,246,0.05)" }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.03)" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 8, transition: "color 0.2s" }}>Email Address</label>
              <motion.input whileFocus={{ scale: 1.02 }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required 
                style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 18px", color: "white", fontSize: 15, outline: "none", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)" }}
                onFocus={e => { e.target.style.borderColor = "#4ECDC4"; e.target.style.background = "rgba(78,205,196,0.05)" }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.03)" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Password</label>
                {isLogin && <a href="#" style={{ fontSize: 12, color: "#4ECDC4", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color="white"} onMouseLeave={e => e.currentTarget.style.color="#4ECDC4"}>Forgot password?</a>}
              </div>
              <motion.input whileFocus={{ scale: 1.02 }} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required 
                style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 18px", color: "white", fontSize: 15, outline: "none", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)" }}
                onFocus={e => { e.target.style.borderColor = "#4ECDC4"; e.target.style.background = "rgba(78,205,196,0.05)" }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.03)" }}
              />
              
              <AnimatePresence>
                {!isLogin && password.length > 0 && (() => {
                  const strength = getPasswordStrength(password);
                  return (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", gap: 4, height: 4 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} style={{ flex: 1, borderRadius: 2, background: i <= strength.score ? strength.color : "rgba(255,255,255,0.1)", transition: "all 0.3s ease" }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: strength.color, textAlign: "right", fontWeight: 600 }}>{strength.label}</div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#FF8585", display: "flex", gap: 8, alignItems: "center" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
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
