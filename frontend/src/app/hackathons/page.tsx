"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const HACKATHONS = [
    { id: 1, title: "Google AI Hackathon 2025", deadline: "Mar 15, 2025", prize: "$25,000", category: "AI/ML", status: "Open", saved: true },
    { id: 2, title: "GitHub Universe Hackathon", deadline: "Mar 28, 2025", prize: "$10,000", category: "Open Source", status: "Open", saved: false },
    { id: 3, title: "HuggingFace Community Hack", deadline: "Apr 5, 2025", prize: "Swag + Recognition", category: "AI/ML", status: "Open", saved: false },
];

const INTERNSHIPS = [
    { id: 1, company: "Google", role: "ML Engineer Intern", location: "Hyderabad / Remote", deadline: "Rolling", type: "Paid", logo: "🔵" },
    { id: 2, company: "Microsoft", role: "SWE Intern - AI", location: "Bangalore", deadline: "Mar 20", type: "Paid", logo: "🟦" },
    { id: 3, company: "Startup (AI)", role: "Full Stack Dev Intern", location: "Remote", deadline: "Mar 31", type: "Stipend", logo: "🚀" },
];

export default function HackathonsPage() {
    const [tab, setTab] = useState<"hackathons" | "internships">("hackathons");

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 960, margin: "0 auto" }}>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 6 }}>🚀 Hackathons & Internships</h1>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 20 }}>Track upcoming opportunities with calendar integration</p>

                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    {(["hackathons", "internships"] as const).map((t) => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: "8px 20px", borderRadius: 10, fontWeight: 700, fontSize: "0.85rem",
                            background: tab === t ? "var(--gradient-primary)" : "rgba(255,255,255,0.04)",
                            border: "1px solid var(--border)", color: "var(--text-primary)", cursor: "pointer",
                            textTransform: "capitalize",
                        }}>{t === "hackathons" ? "🏆 Hackathons" : "💼 Internships"}</button>
                    ))}
                </div>

                {tab === "hackathons" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {HACKATHONS.map((h) => (
                            <div key={h.id} className="glass-card" style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: 4 }}>{h.title}</div>
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>⏰ {h.deadline}</span>
                                        <span style={{ fontSize: "0.75rem", color: "#fbbf24" }}>💰 {h.prize}</span>
                                        <span className="badge badge-green" style={{ fontSize: "0.68rem" }}>{h.status}</span>
                                        <span className="badge badge-purple" style={{ fontSize: "0.68rem" }}>{h.category}</span>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button style={{ padding: "6px 14px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24", cursor: "pointer" }}>
                                        {h.saved ? "🔖 Saved" : "🔖 Save"}
                                    </button>
                                    <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "0.75rem" }}>Apply →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === "internships" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {INTERNSHIPS.map((i) => (
                            <div key={i.id} className="glass-card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                                <div style={{ fontSize: "2rem" }}>{i.logo}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{i.company} — {i.role}</div>
                                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 3 }}>📍 {i.location} • ⏰ Deadline: {i.deadline}</div>
                                </div>
                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                    <span className={`badge ${i.type === "Paid" ? "badge-green" : "badge-orange"}`} style={{ fontSize: "0.7rem" }}>{i.type}</span>
                                    <button className="btn-primary" style={{ padding: "6px 16px", fontSize: "0.78rem" }}>Apply →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
