"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import toast from "react-hot-toast";
import { TulasiLogo } from "@/components/TulasiLogo";
import { GraduationCap, Briefcase, ArrowRight, BookOpen } from "lucide-react";

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
  
  const [selectedType, setSelectedType] = useState<"STUDENT" | "PROFESSIONAL" | "PROFESSOR" | "">("");
  
  // Student Data
  const [studentYear, setStudentYear] = useState("");
  const [studentGoal, setStudentGoal] = useState("");
  
  // Professional Data
  const [currentRole, setCurrentRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [targetSalary, setTargetSalary] = useState("");
  
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

      // 1. Set User Type
      const typeRes = await fetch(`${apiUrl}/api/profile/set-user-type?user_type=${selectedType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      if (!typeRes.ok) throw new Error("Failed to set user type");
      
      const updatedUser = await typeRes.json();

      // 2. Build Profile Data
      let profilePayload: any = {};
      if (selectedType === "STUDENT") {
        profilePayload = {
          student_year: studentYear,
          student_goal: studentGoal
        };
      } else if (selectedType === "PROFESSOR") {
        profilePayload = {
          current_role: currentRole,          // Designation e.g. "Assistant Professor"
          company: companyName,               // Institution name
          student_goal: salaryRange,          // Subjects / research area (reusing field)
          experience_years: 0,
        };
      } else {
        profilePayload = {
          current_role: currentRole,
          company: companyName,
          experience_years: parseInt(experienceYears) || 0,
          current_salary_range: salaryRange,
          target_salary_goal: targetSalary
        };
      }

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
            {step === 0 && (
              <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "white", marginBottom: 12, textAlign: "center", fontFamily: "var(--font-outfit)" }}>
                  Tell us about your current stage
                </h1>
                <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 32, fontSize: 16 }}>
                  so we can personalize your growth journey seamlessly.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <button onClick={() => setSelectedType("STUDENT")}
                    style={{ background: selectedType === "STUDENT" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)",
                      border: `2px solid ${selectedType === "STUDENT" ? "#6366f1" : "rgba(255,255,255,0.05)"}`,
                      borderRadius: 16, padding: "24px", display: "flex", alignItems: "center", gap: 20, cursor: "pointer", transition: "0.2s" }}>
                    <div style={{ background: selectedType === "STUDENT" ? "#6366f1" : "rgba(255,255,255,0.1)", borderRadius: 12, color: "white", display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0 }}>
                      <GraduationCap size={24} />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <h3 style={{ color: "white", fontSize: 20, fontWeight: 700, margin: "0 0 4px 0" }}>Student</h3>
                      <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: 14 }}>In college, hunting for internships or placements.</p>
                    </div>
                  </button>

                  <button onClick={() => setSelectedType("PROFESSIONAL")}
                    style={{ background: selectedType === "PROFESSIONAL" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.02)",
                      border: `2px solid ${selectedType === "PROFESSIONAL" ? "#10b981" : "rgba(255,255,255,0.05)"}`,
                      borderRadius: 16, padding: "24px", display: "flex", alignItems: "center", gap: 20, cursor: "pointer", transition: "0.2s" }}>
                    <div style={{ background: selectedType === "PROFESSIONAL" ? "#10b981" : "rgba(255,255,255,0.1)", borderRadius: 12, color: "white", display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0 }}>
                      <Briefcase size={24} />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <h3 style={{ color: "white", fontSize: 20, fontWeight: 700, margin: "0 0 4px 0" }}>Working Professional</h3>
                      <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: 14 }}>Upskill, switch roles, or grow salary.</p>
                    </div>
                  </button>

                  <button onClick={() => setSelectedType("PROFESSOR")}
                    style={{ background: selectedType === "PROFESSOR" ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.02)",
                      border: `2px solid ${selectedType === "PROFESSOR" ? "#F59E0B" : "rgba(255,255,255,0.05)"}`,
                      borderRadius: 16, padding: "24px", display: "flex", alignItems: "center", gap: 20, cursor: "pointer", transition: "0.2s" }}>
                    <div style={{ background: selectedType === "PROFESSOR" ? "#F59E0B" : "rgba(255,255,255,0.1)", borderRadius: 12, color: "white", display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0 }}>
                      <BookOpen size={24} />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <h3 style={{ color: "white", fontSize: 20, fontWeight: 700, margin: "0 0 4px 0" }}>Professor / Academic</h3>
                      <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: 14 }}>Teaching in college, doing research, or in academia.</p>
                    </div>
                  </button>
                </div>

                <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => setStep(1)} disabled={!selectedType}
                    style={{ background: !selectedType ? "rgba(255,255,255,0.1)" : "white", color: !selectedType ? "rgba(255,255,255,0.3)" : "#000",
                      padding: "16px 32px", borderRadius: 12, border: "none", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: !selectedType ? "not-allowed" : "pointer", transition: "0.2s" }}>
                    Continue <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STUDENT FLOW */}
            {step === 1 && selectedType === "STUDENT" && (
              <motion.div key="student-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 8, fontFamily: "var(--font-outfit)" }}>Student Profile</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>Your content will be 100% personalized to your year — no irrelevant topics.</p>
                
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.8)", marginBottom: 12, fontWeight: 600 }}>Which year are you currently in?</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(YEAR_INFO).map(([year, info]) => (
                      <button key={year} onClick={() => setStudentYear(year)}
                        style={{ 
                          background: studentYear === year ? `${info.color}20` : "rgba(255,255,255,0.03)",
                          border: `2px solid ${studentYear === year ? info.color : "rgba(255,255,255,0.06)"}`,
                          color: "white", padding: "16px 20px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                          cursor: "pointer", transition: "0.2s", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                        <span>{info.label}</span>
                        <span style={{ fontSize: 11, color: studentYear === year ? info.color : "rgba(255,255,255,0.3)", fontWeight: 500, maxWidth: "60%", textAlign: "right", lineHeight: 1.4 }}>{info.focus}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.8)", marginBottom: 12, fontWeight: 600 }}>What is your primary goal?</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {["Placements (On-campus / Off-campus)", "Higher Studies (GATE / GRE / MBA)", "Freelancing / Startup"].map(goal => (
                      <button key={goal} onClick={() => setStudentGoal(goal)}
                        style={{ background: studentGoal === goal ? "#6366f1" : "rgba(255,255,255,0.05)",
                          color: "white", border: "none", padding: "16px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "0.2s" }}>
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
                  <button onClick={() => setStep(0)} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.1)", padding: "14px 24px", borderRadius: 10, fontSize: 15, cursor: "pointer" }}>Back</button>
                  <button onClick={() => setStep(2)} disabled={!studentYear || !studentGoal || loading}
                    style={{ background: (!studentYear || !studentGoal || loading) ? "rgba(255,255,255,0.1)" : "#6366f1", color: "white", border: "none", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: (!studentYear || !studentGoal || loading) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    Name Your Mentor <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* PROFESSIONAL FLOW */}
            {step === 1 && selectedType === "PROFESSIONAL" && (
              <motion.div key="prof-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 8, fontFamily: "var(--font-outfit)" }}>Professional Tracking</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>Define your current career velocity.</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", fontWeight: 700 }}>Current Role</label>
                    <input type="text" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} placeholder="e.g. Frontend Developer"
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "16px", borderRadius: 12, outline: "none", fontSize: 15 }} />
                  </div>
                  
                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", fontWeight: 700 }}>Company Name</label>
                      <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Current Employer"
                        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "16px", borderRadius: 12, outline: "none", fontSize: 15 }} />
                    </div>
                    <div style={{ width: 120 }}>
                      <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", fontWeight: 700 }}>Years Exp.</label>
                      <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="e.g. 2"
                        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "16px", borderRadius: 12, outline: "none", fontSize: 15 }} />
                    </div>
                  </div>

                  <div style={{ gridTemplateColumns: "1fr 1fr", display: "grid", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", fontWeight: 700 }}>Current Salary Range</label>
                      <select value={salaryRange} onChange={e => setSalaryRange(e.target.value)}
                        style={{ width: "100%", background: "#11131F", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "16px", borderRadius: 12, outline: "none", fontSize: 15, cursor: "pointer" }}>
                        <option value="">Select Range...</option>
                        <option value="< $50k">&lt; $50k</option>
                        <option value="$50k - $100k">$50k - $100k</option>
                        <option value="$100k - $150k">$100k - $150k</option>
                        <option value="$150k+">$150k+</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", fontWeight: 700 }}>Target Salary Goal</label>
                      <select value={targetSalary} onChange={e => setTargetSalary(e.target.value)}
                        style={{ width: "100%", background: "#11131F", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "16px", borderRadius: 12, outline: "none", fontSize: 15, cursor: "pointer" }}>
                        <option value="">Select Target...</option>
                        <option value="$100k+">$100k+</option>
                        <option value="$150k+">$150k+</option>
                        <option value="$200k+">$200k+</option>
                        <option value="$300k+">$300k+</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setStep(0)} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.1)", padding: "14px 24px", borderRadius: 10, fontSize: 15, cursor: "pointer" }}>Back</button>
                  <button onClick={() => setStep(2)} disabled={!currentRole || !companyName || !experienceYears || !salaryRange || !targetSalary || loading}
                    style={{ background: (!currentRole || !companyName || !experienceYears || !salaryRange || !targetSalary || loading) ? "rgba(255,255,255,0.1)" : "#10b981", color: "white", border: "none", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: (!currentRole || !companyName || !experienceYears || !salaryRange || !targetSalary || loading) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    Name Your Mentor <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* PROFESSOR FLOW */}
            {step === 1 && selectedType === "PROFESSOR" && (
              <motion.div key="prof-acad-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 8, fontFamily: "var(--font-outfit)" }}>Academic Profile</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>We'll personalize your AI to focus on research, pedagogy, and academic growth.</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", fontWeight: 700 }}>Current Designation</label>
                    <input type="text" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} placeholder="e.g. Assistant Professor, HOD, Research Scholar"
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "16px", borderRadius: 12, outline: "none", fontSize: 15 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", fontWeight: 700 }}>Institution / College Name</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Anna University, NIT Trichy"
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "16px", borderRadius: 12, outline: "none", fontSize: 15 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", fontWeight: 700 }}>Subjects You Teach (or Research Area)</label>
                    <input type="text" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="e.g. Data Structures, AI, Computer Networks"
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "16px", borderRadius: 12, outline: "none", fontSize: 15 }} />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setStep(0)} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.1)", padding: "14px 24px", borderRadius: 10, fontSize: 15, cursor: "pointer" }}>Back</button>
                  <button onClick={() => setStep(2)} disabled={!currentRole || !companyName || loading}
                    style={{ background: (!currentRole || !companyName || loading) ? "rgba(255,255,255,0.1)" : "#F59E0B", color: "black", border: "none", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: (!currentRole || !companyName || loading) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
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
                  <button onClick={() => setStep(1)} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.1)", padding: "14px 24px", borderRadius: 10, fontSize: 15, cursor: "pointer" }}>Back</button>
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
