"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

const ENDPOINTS = [
  { method: "GET",  path: "/health",                    label: "Health Check",        group: "Core" },
  { method: "GET",  path: "/api/hackathons",             label: "List Hackathons",     group: "Hackathons" },
  { method: "GET",  path: "/api/hackathons/1",           label: "Get Hackathon #1",    group: "Hackathons" },
  { method: "GET",  path: "/api/study/rooms",            label: "List Study Rooms",    group: "Study Rooms" },
  { method: "POST", path: "/api/study/create",           label: "Create Study Room",   group: "Study Rooms", body: { name: "Test Room", tag: "General" } },
  { method: "GET",  path: "/api/problems",               label: "List Problems",       group: "Code Practice" },
  { method: "GET",  path: "/api/problems/ARR-001",       label: "Get Problem ARR-001", group: "Code Practice" },
  { method: "POST", path: "/api/startup/generate",       label: "Generate Startup",    group: "Startup Lab", body: { domain: "EdTech", target_audience: "Students" } },
  { method: "GET",  path: "/api/startup/ideas",          label: "My Saved Ideas",      group: "Startup Lab", auth: true },
  { method: "GET",  path: "/api/certificates/my",        label: "My Certificates",     group: "Certificates", auth: true },
  { method: "POST", path: "/api/interview/start",        label: "Start Interview",     group: "Interview", body: { role: "Software Engineer" } },
  { method: "GET",  path: "/api/activity/stats",         label: "Activity Stats",      group: "Activity", auth: true },
  { method: "GET",  path: "/api/roadmaps",               label: "List Roadmaps",       group: "Roadmaps", auth: true },
];

const METHOD_COLOR: Record<string, string> = {
  GET: "#43E97B", POST: "#6C63FF", DELETE: "#FF6B6B", PUT: "#FFD93D"
};

const GROUP_COLOR: Record<string, string> = {
  Core: "#ffffff", Hackathons: "#FF6B6B", "Study Rooms": "#4ECDC4",
  "Code Practice": "#FFD93D", "Startup Lab": "#FF8E53",
  Certificates: "#FFD700", Interview: "#6C63FF",
  Activity: "#43E97B", Roadmaps: "#8B5CF6"
};

type Status = "idle" | "loading" | "ok" | "error";

