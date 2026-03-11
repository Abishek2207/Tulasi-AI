"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface Milestone {
  id: string; title: string; desc: string; icon: string; category: string;
  current_pct: number; can_generate: boolean; already_earned: boolean;
}

interface Certificate {
  id: number; title: string; issuer: string; type: string; issued_at: string;
}

export default function CertificatesPage() {
  const { data: session } = useSession();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/auth/token`, { credentials: "include" });
      const data = await res.json();
      return data.token;
    } catch { return null; }
  };

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) { setLoading(false); return; }
      const res = await fetch(`${BACKEND}/api/certificates/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.certificates || []);
        setMilestones(data.milestones || []);
      }
    } catch (e) {
      setError("Could not load certificates. Please make sure you're logged in.");
    } finally { setLoading(false); }
  };

  const generateCertificate = async (milestoneId: string) => {
    setGenerating(milestoneId); setError(""); setSuccess("");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND}/api/certificates/generate/${milestoneId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      setSuccess(data.message || "🎉 Certificate generated!");
      fetchCertificates();
    } catch (e: any) {
      setError(e.message || "Failed to generate certificate.");
    } finally { setGenerating(null); }
  };

  useEffect(() => { fetchCertificates(); }, []);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const CATEGORY_COLOR: Record<string, string> = {
    coding: "#4ECDC4", interview: "#FFD93D", roadmap: "#43E97B", videos: "#6C63FF",
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "Outfit", marginBottom: 10 }}>
          🎓 Certificates
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 600 }}>
          Certificates are earned — not handed out. Complete 100% of a program to unlock yours.
        </p>
      </div>

      {error && (
        <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 12, padding: "14px 18px", color: "#FF6B6B", marginBottom: 24, fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "rgba(67,233,123,0.1)", border: "1px solid rgba(67,233,123,0.3)", borderRadius: 12, padding: "14px 18px", color: "#43E97B", marginBottom: 24, fontSize: 14 }}>
          ✅ {success}
        </motion.div>
      )}

      {/* Earned Certificates */}
      {!loading && certificates.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>🏆 Your Earned Certificates ({certificates.length})</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {certificates.map((cert, i) => (
              <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{
                  background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,140,0,0.05))",
                  border: "1px solid rgba(255,215,0,0.3)", borderRadius: 18, padding: 24,
                  position: "relative", overflow: "hidden",
                }}>
                <div style={{ position: "absolute", top: -20, right: -20, fontSize: 80, opacity: 0.06 }}>🎓</div>

                <div style={{ fontSize: 32, marginBottom: 12 }}>🏅</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 6 }}>{cert.title}</div>
                <div style={{ fontSize: 13, color: "#FFD700", fontWeight: 600, marginBottom: 12 }}>{cert.issuer}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Issued {formatDate(cert.issued_at)}</span>
                  <span style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", padding: "2px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>✓ Verified</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🎯 Progress Milestones</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24 }}>
          Reach 100% to unlock a certificate. Certificates are <strong>strictly progress-gated</strong> — no shortcuts.
        </p>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {[1, 2, 3, 4].map(k => (
              <div key={k} style={{ height: 180, background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {milestones.map((m, i) => {
              const color = CATEGORY_COLOR[m.category] || "#6C63FF";
              const locked = !m.can_generate;
              const earned = m.already_earned;
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="dash-card"
                  style={{
                    padding: 24,
                    background: earned ? "rgba(255,215,0,0.05)" : locked ? "rgba(255,255,255,0.02)" : "rgba(78,205,196,0.06)",
                    border: earned ? "1px solid rgba(255,215,0,0.3)" : locked ? "1px solid rgba(255,255,255,0.06)" : `1px solid ${color}50`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 32 }}>{earned ? "🏅" : locked ? "🔒" : "🔓"} {m.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
                      background: earned ? "rgba(255,215,0,0.15)" : locked ? "rgba(255,255,255,0.05)" : `${color}20`,
                      color: earned ? "#FFD700" : locked ? "var(--text-muted)" : color }}>
                      {earned ? "✓ EARNED" : `${m.current_pct}%`}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: earned ? "#FFD700" : "white", marginBottom: 6 }}>{m.title}</h3>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>{m.desc}</p>

                  {/* Progress bar */}
                  <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 6, marginBottom: 16, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${m.current_pct}%` }} transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                      style={{ height: "100%", background: earned ? "#FFD700" : locked ? "rgba(255,255,255,0.2)" : `linear-gradient(90deg, ${color}, ${color}aa)`, borderRadius: 6 }}
                    />
                  </div>

                  {!earned && (
                    <motion.button
                      whileHover={m.can_generate ? { scale: 1.03 } : {}}
                      whileTap={m.can_generate ? { scale: 0.97 } : {}}
                      onClick={() => m.can_generate && generateCertificate(m.id)}
                      disabled={!m.can_generate || generating === m.id}
                      style={{
                        width: "100%", padding: "10px", borderRadius: 10, border: "none", cursor: m.can_generate ? "pointer" : "default",
                        background: m.can_generate ? `linear-gradient(135deg, ${color}, #6C63FF)` : "rgba(255,255,255,0.05)",
                        color: m.can_generate ? "white" : "var(--text-muted)", fontWeight: 700, fontSize: 14,
                        opacity: generating === m.id ? 0.7 : 1,
                      }}
                    >
                      {generating === m.id ? "Generating..." : m.can_generate ? "🎓 Generate Certificate" : `🔒 Need ${100 - m.current_pct}% more`}
                    </motion.button>
                  )}
                  {earned && (
                    <button style={{ width: "100%", padding: "10px", borderRadius: 10, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", fontWeight: 700, cursor: "pointer" }}>
                      📥 Download PDF
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
