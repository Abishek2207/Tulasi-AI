"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const MOCK_REELS = [
  {
    id: 1,
    title: "100 Seconds of Code: React Hooks",
    username: "@fireship",
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
    description: "LangChain + Local Embeddings + Next.js = Magic 🪄 #ai #python #nextjs",
    likes: "89.2K",
    comments: "1.1K",
    shares: "4.5K",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=60"
  }
];

export default function ReelsPage() {
  // In a real app we'd track intersection observer to auto-play/pause videos
  // For the MVP we're building a visually accurate CSS snap-scrolling shell

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", justifyContent: "center", background: "#000", borderRadius: 24, overflow: "hidden" }}>
      
      {/* Scrollable Container with CSS Snap */}
      <div style={{ 
        width: "100%", maxWidth: 480, height: "100%", overflowY: "scroll", 
        scrollSnapType: "y mandatory", scrollBehavior: "smooth",
        /* Hide scrollbar for a native app feel */
        msOverflowStyle: "none", scrollbarWidth: "none"
      }}>
        <style>{`
          ::-webkit-scrollbar { display: none; }
        `}</style>

        {MOCK_REELS.map((reel) => (
          <div key={reel.id} style={{ 
            height: "100%", width: "100%", scrollSnapAlign: "start", 
            position: "relative", backgroundColor: "#111", borderBottom: "1px solid #222"
          }}>
            
            {/* Mock Video Layer */}
            <div style={{ 
              position: "absolute", inset: 0, 
              backgroundImage: `url(${reel.thumbnail})`, 
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: 0.6
            }} />
            
            {/* Mock Playing Indicator */}
            <div style={{ position: "absolute", top: 20, left: 20, display: "flex", gap: 10, alignItems: "center", background: "rgba(0,0,0,0.5)", padding: "6px 16px", borderRadius: 20 }}>
              <div style={{ width: 8, height: 8, background: "#FF6B6B", borderRadius: "50%", boxShadow: "0 0 10px #FF6B6B" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Live Tutorial</span>
            </div>

            {/* Bottom Info Overlay */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 80, padding: "32px 20px 40px", background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 20, background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>
                  {reel.username[1].toUpperCase()}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>{reel.username}</h3>
                <button style={{ background: "transparent", border: "1px solid white", color: "white", padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700, marginLeft: 8 }}>Follow</button>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>{reel.title}</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.4, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{reel.description}</p>
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

              <motion.div style={{ width: 48, height: 48, borderRadius: 8, background: `url(${reel.thumbnail})`, backgroundSize: "cover", border: "2px solid white", marginTop: 16, animation: "spin 10s linear infinite" }} />
              
            </div>

          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
