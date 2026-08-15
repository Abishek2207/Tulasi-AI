"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { TulasiLogo } from "@/components/TulasiLogo";
import toast from "react-hot-toast";
import { ArrowLeft, Github, Mail, Lock, User, KeyRound } from "lucide-react";

function getPasswordStrength(pwd: string) {
  if (!pwd) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pwd.length > 5) score++;
  if (pwd.length > 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  
  if (score <= 2) return { score, label: "Weak", color: "#EF4444" };
  if (score <= 4) return { score, label: "Good", color: "#F59E0B" };
  return { score, label: "Strong", color: "#10B981" };
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [oAuthLoading, setOAuthLoading] = useState<string | null>(null);
  
  const appUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_APP_URL || "https://tulasiai.vercel.app");
  
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  const handleGoogleLogin = async () => {
    if (oAuthLoading) return;
    setOAuthLoading("google");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${appUrl}/auth/callback`, queryParams: { prompt: "select_account" } },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error("Google sign-in failed: " + err.message);
      setOAuthLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    if (oAuthLoading) return;
    setOAuthLoading("github");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${appUrl}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error("GitHub sign-in failed: " + err.message);
      setOAuthLoading(null);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Enter your email first.");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${appUrl}/auth`,
      });
      if (error) {
        toast.error("Password reset failed: " + error.message);
        return;
      }
      toast.success("Password reset link sent.");
    } catch {
      toast.error("Unexpected reset error. Please try again.");
    }
  };
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter your email");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.requestOtp(email);
      setShowOtp(true);
      toast.success(data.message || "Verification code sent to your email!", { duration: data.message?.includes("DEV") ? 10000 : 4000 });
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast.error("Enter the verification code");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.verifyOtp(email, otpCode, name || undefined);

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        document.cookie = `token=${data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      window.dispatchEvent(new Event("tulasi-auth-change"));
      
      toast.success("Authentication successful!");
      
      if (data.user?.role === "admin" || data.user?.email.toLowerCase() === "abishekramamoorthy22@gmail.com") {
        router.push("/admin");
      } else if (!(data.user as any)?.is_onboarded) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0A0A0A", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      
      {/* Background Effects */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "50%", background: "radial-gradient(ellipse at top, rgba(6,182,212,0.15), transparent 60%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px", maskImage: "radial-gradient(circle at center, black, transparent 80%)", WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)" }} />
      </div>

      {/* Top Nav */}
      <div style={{ padding: "24px", position: "relative", zIndex: 10 }}>
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      {/* Main Centered Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: 440, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: "40px 32px", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 24px 48px rgba(0,0,0,0.4)" }}>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(6,182,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, border: "1px solid rgba(6,182,212,0.2)", boxShadow: "0 8px 16px rgba(6,182,212,0.2)" }}>
              <TulasiLogo size={36} glow />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "white", marginBottom: 8, textAlign: "center", letterSpacing: "-0.5px" }}>
              {isLogin ? "Continue Your Growth" : "Create an account"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, textAlign: "center" }}>
              {isLogin ? "Enter your details to access your AI dashboard." : "Join the AI Career Operating System."}
            </p>
          </div>

          {!showOtp ? (
            <form onSubmit={handleRequestOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }}><User size={18} /></div>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required 
                        style={{ width: "100%", padding: "14px 16px 14px 44px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "white", fontSize: 15, outline: "none", transition: "all 0.2s" }}
                        onFocus={e => e.target.style.borderColor = "#06B6D4"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }}><Mail size={18} /></div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required 
                  style={{ width: "100%", padding: "14px 16px 14px 44px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "white", fontSize: 15, outline: "none", transition: "all 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#06B6D4"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>

              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #06B6D4, #0891B2)", color: "white", fontWeight: 800, fontSize: 15, borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8, boxShadow: "0 8px 16px rgba(6,182,212,0.25)", opacity: loading ? 0.7 : 1 }}>
                {loading ? <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : "Continue with Email"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }}><KeyRound size={18} /></div>
                <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="Enter 6-digit OTP" required maxLength={6}
                  style={{ width: "100%", padding: "14px 16px 14px 44px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "white", fontSize: 15, outline: "none", transition: "all 0.2s", letterSpacing: "2px" }}
                  onFocus={e => e.target.style.borderColor = "#06B6D4"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>

              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #10B981, #059669)", color: "white", fontWeight: 800, fontSize: 15, borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8, boxShadow: "0 8px 16px rgba(16,185,129,0.25)", opacity: loading ? 0.7 : 1 }}>
                {loading ? <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : "Verify & Sign In"}
              </button>

              <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                <button type="button" onClick={() => setShowOtp(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14 }}>
                  Use a different email
                </button>
              </div>
            </form>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Or continue with</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            <button onClick={handleGoogleLogin} disabled={!!oAuthLoading}
              style={{ padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: oAuthLoading ? "not-allowed" : "pointer" }}>
              {oAuthLoading === "google" ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <img src="https://authjs.dev/img/providers/google.svg" width={18} height={18} alt="Google" />}
              Continue with Google
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 32, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: "transparent", border: "none", color: "#06B6D4", fontWeight: 700, cursor: "pointer", padding: 0 }}>
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        /* Add responsive padding for mobile */
        @media (max-width: 640px) {
          .auth-modal { padding: 32px 20px !important; }
        }
      `}} />
    </div>
  );
}
