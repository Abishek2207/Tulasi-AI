"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import toast from "react-hot-toast";

type CareerStage = "student" | "professional";

interface ProfileData {
  career_stage: CareerStage;
  full_name: string;
  institution?: string;
  degree?: string;
  graduation_year?: number;
  field?: string;
  target_role?: string;
  current_role?: string;
  company?: string;
  experience_years?: number;
  experience_level?: string;
  current_skills?: string;
  current_salary?: string;
  target_salary?: string;
  career_goal?: string;
  daily_time_minutes: number;
  learning_days: string;
}

export default function CareerIntelligenceOnboarding() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<ProfileData>>({
    full_name: session?.user?.name || "",
    daily_time_minutes: 60,
    learning_days: "Monday,Tuesday,Wednesday,Thursday,Friday"
  });

  const [loading, setLoading] = useState(false);

  const updateData = (fields: Partial<ProfileData>) => {
    setData(prev => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    // Validation
    if (step === 1 && !data.career_stage) {
      toast.error("Please select a career stage.");
      return;
    }
    if (step === 2) {
      if (!data.full_name?.trim()) {
        toast.error("Full name is required.");
        return;
      }
      if (data.career_stage === "student") {
        if (!data.target_role?.trim()) {
          toast.error("Target role is required.");
          return;
        }
        if (data.graduation_year && data.graduation_year < 1900) {
          toast.error("Please enter a valid graduation year.");
          return;
        }
      } else {
        if (!data.current_role?.trim()) {
          toast.error("Current role is required.");
          return;
        }
      }
    }
    if (step === 4) {
      if (!data.learning_days?.trim()) {
        toast.error("Please select at least one learning day.");
        return;
      }
      if (data.daily_time_minutes! <= 0) {
        toast.error("Daily time must be positive.");
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/v1/career-intelligence/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to create profile");
      }
      
      toast.success("Career Intelligence Profile created!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    const days = data.learning_days ? data.learning_days.split(",") : [];
    if (days.includes(day)) {
      updateData({ learning_days: days.filter(d => d !== day).join(",") });
    } else {
      updateData({ learning_days: [...days, day].join(",") });
    }
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "12px 16px",
    borderRadius: 8,
    color: "white",
    fontSize: 14,
    marginBottom: 16,
    outline: "none"
  };

  const labelStyle = {
    display: "block",
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginBottom: 6,
    fontWeight: 500
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 8 }}>Which best describes your current career stage?</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>This helps us tailor your intelligence feed and skill mapping.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div 
                onClick={() => updateData({ career_stage: "student" })}
                style={{
                  padding: 24,
                  borderRadius: 16,
                  border: `2px solid ${data.career_stage === "student" ? "#8B5CF6" : "rgba(255,255,255,0.1)"}`,
                  background: data.career_stage === "student" ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>🎓</div>
                <h3 style={{ fontSize: 18, color: "white", fontWeight: 600 }}>I'm a student or fresher preparing for placements.</h3>
              </div>

              <div 
                onClick={() => updateData({ career_stage: "professional" })}
                style={{
                  padding: 24,
                  borderRadius: 16,
                  border: `2px solid ${data.career_stage === "professional" ? "#10B981" : "rgba(255,255,255,0.1)"}`,
                  background: data.career_stage === "professional" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>💼</div>
                <h3 style={{ fontSize: 18, color: "white", fontWeight: 600 }}>I'm currently working and looking to grow my career.</h3>
              </div>
            </div>
          </motion.div>
        );
      
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 8 }}>
              {data.career_stage === "student" ? "Academic Details" : "Professional Details"}
            </h2>
            <div style={{ marginTop: 24 }}>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} value={data.full_name || ""} onChange={e => updateData({ full_name: e.target.value })} placeholder="John Doe" />

              {data.career_stage === "student" ? (
                <>
                  <label style={labelStyle}>College / Institution</label>
                  <input style={inputStyle} value={data.institution || ""} onChange={e => updateData({ institution: e.target.value })} placeholder="University Name" />
                  
                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Degree</label>
                      <input style={inputStyle} value={data.degree || ""} onChange={e => updateData({ degree: e.target.value })} placeholder="B.Tech, B.Sc, etc." />
                    </div>
                    <div style={{ width: 120 }}>
                      <label style={labelStyle}>Grad. Year</label>
                      <input style={inputStyle} type="number" value={data.graduation_year || ""} onChange={e => updateData({ graduation_year: parseInt(e.target.value) })} placeholder="2025" />
                    </div>
                  </div>

                  <label style={labelStyle}>Field / Domain</label>
                  <input style={inputStyle} value={data.field || ""} onChange={e => updateData({ field: e.target.value })} placeholder="Computer Science, Design, etc." />

                  <label style={labelStyle}>Target Role (Required)</label>
                  <input style={inputStyle} value={data.target_role || ""} onChange={e => updateData({ target_role: e.target.value })} placeholder="Software Engineer, Data Scientist" />
                  
                  <label style={labelStyle}>Preferred Companies (Optional)</label>
                  <input style={inputStyle} value={data.company || ""} onChange={e => updateData({ company: e.target.value })} placeholder="Google, Microsoft, Startups" />
                  
                  <label style={labelStyle}>Placement Goal</label>
                  <select style={inputStyle} value={data.career_goal || ""} onChange={e => updateData({ career_goal: e.target.value })}>
                    <option value="">Select Goal</option>
                    <option value="Top Tier Tech">Top Tier Tech / FAANG</option>
                    <option value="High Growth Startup">High Growth Startup</option>
                    <option value="Core Engineering">Core Engineering</option>
                  </select>
                </>
              ) : (
                <>
                  <label style={labelStyle}>Current Company</label>
                  <input style={inputStyle} value={data.company || ""} onChange={e => updateData({ company: e.target.value })} placeholder="Company Name" />

                  <label style={labelStyle}>Current Job Title (Required)</label>
                  <input style={inputStyle} value={data.current_role || ""} onChange={e => updateData({ current_role: e.target.value })} placeholder="Senior Developer, Product Manager" />

                  <label style={labelStyle}>Field / Domain</label>
                  <input style={inputStyle} value={data.field || ""} onChange={e => updateData({ field: e.target.value })} placeholder="Frontend, Backend, Design" />

                  <label style={labelStyle}>Years of Experience</label>
                  <input style={inputStyle} type="number" value={data.experience_years || ""} onChange={e => updateData({ experience_years: parseInt(e.target.value) })} placeholder="3" />

                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Current Salary / Package (Optional)</label>
                      <input style={inputStyle} value={data.current_salary || ""} onChange={e => updateData({ current_salary: e.target.value })} placeholder="e.g. 15 LPA" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Target Salary (Optional)</label>
                      <input style={inputStyle} value={data.target_salary || ""} onChange={e => updateData({ target_salary: e.target.value })} placeholder="e.g. 25 LPA" />
                    </div>
                  </div>

                  <label style={labelStyle}>Career Goal</label>
                  <select style={inputStyle} value={data.career_goal || ""} onChange={e => updateData({ career_goal: e.target.value })}>
                    <option value="">Select Goal</option>
                    <option value="Promotion">Promotion</option>
                    <option value="Salary Growth">Salary Growth</option>
                    <option value="Job Switch">Job Switch</option>
                    <option value="Role Transition">Role Transition</option>
                    <option value="AI Upskilling">AI Upskilling</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Technical Specialization">Technical Specialization</option>
                  </select>
                </>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 8 }}>Your Skills</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Tell us what you know so we can plan what's next.</p>
            
            <label style={labelStyle}>Current Skills (Comma separated)</label>
            <input 
              style={inputStyle} 
              value={data.current_skills || ""} 
              onChange={e => updateData({ current_skills: e.target.value })} 
              placeholder="React, Python, System Design..." 
            />

            <label style={labelStyle}>Current Skill Level</label>
            <select style={inputStyle} value={data.experience_level || ""} onChange={e => updateData({ experience_level: e.target.value })}>
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </motion.div>
        );

      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 8 }}>Learning Schedule</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Consistency is the key to career growth.</p>
            
            <label style={labelStyle}>Daily Learning Time</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
              {[15, 30, 60, 90, 180].map(time => (
                <div 
                  key={time}
                  onClick={() => updateData({ daily_time_minutes: time })}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: `1px solid ${data.daily_time_minutes === time ? "#8B5CF6" : "rgba(255,255,255,0.1)"}`,
                    background: data.daily_time_minutes === time ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.05)",
                    cursor: "pointer",
                    color: "white",
                    fontSize: 14
                  }}
                >
                  {time} min
                </div>
              ))}
            </div>

            <label style={labelStyle}>Custom Daily Time (minutes)</label>
            <input 
              style={inputStyle} 
              type="number" 
              value={data.daily_time_minutes || ""} 
              onChange={e => updateData({ daily_time_minutes: parseInt(e.target.value) })} 
            />

            <label style={labelStyle}>Preferred Learning Days</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                const isActive = data.learning_days?.includes(day);
                return (
                  <div 
                    key={day}
                    onClick={() => toggleDay(day)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: `1px solid ${isActive ? "#10B981" : "rgba(255,255,255,0.1)"}`,
                      background: isActive ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
                      cursor: "pointer",
                      color: "white",
                      fontSize: 13
                    }}
                  >
                    {day.substring(0,3)}
                  </div>
                )
              })}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 8 }}>Review Profile</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Ready to build your intelligence profile?</p>
            
            <div style={{ background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ marginBottom: 12 }}><span style={{ color: "rgba(255,255,255,0.5)" }}>Stage:</span> <span style={{ color: "white", textTransform: "capitalize" }}>{data.career_stage}</span></div>
              <div style={{ marginBottom: 12 }}><span style={{ color: "rgba(255,255,255,0.5)" }}>Name:</span> <span style={{ color: "white" }}>{data.full_name}</span></div>
              <div style={{ marginBottom: 12 }}><span style={{ color: "rgba(255,255,255,0.5)" }}>Target/Current Role:</span> <span style={{ color: "white" }}>{data.target_role || data.current_role}</span></div>
              <div style={{ marginBottom: 12 }}><span style={{ color: "rgba(255,255,255,0.5)" }}>Goal:</span> <span style={{ color: "white" }}>{data.career_goal || "Not set"}</span></div>
              <div style={{ marginBottom: 12 }}><span style={{ color: "rgba(255,255,255,0.5)" }}>Commitment:</span> <span style={{ color: "white" }}>{data.daily_time_minutes} min/day</span></div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 50% 30%, #0D0E1A 0%, #05070A 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }}>
      <div style={{
        width: "100%",
        maxWidth: 560,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 24,
        padding: 40,
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
      }}>
        {/* Progress Bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= step ? "#8B5CF6" : "rgba(255,255,255,0.1)",
              transition: "all 0.3s"
            }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
          {step > 1 && (
            <button 
              onClick={handleBack}
              style={{
                flex: 1,
                padding: "14px 0",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "white",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Back
            </button>
          )}
          
          <button 
            onClick={step === 5 ? handleSubmit : handleNext}
            disabled={loading}
            style={{
              flex: 2,
              padding: "14px 0",
              background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
              border: "none",
              borderRadius: 12,
              color: "white",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Saving..." : step === 5 ? "Build My Career Intelligence Profile" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
