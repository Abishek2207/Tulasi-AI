"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
const FRONTEND = typeof window !== "undefined" ? window.location.origin : "";

const BACKEND_ENDPOINTS = [
  { method: "GET",  path: "/health",                group: "Core",          label: "Health Check" },
  { method: "GET",  path: "/api/hackathons",         group: "Hackathons",    label: "List Hackathons" },
  { method: "GET",  path: "/api/hackathons/1",       group: "Hackathons",    label: "Get Hackathon #1" },
  { method: "GET",  path: "/api/study/rooms",        group: "Study Rooms",   label: "List Rooms" },
  { method: "GET",  path: "/api/problems",           group: "Code Practice", label: "List Problems" },
  { method: "GET",  path: "/api/problems/ARR-001",   group: "Code Practice", label: "Get Problem" },
  { method: "POST", path: "/api/interview/start",    group: "Interview",     label: "Start Interview",  body: { role: "Software Engineer" } },
  { method: "POST", path: "/api/startup/generate",   group: "Startup Lab",   label: "Generate Idea",    body: { domain: "EdTech", target_audience: "Students" } },
  { method: "GET",  path: "/api/certificates/my",    group: "Certificates",  label: "My Certs",         auth: true },
  { method: "GET",  path: "/api/startup/ideas",      group: "Startup Lab",   label: "Saved Ideas",      auth: true },
  { method: "GET",  path: "/api/activity/stats",     group: "Activity",      label: "Activity Stats",   auth: true },
  { method: "GET",  path: "/api/roadmaps",           group: "Roadmaps",      label: "Roadmaps",         auth: true },
];

const FRONTEND_ENDPOINTS = [
  { method: "GET",  path: "/api/auth/session",     group: "Auth",    label: "Auth Session" },
  { method: "GET",  path: "/api/auth/providers",   group: "Auth",    label: "OAuth Providers" },
  { method: "GET",  path: "/api/auth/csrf",        group: "Auth",    label: "CSRF Token" },
  { method: "GET",  path: "/dashboard",            group: "Pages",   label: "Dashboard UI" },
  { method: "GET",  path: "/dashboard/hackathons", group: "Pages",   label: "Hackathons Page" },
  { method: "GET",  path: "/dashboard/study-rooms",group: "Pages",   label: "Study Rooms Page" },
  { method: "GET",  path: "/dashboard/interview",  group: "Pages",   label: "Interview Page" },
  { method: "GET",  path: "/dashboard/startup-lab",group: "Pages",   label: "Startup Lab Page" },
  { method: "GET",  path: "/dashboard/certificates",group:"Pages",   label: "Certificates Page" },
  { method: "GET",  path: "/dashboard/code",       group: "Pages",   label: "Code Practice Page" },
];

const METHOD_COLOR: Record<string, string> = {
  GET: "#43E97B", POST: "#6C63FF", DELETE: "#FF6B6B", PUT: "#FFD93D"
};

type Status = "idle" | "loading" | "ok" | "error";
type TestResult = { status: Status; ms?: number; code?: number };

function StatusBadge({ st }: { st: TestResult | undefined }) {
  if (!st || st.status === "idle") return null;
  if (st.status === "loading") return <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />;
  if (st.status === "ok") return <span style={{ color: "#43E97B", fontWeight: 700, fontSize: 12 }}>✓ {st.code} · {st.ms}ms</span>;
  return <span style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 12 }}>✗ {st.code || "ERR"} · {st.ms}ms</span>;
}

