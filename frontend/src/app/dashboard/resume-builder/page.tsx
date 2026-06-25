"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Wand2, Download, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "@/hooks/useSession";
import { atsApi } from "@/lib/api";

export default function ResumeBuilderPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"form" | "success">("form");

  // Form State
  const [contact, setContact] = useState({ name: "", email: "", phone: "", linkedin: "" });
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState([{ company: "", role: "", duration: "", description: "" }]);
  const [education, setEducation] = useState([{ institution: "", degree: "", year: "" }]);
  
  const [resultId, setResultId] = useState<number | null>(null);
  const [resultScore, setResultScore] = useState<number | null>(null);

  const addExp = () => setExperience([...experience, { company: "", role: "", duration: "", description: "" }]);
  const addEdu = () => setEducation([...education, { institution: "", degree: "", year: "" }]);

  const updateExp = (index: number, field: string, val: string) => {
    const next = [...experience];
    (next[index] as any)[field] = val;
    setExperience(next);
  };

  const updateEdu = (index: number, field: string, val: string) => {
    const next = [...education];
    (next[index] as any)[field] = val;
    setEducation(next);
  };

  const removeExp = (index: number) => {
      const next = [...experience];
      next.splice(index, 1);
      setExperience(next);
  }

  const removeEdu = (index: number) => {
      const next = [...education];
      next.splice(index, 1);
      setEducation(next);
  }

  const handleBuild = async () => {
    if (!session?.user?.accessToken) return toast.error("Please login to build your resume");
    if (!targetRole || !contact.name || !skills) return toast.error("Please fill required fields (Name, Role, Skills)");

    setLoading(true);
    try {
      const payload = {
        contact_info: contact,
        target_role: targetRole,
        skills: skills.split(",").map(s => s.trim()),
        experience: experience.filter(e => e.company),
        education: education.filter(e => e.institution),
        projects: []
      };
      const res = await atsApi.build(payload, session.user.accessToken);
      setResultId(res.resume_id);
      setResultScore(res.ats_score);
      setPhase("success");
      toast.success("Resume generated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #10B981, #059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FileText size={28} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white" }}>ATS Resume Builder</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4 }}>Generate a hyper-optimized PDF resume instantly.</p>
        </div>
      </div>

      {phase === "form" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 32 }}>
          
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 12 }}>1. Basics</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <input placeholder="Full Name *" value={contact.name} onChange={e => setContact({...contact, name: e.target.value})} style={{ padding: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", outline: "none" }} />
              <input placeholder="Target Role *" value={targetRole} onChange={e => setTargetRole(e.target.value)} style={{ padding: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", outline: "none" }} />
              <input placeholder="Email Address" value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} style={{ padding: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", outline: "none" }} />
              <input placeholder="Phone Number" value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})} style={{ padding: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", outline: "none" }} />
            </div>
            <input placeholder="Skills (comma separated) *" value={skills} onChange={e => setSkills(e.target.value)} style={{ padding: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", outline: "none", width: "100%", marginTop: 16 }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 12 }}>2. Experience</h3>
            {experience.map((exp, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <input placeholder="Company" value={exp.company} onChange={e => updateExp(i, "company", e.target.value)} style={{ padding: 10, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", outline: "none" }} />
                  <input placeholder="Role" value={exp.role} onChange={e => updateExp(i, "role", e.target.value)} style={{ padding: 10, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", outline: "none" }} />
                </div>
                <input placeholder="Duration (e.g. Jan 2021 - Present)" value={exp.duration} onChange={e => updateExp(i, "duration", e.target.value)} style={{ padding: 10, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", outline: "none", width: "100%", marginBottom: 12 }} />
                <textarea placeholder="Job Description" value={exp.description} onChange={e => updateExp(i, "description", e.target.value)} style={{ padding: 10, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", outline: "none", width: "100%", resize: "none", height: 80, fontFamily: "inherit" }} />
                {experience.length > 1 && <button onClick={() => removeExp(i)} style={{ background: "none", border: "none", color: "#F43F5E", fontSize: 12, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", marginTop: 8 }}><Trash2 size={14}/> Remove</button>}
              </div>
            ))}
            <button onClick={addExp} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", color: "white", border: "1px dashed rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><Plus size={16} /> Add Experience</button>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 12 }}>3. Education</h3>
            {education.map((edu, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <input placeholder="Institution" value={edu.institution} onChange={e => updateEdu(i, "institution", e.target.value)} style={{ padding: 10, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", outline: "none" }} />
                <input placeholder="Degree" value={edu.degree} onChange={e => updateEdu(i, "degree", e.target.value)} style={{ padding: 10, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", outline: "none" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input placeholder="Year" value={edu.year} onChange={e => updateEdu(i, "year", e.target.value)} style={{ padding: 10, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", outline: "none", flex: 1 }} />
                  {education.length > 1 && <button onClick={() => removeEdu(i)} style={{ background: "none", border: "none", color: "#F43F5E", cursor: "pointer", padding: "0 8px" }}><Trash2 size={16}/></button>}
                </div>
              </div>
            ))}
            <button onClick={addEdu} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", color: "white", border: "1px dashed rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><Plus size={16} /> Add Education</button>
          </div>

          <button onClick={handleBuild} disabled={loading} style={{ width: "100%", padding: 16, borderRadius: 12, background: "linear-gradient(135deg, #10B981, #059669)", color: "white", fontWeight: 800, fontSize: 16, border: "none", cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
            Generate AI Optimized Resume
          </button>
        </motion.div>
      )}

      {phase === "success" && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <FileText size={40} color="#10B981" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 12 }}>Your Resume is Ready!</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>We've formatted it beautifully and optimized it for ATS systems.</p>
          
          <div style={{ padding: 24, background: "rgba(255,255,255,0.03)", borderRadius: 16, display: "inline-block", marginBottom: 32, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Estimated ATS Score</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#10B981" }}>{resultScore}%</div>
          </div>

          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <button onClick={() => toast.success("Downloading PDF...")} style={{ padding: "14px 28px", borderRadius: 12, background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "white", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Download size={18} /> Download PDF
            </button>
            <button onClick={() => setPhase("form")} style={{ padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.05)", color: "white", fontWeight: 700, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>
              Edit Details
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
