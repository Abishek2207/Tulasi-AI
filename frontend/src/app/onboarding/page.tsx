"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import toast from "react-hot-toast";
import { TulasiLogo } from "@/components/TulasiLogo";
import { GraduationCap, ArrowRight } from "lucide-react";

const YEAR_INFO: Record<string, { label: string; focus: string; color: string }> = {
  "1st Year": { label: "1st Year", focus: "C/Python basics, Maths, Digital Logic, Soft Skills, College orientation", color: "#6366f1" },
  "2nd Year": { label: "2nd Year", focus: "DSA, OOP, DBMS, Web Dev basics, Mini-projects, LeetCode Easy", color: "#8B5CF6" },
  "3rd Year": { label: "3rd Year", focus: "Advanced DSA, Internship prep, Full Stack / AI-ML, Open source, LeetCode Medium", color: "#A855F7" },
  "4th Year": { label: "4th Year", focus: "Placement DSA, System Design, Company prep (TCS/MAANG), GATE/GRE, Resume", color: "#EC4899" },
};

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== "loading";
  const router = useRouter();
  
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<"STUDENT" | "PROFESSIONAL" | null>(null);
  
    
  // Student Data
  const [collegeName, setCollegeName] = useState("");
  const [degree, setDegree] = useState("");
  const [department, setDepartment] = useState("");
  const [studentYear, setStudentYear] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [placementGoal, setPlacementGoal] = useState("");
  const [weakAreas, setWeakAreas] = useState("");
  const [resumeStatus, setResumeStatus] = useState("");
  const [existingProjects, setExistingProjects] = useState("");
  

  // Shared Preferences Data
  const [dailyAvailableTime, setDailyAvailableTime] = useState("");
  const [availableDays, setAvailableDays] = useState("");
  
  // AI Mentor
  const [mentorName, setMentorName] = useState("Jarvis");

  useEffect(() => {
    // If the user already completed onboarding, redirect to dashboard if they are just visiting
    if (isLoaded && user && user.is_onboarded) {
      router.replace("/dashboard");
    }
  }, [user, isLoaded, router]);

  const handleFinish = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
      const token = localStorage.getItem("token") || "";

      // 1. Set User Type to userType (STUDENT or PROFESSIONAL)
      const typeRes = await fetch(`${apiUrl}/api/profile/set-user-type?user_type=${userType || "STUDENT"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      if (!typeRes.ok) throw new Error("Failed to set user type");
      
      const updatedUser = await typeRes.json();

      // 2. Build Student Profile Payload
      const profilePayload = {
        student_year: studentYear,
        placement_goal: placementGoal,
        college_name: collegeName,
        degree: degree,
        department: department,
        target_role: targetRole,
        weak_areas: weakAreas,
        resume_status: resumeStatus,
        existing_projects: existingProjects,
        daily_available_hours: dailyAvailableTime,
        available_days: availableDays
      };

      // 3. Update Profile Data
      const profRes = await fetch(`${apiUrl}/api/profile/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profilePayload)
      });
      if (!profRes.ok) throw new Error("Failed to save profile choices");

      // 4. Set AI Mentor Name
      const mentorRes = await fetch(`${apiUrl}/api/profile/set-mentor-name`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mentor_name: mentorName })
      });
      if (!mentorRes.ok) throw new Error("Failed to set mentor name");

      // 5. End Onboarding
      const finalUser = { ...updatedUser, is_onboarded: true };
      localStorage.setItem("user", JSON.stringify(finalUser));
      window.dispatchEvent(new Event("tulasi-auth-change"));
      
      toast.success("Profile customized! Welcome aboard.", { icon: "🚀" });
      router.push("/dashboard");

    } catch (error) {
      console.error(error);
      toast.error("Internal connection error while shaping your profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#05070D", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%", background: "radial-gradient(circle at 50% 50%, rgba(78,205,196,0.03), transparent 50%)", zIndex: 0 }} />
      
      <div style={{ zIndex: 10, maxWidth: 640, width: "100%", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <TulasiLogo size={64} showText glow />
        </div>
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} 
          style={{ background: "#0C0F1A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: "40px", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>
          
          <AnimatePresence mode="wait">
            

            {/* STEP 0: CHOOSE PATH */}
            {step === 0 && (
              <motion.div key="path-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 8, fontFamily: "var(--font-outfit)" }}>Welcome to TulasiAI</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>Tell us who you are so we can personalize your experience.</p>
                
                <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
                  <button onClick={() => { setUserType("STUDENT"); setStep(1); }}
                    style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.3)", padding: "32px 24px", borderRadius: 16, cursor: "pointer", transition: "0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(139,92,246,0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 4 }}>Student</h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>I am in college preparing for jobs</p>
                  </button>

                  <button onClick={() => { setUserType("PROFESSIONAL"); setStep(3); }}
                    style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(16,185,129,0.3)", padding: "32px 24px", borderRadius: 16, cursor: "pointer", transition: "0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💼</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 4 }}>Working Professional</h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>I am already working and want to upskill</p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STUDENT FLOW */}
            {step === 1 && userType === "STUDENT" && (
              <motion.div key="student-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 10 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 8, fontFamily: "var(--font-outfit)" }}>Student Profile</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>We'll build your AI roadmap based on this data.</p>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, fontWeight: 700 }}>College Name</label>
                    <input type="text" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} placeholder="e.g. NIT Trichy"
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "12px", borderRadius: 10, outline: "none", fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, fontWeight: 700 }}>Degree & Department</label>
                    <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. B.Tech CS"
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "12px", borderRadius: 10, outline: "none", fontSize: 14 }} />
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.8)", marginBottom: 12, fontWeight: 600 }}>Which year are you currently in?</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {Object.keys(YEAR_INFO).map((year) => (
                      <button key={year} onClick={() => setStudentYear(year)}
                        style={{ flex: "1 1 45%", background: studentYear === year ? "#6366f1" : "rgba(255,255,255,0.03)", border: `1px solid ${studentYear === year ? "#6366f1" : "rgba(255,255,255,0.06)"}`, color: "white", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "0.2s" }}>
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, fontWeight: 700 }}>Target Role</label>
                    <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Software Engineer"
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "12px", borderRadius: 10, outline: "none", fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, fontWeight: 700 }}>Placement Goal</label>
                    <input type="text" value={placementGoal} onChange={(e) => setPlacementGoal(e.target.value)} placeholder="e.g. MAANG / Startups"
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "12px", borderRadius: 10, outline: "none", fontSize: 14 }} />
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.8)", marginBottom: 12, fontWeight: 600 }}>Daily Available Time for Upskilling</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["1 hour/day", "2 hours/day", "3 hours/day", "Custom"].map(time => (
                      <button key={time} onClick={() => setDailyAvailableTime(time)}
                        style={{ flex: 1, background: dailyAvailableTime === time ? "#6366f1" : "rgba(255,255,255,0.05)", color: "white", border: "none", padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "0.2s" }}>
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.8)", marginBottom: 12, fontWeight: 600 }}>Available Days</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["Mon to Sun", "Mon to Fri", "Weekends Only"].map(days => (
                      <button key={days} onClick={() => setAvailableDays(days)}
                        style={{ flex: 1, background: availableDays === days ? "#6366f1" : "rgba(255,255,255,0.05)", color: "white", border: "none", padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "0.2s" }}>
                        {days}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32 }}>
                  <button onClick={() => setStep(0)} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.1)", padding: "14px 24px", borderRadius: 10, fontSize: 15, cursor: "pointer", marginTop: 32 }}>Back</button>
                  <button onClick={() => setStep(2)} disabled={!studentYear || !targetRole || !dailyAvailableTime || loading}
                    style={{ background: (!studentYear || !targetRole || !dailyAvailableTime || loading) ? "rgba(255,255,255,0.1)" : "#6366f1", color: "white", border: "none", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: (!studentYear || !targetRole || !dailyAvailableTime || loading) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, marginTop: 32 }}>
                    Name Your Mentor <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* PROFESSIONAL FLOW */}
            {step === 3 && userType === "PROFESSIONAL" && (
              <motion.div key="professional-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 10 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 8, fontFamily: "var(--font-outfit)" }}>Professional Profile</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>We'll build your AI upskilling roadmap based on this data.</p>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, fontWeight: 700 }}>Current Role</label>
                    <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. SDE-1"
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "12px", borderRadius: 10, outline: "none", fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, fontWeight: 700 }}>Target Role / Goal</label>
                    <input type="text" value={placementGoal} onChange={(e) => setPlacementGoal(e.target.value)} placeholder="e.g. SDE-2 at MAANG"
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "12px", borderRadius: 10, outline: "none", fontSize: 14 }} />
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.8)", marginBottom: 12, fontWeight: 600 }}>Daily Available Time for Upskilling</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["1 hour/day", "2 hours/day", "3 hours/day", "Custom"].map(time => (
                      <button key={time} onClick={() => setDailyAvailableTime(time)}
                        style={{ flex: 1, background: dailyAvailableTime === time ? "#10B981" : "rgba(255,255,255,0.05)", color: "white", border: "none", padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "0.2s" }}>
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setStep(0)} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.1)", padding: "14px 24px", borderRadius: 10, fontSize: 15, cursor: "pointer", marginTop: 32 }}>Back</button>
                  <button onClick={() => setStep(2)} disabled={!targetRole || !dailyAvailableTime || loading}
                    style={{ background: (!targetRole || !dailyAvailableTime || loading) ? "rgba(255,255,255,0.1)" : "#10B981", color: "white", border: "none", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: (!targetRole || !dailyAvailableTime || loading) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, marginTop: 32 }}>
                    Name Your Mentor <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            

            {/* AI MENTOR STEP */}
            {step === 2 && (
              <motion.div key="mentor-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ textAlign: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 30px rgba(139,92,246,0.5)" }}>
                    <TulasiLogo size={40} />
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 12, fontFamily: "var(--font-outfit)" }}>Name your AI Mentor</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>Give your personal neural strategist a unique identity.</p>
                
                <div style={{ marginBottom: 40 }}>
                  <input type="text" value={mentorName} onChange={(e) => setMentorName(e.target.value)} placeholder="e.g. Jarvis, Friday, TARS"
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "2px solid rgba(139,92,246,0.3)", color: "white", padding: "20px", borderRadius: 16, outline: "none", fontSize: 20, textAlign: "center", fontWeight: 800, letterSpacing: 1 }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setStep(userType === "STUDENT" ? 1 : 3)} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.1)", padding: "14px 24px", borderRadius: 10, fontSize: 15, cursor: "pointer" }}>Back</button>
                  <button onClick={handleFinish} disabled={!mentorName || loading}
                    style={{ background: (!mentorName || loading) ? "rgba(255,255,255,0.1)" : "white", color: "black", padding: "14px 40px", borderRadius: 10, fontSize: 16, fontWeight: 900, cursor: (!mentorName || loading) ? "not-allowed" : "pointer", boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }}>
                    {loading ? "Initializing..." : "Launch Career Universe"}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}
