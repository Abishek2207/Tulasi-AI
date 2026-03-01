"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const SAMPLE_NOTES = [
    { id: 1, title: "Transformer Architecture", content: "The transformer model is based on self-attention mechanism. It consists of encoder and decoder blocks...", tags: ["AI", "DL"], date: "2 days ago" },
    { id: 2, title: "RAG Pipeline Notes", content: "RAG = Retrieval Augmented Generation. Steps: 1. Upload doc 2. Chunk 3. Embed 4. Store in vector DB 5. Query...", tags: ["RAG", "LLM"], date: "5 days ago" },
    { id: 3, title: "React Hooks Cheatsheet", content: "useState, useEffect, useContext, useMemo, useCallback, useRef, useReducer...", tags: ["React", "Frontend"], date: "1 week ago" },
];

export default function NotesPage() {
    const [selected, setSelected] = useState<number | null>(1);
    const [notes, setNotes] = useState(SAMPLE_NOTES);
    const [editContent, setEditContent] = useState(SAMPLE_NOTES[0].content);

    const activeNote = notes.find((n) => n.id === selected);

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>📝 Notes (NotebookLM Style)</h1>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Markdown notes with AI summaries, flashcards & quiz generation</p>
                    </div>
                    <button className="btn-primary" onClick={() => {
                        const n = { id: Date.now(), title: "New Note", content: "Start typing...", tags: [], date: "Just now" };
                        setNotes((prev) => [n, ...prev]);
                        setSelected(n.id);
                        setEditContent(n.content);
                    }}>+ New Note</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, minHeight: "70vh" }}>
                    {/* Note list */}
                    <div className="glass-card" style={{ padding: 14, overflowY: "auto" }}>
                        {notes.map((note) => (
                            <div key={note.id} onClick={() => { setSelected(note.id); setEditContent(note.content); }} style={{
                                padding: "12px 14px", borderRadius: 10, marginBottom: 8, cursor: "pointer",
                                background: selected === note.id ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
                                border: `1px solid ${selected === note.id ? "rgba(124,58,237,0.3)" : "transparent"}`,
                            }}>
                                <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 4 }}>{note.title}</div>
                                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {note.content.substring(0, 60)}...
                                </div>
                                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                                    {note.tags.map((tag) => (
                                        <span key={tag} className="badge badge-blue" style={{ fontSize: "0.62rem" }}>{tag}</span>
                                    ))}
                                </div>
                                <div style={{ fontSize: "0.66rem", color: "var(--text-muted)", marginTop: 6 }}>{note.date}</div>
                            </div>
                        ))}
                    </div>

                    {/* Editor */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {activeNote ? (
                            <>
                                <div className="glass-card" style={{ padding: 20, flex: 1 }}>
                                    <input
                                        style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 14 }}
                                        defaultValue={activeNote.title}
                                        placeholder="Note title..."
                                    />
                                    <textarea
                                        className="input-field"
                                        style={{ minHeight: 300, resize: "vertical", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", lineHeight: 1.8 }}
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    <button style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>
                                        ✨ AI Summarize
                                    </button>
                                    <button style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>
                                        🃏 Generate Flashcards
                                    </button>
                                    <button style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>
                                        🧩 Generate Quiz
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                                Select a note or create a new one
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
