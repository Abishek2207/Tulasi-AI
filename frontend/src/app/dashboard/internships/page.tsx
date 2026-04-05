"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ExternalLink, Calendar, MapPin, DollarSign,
  Clock, Wifi, Building, ChevronDown, X, Filter, Briefcase, Sparkles, Globe
} from "lucide-react";
import { API_URL } from "@/lib/api";
import { useSession } from "@/hooks/useSession";

interface Internship {
  id?: number; title: string; company: string; domain: string;
  type: string; mode: string; state?: string; location?: string;
  stipend?: string; duration?: string; description?: string;
  apply_link: string; deadline?: string;
}

const DOMAINS = ["All", "AI", "Web Dev", "Data Science", "DevOps", "Cybersecurity",
  "Mobile Dev", "Cloud", "Design", "Blockchain", "Product", "Open Source",
  "Finance & Tech", "Hardware", "QA", "AR/VR", "Documentation"];
const TYPES = ["All", "Paid", "Free", "Unpaid"];
const MODES = ["All", "Online", "Offline", "Hybrid"];

const INDIA_STATES = [
  "All India", "Tamil Nadu", "Karnataka", "Maharashtra", "Delhi",
  "Telangana", "Andhra Pradesh", "Kerala", "Gujarat", "Rajasthan",
  "Uttar Pradesh", "West Bengal", "Madhya Pradesh", "Punjab", "Haryana"
];

const INDIA_DISTRICTS: Record<string, string[]> = {
  "Tamil Nadu": ["All Cities", "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli", "Vellore", "Erode", "Thanjavur"],
  "Karnataka": ["All Cities", "Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
  "Maharashtra": ["All Cities", "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane"],
  "Delhi": ["All Cities", "New Delhi", "Noida", "Gurgaon", "Dwarka", "Rohini"],
  "Telangana": ["All Cities", "Hyderabad", "Warangal", "Karimnagar", "Nizamabad"],
  "Andhra Pradesh": ["All Cities", "Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Nellore"],
  "Kerala": ["All Cities", "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kannur"],
  "Gujarat": ["All Cities", "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Rajasthan": ["All Cities", "Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
  "Uttar Pradesh": ["All Cities", "Lucknow", "Kanpur", "Agra", "Varanasi", "Noida", "Allahabad"],
  "West Bengal": ["All Cities", "Kolkata", "Howrah", "Durgapur", "Siliguri"],
  "Madhya Pradesh": ["All Cities", "Bhopal", "Indore", "Gwalior", "Jabalpur"],
  "Punjab": ["All Cities", "Chandigarh", "Amritsar", "Ludhiana", "Patiala"],
  "Haryana": ["All Cities", "Gurgaon", "Faridabad", "Ambala", "Rohtak"],
};

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  "Paid":   { bg: "rgba(16,185,129,0.12)", text: "#10B981", border: "rgba(16,185,129,0.3)" },
  "Free":   { bg: "rgba(6,182,212,0.12)",  text: "#06B6D4", border: "rgba(6,182,212,0.3)" },
  "Unpaid": { bg: "rgba(245,158,11,0.12)", text: "#F59E0B", border: "rgba(245,158,11,0.3)" },
};

function TypeBadge({ type }: { type: string }) {
  const style = typeColors[type] || typeColors["Unpaid"];
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap",
      background: style.bg, color: style.text, border: `1px solid ${style.border}`,
      textTransform: "uppercase", letterSpacing: 0.5,
    }}>{type}</span>
  );
}

function ModeBadge({ mode }: { mode: string }) {
  const icon = mode === "Online" ? <Wifi size={10} /> : mode === "Offline" ? <Building size={10} /> : <Globe size={10} />;
  const color = mode === "Online" ? "#8B5CF6" : mode === "Offline" ? "#F59E0B" : "#06B6D4";
  return (
    <span style={{
      display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700,
      color, background: `${color}15`, padding: "3px 9px", borderRadius: 8, border: `1px solid ${color}25`,
    }}>
      {icon} {mode}
    </span>
  );
}

