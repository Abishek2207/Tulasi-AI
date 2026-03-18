"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { resumeApi } from "@/lib/api";
import Link from "next/link";

export default function ResumeHistoryPage() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (session) fetchHistory();
  }, [session]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = (session?.user as any)?.accessToken;
      if (!token) throw new Error("Unauthorized");
      const data = await resumeApi.getHistory(token);
      setHistory(data);
    } catch (e: any) {
      setError(e.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      {/* Breadcrumbs */}
      <div style={{ marginBottom: 24, fontSize: 13 }}>
        <Link href="/dashboard/resume" style={{ color: "var(--brand-primary)", textDecoration: "none" }}>← Back to Optimizer</Link>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: 8 }}>
          Optimization <span className="gradient-text">History</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Review and restore your previous resume and cover letter generations.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12, background: "rgba(255,255,255,0.03)" }} />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px dashed rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📜</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No history found</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 350, margin: "0 auto" }}>
            As soon as you optimize a resume or generate a cover letter, it will automatically appear here.
          </p>
          <Link href="/dashboard/resume" className="btn-primary" style={{ marginTop: 24, display: "inline-block", textDecoration: "none" }}>
            Start Optimizing
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedItem(item)}
              style={{
                padding: 20,
                background: "var(--bg-card)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 20,
                transition: "all 0.2s"
              }}
              whileHover={{ scale: 1.01, borderColor: "var(--brand-primary)" }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 12, background: item.document_type === "Resume" ? "rgba(67, 233, 123, 0.1)" : "rgba(108, 99, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                {item.document_type === "Resume" ? "📄" : "✉️"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>{item.document_type} Optimization</span>
                  <span style={{ padding: "3px 8px", background: "rgba(255,255,255,0.05)", borderRadius: 6, fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{item.mode}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(item.created_at)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: item.ats_score > 80 ? "#43E97B" : "#FF6B6B" }}>
                  {item.ats_score}%
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, letterSpacing: 0.5, textTransform: "uppercase" }}>Match</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(8px)" }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ width: "100%", maxWidth: 800, background: "#15151a", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800 }}>{selectedItem.document_type} History Detail</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Generated on {formatDate(selectedItem.created_at)}</p>
                </div>
                <button onClick={() => setSelectedItem(null)} style={{ background: "none", border: "none", color: "white", fontSize: 24, cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ padding: 32, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "flex", gap: 20 }}>
                  <div style={{ flex: 1, padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-primary)", marginBottom: 8, textTransform: "uppercase" }}>ATS Score</div>
                    <div style={{ fontSize: 24, fontWeight: 800 }}>{selectedItem.ats_score}%</div>
                  </div>
                  <div style={{ flex: 1, padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-primary)", marginBottom: 8, textTransform: "uppercase" }}>Readability</div>
                    <div style={{ fontSize: 24, fontWeight: 800 }}>{selectedItem.readability_score}%</div>
                  </div>
                </div>

                <div>
                   <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "white" }}>Optimization Result</div>
                   <textarea
                    readOnly
                    value={selectedItem.improved_resume}
                    style={{ width: "100%", height: 300, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 16, color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6, resize: "none" }}
                   />
                </div>
                
                <div style={{ display: "flex", gap: 12 }}>
                   <button className="btn-primary" style={{ flex: 1 }} onClick={() => {
                     navigator.clipboard.writeText(selectedItem.improved_resume);
                     alert("Copied to clipboard!");
                   }}>📋 Copy Result</button>
                   <Link href="/dashboard/resume" style={{ flex: 1, textDecoration: "none" }}>
                      <button className="btn-secondary" style={{ width: "100%" }}>🔄 Start New</button>
                   </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .skeleton {
           animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
           0% { opacity: 0.6; }
           50% { opacity: 1; }
           100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
