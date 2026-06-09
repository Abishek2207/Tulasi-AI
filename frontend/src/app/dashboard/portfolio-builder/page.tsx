"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutTemplate, Github, Globe, CheckCircle, Sparkles, ExternalLink, User, Code2, Briefcase } from "lucide-react";

const TEMPLATES = [
  { id: "minimal", label: "Minimal Pro", desc: "Clean, typography-focused. Great for designers.", accent: "#8B5CF6" },
  { id: "dark", label: "Dark Developer", desc: "Terminal-inspired, code-centric. Ideal for engineers.", accent: "#10B981" },
  { id: "creative", label: "Creative Bold", desc: "Vibrant, visual-first layout. Perfect for UI/UX roles.", accent: "#F59E0B" },
  { id: "corporate", label: "Corporate Clean", desc: "Professional blue-tone. Best for PM or business roles.", accent: "#3B82F6" },
];

const SECTIONS = ["Hero & Summary", "Skills Matrix", "Projects Showcase", "Work Experience", "Education", "GitHub Stats", "Contact & Links"];

interface PortfolioConfig {
  name: string;
  role: string;
  github: string;
  bio: string;
  skills: string[];
}

export default function PortfolioBuilderPage() {
  const [step, setStep] = useState<"template" | "config" | "preview">("template");
  const [template, setTemplate] = useState("dark");
  const [building, setBuilding] = useState(false);
  const [config, setConfig] = useState<PortfolioConfig>({ name: "", role: "", github: "", bio: "", skills: [] });
  const [skillInput, setSkillInput] = useState("");
  const [sections, setSections] = useState<string[]>(SECTIONS);

  const selectedTemplate = TEMPLATES.find(t => t.id === template)!;

  const build = async () => {
    if (!config.name || !config.role) return;
    setBuilding(true);
    await new Promise(r => setTimeout(r, 2000));
    setBuilding(false);
    setStep("preview");
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!config.skills.includes(skillInput.trim())) setConfig(c => ({ ...c, skills: [...c.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #EC4899, #BE185D)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(236,72,153,0.4)" }}>
          <LayoutTemplate size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>Portfolio Builder</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>AI-generated portfolio sites from your profile and GitHub</p>
        </div>
        {/* Step indicator */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {["template", "config", "preview"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: step === s ? "#EC4899" : i < ["template", "config", "preview"].indexOf(step) ? "rgba(236,72,153,0.3)" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "white" }}>{i + 1}</div>
              {i < 2 && <div style={{ width: 20, height: 1, background: "rgba(255,255,255,0.1)" }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Template Selection */}
      {step === "template" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20 }}>Choose Your Template</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)}
                style={{ padding: "24px", borderRadius: 22, border: `2px solid ${template === t.id ? t.accent : "rgba(255,255,255,0.08)"}`, background: template === t.id ? `${t.accent}10` : "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: `${t.accent}20`, border: `1px solid ${t.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <LayoutTemplate size={18} color={t.accent} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 6 }}>{t.label}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{t.desc}</div>
                {template === t.id && <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, color: t.accent, fontSize: 12, fontWeight: 700 }}><CheckCircle size={14} /> Selected</div>}
              </button>
            ))}
          </div>

          <div style={{ padding: 24, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 14 }}>Sections to Include</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {SECTIONS.map(s => (
                <button key={s} onClick={() => setSections(secs => secs.includes(s) ? secs.filter(x => x !== s) : [...secs, s])}
                  style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${sections.includes(s) ? "#EC4899" : "rgba(255,255,255,0.08)"}`, background: sections.includes(s) ? "rgba(236,72,153,0.1)" : "transparent", color: sections.includes(s) ? "#EC4899" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setStep("config")} style={{ width: "100%", padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #EC4899, #BE185D)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 14px 28px rgba(236,72,153,0.3)" }}>
            Continue to Profile Setup →
          </button>
        </motion.div>
      )}

      {/* Step 2: Profile Config */}
      {step === "config" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 24 }}>Your Profile Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {[
              { key: "name", label: "Full Name", placeholder: "Abishek Kumar" },
              { key: "role", label: "Professional Title", placeholder: "Full Stack Developer · Open to Work" },
              { key: "github", label: "GitHub Username", placeholder: "abishek2207" },
            ].map(field => (
              <div key={field.key} style={{ gridColumn: field.key === "github" ? "span 2" : "span 1" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>{field.label}</label>
                <input value={(config as any)[field.key]} onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))} placeholder={field.placeholder}
                  style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, outline: "none" }} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Short Bio</label>
            <textarea value={config.bio} onChange={e => setConfig(c => ({ ...c, bio: e.target.value }))} placeholder="Passionate developer who loves building products at the intersection of AI and UX..."
              style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, outline: "none", minHeight: 100, resize: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Skills (Press Enter)</label>
            <div style={{ padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, display: "flex", flexWrap: "wrap", gap: 8, minHeight: 54, alignItems: "center" }}>
              {config.skills.map(s => (
                <span key={s} style={{ padding: "4px 10px", background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.25)", color: "#EC4899", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  {s} <span onClick={() => setConfig(c => ({ ...c, skills: c.skills.filter(x => x !== s) }))} style={{ cursor: "pointer", opacity: 0.5 }}>×</span>
                </span>
              ))}
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} placeholder="React, Python, Docker..."
                style={{ flex: 1, minWidth: 140, background: "transparent", border: "none", color: "white", fontSize: 14, outline: "none", padding: "6px" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setStep("template")} style={{ padding: "14px 24px", borderRadius: 14, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
            <button onClick={build} disabled={!config.name || !config.role || building}
              style={{ flex: 1, padding: "16px", borderRadius: 16, background: (!config.name || !config.role) ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #EC4899, #BE185D)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: (!config.name || !config.role) ? "not-allowed" : "pointer", opacity: (!config.name || !config.role) ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {building ? "Building..." : <><Sparkles size={20} /> Build My Portfolio</>}
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ padding: 28, borderRadius: 24, background: `linear-gradient(135deg, ${selectedTemplate.accent}10, rgba(255,255,255,0.01))`, border: `1px solid ${selectedTemplate.accent}30`, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: selectedTemplate.accent, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Portfolio Generated · {selectedTemplate.label}</div>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "white" }}>{config.name}</h2>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{config.role}</div>
              </div>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${selectedTemplate.accent}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={28} color={selectedTemplate.accent} />
              </div>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 20 }}>{config.bio || "Passionate developer building impactful products."}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {config.skills.map(s => <span key={s} style={{ padding: "6px 14px", borderRadius: 10, background: `${selectedTemplate.accent}15`, border: `1px solid ${selectedTemplate.accent}30`, color: selectedTemplate.accent, fontSize: 12, fontWeight: 700 }}>{s}</span>)}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {config.github && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.5)" }}><Github size={14} /> github.com/{config.github}</span>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
            {sections.map((s, i) => (
              <div key={s} style={{ padding: "18px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle size={16} color="#10B981" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button style={{ flex: 1, padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #EC4899, #BE185D)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 12px 24px rgba(236,72,153,0.3)" }}>
              <Globe size={20} /> Publish Portfolio <ExternalLink size={16} />
            </button>
            <button style={{ padding: "16px 24px", borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Github size={18} /> Export to GitHub Pages
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
