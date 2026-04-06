"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usersApi } from "@/lib/api";
import { ShieldCheck, UserCircle, Loader2 } from "lucide-react";

export function UsernameModal({ 
  isOpen, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onSuccess: (username: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const val = username.toLowerCase().trim();
    if (val.length < 3 || val.length > 20) {
      setError("Username must be 3-20 characters.");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(val)) {
      setError("Only lowercase letters, numbers, and underscores allowed.");
      return;
    }

    setLoading(true);
    try {
      const res = await usersApi.setUsername(val);
      onSuccess(res.username);
    } catch (err: any) {
      setError(err.message || "Failed to set username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(12px)",
              zIndex: 99998,
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 99999,
              width: "90%",
              maxWidth: 420,
              background: "linear-gradient(to bottom, #1A1A24, #12121A)",
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
              padding: 32,
              overflow: "hidden"
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: 20, 
                background: "rgba(139, 92, 246, 0.1)", 
                border: "1px solid rgba(139, 92, 246, 0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <ShieldCheck size={32} color="#8B5CF6" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px 0" }}>Claim Your Username</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
                TulasiAI is going social. Choose a unique username to connect with peers and mentors.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <UserCircle size={20} color="var(--text-muted)" style={{ position: "absolute", left: 16 }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                    placeholder="e.g. alex_coder99"
                    disabled={loading}
                    autoFocus
                    style={{
                      width: "100%",
                      background: "rgba(0,0,0,0.2)",
                      border: error ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: "16px 16px 16px 48px",
                      color: "white",
                      fontSize: 16,
                      fontWeight: 600,
                      outline: "none",
                      transition: "all 0.2s"
                    }}
                  />
                </div>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} style={{ color: "#EF4444", fontSize: 13, marginTop: 8, textAlign: "center" }}>
                    {error}
                  </motion.div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading || username.length < 3}
                type="submit"
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 12,
                  background: (loading || username.length < 3) ? "rgba(255,255,255,0.1)" : "white",
                  color: (loading || username.length < 3) ? "var(--text-muted)" : "black",
                  border: "none",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: (loading || username.length < 3) ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s"
                }}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : "Secure Username"}
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
