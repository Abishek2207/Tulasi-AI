"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, UploadCloud, ArrowLeft, Loader2, BookOpen, Brain, List } from "lucide-react";
import Link from "next/link";
import { PDFChatWidget } from "@/components/dashboard/PDFChatWidget";

export default function DocumentsDashboard() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/rag/upload", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setActiveDoc({ id: data.document_id, name: file.name });
        // Start polling for analysis
        pollAnalysis(data.document_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const pollAnalysis = async (docId: number) => {
    setAnalyzing(true);
    let attempts = 0;
    
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 15) {
        clearInterval(interval);
        setAnalyzing(false);
        return;
      }
      
      try {
        const res = await fetch(`/api/rag/analyze/${docId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.analysis && Object.keys(data.analysis).length > 0) {
            setAnalysis(data.analysis);
            setAnalyzing(false);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);
  };

  const container: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item: any = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } };

  return (
    <motion.div
      initial="hidden" animate="show" variants={container}
      style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 80, paddingTop: 40 }}
    >
      <motion.div variants={item} style={{ marginBottom: 40 }}>
        <Link href="/dashboard" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "rgba(255,255,255,0.5)", fontSize: 14, textDecoration: "none", marginBottom: 24,
          transition: "color 0.2s"
        }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 20,
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)",
          color: "#34D399", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em",
          textTransform: "uppercase", marginBottom: 18,
        }}>
          <FileText size={13} />
          Phase 5 Intelligence
        </div>

        <h1 style={{
          fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900, color: "white",
          letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14,
          fontFamily: "var(--font-outfit)",
        }}>
          PDF Learning & RAG Engine.
        </h1>

        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", maxWidth: 500, lineHeight: 1.6 }}>
          Upload study materials or documentation. The AI will chunk, embed, and analyze the content to build a custom study plan and conversational memory.
        </p>
      </motion.div>

      {!activeDoc ? (
        <motion.div variants={item}>
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{
            border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 24, padding: "80px 20px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            cursor: "pointer", background: "rgba(255,255,255,0.02)", transition: "all 0.2s"
          }}>
            <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} style={{ display: "none" }} />
            
            {uploading ? (
              <>
                <Loader2 size={40} className="animate-spin" color="#6366f1" style={{ marginBottom: 16 }} />
                <div style={{ fontSize: 18, fontWeight: 600, color: "white", marginBottom: 8 }}>Uploading & Indexing...</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Chunking and generating embeddings...</div>
              </>
            ) : (
              <>
                <div style={{
                  width: 64, height: 64, borderRadius: 20, background: "rgba(99,102,241,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#818CF8", marginBottom: 20
                }}>
                  <UploadCloud size={32} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: "white", marginBottom: 8 }}>Upload PDF Document</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Click to browse or drag and drop</div>
              </>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Analysis Side */}
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 24, padding: 32
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 8 }}>Study Plan</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
              "What should I study from {activeDoc.name}?"
            </p>

            {analyzing ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#818CF8" }}>
                <Loader2 size={16} className="animate-spin" /> Analyzing document context...
              </div>
            ) : analysis ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "white", fontWeight: 600, marginBottom: 12 }}>
                    <BookOpen size={16} color="#6366f1" /> Important Topics
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {analysis.important_topics?.map((t: string, i: number) => (
                      <span key={i} style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8", padding: "4px 12px", borderRadius: 100, fontSize: 13 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "white", fontWeight: 600, marginBottom: 12 }}>
                    <List size={16} color="#10B981" /> Learning Order
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {analysis.learning_order?.map((t: string, i: number) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 12, background: "rgba(16,185,129,0.1)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                          {i+1}
                        </div>
                        <div style={{ paddingTop: 2 }}>{t}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{ padding: 16, background: "rgba(0,0,0,0.2)", borderRadius: 12, borderLeft: "2px solid #F59E0B" }}>
                  <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Summary</div>
                  <div style={{ fontSize: 14, color: "white", lineHeight: 1.5 }}>{analysis.summary}</div>
                </div>
              </div>
            ) : (
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Analysis failed or not available.</div>
            )}
          </div>

          {/* Chat Side */}
          <div>
            <PDFChatWidget documentId={activeDoc.id} />
          </div>
        </motion.div>
      )}
      
    </motion.div>
  );
}
