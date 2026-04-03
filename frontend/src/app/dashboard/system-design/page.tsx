"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { Server, Database, Activity, ShieldCheck, Cpu, ArrowRight } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";

export default function SystemDesignPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("Concepts");
  const [concepts, setConcepts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [practice, setPractice] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:10000";
      
      try {
        const [cRes, coRes, pRes] = await Promise.all([
          fetch(`${baseUrl}/api/system-design/concepts`, { headers }).then(r => r.json()),
          fetch(`${baseUrl}/api/system-design/companies`, { headers }).then(r => r.json()),
          fetch(`${baseUrl}/api/system-design/practice`, { headers }).then(r => r.json()),
        ]);
        setConcepts(cRes.concepts || []);
        setCompanies(coRes.companies || []);
        setPractice(pRes.practice || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const TABS = ["Concepts", "Company Prep", "Practice"];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", background: "rgba(139,92,246,0.1)", borderRadius: 30, color: "#8B5CF6", marginBottom: 16 }}>
          <Server size={18} />
          <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5 }}>Architect Orbit</span>
        </div>
        <h1 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 16 }}>
          System Design Mastery
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
          Learn to build highly scalable, resilient, and fault-tolerant distributed systems capable of handling millions of users.
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, justifyContent: "center", padding: 6, background: "rgba(255,255,255,0.03)", borderRadius: 20, width: "fit-content", margin: "0 auto 40px auto" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 24px", borderRadius: 14, border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 800, transition: "0.2s all",
              background: activeTab === tab ? "rgba(255,255,255,0.1)" : "transparent",
              color: activeTab === tab ? "white" : "var(--text-muted)",
              boxShadow: activeTab === tab ? "0 4px 12px rgba(0,0,0,0.2)" : "none"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>Syncing Architect Data...</div>
      ) : (
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === "Concepts" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {concepts.map((concept) => (
                <div key={concept.id} className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(6,182,212,0.1)", color: "#06B6D4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Activity size={20} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", padding: "4px 8px", background: concept.difficulty === "Advanced" ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.05)", color: concept.difficulty === "Advanced" ? "#F43F5E" : "var(--text-muted)", borderRadius: 8 }}>
                      {concept.difficulty}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>{concept.title}</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{concept.desc}</p>
                  </div>
                  <button className="btn-ghost" style={{ marginTop: "auto", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700, width: "100%" }}>
                    Dive Deep &rarr;
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Company Prep" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {companies.map((co) => (
                <div key={co.id} className="glass-card" style={{ padding: 24, borderLeft: "4px solid #8B5CF6" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{co.company}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16 }}>{co.question}</h3>
                  <button className="btn-primary" style={{ padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                    View Architecture
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Practice" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {practice.map((p) => (
                <div key={p.id} className="glass-card" style={{ padding: 32 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>{p.title}</h3>
                      <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 800 }}>{p.description}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, padding: "4px 12px", background: "rgba(16,185,129,0.15)", color: "#10B981", borderRadius: 20 }}>
                      {p.difficulty}
                    </span>
                  </div>
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>Key Concepts to Cover:</div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {p.solution_hints.map((hint: string, i: number) => (
                        <div key={i} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                          {hint}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: 30, display: "flex", gap: 16 }}>
                    <button className="btn-primary" style={{ padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 800 }}>Start Whiteboarding</button>
                    <button className="btn-ghost" style={{ padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 800 }}>View Exemplar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