export default function ApiStatusPage() {
  const [statuses, setStatuses] = useState<Record<string, { status: Status; ms?: number; code?: number }>>({});
  const [activeGroup, setActiveGroup] = useState("All");
  const [backendAlive, setBackendAlive] = useState<"unknown" | "alive" | "waking" | "down">("unknown");
  const [expanded, setExpanded] = useState<string | null>(null);

  const groups = ["All", ...Array.from(new Set(ENDPOINTS.map(e => e.group)))];

  const pingBackend = async () => {
    setBackendAlive("waking");
    const t = Date.now();
    try {
      const res = await fetch(`${API}/health`, { signal: AbortSignal.timeout(10000) });
      if (res.ok) setBackendAlive("alive");
      else setBackendAlive("down");
    } catch {
      setBackendAlive("down");
    }
  };

  useEffect(() => { pingBackend(); }, []);

  const testEndpoint = async (ep: typeof ENDPOINTS[0]) => {
    const key = ep.path;
    setStatuses(s => ({ ...s, [key]: { status: "loading" } }));
    const t0 = Date.now();
    try {
      const res = await fetch(`${API}${ep.path}`, {
        method: ep.method,
        headers: { "Content-Type": "application/json" },
        body: ep.body ? JSON.stringify(ep.body) : undefined,
        signal: AbortSignal.timeout(15000),
      });
      setStatuses(s => ({ ...s, [key]: { status: res.ok ? "ok" : "error", ms: Date.now() - t0, code: res.status } }));
    } catch {
      setStatuses(s => ({ ...s, [key]: { status: "error", ms: Date.now() - t0 } }));
    }
  };

  const testAll = async () => {
    for (const ep of filteredEndpoints) await testEndpoint(ep);
  };

  const filteredEndpoints = activeGroup === "All" ? ENDPOINTS : ENDPOINTS.filter(e => e.group === activeGroup);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          ⚡ API <span style={{ background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Status</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
          Live endpoint tester — no Swagger needed. Tests run directly from your browser.
        </p>

        {/* Backend ping status */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid var(--border)", marginBottom: 20 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: backendAlive === "alive" ? "#43E97B" : backendAlive === "waking" ? "#FFD93D" : "#FF6B6B", boxShadow: `0 0 8px ${backendAlive === "alive" ? "#43E97B" : backendAlive === "waking" ? "#FFD93D" : "#FF6B6B"}` }} />
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            Backend: {backendAlive === "alive" ? "🟢 Online" : backendAlive === "waking" ? "🟡 Waking up..." : "🔴 Offline / Cold Start"}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{API}</span>
          <button onClick={pingBackend} style={{ marginLeft: "auto", padding: "6px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 8, color: "white", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            Ping Again
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={testAll} style={{ padding: "10px 24px", background: "var(--brand-primary)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
            ▶ Test All Endpoints
          </button>
          {groups.map(g => (
            <button key={g} onClick={() => setActiveGroup(g)}
              style={{ padding: "8px 16px", background: activeGroup === g ? "rgba(108,99,255,0.2)" : "transparent", border: `1px solid ${activeGroup === g ? "#6C63FF" : "var(--border)"}`, borderRadius: 8, color: activeGroup === g ? "#6C63FF" : "var(--text-muted)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Endpoint list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filteredEndpoints.map((ep) => {
          const st = statuses[ep.path];
          const isExpanded = expanded === ep.path;
          return (
            <motion.div key={ep.path} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ border: `1px solid ${st?.status === "ok" ? "rgba(67,233,123,0.3)" : st?.status === "error" ? "rgba(255,107,107,0.3)" : "var(--border)"}`, borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer" }} onClick={() => setExpanded(isExpanded ? null : ep.path)}>
                {/* Method badge */}
                <span style={{ background: `${METHOD_COLOR[ep.method]}20`, color: METHOD_COLOR[ep.method], padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, minWidth: 48, textAlign: "center" }}>{ep.method}</span>
                {/* Group badge */}
                <span style={{ color: GROUP_COLOR[ep.group] || "white", fontSize: 11, fontWeight: 600, minWidth: 100 }}>{ep.group}</span>
                {/* Path */}
                <code style={{ fontSize: 13, color: "white", flex: 1 }}>{ep.path}</code>
                {ep.auth && <span style={{ fontSize: 10, color: "#FFD93D", border: "1px solid rgba(255,217,61,0.3)", padding: "2px 8px", borderRadius: 6 }}>🔑 Auth</span>}
                {/* Status indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {st?.status === "loading" && <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
                  {st?.status === "ok" && <span style={{ color: "#43E97B", fontWeight: 700, fontSize: 13 }}>✓ {st.code} · {st.ms}ms</span>}
                  {st?.status === "error" && <span style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 13 }}>✗ {st.code || "Err"} · {st.ms}ms</span>}
                </div>
                <button onClick={e => { e.stopPropagation(); testEndpoint(ep); }}
                  style={{ padding: "6px 14px", background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 8, color: "#6C63FF", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  Test
                </button>
              </div>
              {/* Expanded body */}
              <AnimatePresence>
                {isExpanded && ep.body && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    style={{ borderTop: "1px solid var(--border)", padding: "12px 16px", background: "rgba(0,0,0,0.3)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 8 }}>EXAMPLE BODY</div>
                    <pre style={{ fontSize: 12, color: "#4ECDC4", margin: 0 }}>{JSON.stringify(ep.body, null, 2)}</pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
