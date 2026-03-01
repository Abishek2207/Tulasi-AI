"use client";
import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

import { chatWithAI, uploadDocument } from "@/lib/api";

type Message = {
    role: "user" | "ai";
    text: string;
    timestamp: string;
};

function formatTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Simple markdown-like renderer
function RenderText({ text }: { text: string }) {
    const lines = text.split("\n");
    return (
        <div style={{ lineHeight: 1.7, fontSize: "0.875rem" }}>
            {lines.map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
                    return <p key={i} style={{ fontWeight: 700, color: "#e0e0ff", marginBottom: 4 }}>{line.replace(/\*\*/g, "")}</p>;
                }
                if (line.startsWith("- ")) {
                    return <div key={i} style={{ marginLeft: 12, marginBottom: 3, display: "flex", gap: 8 }}><span style={{ color: "#a78bfa" }}>•</span><span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong style='color:#c4b5fd'>$1</strong>") }} /></div>;
                }
                if (/^\d+\./.test(line)) {
                    return <div key={i} style={{ marginLeft: 12, marginBottom: 3, display: "flex", gap: 8 }}><span style={{ color: "#7c3aed", fontWeight: 700, minWidth: 16 }}>{line.match(/^\d+/)?.[0]}.</span><span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\. /, "").replace(/\*\*(.*?)\*\*/g, "<strong style='color:#c4b5fd'>$1</strong>") }} /></div>;
                }
                if (line.startsWith("```")) return <div key={i} style={{ display: "none" }} />;
                if (line.startsWith("|")) {
                    const cells = line.split("|").filter(Boolean);
                    return <div key={i} style={{ display: "flex", gap: 0, fontFamily: "monospace", fontSize: "0.78rem", marginBottom: 2 }}>
                        {cells.map((c, j) => <span key={j} style={{ padding: "2px 12px", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)", flex: 1 }}>{c.trim()}</span>)}
                    </div>;
                }
                if (line.startsWith("#")) {
                    return <p key={i} style={{ fontWeight: 800, fontSize: "1rem", marginTop: 8, marginBottom: 6 }} dangerouslySetInnerHTML={{ __html: line.replace(/^#+\s/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />;
                }
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} style={{ marginBottom: 3, color: "rgba(240,240,255,0.85)" }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong style='color:#e0e0ff'>$1</strong>").replace(/`(.*?)`/g, "<code style='background:rgba(124,58,237,0.2);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.82rem;color:#c4b5fd'>$1</code>") }} />;
            })}
        </div>
    );
}

const SUGGESTIONS = [
    "Explain transformers architecture",
    "How does RAG work?",
    "Python best practices",
    "What is pgvector?",
];

import { supabase } from "@/lib/supabase";

export default function ChatPage() {
    const [user, setUser] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            text: `**Welcome to TulasiAI Chatbot!** 🚀\n\nI'm your AI-powered study assistant. I can:\n- **Answer questions** about AI, coding, career\n- **Explain concepts** step-by-step with examples\n- **Analyze documents** — upload a PDF and ask questions\n- **Respond in multiple languages** (Tamil, Hindi, English)\n\nTry asking me something or use the suggestions below! 👇`,
            timestamp: formatTime(),
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const typeResponse = (fullText: string) => {
        setLoading(false);
        let i = 0;
        const placeholder: Message = { role: "ai", text: "", timestamp: formatTime() };
        setMessages((prev) => [...prev, placeholder]);
        const interval = setInterval(() => {
            i += 10;
            const chunk = fullText.slice(0, i);
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...placeholder, text: chunk };
                return updated;
            });
            if (i >= fullText.length) {
                clearInterval(interval);
            }
        }, 15);
    };

    const handleSend = async (text = input) => {
        if (!text.trim() || loading) return;
        const userMsg: Message = { role: "user", text: text.trim(), timestamp: formatTime() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const userId = user?.email || "demo_student";
            const response = await chatWithAI(text, userId);
            typeResponse(response);
        } catch (err) {
            setLoading(false);
            setMessages((prev) => [...prev, { role: "ai", text: "Error: Could not connect to the AI engine.", timestamp: formatTime() }]);
        }
    };

    const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file.name);
            setLoading(true);
            const res = await uploadDocument(file, "demo_student");
            setLoading(false);
            setMessages((prev) => [...prev, { role: "ai", text: `📄 **File Processed:** ${res.status || "Ready for questions!"}`, timestamp: formatTime() }]);
        }
    };

    const startVoice = () => {
        if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            alert("Voice input is not supported in this browser. Try Google Chrome.");
            return;
        }
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = true;
        recognitionRef.current = recognition;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join("");
            setInput(transcript);
        };
        recognition.onend = () => {
            setIsListening(false);
            if (input.trim()) handleSend(input);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.start();
    };

    const stopVoice = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 900, margin: "0 auto", height: "calc(100vh - 48px)", display: "flex", flexDirection: "column", gap: 0 }}>

                {/* Header */}
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "0 0 16px", borderBottom: "1px solid var(--border)", marginBottom: 16, flexShrink: 0,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12, background: "var(--gradient-primary)",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
                            boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
                        }}>🤖</div>
                        <div>
                            <h1 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>TulasiAI Chatbot</h1>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
                                <span style={{ fontSize: "0.72rem", color: "#34d399" }}>Ollama Llama3 • Ready</span>
                                {uploadedFile && <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>📎 {uploadedFile}</span>}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <label style={{
                            padding: "7px 14px", borderRadius: 10, cursor: "pointer",
                            background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)",
                            color: "#a78bfa", fontSize: "0.78rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
                        }}>
                            📎 Upload PDF
                            <input type="file" accept=".pdf" style={{ display: "none" }} onChange={onFileUpload} />
                        </label>
                        <button onClick={() => setMessages([messages[0]])} style={{
                            padding: "7px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)",
                            border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.78rem",
                        }}>🗑 Clear</button>
                    </div>
                </div>

                {/* Chat messages */}
                <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{
                            display: "flex", gap: 12,
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                            marginBottom: 20, alignItems: "flex-start",
                        }}>
                            {msg.role === "ai" && (
                                <div style={{
                                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                                    background: "rgba(255,255,255,0.05)", marginTop: 2,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                }}>
                                    <img src="/logo.png" alt="T" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            )}
                            <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 4 }}>
                                {msg.role === "ai" && (
                                    <span suppressHydrationWarning style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginLeft: 2 }}>TulasiAI • {msg.timestamp}</span>
                                )}
                                <div style={{
                                    padding: "14px 18px", borderRadius: msg.role === "user" ? "20px 20px 6px 20px" : "6px 20px 20px 20px",
                                    background: msg.role === "user"
                                        ? "linear-gradient(135deg, #7c3aed, #2563eb)"
                                        : "rgba(255,255,255,0.04)",
                                    border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.07)",
                                    color: "var(--text-primary)",
                                    boxShadow: msg.role === "user" ? "0 4px 16px rgba(124,58,237,0.3)" : "none",
                                }}>
                                    {msg.role === "ai" ? <RenderText text={msg.text} /> : <p style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>{msg.text}</p>}
                                </div>
                                {msg.role === "user" && (
                                    <span suppressHydrationWarning style={{ fontSize: "0.68rem", color: "var(--text-muted)", textAlign: "right", marginRight: 2 }}>{msg.timestamp}</span>
                                )}
                            </div>
                            {msg.role === "user" && (
                                <div style={{
                                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                    background: "rgba(255,255,255,0.08)", marginTop: 18,
                                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem",
                                }}>👤</div>
                            )}
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {loading && (
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 12,
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden"
                            }}>
                                <img src="/logo.png" alt="T" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div style={{ padding: "14px 20px", borderRadius: "6px 20px 20px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 5, alignItems: "center" }}>
                                {[0, 1, 2].map((d) => (
                                    <div key={d} style={{
                                        width: 7, height: 7, borderRadius: "50%", background: "#7c3aed",
                                        animation: `pulse 1.2s ease-in-out ${d * 0.2}s infinite`,
                                        opacity: 0.6,
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Suggestions */}
                {messages.length <= 1 && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", flexShrink: 0 }}>
                        {SUGGESTIONS.map((s) => (
                            <button key={s} onClick={() => handleSend(s)} style={{
                                padding: "6px 14px", borderRadius: 20, fontSize: "0.76rem", fontWeight: 500,
                                background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)",
                                color: "#c4b5fd", cursor: "pointer", transition: "all 0.2s",
                            }}>{s}</button>
                        ))}
                    </div>
                )}

                {/* Input bar */}
                <div style={{
                    display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16, padding: "8px 8px 8px 16px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                }}>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                        }}
                        placeholder={isListening ? "🎤 Listening..." : "Ask anything... (Shift+Enter for new line)"}
                        rows={1}
                        style={{
                            flex: 1, background: "transparent", border: "none", outline: "none",
                            color: isListening ? "#a78bfa" : "var(--text-primary)", fontSize: "0.9rem",
                            resize: "none", lineHeight: 1.6, minHeight: 24, maxHeight: 120,
                            fontFamily: "inherit", paddingTop: 4,
                        }}
                    />

                    {/* Voice button */}
                    <button
                        onClick={isListening ? stopVoice : startVoice}
                        title={isListening ? "Stop listening" : "Voice input"}
                        style={{
                            width: 40, height: 40, borderRadius: 10, border: "none", cursor: "pointer",
                            background: isListening ? "rgba(239,68,68,0.2)" : "rgba(124,58,237,0.12)",
                            color: isListening ? "#ef4444" : "#a78bfa",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
                            flexShrink: 0, transition: "all 0.2s",
                            animation: isListening ? "pulse-glow 1.5s ease-in-out infinite" : "none",
                        }}>
                        {isListening ? "⏹" : "🎤"}
                    </button>

                    {/* Send button */}
                    <button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        style={{
                            width: 40, height: 40, borderRadius: 10, border: "none",
                            background: input.trim() ? "var(--gradient-primary)" : "rgba(255,255,255,0.05)",
                            color: input.trim() ? "white" : "var(--text-muted)",
                            cursor: input.trim() ? "pointer" : "default",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
                            flexShrink: 0, transition: "all 0.2s",
                            boxShadow: input.trim() ? "0 4px 16px rgba(124,58,237,0.4)" : "none",
                        }}>↑</button>
                </div>

                <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.4); opacity: 1; }
          }
        `}</style>
            </div>
        </DashboardLayout>
    );
}
