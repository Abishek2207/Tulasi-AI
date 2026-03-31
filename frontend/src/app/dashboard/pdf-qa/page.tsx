"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, Send, Trash2, Brain, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { pdfApi, chatApi } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import toast from "react-hot-toast";

export default function PDFQAPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [indexedChunks, setIndexedChunks] = useState(0);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
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
      // Use the generic chat API but indicate we want RAG context
      const res = await chatApi.send(userMsg, undefined, "pdf_qa");
      setMessages(prev => [...prev, { role: "assistant", content: res.response }]);
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
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={20} className="text-brand" /> AI PDF Analyst
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Upload documents and talk to Tulasi AI about them.</p>
        </div>

        <div style={{ border: "2px dashed var(--border)", borderRadius: 16, padding: 24, textAlign: "center", background: "rgba(255,255,255,0.02)", transition: "all 0.2s" }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); }}
        >
          <Upload size={32} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
          <input type="file" accept=".pdf" onChange={onFileChange} style={{ display: "none" }} id="pdf-upload" />
          <label htmlFor="pdf-upload" style={{ cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--brand-primary)" }}>
            {file ? file.name : "Choose a PDF File"}
          </label>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>or drag & drop here</p>
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
        <div style={{ padding: 24, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={24} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Document Intelligence</h3>
              <div style={{ fontSize: 12, color: "#10B981", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle2 size={12} /> Active & Context-Aware
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