function InternshipCard({ item }: { item: Internship }) {
  const daysLeft = item.deadline
    ? Math.ceil((new Date(item.deadline).getTime() - Date.now()) / 86400000)
    : null;
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isUrgent = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }}
      transition={{ duration: 0.2 }}
      className="glass-card"
      style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14, position: "relative", overflow: "hidden" }}
    >
      {/* Accent glow top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #8B5CF6, #06B6D4)", opacity: 0.6 }} />

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "white", marginBottom: 4, lineHeight: 1.3 }}>
            {item.title}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <Briefcase size={12} style={{ opacity: 0.6 }} /> {item.company}
          </div>
        </div>
        <TypeBadge type={item.type} />
      </div>

      {/* Description */}
      {item.description && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
          {item.description.slice(0, 130)}{item.description.length > 130 ? "…" : ""}
        </p>
      )}

      {/* Tags row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <ModeBadge mode={item.mode} />
        {item.location && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: 8 }}>
            <MapPin size={10} /> {item.location}
          </span>
        )}
        {item.stipend && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#10B981", background: "rgba(16,185,129,0.08)", padding: "3px 9px", borderRadius: 8 }}>
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

      {/* Footer: deadline + CTA */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
        {daysLeft !== null && (
          <span style={{ fontSize: 11, fontWeight: 700, color: isExpired ? "#6B7280" : isUrgent ? "#F43F5E" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={10} />
            {isExpired ? "Deadline passed" : isUrgent ? `⚡ Only ${daysLeft}d left!` : `${daysLeft} days left`}
          </span>
        )}
        <motion.a
          href={item.apply_link}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10,
            background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))",
            border: "1px solid rgba(139,92,246,0.35)",
            color: "#A78BFA", fontSize: 12, fontWeight: 800, textDecoration: "none", marginLeft: "auto",
            transition: "all 0.15s ease",
          }}
        >
          Apply Now <ExternalLink size={12} />
        </motion.a>
      </div>
    </motion.div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
        background: active ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.03)",
        color: active ? "#A78BFA" : "var(--text-muted)",
        border: `1px solid ${active ? "rgba(139,92,246,0.4)" : "var(--border)"}`,
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

