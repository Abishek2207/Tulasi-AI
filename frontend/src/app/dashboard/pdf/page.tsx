"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { pdfApi } from "@/lib/api";

interface ChatMsg {
  role: "user" | "ai";
  content: string;
}

export default function PDFQaPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const token = "";
      if (!token) {
        setMessages([{ role: "ai", content: "Auth Error: Please log in to upload files." }]);
        setIsUploading(false);
        return;
      }
      const data = await pdfApi.upload(uploadedFile, token);
      setSessionId(data.session_id);
      setMessages([{ role: "ai", content: `Successfully parsed ${data.pages} pages of ${data.filename}. Ask me anything about it!` }]);
    } catch (err: any) {
      setMessages([{ role: "ai", content: `Error: ${err.message || "Could not upload file"}` }]);
    }
    setIsUploading(false);
  };

  const askQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !sessionId) return;

    const userQ = inputVal;
    setInputVal("");
    setMessages(prev => [...prev, { role: "user", content: userQ }]);
    setIsAsking(true);

    try {
      const token = "";
      if (!token) {
        setMessages(prev => [...prev, { role: "ai", content: "Auth Error: Please log in." }]);
        setIsAsking(false);
        return;
      }
      const data = await pdfApi.ask(userQ, sessionId, token);
      setMessages(prev => [...prev, { role: "ai", content: data.answer }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "ai", content: `Error: ${err.message || "An error occurred while fetching the answer."}` }]);
    }
    setIsAsking(false);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px" }}>
          📄 PDF <span className="gradient-text" style={{ background: "linear-gradient(135deg,var(--brand-primary),var(--brand-secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Q&A AI</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 5 }}>Upload any textbook, research paper, or assignment and instantly ask questions.</p>
      </div>

      <div style={{ display: "flex", gap: 24, flex: 1, minHeight: 0 }}>
        
        {/* Left Side: Upload Zone */}
        <div style={{ width: 300, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="dash-card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderStyle: "dashed", borderColor: "var(--brand-primary)", background: "rgba(108,99,255,0.05)" }}>
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleFileUpload} 
              id="pdf-upload" 
              style={{ display: "none" }} 
            />
            <label htmlFor="pdf-upload" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: "rgba(108,99,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16, border: "1px solid rgba(108,99,255,0.2)" }}>
                📁
              </div>
              <span className="btn btn-primary" style={{ padding: "8px 16px", borderRadius: 20 }}>Select PDF</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>Max size: 50MB</span>
            </label>
            
            {isUploading && (
              <div style={{ marginTop: 24, textAlign: "center", color: "var(--brand-primary)", fontSize: 14 }}>
                <div className="spinner" style={{ margin: "0 auto 10px", width: 24, height: 24, border: "2px solid rgba(108,99,255,0.3)", borderTopColor: "var(--brand-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                Vectorizing PDF...
              </div>
            )}
            {file && !isUploading && (
              <div style={{ marginTop: 24, textAlign: "center" }}>
                <span className="badge badge-green" style={{ display: "block", marginBottom: 8 }}>Ready</span>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", wordBreak: "break-all" }}>{file.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat Bot */}
        <div className="dash-card" style={{ flex: 1, padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          
          <div style={{ padding: "24px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.length === 0 && !isUploading ? (
              <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "white" }}>Awaiting Document...</h3>
                <p style={{ fontSize: 13 }}>Upload a PDF to start analyzing it with RAG technology.</p>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      background: m.role === "user" ? "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))" : "var(--surface)",
                      color: "white",
                      padding: "16px 20px",
                      borderRadius: 16,
                      borderBottomRightRadius: m.role === "user" ? 4 : 16,
                      borderTopLeftRadius: m.role === "user" ? 16 : 4,
                      maxWidth: "80%",
                      fontSize: 14,
                      lineHeight: 1.6,
                      border: m.role === "user" ? "none" : "1px solid var(--border)"
                    }}
                  >
                    {m.content}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {isAsking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: "flex-start", padding: "12px 16px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: "var(--text-muted)", animation: "bounce 1s infinite" }} />
                <div style={{ width: 8, height: 8, borderRadius: 4, background: "var(--text-muted)", animation: "bounce 1s infinite 0.2s" }} />
                <div style={{ width: 8, height: 8, borderRadius: 4, background: "var(--text-muted)", animation: "bounce 1s infinite 0.4s" }} />
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={askQuestion} style={{ padding: 20, borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", display: "flex", gap: 12 }}>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              disabled={!sessionId || isAsking}
              placeholder={sessionId ? "Ask a question about the document..." : "Upload a PDF first"}
              style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "0 20px", color: "white", outline: "none", fontSize: 14 }}
              onFocus={e => e.target.style.borderColor = "var(--brand-primary)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            <button 
              type="submit" 
              disabled={!inputVal.trim() || !sessionId || isAsking}
              className="btn btn-primary"
              style={{ padding: "12px 24px", borderRadius: 12, opacity: (!inputVal.trim() || !sessionId || isAsking) ? 0.5 : 1 }}
            >
              Analyze
            </button>
          </form>

        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  );
}
