"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { hackathonApi } from "@/lib/api";

const FALLBACK_HACKATHONS = [
  {
    id: 1, title: "Global AI Hackathon 2026", organizer: "Anthropic & OpenAI",
    deadline: "April 15-17, 2026", prize_pool: "$250,000", participants_count: 4500,
    tags: "LLMs,RAG,Agents", status: "Upcoming", bookmarked: false,
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
    registration_link: "https://devpost.com",
  },
  {
    id: 2, title: "ETH Global Spring", organizer: "Ethereum Foundation",
    deadline: "May 1-3, 2026", prize_pool: "$100,000", participants_count: 2100,
    tags: "Web3,Smart Contracts,DeFi", status: "Open", bookmarked: false,
    image_url: "https://images.unsplash.com/photo-1622737133809-d95047b9e673?w=800&auto=format&fit=crop&q=60",
    registration_link: "https://ethglobal.com",
  },
  {
    id: 3, title: "FinTech Appathon", organizer: "Stripe",
    deadline: "May 20-22, 2026", prize_pool: "$50,000", participants_count: 1200,
    tags: "Payments,SaaS,Mobile", status: "Upcoming", bookmarked: false,
    image_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=60",
    registration_link: "https://stripe.com",
  },
  {
    id: 4, title: "Tulasi Internal Buildathon", organizer: "Tulasi AI",
    deadline: "June 5-7, 2026", prize_pool: "Summer Internships", participants_count: 500,
    tags: "Education,React,FastAPI", status: "Open", bookmarked: false,
    image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60",
    registration_link: "https://tulasiai.vercel.app",
  },
];

function HackathonSkeleton() {
  return (
    <div style={{ borderRadius: 24, overflow: "hidden", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", height: 420 }}>
      <div style={{ height: 180, background: "rgba(255,255,255,0.04)" }} />
      <div style={{ padding: 24 }}>
        <div style={{ height: 24, width: "70%", borderRadius: 8, background: "rgba(255,255,255,0.06)", marginBottom: 12 }} />
        <div style={{ height: 16, width: "40%", borderRadius: 8, background: "rgba(255,255,255,0.04)", marginBottom: 24 }} />
        <div style={{ height: 44, borderRadius: 12, background: "rgba(255,255,255,0.04)" }} />
      </div>
    </div>
  );
}

export default function HackathonsPage() {
  const { data: session } = useSession();
  const token = "";

  const [filter, setFilter] = useState("All");
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarking, setBookmarking] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchHackathons = async () => {
      setLoading(true);
      try {
        const data = await hackathonApi.list(undefined, filter !== "All" ? filter : undefined, token);
        const list = data.hackathons ?? [];
        setHackathons(list.length > 0 ? list : FALLBACK_HACKATHONS);
      } catch (e) {
        setHackathons(FALLBACK_HACKATHONS);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, [filter, token]);

  const toggleBookmark = async (hack: any) => {
    if (!token) return;
    setBookmarking(prev => new Set(prev).add(hack.id));
    try {
      if (hack.bookmarked) {
        await hackathonApi.unbookmark(hack.id, token);
      } else {
        await hackathonApi.bookmark(hack.id, token);
      }
      setHackathons(prev => prev.map(h => h.id === hack.id ? { ...h, bookmarked: !h.bookmarked } : h));
    } catch (e) {}
    setBookmarking(prev => { const s = new Set(prev); s.delete(hack.id); return s; });
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
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
          <button key={status} onClick={() => setFilter(status)}
            style={{
              background: filter === status ? "var(--brand-primary)" : "rgba(108,99,255,0.05)",
              color: filter === status ? "var(--bg-primary)" : "var(--text-muted)",
              border: filter === status ? "1px solid var(--brand-primary)" : "1px solid var(--border)",
              padding: "8px 24px", borderRadius: 24, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
            }}>
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
                style={{ padding: 0, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)" }}>
                
                {/* Banner */}
                <div style={{ position: "relative", height: 180, overflow: "hidden", background: "#0f0f1a" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${hack.image_url})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.6)" }} />
                  <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)", padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
                    {hack.deadline || "Date TBD"}
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
                <div style={{ padding: 22, flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-card)" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4, lineHeight: 1.3 }}>{hack.title}</h2>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 18 }}>By {hack.organizer || "Organizer"}</p>

                  <div style={{ display: "flex", gap: 24, marginBottom: 22 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 3 }}>Prize Pool</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "var(--brand-primary)" }}>{hack.prize_pool || "–"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 3 }}>Builders</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>{(hack.participants_count ?? 0).toLocaleString()}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: "auto", display: "flex", gap: 10 }}>
                    <button
                      onClick={() => hack.registration_link && window.open(hack.registration_link, "_blank")}
                      className="btn-primary" style={{ flex: 1, padding: 13, borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
                      Apply Now →
                    </button>
                    <button
                      onClick={() => toggleBookmark(hack)}
                      disabled={bookmarking.has(hack.id)}
                      title={hack.bookmarked ? "Remove bookmark" : "Bookmark this hackathon"}
                      style={{
                        padding: "0 16px", borderRadius: 12, fontSize: 18,
                        background: hack.bookmarked ? "rgba(251,191,36,0.15)" : "var(--background)",
                        border: hack.bookmarked ? "1px solid rgba(251,191,36,0.4)" : "1px solid var(--border)",
                        cursor: "pointer", transition: "all 0.2s",
                        opacity: bookmarking.has(hack.id) ? 0.6 : 1,
                      }}>
                      {hack.bookmarked ? "🔖" : "🏷️"}
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
