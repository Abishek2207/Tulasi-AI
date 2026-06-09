"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, Sparkles, ChevronRight, Code2, Database, Cloud, Layout, PlayCircle, Network, Layers, Mic, FileText, CheckCircle, BrainCircuit } from "lucide-react";

const ROLES = [
  { id: "frontend", label: "Frontend Engineer", icon: <Layout size={18} />, color: "#EC4899" },
  { id: "backend", label: "Backend Engineer", icon: <Database size={18} />, color: "#10B981" },
  { id: "fullstack", label: "Full Stack Engineer", icon: <Code2 size={18} />, color: "#3B82F6" },
  { id: "data", label: "Data Engineer", icon: <Network size={18} />, color: "#F59E0B" },
  { id: "ml", label: "Machine Learning Engineer", icon: <BrainCircuit size={18} />, color: "#8B5CF6" },
  { id: "devops", label: "DevOps / SRE", icon: <Cloud size={18} />, color: "#06B6D4" },
];

const SKILL_LEVELS = ["Intermediate", "Advanced", "Expert"];

interface ProjectBlueprint {
  title: string;
  problem: string;
  pitch: string;
  features: string[];
  stack: { category: string; tools: string[] }[];
  architecture: string;
  schema: { table: string; fields: string[] }[];
  github: string;
  buildPlan: { phase: string; tasks: string[] }[];
  resumeTips: string[];
}

const MOCK_BLUEPRINT: ProjectBlueprint = {
  title: "AuraStream: Distributed Event-Sourcing Metrics Aggregator",
  problem: "Most monitoring tools struggle to handle high-throughput burst traffic in microservices without dropping events. Scaling traditional relational databases for time-series event ingestion leads to severe latency bottlenecks and high infrastructure costs.",
  pitch: "I built AuraStream, a distributed, high-throughput event aggregator capable of processing 10,000+ events per second. It uses a Kafka-based event-sourcing architecture to ingest data, buffers it via Redis, and persists to ClickHouse for lightning-fast time-series analytics, all visualizable through a real-time WebSocket dashboard.",
  features: [
    "High-throughput ingestion pipeline using Apache Kafka to prevent dropped events during traffic spikes.",
    "Real-time event processing and buffering using Redis Streams and background workers.",
    "Time-series data persistence utilizing ClickHouse for sub-second analytical queries.",
    "WebSocket-based React dashboard for live metrics visualization (e.g., P99 latency, request volume).",
    "Dockerized microservices architecture deployed on AWS ECS with automated CI/CD via GitHub Actions."
  ],
  stack: [
    { category: "Frontend", tools: ["Next.js", "TailwindCSS", "Recharts", "Socket.io-client"] },
    { category: "Backend", tools: ["Golang (Ingestion API)", "Node.js (Dashboard API)", "gRPC"] },
    { category: "Data Layer", tools: ["Apache Kafka", "Redis", "ClickHouse"] },
    { category: "Infrastructure", tools: ["Docker", "AWS ECS", "Terraform", "GitHub Actions"] },
  ],
  architecture: "Client applications send metrics to a Golang Ingestion API. The API acts as a producer, pushing messages to Kafka topics. A cluster of consumer workers (Golang) read from Kafka, aggregate data in memory, and batch-write to ClickHouse. The Node.js Dashboard API queries ClickHouse and streams live updates to the React frontend via WebSockets.",
  schema: [
    { table: "events_raw (ClickHouse)", fields: ["event_id (UUID)", "timestamp (DateTime)", "service_name (String)", "metric_type (Enum)", "value (Float64)", "metadata (JSON)"] },
    { table: "metrics_aggregated (ClickHouse MV)", fields: ["timestamp_minute (DateTime)", "service_name (String)", "avg_latency (Float64)", "p99_latency (Float64)", "request_count (Int64)"] },
    { table: "alerts_config (PostgreSQL)", fields: ["id (UUID)", "service_name (String)", "threshold_value (Float)", "alert_channel (String)", "created_at (Timestamp)"] },
  ],
  github: "/aurastream\n  /ingestion-api   (Golang)\n  /workers         (Golang consumers)\n  /dashboard-api   (Node.js/Express)\n  /web             (Next.js Frontend)\n  /infra           (Terraform & Docker Compose)\n  docker-compose.yml\n  README.md",
  buildPlan: [
    { phase: "Phase 1: Local Infrastructure", tasks: ["Write docker-compose.yml for Kafka, Zookeeper, Redis, and ClickHouse.", "Verify connectivity between containers."] },
    { phase: "Phase 2: Ingestion & Queuing", tasks: ["Build Golang REST API to accept POST /metrics.", "Implement Kafka Producer to publish received metrics to 'raw_metrics' topic.", "Load test API to 5k RPS using Apache JMeter/k6."] },
    { phase: "Phase 3: Processing & Persistence", tasks: ["Build Golang Consumer to read from Kafka.", "Design ClickHouse schema and Materialized Views for time-series aggregation.", "Implement batch-writing logic from Consumer to ClickHouse."] },
    { phase: "Phase 4: Real-time Dashboard", tasks: ["Build Node.js API to query ClickHouse.", "Setup WebSocket server for pushing updates.", "Create React frontend with Recharts to visualize the data stream."] },
    { phase: "Phase 5: Deployment", tasks: ["Write Dockerfiles for all 3 microservices.", "Write Terraform scripts to provision AWS ECS and RDS.", "Set up GitHub Actions for automated testing and deployment."] }
  ],
  resumeTips: [
    "Architected and deployed a distributed event-sourcing metrics aggregator capable of processing 10,000+ events/sec using Golang and Apache Kafka.",
    "Reduced analytical query latency by 85% by migrating from PostgreSQL to ClickHouse and implementing Materialized Views for time-series data.",
    "Built a real-time observability dashboard using React and WebSockets, providing sub-second visibility into microservice health and P99 latency."
  ]
};

