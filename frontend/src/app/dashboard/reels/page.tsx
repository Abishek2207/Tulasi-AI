"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Trending", "Career", "Code", "System Design"];

const ALL_REELS = [
  {
    id: 1,
    title: "100 Seconds of Code: React Hooks",
    username: "@fireship",
    category: "Code",
    description: "Master useState and useEffect in exactly 100 seconds! ⚡️ #reactjs #webdev",
    likes: "42.1K",
    comments: "842",
    shares: "1.2K",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 2,
    title: "How to Center a Div IN 2026",
    username: "@css_wizard",
    category: "Code",
    description: "Still struggling with flexbox? Here is the absolute easiest way. 🎨 #css #frontend",
    likes: "128K",
    comments: "5.4K",
    shares: "12K",
    thumbnail: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 3,
    title: "Build a RAG AI App in 5 Minutes",
    username: "@ai_engineer",
    category: "Trending",
    description: "LangChain + Local Embeddings + Next.js = Magic 🪄 #ai #python #nextjs",
    likes: "89.2K",
    comments: "1.1K",
    shares: "4.5K",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 4,
    title: "How I Negotiated a $300k Salary",
    username: "@tech_career",
    category: "Career",
    description: "Never accept the first offer. Here is my exact script. 💰 #career #salary",
    likes: "210K",
    comments: "4.2K",
    shares: "25K",
    thumbnail: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 5,
    title: "CAP Theorem Explained in 60s",
    username: "@system_pro",
    category: "System Design",
    description: "Consistency, Availability, Partition Tolerance. Choose two. ⚙️ #systemdesign",
    likes: "55.4K",
    comments: "320",
    shares: "2.1K",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60"
  }
];

export default function ReelsPage() {
  const [activeCategory, setActiveCategory] = useState("Trending");
  const [isLoading, setIsLoading] = useState(false);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  };

  const filteredReels = ALL_REELS.filter(r => r.category === activeCategory || activeCategory === "Trending");

  return (
    <div style={{ position: "relative", height: "calc(100vh - 120px)", display: "flex", justifyContent: "center", background: "#000", borderRadius: 24, overflow: "hidden" }}>
      
      {/* Top Floating Category Bar */}
      <div style={{ position: "absolute", top: 24, zIndex: 50, display: "flex", gap: 12, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", padding: "8px 16px", borderRadius: 32, border: "1px solid rgba(255,255,255,0.1)" }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            style={{
              background: activeCategory === cat ? "white" : "transparent",
              color: activeCategory === cat ? "black" : "rgba(255,255,255,0.8)",
              border: "none", padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", color: "white" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 40, height: 40, border: "4px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%" }} />
        </div>
      ) : (
        <div style={{ 
          width: "100%", maxWidth: 480, height: "100%", overflowY: "scroll", 
          scrollSnapType: "y mandatory", scrollBehavior: "smooth",
          msOverflowStyle: "none", scrollbarWidth: "none"
        }}>
          <style>{`
            ::-webkit-scrollbar { display: none; }
          `}</style>
          
          <AnimatePresence>
            {filteredReels.map((reel) => (
              <motion.div 
                key={reel.id} 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ 
                  height: "100%", width: "100%", scrollSnapAlign: "start", 
                  position: "relative", backgroundColor: "#111", borderBottom: "1px solid #222"
                }}
              >
                {/* Mock Video Layer */}
                <div style={{ 
                  position: "absolute", inset: 0, 
                  backgroundImage: `url(${reel.thumbnail})`, 
                  backgroundSize: "cover", backgroundPosition: "center",
                  opacity: 0.7
                }} />
                
                {/* Mock Playing Indicator */}
                <div style={{ position: "absolute", top: 80, left: 20, display: "flex", gap: 10, alignItems: "center", background: "rgba(0,0,0,0.5)", padding: "6px 16px", borderRadius: 20 }}>
                  <div style={{ width: 8, height: 8, background: "#FF6B6B", borderRadius: "50%", boxShadow: "0 0 10px #FF6B6B" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{reel.category} Tip</span>
                </div>

                {/* Bottom Info Overlay */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 80, padding: "32px 20px 40px", background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "white" }}>
                      {reel.username[1].toUpperCase()}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.5)", margin: 0 }}>{reel.username}</h3>
                    <button style={{ background: "transparent", border: "1px solid white", color: "white", padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700, marginLeft: 8 }}>Follow</button>
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8, textShadow: "0 2px 4px rgba(0,0,0,0.5)", margin: 0 }}>{reel.title}</h2>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.4, margin: 0, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{reel.description}</p>
                </div>

                {/* Right Action Bar */}
                <div style={{ position: "absolute", bottom: 40, right: 16, display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ background: "transparent", border: "none", color: "white", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 24, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>❤️</div>
                    <span style={{ fontSize: 12, fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{reel.likes}</span>
                  </motion.button>
                  
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ background: "transparent", border: "none", color: "white", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 24, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>💬</div>
                    <span style={{ fontSize: 12, fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{reel.comments}</span>
                  </motion.button>

                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ background: "transparent", border: "none", color: "white", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 24, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>↗️</div>
                    <span style={{ fontSize: 12, fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{reel.shares}</span>
                  </motion.button>

                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} style={{ width: 48, height: 48, borderRadius: 8, backgroundImage: `url(${reel.thumbnail})`, backgroundSize: "cover", border: "2px solid white", marginTop: 16 }} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