export default function ApiStatusPage() {
  const [bStatuses, setBStatuses] = useState<Record<string, TestResult>>({});
  const [fStatuses, setFStatuses] = useState<Record<string, TestResult>>({});
  const [backendPing, setBackendPing] = useState<"unknown" | "alive" | "waking" | "down">("unknown");
  const [frontendPing, setFrontendPing] = useState<"unknown" | "alive" | "down">("unknown");
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [tab, setTab] = useState<"backend" | "frontend" | "combined">("combined");

  const pingBackend = async () => {
    setBackendPing("waking");
    const t0 = Date.now();
    try {
      const res = await fetch(`${BACKEND}/health`, { signal: AbortSignal.timeout(12000) });
      const ms = Date.now() - t0;
      setPingMs(ms);
      setBackendPing(res.ok ? "alive" : "down");
    } catch { setBackendPing("down"); }
  };

  const pingFrontend = async () => {
    const t0 = Date.now();
    try {
      const res = await fetch(`${FRONTEND}/api/auth/providers`, { signal: AbortSignal.timeout(5000) });
      setFrontendPing(res.ok ? "alive" : "down");
    } catch { setFrontendPing("down"); }
  };

  useEffect(() => { pingBackend(); pingFrontend(); }, []);

  const testEndpoint = async (
    base: string,
    ep: typeof BACKEND_ENDPOINTS[0],
    setFn: React.Dispatch<React.SetStateAction<Record<string, TestResult>>>
  ) => {
    setFn(s => ({ ...s, [ep.path]: { status: "loading" } }));
    const t0 = Date.now();
    try {
      const res = await fetch(`${base}${ep.path}`, {
        method: ep.method,
        headers: { "Content-Type": "application/json" },
        body: ep.body ? JSON.stringify(ep.body) : undefined,
        signal: AbortSignal.timeout(20000),
      });
      setFn(s => ({ ...s, [ep.path]: { status: res.ok ? "ok" : "error", ms: Date.now() - t0, code: res.status } }));
    } catch {
      setFn(s => ({ ...s, [ep.path]: { status: "error", ms: Date.now() - t0 } }));
    }
  };

  const testAllBackend = async () => { for (const ep of BACKEND_ENDPOINTS) await testEndpoint(BACKEND, ep, setBStatuses); };
  const testAllFrontend = async () => { for (const ep of FRONTEND_ENDPOINTS) await testEndpoint(FRONTEND, ep, setFStatuses); };
  const testAll = async () => { testAllBackend(); testAllFrontend(); };

  const backendOk = Object.values(bStatuses).filter(s => s.status === "ok").length;
  const frontendOk = Object.values(fStatuses).filter(s => s.status === "ok").length;

  const EndpointRow = ({
    ep, base, statuses, setStatuses
  }: {
    ep: typeof BACKEND_ENDPOINTS[0];
    base: string;
    statuses: Record<string, TestResult>;
    setStatuses: React.Dispatch<React.SetStateAction<Record<string, TestResult>>>;
  }) => {
    const st = statuses[ep.path];
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${st?.status === "ok" ? "rgba(67,233,123,0.25)" : st?.status === "error" ? "rgba(255,107,107,0.25)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 10,
      }}>
        <span style={{ background: `${METHOD_COLOR[ep.method]}20`, color: METHOD_COLOR[ep.method], padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 800, minWidth: 40, textAlign: "center" }}>{ep.method}</span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 80, fontWeight: 600 }}>{ep.group}</span>
        <code style={{ fontSize: 12, color: "white", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ep.path}</code>
        {(ep as any).auth && <span style={{ fontSize: 9, color: "#FFD93D", border: "1px solid rgba(255,217,61,0.3)", padding: "1px 6px", borderRadius: 4 }}>AUTH</span>}
        <StatusBadge st={st} />
        <button onClick={() => testEndpoint(base, ep, setStatuses)}
          style={{ padding: "4px 12px", background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 6, color: "#6C63FF", fontWeight: 700, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
          Test
        </button>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 950, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>
          ⚡ Combined <span style={{ background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>API Status</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Live tester for both <strong style={{ color: "#4ECDC4" }}>Vercel Frontend</strong> and <strong style={{ color: "#6C63FF" }}>Render Backend</strong> — all in one place.
        </p>
      </div>

      {/* Status cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Frontend card */}
        <div style={{ padding: "16px 20px", background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.25)", borderRadius: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#4ECDC4" }}>🌐 Vercel Frontend</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: frontendPing === "alive" ? "#43E97B" : "#FFD93D", boxShadow: `0 0 6px ${frontendPing === "alive" ? "#43E97B" : "#FFD93D"}` }} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>{frontendPing === "alive" ? "Online" : "Checking..."}</span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{FRONTEND || "https://tulasi-frontend.onrender.com"}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{frontendOk}/{FRONTEND_ENDPOINTS.length} endpoints OK</span>
            <button onClick={testAllFrontend} style={{ padding: "5px 12px", background: "rgba(78,205,196,0.15)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 8, color: "#4ECDC4", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
              Test All
            </button>
          </div>
        </div>

        {/* Backend card */}
        <div style={{ padding: "16px 20px", background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.25)", borderRadius: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#6C63FF" }}>🔧 Render Backend</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: backendPing === "alive" ? "#43E97B" : backendPing === "waking" ? "#FFD93D" : "#FF6B6B", boxShadow: `0 0 6px ${backendPing === "alive" ? "#43E97B" : "#FFD93D"}` }} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>
                {backendPing === "alive" ? `Online · ${pingMs}ms` : backendPing === "waking" ? "Waking up..." : "Down"}
              </span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{BACKEND}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{backendOk}/{BACKEND_ENDPOINTS.length} endpoints OK</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={pingBackend} style={{ padding: "5px 10px", background: "transparent", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 8, color: "var(--text-muted)", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>Ping</button>
              <button onClick={testAllBackend} style={{ padding: "5px 12px", background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 8, color: "#6C63FF", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Test All</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab + Test All row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        {(["combined", "backend", "frontend"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "8px 18px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", border: `1px solid ${tab === t ? "#6C63FF" : "var(--border)"}`, background: tab === t ? "rgba(108,99,255,0.2)" : "transparent", color: tab === t ? "#6C63FF" : "var(--text-muted)" }}>
            {t === "combined" ? "🔗 Combined" : t === "backend" ? "🔧 Backend Only" : "🌐 Frontend Only"}
          </button>
        ))}
        <button onClick={testAll} style={{ marginLeft: "auto", padding: "8px 20px", background: "var(--brand-primary)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          ▶ Test All
        </button>
      </div>

      {/* Endpoint list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(tab === "backend" || tab === "combined") && (
          <>
            {tab === "combined" && <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#6C63FF", marginTop: 8, marginBottom: 4 }}>🔧 Render Backend — FastAPI</div>}
            {BACKEND_ENDPOINTS.map(ep => (
              <EndpointRow key={ep.path} ep={ep} base={BACKEND} statuses={bStatuses} setStatuses={setBStatuses} />
            ))}
          </>
        )}
        {(tab === "frontend" || tab === "combined") && (
          <>
            {tab === "combined" && <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#4ECDC4", marginTop: 20, marginBottom: 4 }}>🌐 Vercel Frontend — Next.js</div>}
            {FRONTEND_ENDPOINTS.map(ep => (
              <EndpointRow key={ep.path} ep={ep} base={FRONTEND} statuses={fStatuses} setStatuses={setFStatuses} />
            ))}
          </>
        )}
      </div>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
