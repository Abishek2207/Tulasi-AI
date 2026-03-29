"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { hackathonApi, Hackathon } from "@/lib/api";
import toast from "react-hot-toast";

// New Components
import HackathonCard from "@/components/dashboard/hackathons/HackathonCard";
import FilterSidebar from "@/components/dashboard/hackathons/FilterSidebar";
import AIRecommender from "@/components/dashboard/hackathons/AIRecommender";

function SkeletonGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="glass-card" style={{ height: 440, opacity: 0.1, background: "rgba(255,255,255,0.05)" }} />
      ))}
    </div>
  );
}

export default function HackathonsDiscoveryPage() {
  const { data: session } = useSession();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  // Filter State
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [mode, setMode] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [activeTab, setActiveTab] = useState("Discovery");

  // Data State
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const LIMIT = 12;

  // Actions State
  const [bookmarking, setBookmarking] = useState<Set<number>>(new Set());
  const [applying, setApplying] = useState<Set<number>>(new Set());

  const fetchHackathons = useCallback(async (isLoadMore = false) => {
    if (!token) return;
    if (isLoadMore) setLoadingMore(true);
    else {
      setLoading(true);
      setOffset(0);
    }

    try {
      let data: any;
      if (activeTab === "Saved") {
        data = await hackathonApi.bookmarked(token);
        setHackathons(data.hackathons || []);
        setTotal(data.hackathons?.length || 0);
      } else if (activeTab === "Applied") {
        data = await hackathonApi.list(undefined, undefined, q, difficulty, mode, token, 100, 0);
        const filtered = (data.hackathons || []).filter((h: Hackathon) => h.applied);
        setHackathons(filtered);
        setTotal(filtered.length);
      } else {
        // Discovery
        const currentOffset = isLoadMore ? offset + LIMIT : 0;
        data = await hackathonApi.list(domain, undefined, q, difficulty, mode, token, LIMIT, currentOffset);
        
        if (isLoadMore) {
          setHackathons(prev => [...prev, ...(data.hackathons || [])]);
          setOffset(currentOffset);
        } else {
          setHackathons(data.hackathons || []);
        }
        setTotal(data.total || 0);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch events");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [token, activeTab, domain, difficulty, mode, q, offset]);

  // Initial Fetch & Filter Response
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHackathons(false);
    }, 300); // Debounce search/filters
    return () => clearTimeout(timer);
  }, [fetchHackathons, q, domain, difficulty, mode, activeTab]);

  const toggleBookmark = async (id: number) => {
    setBookmarking(prev => new Set(prev).add(id));
    try {
      const h = hackathons.find(x => x.id === id);
      if (h?.bookmarked) {
        await hackathonApi.unbookmark(id, token);
        toast.success("Removed from bookmarks");
      } else {
        await hackathonApi.bookmark(id, token);
        toast.success("Added to bookmarks!");
      }
      setHackathons(prev => prev.map(h => h.id === id ? { ...h, bookmarked: !h.bookmarked } : h));
    } catch (e) {
      toast.error("Action failed");
    } finally {
      setBookmarking(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const applyHackathon = async (id: number) => {
    setApplying(prev => new Set(prev).add(id));
    try {
      await hackathonApi.apply(id, token);
      setHackathons(prev => prev.map(h => h.id === id ? { ...h, applied: true, application_status: "Applied" } : h));
      toast.success("Application tracked!");
    } catch (e) {
      toast.error("Application tracking failed");
    } finally {
      setApplying(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto", display: "flex", gap: 32, padding: "20px 0 60px 0" }}>
      
      {/* 1. Sidebar (Filters) */}
      <aside style={{ width: 320, flexShrink: 0, position: "sticky", top: 20, height: "fit-content" }}>
        <FilterSidebar 
          q={q} setQ={setQ}
          domain={domain} setDomain={setDomain}
          difficulty={difficulty} setDifficulty={setDifficulty}
          mode={mode} setMode={setMode}
          sort={sort} setSort={setSort}
          activeTab={activeTab} setActiveTab={setActiveTab}
        />
      </aside>

      {/* 2. Main Content */}
      <main style={{ flex: 1, minWidth: 0 }}>
        
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "white", marginBottom: 8 }}>
            Hackathon <span className="gradient-text">Discovery</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 16 }}>
            {activeTab === "Discovery" 
              ? "Browse, filter, and apply to world-class developer events." 
              : activeTab === "Saved" 
                ? "Your bookmarked events for quick access."
                : "Tracking your active participations and applications."
            }
          </p>
        </header>

        {/* AI Recommendations Bar */}
        <AnimatePresence>
          {activeTab === "Discovery" && <AIRecommender />}
        </AnimatePresence>

        {/* Results Info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>
            Showing {hackathons.length} of {total} {activeTab.toLowerCase()} items
          </div>
          <div style={{ fontSize: 12, color: "var(--brand-primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>
            {loading ? "Syncing..." : "Updated Just Now"}
          </div>
        </div>

        {/* Grid */}
        {loading && offset === 0 ? (
          <SkeletonGrid />
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", 
            gap: 28 
          }}>
            <AnimatePresence mode="popLayout">
              {hackathons.map((h) => (
                <HackathonCard
                  key={h.id}
                  hackathon={h}
                  onBookmark={toggleBookmark}
                  onApply={applyHackathon}
                  isBookmarking={bookmarking.has(h.id)}
                  isApplying={applying.has(h.id)}
                />
              ))}
            </AnimatePresence>

            {hackathons.length === 0 && !loading && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ gridColumn: "1 / -1", textAlign: "center", padding: "100px 0", background: "rgba(255,255,255,0.02)", borderRadius: 32, border: "1px dashed rgba(255,255,255,0.1)" }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "white", marginBottom: 8 }}>No results matched your criteria</h3>
                <p style={{ color: "var(--text-muted)" }}>Try adjusting your filters or search query.</p>
                <button 
                  onClick={() => { setQ(""); setDomain("All"); setDifficulty("All"); setMode("All"); }}
                  style={{ marginTop: 24, padding: "10px 24px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", cursor: "pointer", fontWeight: 700 }}
                >
                  Reset all filters
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Load More */}
        {hackathons.length < total && !loading && (
          <div style={{ marginTop: 60, textAlign: "center" }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchHackathons(true)}
              disabled={loadingMore}
              style={{
                padding: "16px 48px", borderRadius: 30, fontSize: 16, fontWeight: 900,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, margin: "0 auto",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
              }}
            >
              {loadingMore ? "Loading..." : "View More Opportunities"}
              {!loadingMore && <span>↓</span>}
            </motion.button>
          </div>
        )}
      </main>
    </div>
  );
}
