"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const PROBLEMS = [
    { id: 1, title: "Two Sum", difficulty: "Easy", category: "Arrays", solved: true, xp: 50 },
    { id: 2, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", category: "Strings", solved: true, xp: 100 },
    { id: 3, title: "Median of Two Sorted Arrays", difficulty: "Hard", category: "Arrays", solved: false, xp: 200 },
    { id: 4, title: "Binary Search", difficulty: "Easy", category: "Search", solved: true, xp: 50 },
    { id: 5, title: "Merge K Sorted Lists", difficulty: "Hard", category: "Linked List", solved: false, xp: 200 },
    { id: 6, title: "Maximum Subarray", difficulty: "Medium", category: "DP", solved: false, xp: 100 },
    { id: 7, title: "Valid Parentheses", difficulty: "Easy", category: "Stack", solved: true, xp: 50 },
    { id: 8, title: "Word Break", difficulty: "Medium", category: "DP", solved: false, xp: 100 },
];

const DIFF_COLORS: Record<string, string> = {
    Easy: "#10b981",
    Medium: "#f59e0b",
    Hard: "#ef4444",
};

export default function CodingPage() {
    const [selected, setSelected] = useState<number | null>(null);
    const [code, setCode] = useState(`def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test
print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
`);
    const [output, setOutput] = useState("");

    const runCode = () => {
        setOutput("✅ Output: [0, 1]\n⏱ Runtime: 42ms | 🧠 Memory: 14.3 MB\n✓ All 3 test cases passed!");
    };

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ marginBottom: 20 }}>
                    <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>💻 Coding Practice</h1>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>LeetCode-style DSA problems • Monaco Editor • Docker sandbox</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: selected !== null ? "340px 1fr" : "1fr", gap: 16, minHeight: "75vh" }}>
                    {/* Problem list */}
                    <div className="glass-card" style={{ padding: 16, overflowY: "auto" }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                            {["All", "Easy", "Medium", "Hard"].map((f) => (
                                <button key={f} style={{
                                    padding: "4px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600,
                                    background: f === "All" ? "var(--gradient-primary)" : "rgba(255,255,255,0.05)",
                                    border: "1px solid var(--border)", color: "var(--text-primary)", cursor: "pointer",
                                }}>{f}</button>
                            ))}
                        </div>
                        {PROBLEMS.map((p) => (
                            <div key={p.id} onClick={() => setSelected(p.id)} style={{
                                padding: "12px 14px", borderRadius: 10, marginBottom: 8, cursor: "pointer",
                                background: selected === p.id ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                                border: `1px solid ${selected === p.id ? "rgba(124,58,237,0.35)" : "var(--border)"}`,
                                transition: "all 0.2s",
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: p.solved ? "var(--text-primary)" : "var(--text-secondary)" }}>
                                        {p.solved ? "✅ " : "⭕ "}{p.title}
                                    </span>
                                    <span style={{ fontSize: "0.7rem", color: DIFF_COLORS[p.difficulty], fontWeight: 700 }}>{p.difficulty}</span>
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>{p.category} • +{p.xp} XP</div>
                            </div>
                        ))}
                    </div>

                    {/* Code Editor area */}
                    {selected !== null && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div className="glass-card" style={{ padding: 20 }}>
                                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{PROBLEMS.find(p => p.id === selected)?.title}</h3>
                                <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                                    Given an array of integers <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>nums</code> and an integer <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>target</code>, return indices of the two numbers such that they add up to target.
                                </p>
                            </div>

                            <div className="glass-card" style={{ padding: 16 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {["Python", "JavaScript", "C++"].map((lang) => (
                                            <button key={lang} style={{
                                                padding: "4px 12px", borderRadius: 6, fontSize: "0.75rem",
                                                background: lang === "Python" ? "rgba(124,58,237,0.2)" : "transparent",
                                                border: "1px solid var(--border)", color: "var(--text-primary)", cursor: "pointer",
                                            }}>{lang}</button>
                                        ))}
                                    </div>
                                    <button className="btn-primary" onClick={runCode} style={{ padding: "6px 16px", fontSize: "0.82rem" }}>
                                        ▶ Run Code
                                    </button>
                                </div>
                                <textarea
                                    className="font-code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    style={{
                                        width: "100%", minHeight: 240, background: "#0d0d16",
                                        border: "1px solid var(--border)", borderRadius: 8, padding: 16,
                                        color: "#c9d1d9", fontSize: "0.85rem", lineHeight: 1.7, resize: "vertical",
                                        outline: "none", fontFamily: "'JetBrains Mono', monospace",
                                    }}
                                />
                                {output && (
                                    <div style={{
                                        marginTop: 12, padding: 14, borderRadius: 8,
                                        background: "#0d1117", border: "1px solid #30363d", fontSize: "0.82rem",
                                        fontFamily: "monospace", color: "#7ee787", whiteSpace: "pre-line",
                                    }}>{output}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
