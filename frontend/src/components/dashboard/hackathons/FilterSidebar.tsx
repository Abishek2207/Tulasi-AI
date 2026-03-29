"use client";

import { Search, Filter, Layers, MapPin, Trophy, Star } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  q: string;
  setQ: (v: string) => void;
  domain: string;
  setDomain: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  mode: string;
  setMode: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  activeTab: string;
  setActiveTab: (v: string) => void;
}

const DOMAINS = ["All", "AI", "Web Dev", "Mobile", "Web3", "Blockchain", "Cybersecurity", "IoT", "Cloud", "FinTech", "EdTech", "HealthTech", "AgriTech", "SaaS", "AR/VR"];
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];
const MODES = ["All", "Online", "Offline", "Hybrid"];
const SORT_OPTIONS = ["Newest", "Deadline", "Prize"];

export default function FilterSidebar({
  q, setQ, domain, setDomain, difficulty, setDifficulty, mode, setMode, sort, setSort, activeTab, setActiveTab
}: Props) {
  return (
    <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 32 }}>
      
      {/* Platform Tabs */}
      <div style={{ 
        display: "flex", background: "rgba(255,255,255,0.03)", 
        padding: 5, borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)" 
      }}>
        {["Discovery", "Saved", "Applied"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: "10px", borderRadius: 12, border: "none",
              fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
              background: activeTab === tab ? "rgba(255,255,255,0.06)" : "transparent",
              color: activeTab === tab ? "white" : "var(--text-muted)",
              boxShadow: activeTab === tab ? "0 4px 12px rgba(0,0,0,0.2)" : "none"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 900, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: 1.5 }}>Search</label>
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events, companies..."
            style={{
              width: "100%", background: "rgba(255,255,255,0.03)", 
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, 
              padding: "12px 14px 12px 42px", color: "white", fontSize: 14,
              outline: "none", boxSizing: "border-box"
            }}
          />
        </div>
      </div>

      {/* Domain */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Layers size={14} className="text-brand" />
          <label style={{ fontSize: 11, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: 1.5 }}>Domain</label>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {DOMAINS.map(d => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              style={{
                padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s",
                background: domain === d ? "var(--brand-primary)" : "rgba(255,255,255,0.03)",
                color: domain === d ? "var(--bg-primary)" : "var(--text-secondary)",
                border: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Mode & Difficulty */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={14} className="text-brand" />
            <label style={{ fontSize: 11, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: 1.5 }}>Mode</label>
          </div>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{
              width: "100%", background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
              padding: "12px", color: "white", fontSize: 13, fontWeight: 700, outline: "none"
            }}
          >
            {MODES.map(m => <option key={m} value={m} style={{ background: "#0c0e14" }}>{m}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Star size={14} className="text-brand" />
            <label style={{ fontSize: 11, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: 1.5 }}>Level</label>
          </div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{
              width: "100%", background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
              padding: "12px", color: "white", fontSize: 13, fontWeight: 700, outline: "none"
            }}
          >
            {DIFFICULTIES.map(d => <option key={d} value={d} style={{ background: "#0c0e14" }}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Sort By */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={14} className="text-brand" />
          <label style={{ fontSize: 11, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: 1.5 }}>Sort By</label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {SORT_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              style={{
                padding: "10px", borderRadius: 12, fontSize: 12, fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s",
                background: sort === s ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
                color: sort === s ? "white" : "var(--text-muted)",
                border: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
