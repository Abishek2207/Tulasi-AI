"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const REELS = [
    { id: 1, title: "How Large Language Models Work", author: "Computerphile", views: "1.2M", likes: "45K", category: "AI/ML", type: "youtube", videoId: "LPZh9BOjkQs", emoji: "🤖" },
    { id: 2, title: "Neural Networks explained in 60s", author: "TulasiAI Docs", views: "14K", likes: "1.2K", category: "AI/ML", type: "youtube", videoId: "rEDzUT3ybC4", emoji: "🧠" },
    { id: 3, title: "Python decorators simply explained", author: "CodeWithMosh", views: "82K", likes: "4.1K", category: "Backend", type: "youtube", videoId: "iM99wRmvNfI", emoji: "🐍" },
    { id: 4, title: "React Virtual DOM in 1 minute", author: "Frontend Labs", views: "25K", likes: "1.8K", category: "Frontend", type: "youtube", videoId: "7Yh9t_08lR8", emoji: "⚛️" },
    { id: 5, title: "The P vs NP Problem explained", author: "Veritasium", views: "4.5M", likes: "210K", category: "DSA", type: "youtube", videoId: "YX40hbAHx3s", emoji: "🧩" },
    { id: 6, title: "Docker Containerization basics", author: "DevOps Daily", views: "34K", likes: "2.5K", category: "DevOps", type: "youtube", videoId: "fq88H00I-iM", emoji: "🐳" },
    { id: 7, title: "AI Math Trick (Multiplication)", author: "Math Wiz", views: "1.2M", likes: "82K", category: "DSA", type: "instagram", videoId: "Cw5n9jGg4Rk", emoji: "🧮" },
];

const CATS = ["All", "AI/ML", "Frontend", "Backend", "DevOps", "DSA"];

export default function ReelsPage() {
    const [selectedReel, setSelectedReel] = useState<typeof REELS[0] | null>(null);
    const [filter, setFilter] = useState("All");

    const filtered = REELS.filter((r) => filter === "All" || r.category === filter);

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 40 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: 8, background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>📹 Educational Reels</h1>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Curated byte-sized learning from across the web. Stay updated in minutes.</p>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ background: "rgba(124,58,237,0.1)", padding: "8px 16px", borderRadius: 12, border: "1px solid rgba(124,58,237,0.2)" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a78bfa" }}>DAILY GOAL: 3/5 REELS</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: 10, marginBottom: 30, overflowX: "auto", paddingBottom: 8 }} className="hide-scrollbar">
                    {CATS.map((c) => (
                        <button key={c} onClick={() => setFilter(c)} style={{
                            padding: "8px 20px", borderRadius: 25, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                            background: filter === c ? "var(--gradient-primary)" : "rgba(255,255,255,0.03)",
                            border: filter === c ? "none" : "1px solid var(--border)", color: "var(--text-primary)",
                            whiteSpace: "nowrap", transition: "all 0.2s"
                        }}>{c}</button>
                    ))}
                </div>

                {/* Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                    {filtered.map((reel, i) => (
                        <div key={reel.id} className="feature-card" style={{
                            cursor: "pointer", padding: 0, overflow: "hidden",
                            border: "1px solid var(--border)",
                            background: "rgba(255,255,255,0.01)"
                        }} onClick={() => setSelectedReel(reel)}>
                            {/* Thumbnail Overlay */}
                            <div style={{
                                height: 400, position: "relative",
                                background: `linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%), 
                                            linear-gradient(135deg, ${["#7c3aed", "#2563eb", "#ec4899"][i % 3]}40, #000)`,
                                display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 20
                            }}>
                                <div style={{ position: "absolute", top: "45%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "4rem", opacity: 0.8 }}>
                                    {reel.emoji}
                                </div>
                                <div style={{
                                    width: 48, height: 48, borderRadius: "50%", background: "rgba(124,58,237,0.8)",
                                    position: "absolute", top: "45%", left: "50%", transform: "translate(-50%, -50%)",
                                    display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white",
                                    boxShadow: "0 0 20px rgba(124,58,237,0.5)"
                                }}>
                                    <span style={{ fontSize: "1.2rem", color: "white", marginLeft: 4 }}>▶</span>
                                </div>

                                <div style={{ zIndex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "white", marginBottom: 4, lineHeight: 1.2 }}>{reel.title}</div>
                                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", display: "flex", gap: 8, alignItems: "center" }}>
                                        <span>{reel.author}</span>
                                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
                                        <span>{reel.views} views</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Video Modal */}
                {selectedReel && (
                    <div style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.95)", zIndex: 1000,
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 20
                    }} onClick={() => setSelectedReel(null)}>
                        <div style={{
                            width: "100%", maxWidth: 450, height: "85vh", position: "relative",
                            background: "#000", borderRadius: 20, overflow: "hidden",
                            boxShadow: "0 0 50px rgba(124,58,237,0.3)", border: "1px solid rgba(255,255,255,0.1)"
                        }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => setSelectedReel(null)} style={{
                                position: "absolute", top: 20, right: 20, zIndex: 10,
                                background: "rgba(0,0,0,0.5)", color: "white", border: "none",
                                width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem"
                            }}>×</button>

                            <iframe
                                width="100%"
                                height="100%"
                                src={selectedReel.type === "youtube"
                                    ? `https://www.youtube.com/embed/${selectedReel.videoId}?autoplay=1&controls=0&rel=0`
                                    : `https://www.instagram.com/reels/${selectedReel.videoId}/embed/`}
                                title={selectedReel.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />

                            <div style={{
                                position: "absolute", bottom: 0, left: 0, right: 0,
                                padding: "40px 20px 20px",
                                background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
                                pointerEvents: "none"
                            }}>
                                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                                    <span className="badge badge-purple">{selectedReel.category}</span>
                                    <span style={{ fontSize: "0.8rem", color: "white", fontWeight: 600 }}>❤️ {selectedReel.likes}</span>
                                </div>
                                <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "white", marginBottom: 4 }}>{selectedReel.title}</h2>
                                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>{selectedReel.author}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
