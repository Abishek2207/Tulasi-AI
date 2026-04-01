"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, X, CheckCircle2, User, Mail, Briefcase, MessageSquare } from "lucide-react";
import confetti from "canvas-confetti";

interface ReviewFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function ReviewForm({ onClose, onSuccess }: ReviewFormProps) {
  const [step, setStep] = useState<"form" | "submitting" | "success">("form");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    review: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.review.length < 10) {
      setError("Review must be at least 10 characters long.");
      return;
    }
    setError("");
    setStep("submitting");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tulasi-ai-wgwl.onrender.com";
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rating
        })
      });

      if (res.ok) {
        setStep("success");
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#A855F7", "#22D3EE", "#10B981"]
        });
        if (onSuccess) onSuccess();
      } else {
        const errData = await res.json();
        setError(errData.detail || "Failed to submit review. Please try again.");
        setStep("form");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      setStep("form");
    }
  };

  if (step === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: "center", padding: "40px 20px" }}
      >
        <div style={{ 
          width: 80, height: 80, borderRadius: "50%", background: "rgba(16,185,129,0.1)", 
          display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981",
          margin: "0 auto 24px"
        }}>
          <CheckCircle2 size={48} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "white", marginBottom: 12 }}>Review Received!</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.6 }}>
          Thank you for helping us build the future of AI learning. Your feedback is invaluable to the Tulasi AI community.
        </p>
        <button 
          onClick={onClose}
          style={{ 
            padding: "12px 32px", borderRadius: 12, background: "var(--brand-primary)", 
            color: "white", border: "none", fontWeight: 700, cursor: "pointer" 
          }}
        >
          Return to Dashboard
        </button>
      </motion.div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {onClose && (
        <button 
          onClick={onClose}
          style={{ 
            position: "absolute", top: -10, right: -10, background: "rgba(255,255,255,0.05)", 
            border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", 
            alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" 
          }}
        >
          <X size={18} />
        </button>
      )}

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 8, letterSpacing: "-0.5px" }}>
          Share Your Experience
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          How is Tulasi AI helping you engineer your career?
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        
        {/* Rating Picker */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
            Rating
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
                style={{ 
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  transition: "transform 0.2s"
                }}
              >
                <Star 
                  size={28} 
                  fill={(hoverRating || rating) >= s ? "#FFD93D" : "none"} 
                  color={(hoverRating || rating) >= s ? "#FFD93D" : "rgba(255,255,255,0.1)"} 
                  style={{ transform: (hoverRating || rating) >= s ? "scale(1.1)" : "scale(1)" }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Name</label>
            <div style={{ position: "relative" }}>
              <User size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input 
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                style={{ 
                  width: "100%", padding: "12px 12px 12px 36px", borderRadius: 12, 
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "white", fontSize: 14
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Email (Optional)</label>
            <div style={{ position: "relative" }}>
              <Mail size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input 
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                style={{ 
                  width: "100%", padding: "12px 12px 12px 36px", borderRadius: 12, 
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "white", fontSize: 14
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Role / Title</label>
          <div style={{ position: "relative" }}>
            <Briefcase size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              placeholder="Software Engineer at Google"
              style={{ 
                width: "100%", padding: "12px 12px 12px 36px", borderRadius: 12, 
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                color: "white", fontSize: 14
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Your Review</label>
          <div style={{ position: "relative" }}>
            <MessageSquare size={14} style={{ position: "absolute", left: 12, top: 14, color: "var(--text-muted)" }} />
            <textarea 
              required
              minLength={10}
              maxLength={1000}
              value={formData.review}
              onChange={e => setFormData({ ...formData, review: e.target.value })}
              placeholder="Tell us what you think..."
              rows={4}
              style={{ 
                width: "100%", padding: "12px 12px 12px 36px", borderRadius: 12, 
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                color: "white", fontSize: 14, resize: "none"
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)" }}>
            <span>Min 10 characters</span>
            <span>{formData.review.length}/1000</span>
          </div>
        </div>

        {error && (
          <div style={{ 
            padding: "10px 14px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)",
            borderRadius: 8, color: "#F43F5E", fontSize: 13, fontWeight: 600
          }}>
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={step === "submitting"}
          style={{ 
            marginTop: 8, padding: "16px", borderRadius: 12, background: "var(--brand-primary)",
            color: "white", border: "none", fontWeight: 800, fontSize: 15, display: "flex",
            alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer",
            transition: "all 0.2s", opacity: step === "submitting" ? 0.7 : 1
          }}
        >
          {step === "submitting" ? "Transmitting..." : (
            <>Submit Review <Send size={18} /></>
          )}
        </button>

      </form>
    </div>
  );
}
