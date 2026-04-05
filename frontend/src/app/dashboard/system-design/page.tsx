"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import {
  Server, Database, Activity, ShieldCheck, Cpu, Sparkles,
  BookOpen, Building2, Target, ChevronRight, Zap, Lock
} from "lucide-react";
import { GuidedArchitectView } from "@/components/system-design/GuidedArchitectView";

// ─── Fallback Static Data (always shown if backend is slow) ─────────────────
const FALLBACK_CONCEPTS = [
  { id: "c1", title: "Load Balancing", difficulty: "Beginner", desc: "L4 vs L7, Round Robin, Least Connections, IP Hash strategies.", icon: "⚖️", color: "#06B6D4" },
  { id: "c2", title: "Caching Strategy", difficulty: "Beginner", desc: "Write-through, Write-back, LRU Eviction, Redis Cluster patterns.", icon: "⚡", color: "#F59E0B" },
  { id: "c3", title: "Database Sharding", difficulty: "Intermediate", desc: "Horizontal partitioning, Consistent Hashing, Shard Rebalancing.", icon: "🗄️", color: "#8B5CF6" },
  { id: "c4", title: "Event Streaming", difficulty: "Intermediate", desc: "Kafka, RabbitMQ, Publisher-Subscriber, At-least-once delivery.", icon: "📡", color: "#10B981" },
  { id: "c5", title: "CAP & PACELC Theorem", difficulty: "Advanced", desc: "Consistency, Availability, Partition Tolerance, Latency tradeoffs.", icon: "🔺", color: "#F43F5E" },
  { id: "c6", title: "Microservices Pattern", difficulty: "Advanced", desc: "gRPC vs REST, Saga Pattern, Circuit Breaker, Bulkhead.", icon: "🧩", color: "#EC4899" },
  { id: "c7", title: "Distributed KV Stores", difficulty: "Elite", desc: "Distributed Locking (Dsync), Etcd, Paxos/Raft consensus.", icon: "🔑", color: "#EF4444" },
  { id: "c8", title: "API Gateway Design", difficulty: "Intermediate", desc: "Rate limiting, authentication, request routing, response caching.", icon: "🚪", color: "#0EA5E9" },
  { id: "c9", title: "Message Queues", difficulty: "Beginner", desc: "SQS, RabbitMQ, fanout vs point-to-point, dead letter queues.", icon: "📬", color: "#84CC16" },
  { id: "c10", title: "CDN & Edge Computing", difficulty: "Advanced", desc: "Cache invalidation, origin shielding, geo-routing, edge functions.", icon: "🌐", color: "#A78BFA" },
  { id: "c11", title: "Service Mesh (Istio)", difficulty: "Elite", desc: "Sidecar proxies, mTLS, traffic management, observability.", icon: "🕸️", color: "#FB923C" },
  { id: "c12", title: "Database Replication", difficulty: "Intermediate", desc: "Leader-follower, multi-master, semi-sync, binlog streaming.", icon: "🔁", color: "#34D399" },
];

