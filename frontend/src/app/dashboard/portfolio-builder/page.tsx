"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutTemplate, Sparkles, Wand2, Globe, Monitor, Smartphone, Download, Check, RefreshCcw } from "lucide-react";

const TEMPLATES = [
  { id: "minimal", name: "Minimalist Dev", desc: "Clean, text-heavy, perfect for backend/system engineers.", color: "#10B981" },
  { id: "bento", name: "Bento Grid UI", desc: "Modern bento-box layout. Great for full-stack and designers.", color: "#8B5CF6" },
  { id: "terminal", name: "Retro Terminal", desc: "Hacker theme. Stand out for DevOps and security roles.", color: "#06B6D4" },
];

export default function PortfolioBuilderPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("bento");
  const [generating, setGenerating] = useState(false);
  const [ready, setReady] = useState(false);

  const generate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2500));
    setGenerating(false);
    setReady(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(139,92,246,0.4)" }}>
          <LayoutTemplate size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px", fontFamily: "var(--font-outfit)" }}>Portfolio Builder</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Auto-generate a stunning developer portfolio from your profile</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: ready ? "320px 1fr" : "1fr", gap: 24 }}>
        {/* Config Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16 }}>Select Template</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => { setSelectedTemplate(t.id); setReady(false); }}
                  style={{ padding: "16px", borderRadius: 16, border: `2px solid ${selectedTemplate === t.id ? t.color : "rgba(255,255,255,0.08)"}`, background: selectedTemplate === t.id ? `${t.color}15` : "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: selectedTemplate === t.id ? "white" : "rgba(255,255,255,0.6)", marginBottom: 4 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 16 }}>Data Sync Status</h2>
            {[
              { label: "GitHub Repositories", status: true },
              { label: "Resume Projects", status: true },
              { label: "LinkedIn Experience", status: false },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{item.label}</span>
                {item.status ? <Check size={16} color="#10B981" /> : <RefreshCcw size={14} color="rgba(255,255,255,0.3)" />}
              </div>
            ))}
          </div>

          <button onClick={generate} disabled={generating || ready}
            style={{ width: "100%", padding: "16px", borderRadius: 16, background: ready ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #8B5CF6, #6D28D9)", color: ready ? "rgba(255,255,255,0.3)" : "white", fontWeight: 900, fontSize: 15, border: "none", cursor: ready ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: !ready ? "0 12px 24px rgba(139,92,246,0.3)" : "none" }}>
            {generating ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Sparkles size={18} /></motion.div> Generating Site...</>
            ) : ready ? (<><Check size={18} /> Portfolio Generated</>) : (<><Wand2 size={18} /> Generate Portfolio</>)}
          </button>
        </div>

        {/* Preview Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {ready ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0F172A", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
              {/* Browser Header */}
              <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#EF4444" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#F59E0B" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10B981" }} />
                </div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, background: "rgba(255,255,255,0.05)", padding: "4px 0", borderRadius: 8 }}>
                  localhost:3000
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Monitor size={14} color="rgba(255,255,255,0.5)" />
                  <Smartphone size={14} color="rgba(255,255,255,0.3)" />
                </div>
              </div>
              
              {/* Fake Content Area */}
              <div style={{ flex: 1, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
                <Globe size={48} color="rgba(139,92,246,0.3)" style={{ marginBottom: 20 }} />
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "white", marginBottom: 8 }}>Preview Available Shortly</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", maxWidth: 400 }}>Your portfolio has been generated based on your profile data using the {TEMPLATES.find(t=>t.id===selectedTemplate)?.name} template.</p>
              </div>

              <div style={{ padding: 20, background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button style={{ padding: "10px 20px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <Download size={16} /> Download Code
                </button>
                <button style={{ padding: "10px 20px", borderRadius: 12, background: "#10B981", color: "white", fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  Deploy to Vercel
                </button>
              </div>
            </motion.div>
          ) : (
            <div style={{ flex: 1, borderRadius: 24, border: "2px dashed rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 500, padding: 40, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <LayoutTemplate size={32} color="#8B5CF6" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Select a template to begin</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 300 }}>We'll pull your projects, skills, and resume data to automatically construct a professional portfolio.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
