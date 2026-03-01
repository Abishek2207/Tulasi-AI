"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const CERTS = [
    { id: 1, title: "Machine Learning Specialization", issuer: "Coursera / DeepLearning.AI", date: "Jan 2025", skills: ["ML", "Python", "TensorFlow"], color: "#7c3aed" },
    { id: 2, title: "React Developer Certificate", issuer: "Meta", date: "Dec 2024", skills: ["React", "JavaScript", "Redux"], color: "#2563eb" },
    { id: 3, title: "AWS Cloud Practitioner", issuer: "Amazon Web Services", date: "Nov 2024", skills: ["AWS", "Cloud", "DevOps"], color: "#f59e0b" },
];

export default function CertificatesPage() {
    const [certs, setCerts] = useState(CERTS);

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>🏆 Certificate Vault</h1>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Upload, tag skills, and add to your resume</p>
                    </div>
                    <label className="btn-primary" style={{ cursor: "pointer" }}>
                        ⬆ Upload Certificate
                        <input type="file" accept=".pdf,.png,.jpg" style={{ display: "none" }} />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {certs.map((cert) => (
                        <div key={cert.id} className="feature-card" style={{ borderLeft: `4px solid ${cert.color}` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 10,
                                    background: `${cert.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem",
                                }}>🏅</div>
                                <span className="badge badge-green" style={{ fontSize: "0.68rem" }}>Verified</span>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: 4 }}>{cert.title}</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 4 }}>{cert.issuer}</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 14 }}>Issued: {cert.date}</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                                {cert.skills.map((s) => (
                                    <span key={s} className="badge badge-blue" style={{ fontSize: "0.65rem" }}>{s}</span>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                                <button style={{
                                    flex: 1, padding: "6px 0", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600,
                                    background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)", cursor: "pointer",
                                }}>View</button>
                                <button style={{
                                    flex: 1, padding: "6px 0", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600,
                                    background: `${cert.color}20`, border: `1px solid ${cert.color}40`, color: cert.color, cursor: "pointer",
                                }}>Add to Resume</button>
                            </div>
                        </div>
                    ))}

                    {/* Upload placeholder */}
                    <label style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        padding: 30, borderRadius: 16, border: "2px dashed var(--border)",
                        cursor: "pointer", color: "var(--text-muted)", textAlign: "center", transition: "all 0.2s",
                        minHeight: 220,
                    }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>📎</div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>Upload New Certificate</div>
                        <div style={{ fontSize: "0.75rem", marginTop: 4 }}>PDF, PNG, JPG supported</div>
                        <input type="file" style={{ display: "none" }} />
                    </label>
                </div>
            </div>
        </DashboardLayout>
    );
}
