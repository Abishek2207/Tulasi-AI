"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const GROUPS = [
    { id: 1, name: "AI Study Circle", members: 12, topic: "LLMs & RAG", online: 5 },
    { id: 2, name: "DSA Grind Squad", members: 24, topic: "Arrays & DP", online: 9 },
];

const MESSAGES = [
    { user: "Priya", text: "Hey everyone! Ready to study transformers today?", time: "10:02 AM" },
    { user: "Arun", text: "Yes! Let's start with attention mechanisms.", time: "10:04 AM" },
    { user: "You", text: "I have notes from the TulasiAI chatbot. Sharing now!", time: "10:06 AM", isMe: true },
];

export default function GroupStudyPage() {
    const [activeGroup, setActiveGroup] = useState<number | null>(null);
    const [msg, setMsg] = useState("");
    const [chat, setChat] = useState(MESSAGES);

    const sendMsg = () => {
        if (!msg.trim()) return;
        setChat((c) => [...c, { user: "You", text: msg, time: "Now", isMe: true }]);
        setMsg("");
    };

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>👥 Group Study</h1>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Create batches, group chat & solve problems together</p>
                    </div>
                    <button className="btn-primary">+ Create Group</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: activeGroup ? "280px 1fr" : "1fr", gap: 16, minHeight: "70vh" }}>
                    {/* Groups list */}
                    <div>
                        {GROUPS.map((g) => (
                            <div key={g.id} onClick={() => setActiveGroup(g.id)} style={{
                                padding: 18, borderRadius: 14, marginBottom: 12, cursor: "pointer",
                                background: activeGroup === g.id ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.04)",
                                border: `1px solid ${activeGroup === g.id ? "rgba(124,58,237,0.35)" : "var(--border)"}`,
                                transition: "all 0.2s",
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{g.name}</span>
                                    <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 600 }}>● {g.online} online</span>
                                </div>
                                <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: 4 }}>Topic: {g.topic}</div>
                                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>{g.members} members</div>
                            </div>
                        ))}
                        <div style={{
                            padding: 18, borderRadius: 14, border: "2px dashed var(--border)",
                            textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem", cursor: "pointer",
                        }}>
                            🔗 Join via invite link
                        </div>
                    </div>

                    {/* Chat */}
                    {activeGroup && (
                        <div className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
                            <div style={{ fontWeight: 700, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                                💬 {GROUPS.find(g => g.id === activeGroup)?.name}
                                <span style={{ fontSize: "0.72rem", color: "#10b981", marginLeft: 10 }}>● Live</span>
                            </div>
                            <div style={{ flex: 1, overflowY: "auto", marginBottom: 14, display: "flex", flexDirection: "column", gap: 12, minHeight: 300 }}>
                                {chat.map((m, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: (m as any).isMe ? "flex-end" : "flex-start", gap: 8 }}>
                                        {!(m as any).isMe && <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", flexShrink: 0 }}>{m.user[0]}</div>}
                                        <div style={{ maxWidth: "70%" }}>
                                            {!(m as any).isMe && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 3 }}>{m.user} • {m.time}</div>}
                                            <div style={{
                                                padding: "10px 14px", borderRadius: (m as any).isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                                background: (m as any).isMe ? "var(--gradient-primary)" : "rgba(255,255,255,0.06)",
                                                fontSize: "0.84rem", lineHeight: 1.5,
                                            }}>{m.text}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                                <input className="input-field" value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMsg()} placeholder="Type a message..." style={{ flex: 1 }} />
                                <button className="btn-primary" onClick={sendMsg} style={{ flexShrink: 0 }}>Send</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
