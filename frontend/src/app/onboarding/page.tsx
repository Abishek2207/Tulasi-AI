"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "@/hooks/useSession";
// Removed unused api import
import toast from "react-hot-toast";
import { TulasiLogo } from "@/components/TulasiLogo";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== "loading";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<"STUDENT" | "PROFESSIONAL" | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      if (user.user_type === "STUDENT") {
        router.replace("/dashboard/student");
      } else if (user.user_type === "PROFESSIONAL") {
        router.replace("/dashboard/professional");
      }
    }
  }, [user, isLoaded, router]);

  const handleContinue = async () => {
    if (!selectedType) {
      toast.error("Please select an option to continue");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/profile/set-user-type?user_type=${selectedType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to set user profile");
      }
      
      const updatedUser = await response.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("tulasi-auth-change"));
      
      toast.success("Profile fully setup!");
      
      if (selectedType === "STUDENT") {
        router.push("/dashboard/student");
      } else {
        router.push("/dashboard/professional");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during onboarding!");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0B0C10", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", width: "150%", height: "150%", top: "-25%", left: "-25%", background: "radial-gradient(circle at 50% 50%, rgba(78,205,196,0.05), transparent 60%)" }} />
      </div>
      
      <div style={{ zIndex: 10, maxWidth: 600, width: "100%", padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
          <TulasiLogo size={56} showText glow />
        </div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: "#111218", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "40px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "white", marginBottom: 10, textAlign: "center", fontFamily: "var(--font-outfit)" }}>
            Welcome to Tulasi AI
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 30 }}>
            To personalize your experience, please tell us about your current status:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <button
              onClick={() => setSelectedType("STUDENT")}
              style={{
                background: selectedType === "STUDENT" ? "rgba(78,205,196,0.1)" : "rgba(255,255,255,0.03)",
                border: `2px solid ${selectedType === "STUDENT" ? "#4ECDC4" : "rgba(255,255,255,0.05)"}`,
                borderRadius: 16,
                padding: "20px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <h3 style={{ color: "white", fontSize: 18, marginBottom: 4 }}>🎓 I am a Student</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Preparing for placements, internships, and skill development.</p>
            </button>

            <button
              onClick={() => setSelectedType("PROFESSIONAL")}
              style={{
                background: selectedType === "PROFESSIONAL" ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.03)",
                border: `2px solid ${selectedType === "PROFESSIONAL" ? "#8B5CF6" : "rgba(255,255,255,0.05)"}`,
                borderRadius: 16,
                padding: "20px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <h3 style={{ color: "white", fontSize: 18, marginBottom: 4 }}>💼 I am a Working Professional</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Looking to upskill, transition roles, or increase salary.</p>
            </button>
          </div>

          <motion.button
            onClick={handleContinue}
            disabled={!selectedType || loading}
            whileHover={{ scale: selectedType && !loading ? 1.02 : 1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: "100%",
              background: !selectedType ? "rgba(255,255,255,0.1)" : "white",
              color: !selectedType ? "rgba(255,255,255,0.3)" : "#111",
              border: "none",
              borderRadius: 12,
              padding: "16px",
              fontSize: 16,
              fontWeight: 700,
              cursor: !selectedType || loading ? "not-allowed" : "pointer",
              marginTop: 30,
              transition: "all 0.3s"
            }}
          >
            {loading ? "Customizing your experience..." : "Continue to Dashboard"}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
