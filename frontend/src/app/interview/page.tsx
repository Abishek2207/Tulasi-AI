"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "AI Engineer", "Data Scientist", "ML Researcher"];
const QUESTIONS: Record<string, string[]> = {
    "Frontend Developer": ["What is the virtual DOM in React?", "Explain CSS specificity.", "What are React hooks and how do they work?"],
    "AI Engineer": ["Explain the transformer architecture.", "What is RAG and how does it work?", "Compare fine-tuning vs prompt engineering."],
    "Data Scientist": ["What is the bias-variance tradeoff?", "Explain gradient descent.", "When would you use PCA?"],
};

export default function InterviewPage() {
    const [step, setStep] = useState<"select" | "interview" | "result">("select");
    const [role, setRole] = useState("");
    const [qIndex, setQIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [scores, setScores] = useState<number[]>([]);

    const questions = QUESTIONS[role] || QUESTIONS["AI Engineer"];

    const startInterview = (r: string) => {
        setRole(r); setStep("interview"); setQIndex(0); setScores([]);
    };

    const submitAnswer = () => {
        const score = Math.floor(Math.random() * 30) + 65;
        setScores((s) => [...s, score]);
        if (qIndex + 1 >= questions.length) {
            setStep("result");
        } else {
            setQIndex(qIndex + 1);
            setAnswer("");
        }
    };

    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 6 }}>🎤 AI Mock Interview</h1>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 24 }}>AI evaluates your answers and gives detailed feedback</p>

                {step === "select" && (
                    <div>
                        <p style={{ marginBottom: 16, color: "var(--text-secondary)", fontSize: "0.9rem" }}>Select your target role:</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                            {ROLES.map((r) => (
                                <div key={r} onClick={() => startInterview(r)} style={{
                                    padding: 20, borderRadius: 14, cursor: "pointer",
                                    background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                                    textAlign: "center", transition: "all 0.2s",
                                }} onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)")}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                                    <div style={{ fontSize: "2rem", marginBottom: 10 }}>
                                        {r.includes("AI") ? "🤖" : r.includes("Data") ? "📊" : r.includes("ML") ? "🧬" : r.includes("Full") ? "⚙️" : r.includes("Back") ? "🔧" : "🎨"}
                                    </div>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{r}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === "interview" && (
                    <div className="glass-card" style={{ padding: 28 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                            <span className="badge badge-purple">{role}</span>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Q {qIndex + 1} of {questions.length}</span>
                        </div>
                        <div className="progress-bar" style={{ marginBottom: 24 }}>
                            <div className="progress-fill" style={{ width: `${((qIndex) / questions.length) * 100}%` }} />
                        </div>
                        <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                            <p style={{ fontSize: "0.75rem", color: "#a78bfa", fontWeight: 700, marginBottom: 8 }}>🤖 AI Interviewer asks:</p>
                            <p style={{ fontSize: "1rem", fontWeight: 600 }}>{questions[qIndex]}</p>
                        </div>
                        <textarea
                            className="input-field"
                            rows={6}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Type your answer here... Be specific and give examples."
                            style={{ resize: "vertical", marginBottom: 14 }}
                        />
                        <button className="btn-primary" onClick={submitAnswer}>
                            {qIndex + 1 >= questions.length ? "Finish Interview" : "Next Question →"}
                        </button>
                    </div>
                )}

                {step === "result" && (
                    <div>
                        <div className="glass-card" style={{ padding: 28, textAlign: "center", marginBottom: 16 }}>
                            <div style={{ fontSize: "3rem", marginBottom: 10 }}>{avgScore >= 80 ? "🎉" : avgScore >= 65 ? "👍" : "📚"}</div>
                            <div style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: 6 }} className="gradient-text">{avgScore}%</div>
                            <p style={{ color: "var(--text-secondary)" }}>Overall Interview Score</p>
                            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
                                <span className={`badge ${avgScore >= 80 ? "badge-green" : "badge-orange"}`}>
                                    {avgScore >= 80 ? "Excellent" : avgScore >= 65 ? "Good" : "Needs Improvement"}
                                </span>
                            </div>
                        </div>
                        {questions.map((q, i) => (
                            <div key={i} className="glass-card" style={{ padding: 16, marginBottom: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{q}</span>
                                    <span style={{ color: scores[i] >= 80 ? "#10b981" : "#f59e0b", fontWeight: 700, fontSize: "0.9rem" }}>{scores[i]}%</span>
                                </div>
                                <p style={{ fontSize: "0.77rem", color: "var(--text-secondary)" }}>
                                    💡 AI Feedback: Good answer structure. Consider adding more specific examples to strengthen your response.
                                </p>
                            </div>
                        ))}
                        <button className="btn-primary" onClick={() => setStep("select")} style={{ marginTop: 14 }}>
                            🔄 Start New Interview
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
