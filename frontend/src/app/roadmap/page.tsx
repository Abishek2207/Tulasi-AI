"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const ROADMAPS = [
    {
        id: "ai-engineer", title: "AI Engineer", icon: "🤖", color: "#7c3aed", progress: 35, steps: [
            { title: "Python Fundamentals", done: true, sub: ["Variables", "Functions", "OOP", "File I/O"] },
            { title: "ML Fundamentals", done: true, sub: ["Linear Regression", "Classification", "Model Evaluation"] },
            { title: "Deep Learning", done: false, sub: ["Neural Networks", "CNNs", "RNNs", "Transformers"] },
            { title: "LLMs & RAG", done: false, sub: ["LangChain", "LlamaIndex", "Vector DBs", "Prompt Engineering"] },
            { title: "MLOps", done: false, sub: ["Docker", "CI/CD", "Model Serving", "Monitoring"] },
        ]
    },
    {
        id: "fullstack", title: "Full Stack Dev", icon: "⚙️", color: "#2563eb", progress: 60, steps: [
            { title: "HTML/CSS/JS", done: true, sub: ["Semantic HTML", "Flexbox/Grid", "ES6+"] },
            { title: "React/Next.js", done: true, sub: ["Components", "Hooks", "App Router", "SSR"] },
            { title: "Backend (Node/FastAPI)", done: true, sub: ["REST APIs", "Authentication", "Databases"] },
            { title: "DevOps", done: false, sub: ["Docker", "Vercel", "Railway", "GitHub Actions"] },
        ]
    },
    {
        id: "data-scientist", title: "Data Scientist", icon: "📊", color: "#10b981", progress: 20, steps: [
            { title: "Statistics & Math", done: true, sub: ["Probability", "Linear Algebra", "Calculus"] },
            { title: "Data Analysis", done: false, sub: ["Pandas", "NumPy", "Matplotlib", "EDA"] },
            { title: "ML Models", done: false, sub: ["Scikit-learn", "XGBoost", "Feature Engineering"] },
            { title: "ML at Scale", done: false, sub: ["Spark", "Cloud ML", "Deployment"] },
        ]
    },
];

export default function RoadmapPage() {
    const [selected, setSelected] = useState("ai-engineer");
    const roadmap = ROADMAPS.find((r) => r.id === selected)!;

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 960, margin: "0 auto" }}>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 6 }}>🗺️ Career Roadmap</h1>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 24 }}>Step-by-step guided paths with skill tracking</p>

                {/* Role selector */}
                <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                    {ROADMAPS.map((r) => (
                        <button key={r.id} onClick={() => setSelected(r.id)} style={{
                            padding: "8px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: "0.83rem",
                            background: selected === r.id ? "var(--gradient-primary)" : "rgba(255,255,255,0.04)",
                            border: selected === r.id ? "none" : "1px solid var(--border)",
                            color: "var(--text-primary)",
                        }}>{r.icon} {r.title}</button>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <div>
                            <span style={{ fontSize: "1.1rem", fontWeight: 800 }}>{roadmap.icon} {roadmap.title}</span>
                            <span className="badge badge-purple" style={{ marginLeft: 10 }}>In Progress</span>
                        </div>
                        <span style={{ fontSize: "1.4rem", fontWeight: 900, color: roadmap.color }}>{roadmap.progress}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${roadmap.progress}%`, background: `linear-gradient(90deg, ${roadmap.color}, #06b6d4)` }} />
                    </div>
                </div>

                {/* Steps */}
                <div style={{ position: "relative", paddingLeft: 28 }}>
                    {roadmap.steps.map((step, i) => (
                        <div key={i} style={{ position: "relative", marginBottom: 16 }}>
                            {/* Connector line */}
                            {i < roadmap.steps.length - 1 && (
                                <div style={{
                                    position: "absolute", left: -22, top: 28, width: 2, height: "calc(100% + 6px)",
                                    background: step.done ? roadmap.color : "var(--border)",
                                }} />
                            )}
                            {/* Circle */}
                            <div style={{
                                position: "absolute", left: -28, top: 14,
                                width: 14, height: 14, borderRadius: "50%",
                                background: step.done ? roadmap.color : "var(--border)",
                                border: step.done ? `2px solid ${roadmap.color}` : "2px solid var(--border)",
                                zIndex: 1,
                            }} />

                            <div className="glass-card" style={{
                                padding: 18,
                                background: step.done ? `${roadmap.color}08` : "rgba(255,255,255,0.03)",
                                borderColor: step.done ? `${roadmap.color}30` : "var(--border)",
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                    <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                                        {step.done ? "✅" : "⬜"} {step.title}
                                    </span>
                                    <span className={`badge ${step.done ? "badge-green" : "badge-purple"}`} style={{ fontSize: "0.68rem" }}>
                                        {step.done ? "Completed" : "Upcoming"}
                                    </span>
                                </div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {step.sub.map((s) => (
                                        <span key={s} style={{
                                            padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem",
                                            background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
                                            color: "var(--text-secondary)",
                                        }}>{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
