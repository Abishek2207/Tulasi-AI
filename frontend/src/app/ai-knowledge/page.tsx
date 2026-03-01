"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const TOPICS = [
    {
        id: "rag", icon: "🔍", title: "RAG (Retrieval Augmented Generation)", color: "#7c3aed",
        content: "RAG combines information retrieval with text generation. Instead of relying solely on the model's training data, it retrieves relevant documents from a vector database and uses them as context for the LLM to generate accurate, up-to-date answers."
    },
    {
        id: "llm", icon: "🧠", title: "LLM Architecture", color: "#2563eb",
        content: "Large Language Models (LLMs) are built on the Transformer architecture with self-attention mechanisms. They are pre-trained on massive text corpora and can be fine-tuned for specific tasks. Key models include GPT-4, Llama 3, Mistral, and Gemini."
    },
    {
        id: "vector-db", icon: "📊", title: "Vector Databases", color: "#10b981",
        content: "Vector databases store embeddings — high-dimensional numerical representations of data. They enable similarity search using cosine distance or dot product. Popular options: pgvector (PostgreSQL), Pinecone, Weaviate, Chroma, and FAISS."
    },
    {
        id: "langchain", icon: "⛓️", title: "LangChain", color: "#f59e0b",
        content: "LangChain is a framework for building applications powered by LLMs. It provides chains, agents, memory, and tools to build complex AI workflows. Key components: LLMChain, RetrievalQA, ConversationChain, and LangGraph for multi-agent systems."
    },
    {
        id: "llamaindex", icon: "🦙", title: "LlamaIndex", color: "#ec4899",
        content: "LlamaIndex (formerly GPT Index) is a data framework for LLM applications. It specializes in connecting custom data sources to LLMs. Key features: document loading, indexing, retrieval, and query engines for RAG pipelines."
    },
    {
        id: "huggingface", icon: "🤗", title: "HuggingFace", color: "#06b6d4",
        content: "HuggingFace is the go-to platform for open-source AI models. The Transformers library provides easy access to thousands of pre-trained models. Sentence Transformers are used for creating semantic embeddings for RAG and semantic search."
    },
];

export default function AIKnowledgePage() {
    const [selected, setSelected] = useState(TOPICS[0]);
    const [lang, setLang] = useState("English");

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>🧠 AI Knowledge Hub</h1>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Learn AI concepts in multiple languages</p>
                    </div>
                    <select value={lang} onChange={(e) => setLang(e.target.value)} className="input-field" style={{ width: "auto", padding: "8px 14px" }}>
                        <option>English</option>
                        <option>Tamil</option>
                        <option>Hindi</option>
                        <option>Telugu</option>
                    </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
                    {/* Topic List */}
                    <div>
                        {TOPICS.map((t) => (
                            <div key={t.id} onClick={() => setSelected(t)} style={{
                                padding: "12px 14px", borderRadius: 10, marginBottom: 8, cursor: "pointer",
                                background: selected.id === t.id ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
                                border: `1px solid ${selected.id === t.id ? "rgba(124,58,237,0.3)" : "transparent"}`,
                                display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s",
                            }}>
                                <span>{t.icon}</span>
                                <span style={{ fontSize: "0.82rem", fontWeight: selected.id === t.id ? 700 : 500, color: selected.id === t.id ? "#a78bfa" : "var(--text-primary)" }}>{t.title.split("(")[0]}</span>
                            </div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="glass-card" style={{ padding: 28 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 12,
                                background: `${selected.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem",
                            }}>{selected.icon}</div>
                            <div>
                                <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{selected.title}</h2>
                                <span className="badge badge-blue" style={{ fontSize: "0.68rem" }}>{lang}</span>
                            </div>
                        </div>

                        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 24 }}>
                            {selected.content}
                            {lang !== "English" && <em style={{ color: "var(--text-muted)" }}> (Connect FastAPI backend to get translated content in {lang})</em>}
                        </p>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button style={{ padding: "8px 16px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, background: `${selected.color}15`, border: `1px solid ${selected.color}30`, color: selected.color, cursor: "pointer" }}>
                                🤖 Ask AI about this
                            </button>
                            <button style={{ padding: "8px 16px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)", cursor: "pointer" }}>
                                💻 Practice Problems
                            </button>
                            <button style={{ padding: "8px 16px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)", cursor: "pointer" }}>
                                📝 Create Notes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
