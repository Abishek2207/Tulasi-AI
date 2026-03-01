"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function ResumePage() {
    const [activeSection, setActiveSection] = useState("personal");
    const [atsScore, setAtsScore] = useState<number | null>(null);

    const sections = ["personal", "education", "experience", "skills", "projects"];

    const checkATS = () => {
        setTimeout(() => setAtsScore(78), 800);
    };

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>📄 Resume Builder</h1>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Build, scan with ATS checker, and export to PDF</p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={checkATS} style={{
                            padding: "8px 16px", borderRadius: 10, background: "rgba(16,185,129,0.15)",
                            border: "1px solid rgba(16,185,129,0.3)", color: "#34d399", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem",
                        }}>🔍 ATS Scan</button>
                        <button className="btn-primary" style={{ padding: "8px 16px" }}>⬇ Export PDF</button>
                    </div>
                </div>

                {atsScore !== null && (
                    <div style={{ marginBottom: 16, padding: "14px 20px", borderRadius: 12, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ fontSize: "2rem", fontWeight: 900, color: "#34d399" }}>{atsScore}%</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#34d399" }}>ATS Score: Good</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Add more keywords: "React", "TypeScript", "REST API" to improve to 90%+</div>
                        </div>
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
                    {/* Editor */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                            {sections.map((s) => (
                                <button key={s} onClick={() => setActiveSection(s)} style={{
                                    padding: "5px 14px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                                    textTransform: "capitalize",
                                    background: activeSection === s ? "var(--gradient-primary)" : "rgba(255,255,255,0.04)",
                                    border: "1px solid var(--border)", color: "var(--text-primary)",
                                }}>{s}</button>
                            ))}
                        </div>

                        {activeSection === "personal" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <input className="input-field" placeholder="Full Name" defaultValue="Student User" />
                                <input className="input-field" placeholder="Email" defaultValue="student@tulasiai.com" />
                                <input className="input-field" placeholder="Phone" defaultValue="+91 98765 43210" />
                                <input className="input-field" placeholder="LinkedIn URL" />
                                <input className="input-field" placeholder="GitHub URL" />
                                <textarea className="input-field" rows={3} placeholder="Professional Summary" defaultValue="Passionate AI/ML Engineer with experience in building production-grade applications using Python, FastAPI, and LangChain." />
                            </div>
                        )}
                        {activeSection === "skills" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <input className="input-field" placeholder="Programming Languages (e.g., Python, JavaScript)" defaultValue="Python, JavaScript, TypeScript, C++" />
                                <input className="input-field" placeholder="Frameworks & Libraries" defaultValue="React, Next.js, FastAPI, LangChain, LlamaIndex" />
                                <input className="input-field" placeholder="AI/ML Tools" defaultValue="PyTorch, HuggingFace, Ollama, pgvector" />
                                <input className="input-field" placeholder="Databases" defaultValue="PostgreSQL, Redis, MongoDB" />
                                <input className="input-field" placeholder="DevOps" defaultValue="Docker, GitHub Actions, Vercel, Railway" />
                            </div>
                        )}
                        {(activeSection !== "personal" && activeSection !== "skills") && (
                            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                ✏️ Fill in your {activeSection} details here
                                <div style={{ marginTop: 16 }}>
                                    <button className="btn-primary" style={{ fontSize: "0.8rem", padding: "8px 16px" }}>+ Add {activeSection}</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    <div style={{ background: "#ffffff", borderRadius: 16, padding: 28, color: "#1a1a2e", fontSize: "0.82rem", minHeight: 400 }}>
                        <div style={{ borderBottom: "2px solid #7c3aed", paddingBottom: 12, marginBottom: 16 }}>
                            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1a1a2e" }}>Student User</h2>
                            <p style={{ color: "#555", fontSize: "0.75rem" }}>student@tulasiai.com • +91 98765 43210</p>
                        </div>
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#7c3aed", textTransform: "uppercase", marginBottom: 6 }}>Summary</div>
                            <p style={{ color: "#333", lineHeight: 1.6 }}>Passionate AI/ML Engineer with experience in building production-grade applications using Python, FastAPI, and LangChain.</p>
                        </div>
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#7c3aed", textTransform: "uppercase", marginBottom: 6 }}>Skills</div>
                            <p style={{ color: "#333" }}>Python, JavaScript, TypeScript, React, Next.js, FastAPI, LangChain, Docker, PostgreSQL</p>
                        </div>
                        <div style={{ background: "#f3e8ff", borderRadius: 8, padding: 10, fontSize: "0.75rem", color: "#7c3aed" }}>
                            📎 Built with TulasiAI Resume Builder
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
