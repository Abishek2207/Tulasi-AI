"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, FileText, Loader2, Send, Sparkles, Trash2, Upload, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import { pdfApi } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import toast from "react-hot-toast";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

export default function PDFQAPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [indexedChunks, setIndexedChunks] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchStatus = async () => {
    try {
      const data = await pdfApi.status();
      setIndexedChunks(data.indexed_chunks);
    } catch (e) {
      console.error("Failed to fetch PDF status", e);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setIndexing(true);
    try {
      const res = await pdfApi.upload(file);
      toast.success(res.message);
      setIndexedChunks(res.chunks_indexed);
      setFile(null);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setIndexing(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Clear all indexed documents from memory?")) return;
    try {
      await pdfApi.clear();
      setIndexedChunks(0);
      setMessages([]);
      toast.success("Memory cleared");
    } catch (e) {
      toast.error("Failed to clear memory");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setSending(true);

    try {
      // Use the dedicated Gemini 1.5 RAG endpoint for document-aware answers
      const res = await pdfApi.ask(userMsg);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.answer,
        citations: res.citations
      }]);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", gap: 24 }} className="pdf-qa-container">
      
      {/* Left Sidebar: Document Management */}
      <div className="dash-card" style={{ width: 340, display: "flex", flexDirection: "column", gap: 24, padding: 24 }}>
        <div style={{ padding: "0 4px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, display: "flex", alignItems: "center", gap: 12, letterSpacing: "-0.02em" }}>
            <div style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(108,99,255,0.3)" }}>
              <Zap size={20} color="white" />
            </div>
            <span>Document Lab</span>
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>Upload & analyze technical documents with RAG.</p>
        </div>

        <div 
          style={{ 
            border: "2px dashed rgba(255,255,255,0.1)", 
            borderRadius: 20, 
            padding: "32px 24px", 
            textAlign: "center", 
            background: "rgba(255,255,255,0.01)", 
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden"
          }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--brand-primary), transparent)", opacity: uploading ? 1 : 0 }} />
          <Upload size={40} style={{ margin: "0 auto 16px", opacity: 0.3, color: "var(--brand-primary)" }} />
          <input type="file" accept=".pdf" onChange={onFileChange} style={{ display: "none" }} id="pdf-upload" />
          <label htmlFor="pdf-upload" style={{ cursor: "pointer", fontSize: 15, fontWeight: 800, color: "white", display: "block" }}>
            {file ? file.name : "Select technical PDF"}
          </label>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10, fontWeight: 500 }}>Max size 10MB • .pdf only</p>
        </div>

        {file && (
          <motion.button 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            onClick={handleUpload} disabled={uploading} className="btn-primary" 
            style={{ padding: "14px", borderRadius: 12, fontWeight: 800, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {uploading ? "Analyzing..." : "Index Document"}
          </motion.button>
        )}

        <div style={{ height: 1, background: "var(--border)" }} />

        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>Index Status</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: "12px 16px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: indexedChunks > 0 ? "#10B981" : "var(--text-muted)" }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{indexedChunks} Knowledge Chunks</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Available for RAG retrieval</div>
              </div>
            </div>
            
            {indexedChunks > 0 && (
              <button 
                onClick={handleClear}
                style={{ fontSize: 12, color: "#F43F5E", fontWeight: 700, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}
              >
                <Trash2 size={14} /> Wipe AI Memory
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: 16, background: "rgba(255,165,0,0.05)", border: "1px solid rgba(255,165,0,0.2)", borderRadius: 12, fontSize: 11, color: "#F59E0B", lineHeight: 1.5 }}>
          Tulasi AI uses <strong>Retrieval Augmented Generation (RAG)</strong> to find specific answers inside your documents without hallucinating.
        </div>
      </div>

      {/* Main Area: AI Chat */}
      <div className="dash-card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        
        {/* Chat Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(108,99,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(108,99,255,0.2)" }}>
              <Brain size={26} style={{ color: "var(--brand-primary)" }} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-0.01em" }}>Neural Document Engine</h3>
              <div style={{ fontSize: 11, color: "#10B981", fontWeight: 800, display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                <ShieldCheck size={13} /> Context Authenticated
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          {messages.length === 0 ? (
            <div style={{ margin: "auto", textAlign: "center", maxWidth: 400 }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <FileText size={32} style={{ opacity: 0.3 }} />
              </div>
              <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Ready for Analysis</h4>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Upload a document on the left and start asking questions like:<br/>
                <em>"What are the main conclusions?"</em> or <br/>
                <em>"Summarize the technical specifications."</em>
              </p>
            </div>
          ) : (
            messages.map((m, i) => (
              <motion.div 
                key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%" }}
              >
                <div style={{
                  padding: "14px 18px", borderRadius: 16, fontSize: 15, lineHeight: 1.6,
                  background: m.role === "user" ? "var(--brand-primary)" : "var(--surface)",
                  color: "white",
                  border: m.role === "user" ? "none" : "1px solid var(--border)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  {m.content}
                </div>
                {m.role === "assistant" && (m as any).citations?.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, paddingLeft: 4 }}>
                    {(m as any).citations.map((c: string, ci: number) => (
                      <span key={ci} style={{ fontSize: 10, fontWeight: 700, color: "#8B5CF6", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", padding: "2px 8px", borderRadius: 8 }}>
                        📎 {c}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
          {sending && (
            <div style={{ display: "flex", gap: 8, padding: 8 }}>
              <div className="dot-pulse" />
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>Tulasi AI is reading...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} style={{ padding: 24, borderTop: "1px solid var(--border)", display: "flex", gap: 12, background: "rgba(255,255,255,0.01)" }}>
          <input 
            type="text" value={input} onChange={e => setInput(e.target.value)} 
            placeholder={indexedChunks > 0 ? "Ask about your PDF..." : "Index a document first..."}
            disabled={indexedChunks === 0 || sending}
            style={{ flex: 1, borderRadius: 14, padding: "14px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white", outline: "none", opacity: indexedChunks === 0 ? 0.5 : 1 }}
          />
          <button disabled={!input.trim() || sending} type="submit" className="btn-primary" style={{ width: 50, height: 50, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            <Send size={20} />
          </button>
        </form>
      </div>

      <style jsx>{`
        .dot-pulse {
          width: 8px; height: 8px; border-radius: 4px; background: var(--brand-primary);
          animation: pulse 1.5s infinite ease-in-out;
        }
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
        @media (max-width: 900px) {
          .pdf-qa-container { flex-direction: column !important; height: auto !important; }
          .dash-card { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
