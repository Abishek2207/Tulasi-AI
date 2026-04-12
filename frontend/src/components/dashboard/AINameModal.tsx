"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, User } from "lucide-react";
import { authApi } from "@/lib/api";

export function AINameModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only show once per session or if not set in profile
    const mentorName = localStorage.getItem("ai_mentor_name");
    const dismissed = localStorage.getItem("ai_mentor_modal_dismissed");
    
    if (!mentorName && !dismissed) {
      // Delay slightly for dramatic effect on dashboard entry
      setTimeout(() => setIsOpen(true), 1500);
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      // Use existing fetch structure to call /api/profile/set-mentor-name
      const token = localStorage.getItem("tulasi_token");
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/profile/set-mentor-name`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ mentor_name: name })
        });
      }
      
      localStorage.setItem("ai_mentor_name", name);
      window.dispatchEvent(new Event("mentorNameUpdated"));
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to save AI mentor name:", err);
      // Failsafe: still save locally
      localStorage.setItem("ai_mentor_name", name);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("ai_mentor_modal_dismissed", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            background: "#09090b",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "32px",
            borderRadius: "24px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.1)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.05)"
            }}>
              <Sparkles size={24} color="#A78BFA" />
            </div>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "white", margin: 0 }}>Name Your AI Mentor</h2>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>Personalize your career guide</p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: "24px", marginTop: "24px" }}>
              <div style={{ position: "relative" }}>
                <User size={18} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="e.g., Arjun, Athena, Jarvis..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  autoFocus
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "14px 16px 14px 44px",
                    color: "white",
                    fontSize: "15px",
                    outline: "none",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--brand-primary)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={handleDismiss}
                style={{
                  flex: 1, padding: "12px", background: "transparent",
                  color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={!name.trim() || loading}
                style={{
                  flex: 2, padding: "12px", background: name.trim() ? "var(--brand-primary)" : "rgba(255,255,255,0.05)",
                  color: name.trim() ? "white" : "rgba(255,255,255,0.3)", border: "none",
                  borderRadius: "12px", fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "all 0.2s"
                }}
              >
                {loading ? "Saving..." : "Meet " + (name.trim() || "Mentor")}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
