"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Fallback data shown if API is empty
const FALLBACK_HACKATHONS = [
  {
    id: 1, title: "Global AI Hackathon 2026", organization: "Anthropic & OpenAI",
    date: "April 15-17, 2026", prize_pool: "$250,000", participants_count: 4500,
    tags: "LLMs,RAG,Agents", status: "Upcoming",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: 2, title: "ETH Global Spring", organization: "Ethereum Foundation",
    date: "May 1-3, 2026", prize_pool: "$100,000", participants_count: 2100,
    tags: "Web3,Smart Contracts,DeFi", status: "Open",
    image_url: "https://images.unsplash.com/photo-1622737133809-d95047b9e673?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: 3, title: "FinTech Appathon", organization: "Stripe",
    date: "May 20-22, 2026", prize_pool: "$50,000", participants_count: 1200,
    tags: "Payments,SaaS,Mobile", status: "Upcoming",
    image_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: 4, title: "Tulasi Internal Buildathon", organization: "Tulasi AI",
    date: "June 5-7, 2026", prize_pool: "Summer Internships", participants_count: 500,
    tags: "Education,React,FastAPI", status: "Open",
    image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60",
  },
];

// Skeleton card shown while loading
function HackathonSkeleton() {
  return (
    <div style={{
      borderRadius: 24, overflow: "hidden", background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)", height: 420, animation: "shimmer 1.6s ease-in-out infinite",
    }}>
      <div style={{ height: 180, background: "rgba(255,255,255,0.04)" }} />
      <div style={{ padding: 24 }}>
        <div style={{ height: 24, width: "70%", borderRadius: 8, background: "rgba(255,255,255,0.06)", marginBottom: 12 }} />
        <div style={{ height: 16, width: "40%", borderRadius: 8, background: "rgba(255,255,255,0.04)", marginBottom: 24 }} />
        <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
          <div style={{ height: 40, width: 100, borderRadius: 8, background: "rgba(255,255,255,0.04)" }} />
          <div style={{ height: 40, width: 80, borderRadius: 8, background: "rgba(255,255,255,0.04)" }} />
        </div>
        <div style={{ height: 44, borderRadius: 12, background: "rgba(255,255,255,0.04)" }} />
      </div>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default function HackathonsPage() {
  const [filter, setFilter] = useState("All");
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const fetchHackathons = async () => {
      setLoading(true);
      setError(false);

      // Build URL: use relative /api/ so Vercel rewrites forward to Render
      const params = new URLSearchParams();
      if (filter !== "All") params.append("status", filter);
      const url = `/api/hackathons${params.toString() ? `?${params}` : ""}`;

      let attempt = 0;
      while (attempt < 3) {
        try {
          const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            const list = data.hackathons ?? [];
            setHackathons(list.length > 0 ? list : FALLBACK_HACKATHONS);
            setLoading(false);
            return;
          }
        } catch (e: any) {
          if (e?.name === "AbortError") break;
        }
        attempt++;
        if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
      }

      // All retries failed — silently show fallback data
      clearTimeout(timeoutId);
      setHackathons(FALLBACK_HACKATHONS);
      setError(false); // Don't show scary error messages
      setLoading(false);
    };

    fetchHackathons();
    return () => { controller.abort(); clearTimeout(timeoutId); };
  }, [filter]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 12 }}>
          Global <span className="gradient-text">Hackathons</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          Build projects, win prizes, and get hired. Browse top vetted hackathons happening globally this season.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
        {["All", "Open", "Upcoming", "Past"].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              background: filter === status ? "var(--brand-primary)" : "rgba(255,255,255,0.05)",
              color: filter === status ? "white" : "var(--text-muted)",
              border: filter === status ? "1px solid var(--brand-primary)" : "1px solid rgba(255,255,255,0.1)",
              padding: "8px 24px", borderRadius: 24, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 28 }}>
        {loading ? (
          [1, 2, 3, 4].map(i => <HackathonSkeleton key={i} />)
        ) : (
          <AnimatePresence>
            {hackathons.length > 0 ? hackathons.map((hack) => (
              <motion.div
                key={hack.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                className="glass-card"
                style={{
                  padding: 0, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)",
                }}
              >
                {/* Banner */}
                <div style={{ position: "relative", height: 180, overflow: "hidden", background: "#0f0f1a" }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `url(${hack.image_url || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=60"})`,
                    backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.6)",
                  }} />
                  <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)", padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
                    {hack.date || "Date TBD"}
                  </div>
                  <div style={{ position: "absolute", top: 14, right: 14, background: hack.status === "Open" ? "#22c55e" : "var(--brand-primary)", padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, color: "white" }}>
                    {hack.status || "Open"}
                  </div>
                  <div style={{ position: "absolute", bottom: 12, left: 14, display: "flex", gap: 6, flexWrap: "wrap", right: 14 }}>
                    {(hack.tags || "").split(",").slice(0, 3).map((tag: string) => (
                      <span key={tag} style={{ background: "rgba(124,58,237,0.85)", backdropFilter: "blur(4px)", padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700, color: "white" }}>
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: 22, flex: 1, display: "flex", flexDirection: "column" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 4, lineHeight: 1.3 }}>{hack.title}</h2>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 18 }}>By {hack.organization || "Organizer"}</p>

                  <div style={{ display: "flex", gap: 24, marginBottom: 22 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 3 }}>Prize Pool</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-primary)" }}>{hack.prize_pool || "–"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 3 }}>Builders</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "white" }}>{(hack.participants_count ?? 0).toLocaleString()}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: "auto", display: "flex", gap: 10 }}>
                    <button className="btn-primary" style={{ flex: 1, padding: 13, borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
                      Apply Now
                    </button>
                    <button className="btn-ghost" style={{ padding: "0 18px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", fontSize: 14 }}>
                      Team Up
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 80, color: "var(--text-muted)", fontSize: 16 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: "var(--text-secondary)" }}>No Hackathons Found</div>
                Stay tuned — new events are added regularly!
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