const FALLBACK_COMPANIES = [
  { id: "g1", company: "Google", logo: "🔍", question: "Design YouTube — Global scale, 500 hours of video uploaded per minute", difficulty: "Hard", tags: ["CDN", "Encoding", "Sharding"] },
  { id: "g2", company: "Google", logo: "🔍", question: "Design Google Drive — Differential sync, chunk-based sharding, version control", difficulty: "Hard", tags: ["Sync", "Chunking", "Conflicts"] },
  { id: "g3", company: "Google", logo: "🔍", question: "Design Google Maps — Real-time routing, geo-spatial indexing at planet scale", difficulty: "Elite", tags: ["Geo", "Graph", "Caching"] },
  { id: "a1", company: "Amazon", logo: "📦", question: "Design Amazon Inventory — Flash sales, ACID vs BASE, DynamoDB patterns", difficulty: "Hard", tags: ["ACID", "Flash Sale", "DynamoDB"] },
  { id: "a2", company: "Amazon", logo: "📦", question: "Design Amazon Prime Video — Adaptive bitrate streaming, DRM, offline downloads", difficulty: "Hard", tags: ["HLS", "DRM", "Encoding"] },
  { id: "m1", company: "Microsoft", logo: "🪟", question: "Design Teams Presence — Real-time status, status sharding, push vs pull", difficulty: "Medium", tags: ["WebSocket", "Sharding", "Push"] },
  { id: "m2", company: "Microsoft", logo: "🪟", question: "Design Azure Blob Storage — Petabyte-scale object storage with 99.999% availability", difficulty: "Elite", tags: ["Erasure Coding", "Replication", "Metadata"] },
  { id: "n1", company: "Netflix", logo: "🎬", question: "Design Netflix Playback Engine — Micro-batching, adaptive encoding, CDN strategy", difficulty: "Elite", tags: ["ABR", "CDN", "Encoding"] },
  { id: "u1", company: "Uber", logo: "🚗", question: "Design Uber Rideshare — Geo-spatial indexing, Quad-trees, real-time matching", difficulty: "Hard", tags: ["Geo", "QuadTree", "Matching"] },
  { id: "u2", company: "Uber", logo: "🚗", question: "Design Uber Eats Surge Pricing — Real-time demand scoring, ML inference at edge", difficulty: "Elite", tags: ["ML", "Real-time", "Pricing"] },
  { id: "f1", company: "Meta", logo: "👤", question: "Design Facebook News Feed — Ranking, fan-out on write vs read, graph traversal", difficulty: "Elite", tags: ["Feed", "Graph", "Ranking"] },
  { id: "t1", company: "Twitter/X", logo: "🐦", question: "Design Twitter Timeline — Celebrity problem, hybrid fanout, cache warming", difficulty: "Hard", tags: ["Timeline", "Fanout", "Celebrity"] },
  { id: "ln1", company: "LinkedIn", logo: "💼", question: "Design LinkedIn People You May Know — Graph algorithms at 900M+ node scale", difficulty: "Elite", tags: ["Graph", "Recommendations", "Scale"] },
  { id: "sl1", company: "Slack", logo: "💬", question: "Design Slack Messaging — Channels at scale, workspace isolation, search indexing", difficulty: "Hard", tags: ["WebSocket", "Search", "Scale"] },
];

const FALLBACK_PRACTICE = [
  { id: "p1", title: "Design a Global URL Shortener", difficulty: "Easy", description: "Design a service like bit.ly/TinyURL that handles 100M+ requests per day globally.", solution_hints: ["Base62 encoding", "Collision handling", "Read-heavy caching (Redis)"] },
  { id: "p2", title: "Design a Real-time Messaging Platform", difficulty: "Medium", description: "Design WhatsApp/Discord for 1B users with message persistence and E2EE.", solution_hints: ["WebSockets/long-polling", "Sequence markers", "Cassandra/HBase storage"] },
  { id: "p3", title: "Design a Distributed Rate Limiter", difficulty: "Hard", description: "Design a global rate limiter to prevent API abuse at 10M QPS.", solution_hints: ["Sliding Window Counter", "Race conditions in Redis", "Local vs Global enforcement"] },
  { id: "p4", title: "Design a Metrics Monitoring DB", difficulty: "Elite", description: "Design a Time-Series DB like Prometheus for millions of incoming data points/sec.", solution_hints: ["LSM Trees", "Downsampling", "Retention policies", "Write-ahead logging"] },
  { id: "p5", title: "Design a Ride-sharing Service", difficulty: "Hard", description: "Design Uber/Ola with live driver tracking, surge pricing, and trip matching.", solution_hints: ["Geo-spatial indexing", "QuadTree / S2 Cells", "WebSocket driver updates", "ML surge pricing"] },
  { id: "p6", title: "Design a Search Autocomplete", difficulty: "Medium", description: "Design Google Search type-ahead suggestions with sub-20ms latency for 1B users.", solution_hints: ["Trie data structure", "LRU cache", "Query log aggregation", "Real-time updates"] },
];

type Tab = "Concepts" | "Company Prep" | "Practice";

