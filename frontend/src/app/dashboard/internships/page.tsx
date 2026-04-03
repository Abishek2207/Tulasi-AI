"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ExternalLink, Calendar, MapPin, DollarSign, Clock, Wifi, Building } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useSession } from "@/hooks/useSession";

interface Internship {
  id?: number; title: string; company: string; domain: string;
  type: string; mode: string; location?: string; stipend?: string;
  duration?: string; description?: string; apply_link: string; deadline?: string;
}

const DOMAINS = ["All", "AI", "Web Dev", "Data Science", "DevOps", "Cybersecurity", "Mobile Dev", "Cloud", "Design", "Blockchain", "Product", "Open Source", "Finance & Tech"];
const TYPES = ["All", "Paid", "Unpaid"];
const MODES = ["All", "Online", "Offline", "Hybrid"];

function InternshipCard({ item }: { item: Internship }) {
  const typeColor = item.type === "Paid" ? "#10B981" : "#F59E0B";
  const modeIcon = item.mode === "Online" ? <Wifi size={12} /> : item.mode === "Offline" ? <Building size={12} /> : <MapPin size={12} />;

  const daysLeft = item.deadline
    ? Math.ceil((new Date(item.deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }}
      className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "white", marginBottom: 4 }}>{item.title}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{item.company}</div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap",
          background: `${typeColor}20`, color: typeColor, border: `1px solid ${typeColor}30`
        }}>{item.type}</span>
      </div>

      {item.description && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
          {item.description.slice(0, 120)}{item.description.length > 120 ? "…" : ""}
        </p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: 8 }}>
          {modeIcon} {item.mode}
        </span>
        {item.location && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: 8 }}>
            <MapPin size={10} /> {item.location}
          </span>
        )}
        {item.stipend && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#10B981", background: "rgba(16,185,129,0.08)", padding: "3px 8px", borderRadius: 8 }}>
            <DollarSign size={10} /> {item.stipend}
          </span>
        )}
        {item.duration && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: 8 }}>
            <Clock size={10} /> {item.duration}
          </span>
        )}
        <span style={{ fontSize: 11, color: "#A78BFA", background: "rgba(139,92,246,0.1)", padding: "3px 8px", borderRadius: 8 }}>
          {item.domain}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        {daysLeft !== null && (
          <span style={{ fontSize: 11, color: daysLeft < 7 ? "#F43F5E" : "var(--text-muted)", fontWeight: 700 }}>
            <Calendar size={10} style={{ display: "inline", marginRight: 4 }} />
            {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
          </span>
        )}
        <motion.a href={item.apply_link} target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10,
            background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
            color: "#A78BFA", fontSize: 12, fontWeight: 800, textDecoration: "none", marginLeft: "auto"
          }}>
          Apply Now <ExternalLink size={12} />
        </motion.a>
      </div>
    </motion.div>
  );
}

export default function InternshipsPage() {
  const { data: session } = useSession();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [type, setType] = useState("All");
  const [mode, setMode] = useState("All");

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const params = new URLSearchParams();
    if (domain !== "All") params.append("domain", domain);
    if (type !== "All") params.append("type", type);
    if (mode !== "All") params.append("mode", mode);
    fetch(`${API_URL}/api/internships?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setInternships(d.internships || [])).catch(console.error).finally(() => setLoading(false));
  }, [domain, type, mode]);

  const filtered = internships.filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ marginBottom: 40 }}>
        <h1 className="hero-title" style={{ fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-1.5px", marginBottom: 12 }}>
          Internship <span className="gradient-text">Discovery</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          {internships.length}+ curated internship opportunities across top companies. Filtered and verified.
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or company..."
            style={{ width: "100%", padding: "12px 14px 12px 42px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "white", fontSize: 14, boxSizing: "border-box" }} />
        </div>

        {/* Domain filter */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", marginBottom: 10, letterSpacing: 1 }}>DOMAIN</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {DOMAINS.map(d => (
              <button key={d} onClick={() => setDomain(d)} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
                background: domain === d ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.03)",
                color: domain === d ? "#A78BFA" : "var(--text-muted)",
                border: `1px solid ${domain === d ? "rgba(139,92,246,0.4)" : "var(--border)"}`,
              }}>{d}</button>
            ))}
          </div>
        </div>

        {/* Type + Mode */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[{ label: "TYPE", options: TYPES, value: type, set: setType },
            { label: "MODE", options: MODES, value: mode, set: setMode }].map(({ label, options, value, set }) => (
            <div key={label}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", marginBottom: 10, letterSpacing: 1 }}>{label}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {options.map(o => (
                  <button key={o} onClick={() => set(o)} style={{
                    flex: 1, padding: "8px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    background: value === o ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                    color: value === o ? "#06B6D4" : "var(--text-muted)",
                    border: `1px solid ${value === o ? "rgba(6,182,212,0.3)" : "var(--border)"}`,
                  }}>{o}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, fontWeight: 600 }}>
        Showing {filtered.length} internships
        {(domain !== "All" || type !== "All" || mode !== "All") && " · Filters active"}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            style={{ width: 40, height: 40, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8B5CF6", borderRadius: "50%" }} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(340px,100%), 1fr))", gap: 20 }}>
          {filtered.map((item, i) => <InternshipCard key={item.id || i} item={item} />)}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>No internships found</div>
              <div style={{ fontSize: 13, marginTop: 8 }}>Try adjusting your filters</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
