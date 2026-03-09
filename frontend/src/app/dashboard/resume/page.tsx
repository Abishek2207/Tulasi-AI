"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export default function ResumeBuilderPage() {
  const { data: session } = useSession();
  const [personalInfo, setPersonalInfo] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "(123) 456-7890",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    summary: "Passionate software engineering student with experience in full-stack development. Seeking a Summer 2026 SWE Internship."
  });

  const [experience, setExperience] = useState([
    { role: "Software Engineering Intern", company: "TechCorp Inc.", dates: "May 2025 - Aug 2025", desc: "Developed robust REST APIs using FastAPI and reduced database read latency by 40% using Redis caching." },
    { role: "Open Source Contributor", company: "Linux Foundation", dates: "Jan 2025 - Present", desc: "Submitted 15+ pull requests improving documentation and fixing memory leaks in core C++ modules." }
  ]);

  const [education, setEducation] = useState({
    degree: "B.S. in Computer Science",
    university: "State University",
    dates: "Expected May 2026",
    gpa: "3.8/4.0",
    coursework: "Data Structures, Algorithms, Operating Systems, Machine Learning"
  });

  const [skills, setSkills] = useState("Python, JavaScript, TypeScript, React, Next.js, FastAPI, PostgreSQL, Docker, Git");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", gap: 24, height: "calc(100vh - 120px)" }}>
      
      {/* Left Pane: Editor */}
      <div className="dash-card no-print" style={{ width: "40%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24, padding: "24px" }}>
        
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>📄 Resume Editor</h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Fill in your details. The preview updates instantly.</p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-secondary" style={{ flex: 1, padding: "10px", fontSize: 13, borderRadius: 8 }}>✨ Auto-fill from Profile</button>
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, padding: "10px", fontSize: 13, borderRadius: 8, background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))" }}>📥 Download PDF</button>
        </div>

        {/* Form Sections */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--brand-primary)", marginBottom: 16 }}>Personal Details</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input className="input-field" placeholder="Full Name" value={personalInfo.name} onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})} />
            <div style={{ display: "flex", gap: 12 }}>
              <input className="input-field" placeholder="Email" value={personalInfo.email} onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})} style={{ flex: 1 }} />
              <input className="input-field" placeholder="Phone" value={personalInfo.phone} onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} style={{ flex: 1 }} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <input className="input-field" placeholder="LinkedIn URL" value={personalInfo.linkedin} onChange={e => setPersonalInfo({...personalInfo, linkedin: e.target.value})} style={{ flex: 1 }} />
              <input className="input-field" placeholder="GitHub URL" value={personalInfo.github} onChange={e => setPersonalInfo({...personalInfo, github: e.target.value})} style={{ flex: 1 }} />
            </div>
            <textarea className="input-field" placeholder="Professional Summary" value={personalInfo.summary} onChange={e => setPersonalInfo({...personalInfo, summary: e.target.value})} rows={3} style={{ resize: "vertical" }} />
          </div>
        </div>

        <div>
           <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--brand-primary)", marginBottom: 16 }}>Education</h3>
           <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
             <input className="input-field" placeholder="Degree" value={education.degree} onChange={e => setEducation({...education, degree: e.target.value})} />
             <input className="input-field" placeholder="University" value={education.university} onChange={e => setEducation({...education, university: e.target.value})} />
             <div style={{ display: "flex", gap: 12 }}>
               <input className="input-field" placeholder="Dates" value={education.dates} onChange={e => setEducation({...education, dates: e.target.value})} style={{ flex: 1 }} />
               <input className="input-field" placeholder="GPA" value={education.gpa} onChange={e => setEducation({...education, gpa: e.target.value})} style={{ flex: 1 }} />
             </div>
             <textarea className="input-field" placeholder="Relevant Coursework" value={education.coursework} onChange={e => setEducation({...education, coursework: e.target.value})} rows={2} style={{ resize: "vertical" }} />
           </div>
        </div>

        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--brand-primary)", marginBottom: 16 }}>Skills</h3>
          <textarea className="input-field" placeholder="Comma separated skills" value={skills} onChange={e => setSkills(e.target.value)} rows={3} style={{ resize: "vertical" }} />
        </div>

      </div>

      {/* Right Pane: Live A4 Preview */}
      <div className="dash-card no-print" style={{ width: "60%", overflowY: "auto", display: "flex", justifyContent: "center", padding: "40px 20px", background: "var(--background-alt)" }}>
        
        {/* Printable A4 Container */}
        <div id="resume-preview" style={{ 
          width: "210mm", height: "auto", minHeight: "297mm", 
          background: "white", color: "black", padding: "20mm 15mm", 
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)", fontFamily: "'Helvetica Neue', Arial, sans-serif",
          boxSizing: "border-box"
        }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #333", paddingBottom: 16, marginBottom: 16 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0", color: "#111" }}>{personalInfo.name}</h1>
            <div style={{ fontSize: 11, color: "#444", display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", margin: "4px 0" }}>
              <span>{personalInfo.email}</span> • 
              <span>{personalInfo.phone}</span> • 
              <span>{personalInfo.linkedin}</span> • 
              <span>{personalInfo.github}</span>
            </div>
            {personalInfo.summary && <p style={{ fontSize: 11, marginTop: 12, color: "#333", lineHeight: 1.5, textAlign: "justify" }}>{personalInfo.summary}</p>}
          </div>

          {/* Education */}
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, textTransform: "uppercase", fontWeight: 700, color: "#111", borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 8 }}>Education</h2>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{education.university}</span>
              <span style={{ fontSize: 11 }}>{education.dates}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 11, fontStyle: "italic" }}>{education.degree}</span>
              <span style={{ fontSize: 11 }}>GPA: {education.gpa}</span>
            </div>
            <div style={{ fontSize: 10, marginTop: 4, color: "#444" }}><strong>Coursework:</strong> {education.coursework}</div>
          </div>

          {/* Experience */}
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, textTransform: "uppercase", fontWeight: 700, color: "#111", borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 8 }}>Experience</h2>
            {experience.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{exp.company}</span>
                  <span style={{ fontSize: 11 }}>{exp.dates}</span>
                </div>
                <div style={{ fontSize: 11, fontStyle: "italic", marginBottom: 4 }}>{exp.role}</div>
                <div style={{ fontSize: 11, lineHeight: 1.5, color: "#333", marginLeft: 12 }}>• {exp.desc}</div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <h2 style={{ fontSize: 13, textTransform: "uppercase", fontWeight: 700, color: "#111", borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 8 }}>Technical Skills</h2>
            <div style={{ fontSize: 11, lineHeight: 1.6, color: "#333" }}>
              {skills}
            </div>
          </div>

        </div>
      </div>
      
      {/* CSS for printing exclusively the Resume container */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          #resume-preview, #resume-preview * {
            visibility: visible;
          }
          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
          }
        }
      `}</style>

    </div>
  );
}
