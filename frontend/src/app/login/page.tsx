"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === "register") {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: name } },
                });
                if (error) throw error;
                alert("Check your email for the confirmation link!");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                window.location.href = "/dashboard";
            }
        } catch (err: any) {
            if (err.message === "Email not confirmed") {
                setError("Email not confirmed. Please check your inbox for the verification link (check Spam folder too!).");
            } else {
                setError(err.message || "Authentication failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({ provider: 'google' });
    };

    const signInWithGithub = async () => {
        await supabase.auth.signInWithOAuth({ provider: 'github' });
    };

    return (
        <div style={{
            minHeight: "100vh", background: "var(--bg-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, position: "relative", overflow: "hidden",
        }}>
            {/* Background glow effects */}
            <div style={{ position: "fixed", top: "20%", left: "15%", width: 400, height: 400, borderRadius: "50%", background: "rgba(124,58,237,0.08)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "fixed", bottom: "20%", right: "15%", width: 300, height: 300, borderRadius: "50%", background: "rgba(37,99,235,0.08)", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />

            <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: "var(--gradient-primary)", margin: "0 auto 14px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.5rem", fontWeight: 900, color: "white",
                        boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
                    }}>T</div>
                    <h1 style={{ fontSize: "1.6rem", fontWeight: 900 }}>TulasiAI</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: 4 }}>AI-Powered Education Ecosystem</p>
                </div>

                {/* Card */}
                <div className="glass-card" style={{ padding: 32 }}>
                    {/* Tabs */}
                    <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
                        {(["login", "register"] as const).map((m) => (
                            <button key={m} onClick={() => setMode(m)} style={{
                                flex: 1, padding: "8px 0", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem",
                                background: mode === m ? "var(--gradient-primary)" : "transparent",
                                border: "none", color: "var(--text-primary)", cursor: "pointer", textTransform: "capitalize",
                            }}>{m === "login" ? "Sign In" : "Register"}</button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {error && <div style={{ color: "#ef4444", fontSize: "0.8rem", textAlign: "center", background: "rgba(239,68,68,0.1)", padding: "10px", borderRadius: "8px" }}>{error}</div>}
                        {mode === "register" && (
                            <input className="input-field" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                        )}
                        <input className="input-field" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input className="input-field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", padding: "13px 0", fontSize: "0.95rem", marginTop: 4, opacity: loading ? 0.7 : 1 }}>
                            {loading ? "Processing..." : mode === "login" ? "Sign In →" : "Create Account →"}
                        </button>
                    </form>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
                        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>or continue with</span>
                        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={signInWithGoogle} style={{
                            flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--border)",
                            background: "rgba(255,255,255,0.04)", color: "var(--text-primary)", cursor: "pointer",
                            fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}>🔵 Google</button>
                        <button onClick={signInWithGithub} style={{
                            flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--border)",
                            background: "rgba(255,255,255,0.04)", color: "var(--text-primary)", cursor: "pointer",
                            fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}>⬛ GitHub</button>
                    </div>

                    <div style={{ marginTop: 24, textAlign: "center" }}>
                        <button onClick={() => window.location.href = "/dashboard"} style={{
                            background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.8rem",
                            cursor: "pointer", textDecoration: "underline", opacity: 0.8
                        }}>
                            Skip for now (Guest Access) →
                        </button>
                    </div>
                </div>

                <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}
