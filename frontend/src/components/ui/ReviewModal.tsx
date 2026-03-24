"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export function ReviewModal() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    // Check if review has been submitted before
    const isSubmitted = localStorage.getItem("review_submitted");
    const sessionCount = parseInt(localStorage.getItem("ai_session_count") || "0", 10);
    
    // Auto-trigger logic: Only if they haven't submitted, and they have at least 1 session logged
    if (!isSubmitted && sessionCount > 0) {
      // Small delay so it feels natural
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleSubmit = async () => {
    if (!review.trim()) return;
    setIsSubmitting(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const name = session?.user?.name || user?.name || "Anonymous Engineer";
      
      const payload = {
        name,
        role: "Student / Developer",
        company: "Software Engineering",
        review: review.trim(),
        rating,
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tulasiai.up.railway.app";
      const res = await fetch(`${API_URL}/api/reviews/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsSuccess(true);
        localStorage.setItem("review_submitted", "true");
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#7C3AED', '#06B6D4', '#F43F5E']
        });
        setTimeout(() => setIsOpen(false), 3000);
      }
    } catch (e) {
      console.error("Failed to submit review", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)"
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          style={{
            width: "90%", maxWidth: 480, background: "var(--bg-primary)",
            borderRadius: 24, border: "1px solid var(--border)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.4)", overflow: "hidden", position: "relative"
          }}
        >
          {/* Header */}
          <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)", position: "relative" }}>
            <button onClick={() => setIsOpen(false)} style={{ position: "absolute", right: 24, top: 24, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
               <X size={20} />
            </button>
            <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 8 }}>
              {isSuccess ? "Review Processed" : "Engine Calibration"}
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              {isSuccess ? "Your trajectory feedback has been synced globally." : "How was your experience with the Tulasi AI simulation engine?"}
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "32px" }}>
            {isSuccess ? (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                 <CheckCircle2 size={64} color="#10B981" />
                 <div style={{ fontSize: 18, fontWeight: 700 }}>Thank you for your feedback!</div>
              </motion.div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Interactive Stars */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: "transparent", border: "none", cursor: "pointer", padding: 0,
                        color: (hoverRating || rating) >= star ? "#F59E0B" : "var(--text-muted)",
                        transition: "color 0.2s"
                      }}
                    >
                      <Star size={36} fill={(hoverRating || rating) >= star ? "#F59E0B" : "transparent"} strokeWidth={1} />
                    </motion.button>
                  ))}
                </div>

                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience (e.g. 'Tulasi AI completely re-engineered my interview mindset...')"
                  style={{
                    width: "100%", height: 120, padding: 16, borderRadius: 16, border: "1px solid var(--border)",
                    background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14,
                    resize: "none", outline: "none", fontFamily: "var(--font-inter)",
                    boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)"
                  }}
                />

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !review.trim()}
                  className="btn-primary"
                  style={{
                    width: "100%", padding: 16, borderRadius: 14, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    opacity: (!review.trim() || isSubmitting) ? 0.5 : 1, cursor: (!review.trim() || isSubmitting) ? "not-allowed" : "pointer"
                  }}
                >
                  {isSubmitting ? "Syncing..." : "SUBMIT FEEDBACK"}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