export default function ProjectBuilderPage() {
  const [phase, setPhase] = useState<"input" | "loading" | "output">("input");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Advanced");
  const [blueprint, setBlueprint] = useState<ProjectBlueprint | null>(null);

  const generate = async () => {
    if (!role) return;
    setPhase("loading");
    await new Promise(r => setTimeout(r, 2500));
    setBlueprint(MOCK_BLUEPRINT);
    setPhase("output");
  };

  const selectedRole = ROLES.find(r => r.id === role);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #F97316, #EA580C)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(249,115,22,0.4)" }}>
          <Hammer size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>Project Builder</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Architect FAANG-level portfolio projects</p>
        </div>
      </div>

      {phase === "input" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ padding: 32, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 20 }}>Target Role</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
              {ROLES.map(r => (
                <button key={r.id} onClick={() => setRole(r.id)}
                  style={{ padding: "16px", borderRadius: 16, border: `2px solid ${role === r.id ? r.color : "rgba(255,255,255,0.08)"}`, background: role === r.id ? `${r.color}12` : "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}>
                  <span style={{ color: role === r.id ? r.color : "rgba(255,255,255,0.3)" }}>{r.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: role === r.id ? "white" : "rgba(255,255,255,0.6)" }}>{r.label}</span>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 12 }}>Skill Level</h2>
              <div style={{ display: "flex", gap: 10 }}>
                {SKILL_LEVELS.map(l => (
                  <button key={l} onClick={() => setLevel(l)}
                    style={{ flex: 1, padding: "14px", borderRadius: 14, border: `1px solid ${level === l ? "#F97316" : "rgba(255,255,255,0.08)"}`, background: level === l ? "rgba(249,115,22,0.1)" : "transparent", color: level === l ? "#F97316" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    {l}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 10 }}>Note: We omit 'Beginner' to ensure all generated projects are complex and portfolio-worthy.</p>
            </div>

            <button onClick={generate} disabled={!role}
              style={{ width: "100%", padding: "16px", borderRadius: 16, background: role ? "linear-gradient(135deg, #F97316, #EA580C)" : "rgba(255,255,255,0.05)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: role ? "pointer" : "not-allowed", opacity: !role ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: role ? "0 12px 24px rgba(249,115,22,0.3)" : "none" }}>
              <Sparkles size={20} /> Generate FAANG-Level Blueprint
            </button>
          </div>
        </motion.div>
      )}

      {phase === "loading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid rgba(249,115,22,0.2)", borderTopColor: "#F97316" }} />
          </motion.div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Architecting System...</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Designing a complex {level.toLowerCase()} {selectedRole?.label.toLowerCase()} project.</p>
        </div>
      )}

      {phase === "output" && blueprint && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Header & Idea */}
          <div style={{ padding: 36, borderRadius: 28, background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(255,255,255,0.01))", border: "1px solid rgba(249,115,22,0.2)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#F97316", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>{level} Engineering Blueprint</div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "white", marginBottom: 16, lineHeight: 1.2 }}>{blueprint.title}</h2>
            
            <div style={{ padding: 20, borderRadius: 16, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#F43F5E", marginBottom: 8, textTransform: "uppercase" }}>The Problem</div>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{blueprint.problem}</p>
            </div>

            <div style={{ padding: 20, borderRadius: 16, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#10B981", marginBottom: 8, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}><Mic size={14} /> Demo Pitch (30s)</div>
              <p style={{ fontSize: 15, color: "white", lineHeight: 1.6, fontWeight: 500 }}>"{blueprint.pitch}"</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Features */}
            <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={18} color="#F59E0B" /> Core Features</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {blueprint.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <CheckCircle size={18} color="#F59E0B" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><Layers size={18} color="#3B82F6" /> Tech Stack</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {blueprint.stack.map(s => (
                  <div key={s.category}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase" }}>{s.category}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {s.tools.map(t => <span key={t} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3B82F6", fontSize: 13, fontWeight: 600 }}>{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Architecture & DB Schema */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><Network size={18} color="#8B5CF6" /> Architecture Flow</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>{blueprint.architecture}</p>
            </div>
            
            <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><Database size={18} color="#06B6D4" /> Database Schema</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {blueprint.schema.map((s, i) => (
                  <div key={i} style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#06B6D4", marginBottom: 8 }}>{s.table}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {s.fields.map(f => <span key={f} style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 6, fontFamily: "monospace" }}>{f}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Build Plan & Resume */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}><PlayCircle size={18} color="#10B981" /> Step-by-Step Build Plan</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {blueprint.buildPlan.map((phase, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#10B981", marginBottom: 10 }}>{phase.phase}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {phase.tasks.map((t, j) => (
                        <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(16,185,129,0.5)", marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><FileText size={18} color="#EC4899" /> Resume Bullet Points</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {blueprint.resumeTips.map((tip, i) => (
                    <div key={i} style={{ padding: 12, borderRadius: 12, background: "rgba(236,72,153,0.05)", border: "1px solid rgba(236,72,153,0.15)", fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                      • {tip}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Code2 size={18} color="#6366F1" /> GitHub Structure</h3>
                <pre style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", overflowX: "auto" }}>
                  {blueprint.github}
                </pre>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <button onClick={() => setPhase("input")} style={{ padding: "14px 28px", borderRadius: 14, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Architect Another Project
            </button>
          </div>

        </motion.div>
      )}
    </motion.div>
  );
}
