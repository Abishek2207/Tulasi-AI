"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { TulasiLogo } from "@/components/TulasiLogo";
import toast from "react-hot-toast";
import { ArrowLeft, Github, Mail, Lock, User, KeyRound } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initMode = searchParams.get("mode") === "register" ? false : true;

  const [isLogin, setIsLogin] = useState(initMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oAuthLoading, setOAuthLoading] = useState<string | null>(null);
  
  const appUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_APP_URL || "https://tulasiai.vercel.app");
  
  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/pricing");
  }, [router]);

  const handleGoogleLogin = async () => {
    if (oAuthLoading) return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (!supabaseUrl || supabaseUrl.includes("localhost:54321") || supabaseUrl.includes("dummy")) {
      toast.error("Google authentication is not configured. Set a real NEXT_PUBLIC_SUPABASE_URL.");
      return;
    }
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

  const handleAuthSuccess = (data: any) => {
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      document.cookie = `token=${data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    window.dispatchEvent(new Event("tulasi-auth-change"));
    
    toast.success("Authentication successful!");

    const pendingCheckoutPlan = localStorage.getItem("pending_checkout_plan");
    if (pendingCheckoutPlan) {
      router.push("/pricing");
      return;
    }
    
    if (data.user?.role === "admin" || data.user?.email.toLowerCase() === "abishekramamoorthy22@gmail.com") {
      router.push("/admin");
    } else if (!(data.user as any)?.is_onboarded) {
      router.push("/onboarding");
    } else {
      router.push("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!isLogin && !name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // email can be email or member_id
        const data = await authApi.login(email.trim(), password);
        handleAuthSuccess(data);
      } else {
        const data = await authApi.register(email.trim(), password, name.trim());
        handleAuthSuccess(data);
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0A0A0A", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      
      {/* Background Effects */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "50%", background: "radial-gradient(ellipse at top, rgba(6,182,212,0.15), transparent 60%)" }} />
      </div>

      <div style={{ padding: "24px", position: "relative", zIndex: 10 }}>
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }}><User size={18} /></div>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required={!isLogin}
                      style={{ width: "100%", padding: "14px 16px 14px 44px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "white", fontSize: 15, outline: "none", transition: "all 0.2s" }}
                      onFocus={e => e.target.style.borderColor = "#06B6D4"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }}><Mail size={18} /></div>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder={isLogin ? "Email or Member ID (TUL-STU-...)" : "Email Address"} required 
                style={{ width: "100%", padding: "14px 16px 14px 44px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "white", fontSize: 15, outline: "none", transition: "all 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#06B6D4"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }}><Lock size={18} /></div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required 
                style={{ width: "100%", padding: "14px 16px 14px 44px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "white", fontSize: 15, outline: "none", transition: "all 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#06B6D4"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
            </div>

            <button type="submit" disabled={loading} style={{ background: loading ? "rgba(6,182,212,0.5)" : "#06B6D4", color: "white", padding: "14px 24px", borderRadius: 14, border: "none", fontSize: 16, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 8, transition: "all 0.2s" }}>
              {loading ? "Authenticating..." : (isLogin ? "Login" : "Create Account")}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", margin: "24px 0", gap: 16 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, textTransform: "uppercase" }}>Or continue with</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={handleGoogleLogin} disabled={!!oAuthLoading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 500, cursor: oAuthLoading ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button onClick={handleGithubLogin} disabled={!!oAuthLoading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 500, cursor: oAuthLoading ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
              <Github size={18} />
              GitHub
            </button>
          </div>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <span style={{ color: "#06B6D4", fontWeight: 600 }}>{isLogin ? "Sign up" : "Log in"}</span>
            </button>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
