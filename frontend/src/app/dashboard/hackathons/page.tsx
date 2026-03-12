"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HACKATHONS = [
  {
    id: 1,
    title: "Global AI Hackathon 2026",
    org: "Anthropic & OpenAI",
    date: "April 15-17, 2026",
    prize: "$250,000",
    participants: 4500,
    tags: ["LLMs", "RAG", "Agents"],
    color: "#6C63FF",
    status: "Upcoming",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 2,
    title: "ETH Global Spring",
    org: "Ethereum Foundation",
    date: "May 1-3, 2026",
    prize: "$100,000",
    participants: 2100,
    tags: ["Web3", "Smart Contracts", "DeFi"],
    color: "#4ECDC4",
    status: "Open",
    image: "https://images.unsplash.com/photo-1622737133809-d95047b9e673?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 3,
    title: "FinTech Appathon",
    org: "Stripe",
    date: "May 20-22, 2026",
    prize: "$50,000",
    participants: 1200,
    tags: ["Payments", "SaaS", "Mobile"],
    color: "#FFD93D",
    status: "Upcoming",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 4,
    title: "Tulasi Internal Buildathon",
    org: "Tulasi AI",
    date: "June 5-7, 2026",
    prize: "Summer Internships 2026",
    participants: 500,
    tags: ["Education", "React", "FastAPI"],
    color: "#FF6B6B",
    status: "Open",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60"
  }
];

export default function HackathonsPage() {
  const [filter, setFilter] = useState("All");
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHackathons = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000"}/api/hackathons?tag=${filter}`);
        if (res.ok) {
          const data = await res.json();
          setHackathons(data.hackathons || []);
        }
      } catch (e) {
        console.error("Failed to fetch hackathons:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, [filter]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 12 }}>
          Global <span className="gradient-text">Hackathons</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          Build projects, win prizes, and get hired. Browse the top vetted hackathons occurring globally this season.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 40 }}>
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

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 32 }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="glass-card" style={{ height: 400, background: "rgba(255,255,255,0.02)", borderRadius: 24 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 32 }}>
          <AnimatePresence>
            {hackathons.map((hack) => (
              <motion.div 
                key={hack.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card"
                style={{ padding: 0, overflow: "hidden", border: `1px solid rgba(255,255,255,0.08)`, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)" }}
              >
                {/* Banner Image Area */}
                <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${hack.image_url || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&auto=format&fit=crop&q=60"})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.6)" }} />
                  
                  <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
                    {hack.date || "Upcoming"}
                  </div>

                  <div style={{ position: "absolute", top: 16, right: 16, background: "var(--brand-primary)", padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, color: "white", textTransform: "uppercase" }}>
                    {hack.status || "Open"}
                  </div>
                  
                  <div style={{ position: "absolute", bottom: 16, left: 16, display: "flex", gap: 8, flexWrap: "wrap", right: 16 }}>
                    {(hack.tags || "").split(",").map((tag: string) => (
                      <span key={tag} style={{ background: "rgba(124,58,237,0.8)", backdropFilter: "blur(4px)", padding: "4px 12px", borderRadius: 12, fontSize: 11, fontWeight: 700, color: "white" }}>
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 4, lineHeight: 1.2 }}>{hack.title}</h2>
                      <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 600 }}>By {hack.organization || "Hackathon Org"}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 24, marginTop: 16, marginBottom: 32 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 4 }}>Prize Pool</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--brand-primary)" }}>{hack.prize_pool || "Contact Org"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 4 }}>Builders</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>{hack.participants_count || 0}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: "auto", display: "flex", gap: 12 }}>
                    <button className="btn-primary" style={{ flex: 1, padding: 14, borderRadius: 12, fontWeight: 700 }}>
                      Apply Now
                    </button>
                    <button className="btn-ghost" style={{ padding: "0 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
                      Team Up
                    </button>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {hackathons.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60, color: "var(--text-muted)", fontSize: 16 }}>
               No hackathons found. Stay tuned for upcoming events!
            </div>
          )}
        </div>
      )}

    </div>
  );
}