export default function InternshipsPage() {
  useSession();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [type, setType] = useState("All");
  const [mode, setMode] = useState("All");
  const [state, setState] = useState("All India");
  const [city, setCity] = useState("All Cities");
  const [showFilters, setShowFilters] = useState(false);

  const availableCities = useMemo(() => {
    if (!state || state === "All India") return [];
    return INDIA_DISTRICTS[state] || [];
  }, [state]);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const params = new URLSearchParams();
    if (domain !== "All") params.append("domain", domain);
    if (type !== "All") params.append("type", type);
    if (mode !== "All") params.append("mode", mode);
    if (state && state !== "All India") params.append("state", state);
    if (city && city !== "All Cities") params.append("location", city);

    setLoading(true);
    fetch(`${API_URL}/api/internships?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setInternships(d.internships || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [domain, type, mode, state, city]);

  const filtered = useMemo(() =>
    internships.filter((i) =>
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.company.toLowerCase().includes(search.toLowerCase()) ||
      i.domain.toLowerCase().includes(search.toLowerCase())
    ), [internships, search]);

  const activeFilterCount = [
    domain !== "All", type !== "All", mode !== "All",
    state !== "All India", city !== "All Cities"
  ].filter(Boolean).length;

  const clearFilters = () => {
    setDomain("All"); setType("All"); setMode("All");
    setState("All India"); setCity("All Cities"); setSearch("");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(139,92,246,0.1)", borderRadius: 30, color: "#8B5CF6", marginBottom: 16 }}>
          <Sparkles size={16} className="animate-pulse" />
          <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5 }}>Internship Discovery</span>
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-2px", marginBottom: 12, lineHeight: 1 }}>
          Find Your <span className="gradient-text">Dream Internship</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, lineHeight: 1.6 }}>
          {internships.length}+ curated opportunities — Free, Paid & Unpaid — across India & Remote. Filter by state, district, mode, and domain.
        </p>
      </motion.div>

      {/* Search + Filter Toggle Bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, company, or domain..."
            style={{ width: "100%", padding: "13px 14px 13px 44px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "white", fontSize: 14, boxSizing: "border-box" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(p => !p)}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 14,
            background: showFilters ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${showFilters ? "rgba(139,92,246,0.4)" : "var(--border)"}`,
            color: showFilters ? "#A78BFA" : "var(--text-secondary)", cursor: "pointer", fontWeight: 700, fontSize: 13,
            position: "relative",
          }}
        >
          <Filter size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span style={{ background: "#8B5CF6", color: "white", fontSize: 10, fontWeight: 900, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {activeFilterCount}
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 16px", borderRadius: 14, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "#F43F5E", cursor: "pointer", fontWeight: 700, fontSize: 13 }}
          >
            <X size={14} /> Clear All
          </button>
        )}
      </div>

      {/* Expandable Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginBottom: 24 }}
          >
            <div className="glass-card" style={{ padding: 28 }}>
              {/* Domain */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 12 }}>DOMAIN</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {DOMAINS.map((d) => <FilterChip key={d} label={d} active={domain === d} onClick={() => setDomain(d)} />)}
                </div>
              </div>

              {/* Type + Mode */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 22 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 12 }}>INTERNSHIP TYPE</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {TYPES.map((t) => (
                      <button key={t} onClick={() => setType(t)} style={{
                        flex: 1, minWidth: 60, padding: "9px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                        background: type === t ? (t === "Free" ? "rgba(6,182,212,0.15)" : t === "Paid" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)") : "rgba(255,255,255,0.03)",
                        color: type === t ? (t === "Free" ? "#06B6D4" : t === "Paid" ? "#10B981" : "white") : "var(--text-muted)",
                        border: `1px solid ${type === t ? (t === "Free" ? "rgba(6,182,212,0.35)" : t === "Paid" ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.12)") : "var(--border)"}`,
                        transition: "all 0.15s",
                      }}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 12 }}>MODE</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {MODES.map((m) => (
                      <button key={m} onClick={() => setMode(m)} style={{
                        flex: 1, minWidth: 60, padding: "9px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                        background: mode === m ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                        color: mode === m ? "#A78BFA" : "var(--text-muted)",
                        border: `1px solid ${mode === m ? "rgba(139,92,246,0.35)" : "var(--border)"}`,
                        transition: "all 0.15s",
                      }}>{m}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location — India State + District */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={12} /> LOCATION — INDIA
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  {/* State selector */}
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 8 }}>State</div>
                    <div style={{ position: "relative" }}>
                      <select
                        value={state}
                        onChange={(e) => { setState(e.target.value); setCity("All Cities"); }}
                        style={{ width: "100%", padding: "10px 36px 10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 13, fontWeight: 600, cursor: "pointer", appearance: "none" }}
                      >
                        {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                    </div>
                  </div>

                  {/* District/City selector */}
                  {availableCities.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 8 }}>District / City</div>
                      <div style={{ position: "relative" }}>
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          style={{ width: "100%", padding: "10px 36px 10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 13, fontWeight: 600, cursor: "pointer", appearance: "none" }}
                        >
                          {availableCities.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick state chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {INDIA_STATES.map((s) => (
                    <FilterChip key={s} label={s} active={state === s} onClick={() => { setState(s); setCity("All Cities"); }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600 }}>
          Showing <span style={{ color: "white", fontWeight: 800 }}>{filtered.length}</span> internships
          {activeFilterCount > 0 && <span style={{ color: "#8B5CF6" }}> · {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {type !== "All" && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(139,92,246,0.1)", color: "#A78BFA", fontWeight: 700 }}>Type: {type}</span>}
          {mode !== "All" && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(6,182,212,0.1)", color: "#06B6D4", fontWeight: 700 }}>Mode: {mode}</span>}
          {state !== "All India" && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(16,185,129,0.08)", color: "#10B981", fontWeight: 700 }}>{state}</span>}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 80, flexDirection: "column", gap: 16 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            style={{ width: 40, height: 40, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8B5CF6", borderRadius: "50%" }}
          />
          <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>Scanning Opportunities...</span>
        </div>
      ) : (
        <motion.div
          key={`${domain}-${type}-${mode}-${state}-${city}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))", gap: 20 }}
        >
          {filtered.map((item, i) => <InternshipCard key={item.id ?? i} item={item} />)}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 8 }}>No internships found</div>
              <div style={{ fontSize: 14, marginBottom: 24 }}>Try adjusting your filters or search query</div>
              <button onClick={clearFilters} style={{ padding: "12px 28px", borderRadius: 12, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#A78BFA", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                Clear All Filters
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