export default function SystemDesignPage() {
  useSession();
  const [activeTab, setActiveTab] = useState<Tab>("Concepts");
  const [concepts, setConcepts] = useState(FALLBACK_CONCEPTS);
  const [companies, setCompanies] = useState(FALLBACK_COMPANIES);
  const [practice, setPractice] = useState(FALLBACK_PRACTICE);
  const [loading, setLoading] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);

  // Try to load from backend but always show fallback immediately
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const baseUrl = API_URL;

    Promise.all([
      fetch(`${baseUrl}/api/system-design/concepts`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${baseUrl}/api/system-design/companies`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${baseUrl}/api/system-design/practice`, { headers }).then(r => r.ok ? r.json() : null),
    ]).then(([cRes, coRes, pRes]) => {
      if (cRes?.concepts?.length) setConcepts(cRes.concepts);
      if (coRes?.companies?.length) setCompanies(coRes.companies);
      if (pRes?.practice?.length) setPractice(pRes.practice);
    }).catch(() => {});
  }, []);

  if (selectedProblem) {
    return <GuidedArchitectView problem={selectedProblem} onBack={() => setSelectedProblem(null)} />;
  }

  const TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "Concepts", icon: <BookOpen size={16} />, label: "Concepts" },
    { id: "Company Prep", icon: <Building2 size={16} />, label: "Company Prep" },
    { id: "Practice", icon: <Target size={16} />, label: "Practice" },
  ];

  const difficultyStyle = (d: string) => ({
    "Beginner": { bg: "rgba(16,185,129,0.12)", color: "#10B981" },
    "Easy": { bg: "rgba(16,185,129,0.12)", color: "#10B981" },
    "Intermediate": { bg: "rgba(6,182,212,0.12)", color: "#06B6D4" },
    "Medium": { bg: "rgba(6,182,212,0.12)", color: "#06B6D4" },
    "Hard": { bg: "rgba(245,158,11,0.12)", color: "#F59E0B" },
    "Advanced": { bg: "rgba(244,63,94,0.12)", color: "#F43F5E" },
    "Elite": { bg: "rgba(139,92,246,0.12)", color: "#8B5CF6" },
  } as Record<string, { bg: string; color: string }>)[d] || { bg: "rgba(255,255,255,0.06)", color: "var(--text-muted)" };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 18px", background: "rgba(139,92,246,0.1)", borderRadius: 30, color: "#8B5CF6", marginBottom: 18 }}>
          <Sparkles size={18} className="animate-pulse" />
          <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5 }}>Architect Orbit</span>
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 16, letterSpacing: "-2px" }}>
          System Design <span className="gradient-text">Mastery</span>
        </h1>
        <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
          Learn to build highly scalable, fault-tolerant distributed systems with AI-guided Socratic mentoring.
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 36, justifyContent: "center", padding: 6, background: "rgba(255,255,255,0.03)", borderRadius: 20, width: "fit-content", margin: "0 auto 40px auto", flexWrap: "wrap" }}>
        {TABS.map(({ id, icon, label }) => (
          <motion.button
            key={id}
            onClick={() => setActiveTab(id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "11px 22px", borderRadius: 14, border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 800, transition: "all 0.2s",
              background: activeTab === id ? "rgba(255,255,255,0.1)" : "transparent",
              color: activeTab === id ? "white" : "var(--text-muted)",
              boxShadow: activeTab === id ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
              display: "flex", alignItems: "center", gap: 8, position: "relative",
            }}
          >
            {icon} {label}
            {id === "Practice" && (
              <span style={{ position: "absolute", top: -7, right: -7, background: "#8B5CF6", color: "white", fontSize: 9, fontWeight: 900, padding: "2px 6px", borderRadius: 6 }}>AI</span>
            )}
          </motion.button>
        ))}
      </div>

      {/* ── CONCEPTS TAB ──────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "Concepts" && (
          <motion.div key="concepts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 18 }}>
              {concepts.map((concept: any) => {
                const dStyle = difficultyStyle(concept.difficulty);
                const isExpanded = expandedConcept === concept.id;
                const accentColor = concept.color || "#8B5CF6";
                return (
                  <motion.div
                    key={concept.id}
                    whileHover={{ y: -4 }}
                    className="glass-card"
                    style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14, cursor: "pointer", position: "relative", overflow: "hidden" }}
                    onClick={() => setExpandedConcept(isExpanded ? null : concept.id)}
                  >
                    {/* Top accent line */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accentColor, opacity: 0.7 }} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontSize: 28, lineHeight: 1 }}>{concept.icon || "⚙️"}</div>
                      <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", padding: "3px 10px", background: dStyle.bg, color: dStyle.color, borderRadius: 8, letterSpacing: 0.5 }}>
                        {concept.difficulty}
                      </span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 900, marginBottom: 8, lineHeight: 1.2 }}>{concept.title}</h3>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{concept.desc}</p>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>KEY TOPICS TO MASTER:</div>
                            {(concept.desc || "").split(",").map((topic: string, i: number) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                                <ChevronRight size={12} color={accentColor} />
                                {topic.trim()}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                        {isExpanded ? "Click to collapse" : "Click to explore"}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        style={{ color: accentColor }}
                      >
                        <ChevronRight size={18} />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── COMPANY PREP TAB ─────────────────────────────────────────────────── */}
        {activeTab === "Company Prep" && (
          <motion.div key="company" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))", gap: 20 }}>
              {companies.map((co: any) => {
                const dStyle = difficultyStyle(co.difficulty || "Hard");
                const companyColors: Record<string, string> = {
                  "Google": "#4285F4", "Amazon": "#FF9900", "Microsoft": "#00A4EF",
                  "Netflix": "#E50914", "Uber": "#000000", "Meta": "#0866FF",
                  "Twitter/X": "#1DA1F2", "LinkedIn": "#0A66C2", "Slack": "#4A154B",
                };
                const accentColor = companyColors[co.company] || "#8B5CF6";
                return (
                  <motion.div
                    key={co.id}
                    whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }}
                    className="glass-card"
                    style={{ padding: 26, borderLeft: `3px solid ${accentColor}`, display: "flex", flexDirection: "column", gap: 14 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{co.logo || "🏢"}</span>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: accentColor, textTransform: "uppercase", letterSpacing: 1 }}>{co.company}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", background: dStyle.bg, color: dStyle.color, borderRadius: 8 }}>
                        {co.difficulty || "Hard"}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.4, color: "white" }}>{co.question}</h3>
                    {co.tags && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {(Array.isArray(co.tags) ? co.tags : co.tags.split(",")).map((tag: string, i: number) => (
                          <span key={i} style={{ fontSize: 11, padding: "3px 9px", background: "rgba(255,255,255,0.05)", borderRadius: 8, color: "var(--text-muted)", fontWeight: 600 }}>
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedProblem({ ...co, title: co.question, description: co.question, solution_hints: co.tags ? (Array.isArray(co.tags) ? co.tags : co.tags.split(",")) : [], id: co.id })}
                      style={{ padding: "11px 0", borderRadius: 11, border: "none", background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}11)`, borderTop: `1px solid ${accentColor}30`, color: accentColor, fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s" }}
                    >
                      <Sparkles size={14} /> Start Guided Session
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── PRACTICE TAB ─────────────────────────────────────────────────── */}
        {activeTab === "Practice" && (
          <motion.div key="practice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {/* AI Banner */}
            <div style={{ padding: "18px 22px", background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.1))", borderRadius: 18, border: "1px dashed rgba(139,92,246,0.35)", display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Sparkles size={22} color="#8B5CF6" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 4 }}>Guided Socratic Design Session</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Select a problem below to start a 1-on-1 session with your AI Senior Architect. It will evaluate your answers, identify gaps, and guide you through each phase like a real FAANG interview.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {practice.map((p: any) => {
                const dStyle = difficultyStyle(p.difficulty);
                return (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -3 }}
                    className="glass-card"
                    style={{ padding: 28 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, lineHeight: 1.2 }}>{p.title}</h3>
                        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{p.description}</p>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, padding: "5px 14px", background: dStyle.bg, color: dStyle.color, borderRadius: 20, flexShrink: 0 }}>
                        {p.difficulty}
                      </span>
                    </div>

                    <div style={{ marginBottom: 22 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Key Concepts to Cover:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {(p.solution_hints || []).map((hint: string, i: number) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                            <Cpu size={11} color="#8B5CF6" /> {hint}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <motion.button
                        whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(139,92,246,0.3)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedProblem(p)}
                        style={{ padding: "13px 28px", borderRadius: 13, border: "none", background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", color: "white", fontWeight: 900, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                      >
                        <Sparkles size={16} /> Guided Architect
                      </motion.button>
                      <button
                        className="btn-ghost"
                        style={{ padding: "13px 22px", borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                      >
                        View Exemplar
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
