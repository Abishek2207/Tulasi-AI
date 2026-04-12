"use client";

import React, { useEffect, useState } from "react";
import { ExternalLink, Star, Award, ShieldCheck, Cpu, Cloud, Database, LineChart, Code } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";

interface CertificationItem {
  id: string;
  provider: string;
  name: string;
  role: string[];
  level: string;
  cost: string;
  url: string;
}

export function CertificationDirectory() {
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"ALL" | "RECOMMENDED" | "FREE">("ALL");

  useEffect(() => {
    const fetchCerts = async () => {
      setLoading(true);
      try {
        let endpoint = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/certifications`;
        if (filterMode === "FREE") endpoint += "?cost=Free";
        
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          // Simulating recommendation filtering if requested but endpoint handles it partly
          setCertifications(data.certifications);
        }
      } catch (err) {
        console.error("Failed to load certifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, [filterMode]);

  const getProviderIcon = (provider: string) => {
    const lower = provider.toLowerCase();
    if (lower.includes("google")) return <Cloud size={20} color="#4285F4" />;
    if (lower.includes("aws")) return <Database size={20} color="#FF9900" />;
    if (lower.includes("microsoft")) return <Cpu size={20} color="#00A4EF" />;
    if (lower.includes("meta")) return <Code size={20} color="#0668E1" />;
    if (lower.includes("ibm")) return <LineChart size={20} color="#052FAD" />;
    return <ShieldCheck size={20} color="#10B981" />;
  };

  return (
    <div style={{ marginTop: "48px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px" }}>
            Industry Standard <span style={{ color: "var(--brand-primary)" }}>Certifications</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Highly recognized global credentials to bypass ATS filters and boost your career capital.
          </p>
        </div>
        
        <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "4px" }}>
          {["ALL", "FREE"].map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode as any)}
              style={{
                padding: "8px 16px",
                background: filterMode === mode ? "rgba(139, 92, 246, 0.2)" : "transparent",
                color: filterMode === mode ? "white" : "var(--text-muted)",
                border: filterMode === mode ? "1px solid rgba(139, 92, 246, 0.4)" : "1px solid transparent",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.2s",
                letterSpacing: "1px"
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {[1, 2, 3].map(k => (
            <Skeleton key={k} height={160} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {certifications.map((cert, i) => (
            <motion.a
              key={cert.id}
              href={cert.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: "block",
                textDecoration: "none",
                background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "20px",
                padding: "20px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)";
                e.currentTarget.style.background = "linear-gradient(180deg, rgba(139,92,246,0.05) 0%, rgba(255,255,255,0.01) 100%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.background = "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ 
                  width: "40px", height: "40px", borderRadius: "10px", 
                  background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" 
                }}>
                  {getProviderIcon(cert.provider)}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, padding: "4px 8px", borderRadius: "6px", background: cert.cost === "Free" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.1)", color: cert.cost === "Free" ? "#10B981" : "#F59E0B" }}>
                    {cert.cost.toUpperCase()}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", padding: "4px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Award size={12} /> {cert.level}
                  </span>
                </div>
              </div>
              
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 700, marginBottom: "4px" }}>{cert.provider}</div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "white", marginBottom: "16px", lineHeight: 1.4 }}>{cert.name}</h3>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {cert.role.slice(0, 2).map((r, ri) => (
                    <span key={ri} style={{ fontSize: "10px", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                      {r}
                    </span>
                  ))}
                  {cert.role.length > 2 && <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>+{cert.role.length - 2}</span>}
                </div>
                <ExternalLink size={16} color="var(--brand-primary)" />
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}
