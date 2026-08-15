"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Star, Loader2, CheckCircle2, Clock, Map, Target, ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function CertificationsPage() {
  const [activeCerts, setActiveCerts] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: certs } = await apiFetch<any[]>("/api/v1/certifications/");
      if (certs) setActiveCerts(certs);

      if (!certs || certs.length === 0) {
        const { data: recs } = await apiFetch<any[]>("/api/v1/certifications/recommend");
        if (recs) setRecommendations(recs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCert = async (cert: any) => {
    try {
      setStarting(true);
      await apiFetch("/api/v1/certifications/start", {
        method: "POST",
        body: JSON.stringify({
          title: cert.title,
          provider: cert.provider,
          difficulty: cert.difficulty,
          external_url: cert.external_url
        })
      });
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 40 }}>
        <Loader2 size={32} style={{ color: "#4F46E5", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: 1000, margin: "0 auto", width: "100%", color: "white" }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <Target size={28} color="#4F46E5" /> Certification Engine
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15 }}>
          Real-world credentials to bridge your skill gap and increase your market value.
        </p>
      </header>

      {activeCerts.length > 0 ? (
        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Your Active Tracks</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {activeCerts.map((cert, idx) => {
              const studyPath = cert.study_path_json ? JSON.parse(cert.study_path_json) : null;
              
              return (
                <div key={idx} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 24,
                  padding: 32
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
                    <div>
                      <div style={{ display: "inline-block", padding: "4px 12px", background: "rgba(79, 70, 229, 0.1)", color: "#818cf8", borderRadius: 12, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                        {cert.provider} • {cert.difficulty}
                      </div>
                      <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{cert.title}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={16} /> {cert.estimated_time}</span>
                        {cert.external_url && (
                          <a href={cert.external_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, color: "#818cf8", textDecoration: "none" }}>
                            <ExternalLink size={16} /> Official Info
                          </a>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10b981", fontSize: 14, fontWeight: 600, background: "rgba(16, 185, 129, 0.1)", padding: "8px 16px", borderRadius: 16 }}>
                      <CheckCircle2 size={18} /> In Progress
                    </div>
                  </div>

                  {studyPath && studyPath.weeks && (
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <Map size={18} color="rgba(255,255,255,0.6)" /> Generated Study Plan
                      </h4>
                      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                        {studyPath.weeks.map((w: any, wIdx: number) => (
                          <div key={wIdx} style={{
                            background: "rgba(0,0,0,0.2)",
                            border: "1px solid rgba(255,255,255,0.03)",
                            borderRadius: 16,
                            padding: 20
                          }}>
                            <div style={{ fontSize: 13, color: "#818cf8", fontWeight: 600, marginBottom: 4 }}>Week {w.week}</div>
                            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{w.focus}</div>
                            <ul style={{ margin: 0, padding: 0, paddingLeft: 16, color: "rgba(255,255,255,0.7)", fontSize: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                              {w.tasks.map((t: string, tIdx: number) => (
                                <li key={tIdx}>{t}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>AI Recommended Certifications</h2>
          {starting && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "16px", background: "rgba(79, 70, 229, 0.1)", color: "#818cf8", borderRadius: 12 }}>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Generating AI study plan and committing...
            </div>
          )}
          <div style={{ display: "grid", gap: 20 }}>
            {recommendations.map((cert, idx) => (
              <div key={idx} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 20,
                padding: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 8 }}>{cert.provider}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, background: "rgba(79, 70, 229, 0.1)", color: "#818cf8", padding: "4px 10px", borderRadius: 8 }}>{cert.difficulty}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 8 }}>{cert.estimated_time}</span>
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{cert.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: 0, maxWidth: 600 }}>{cert.reason}</p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {cert.external_url && (
                    <a
                      href={cert.external_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12, color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600, cursor: "pointer"
                      }}
                    >
                      View Official
                    </a>
                  )}
                  <button
                    onClick={() => handleStartCert(cert)}
                    disabled={starting}
                    style={{
                      padding: "10px 20px", background: "#4F46E5", border: "none",
                      borderRadius: 12, color: "white", fontSize: 14, fontWeight: 600, cursor: starting ? "not-allowed" : "pointer"
                    }}
                  >
                    Start Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
