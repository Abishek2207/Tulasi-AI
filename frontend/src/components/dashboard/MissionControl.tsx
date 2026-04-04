"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Target, Shield, Sparkles, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

interface Mission {
  mission_title: string;
  mission_description: string;
  reward_xp: number;
  module_link: string;
}

import { intelligenceApi } from "@/lib/api";

export function MissionControl({ token }: { token: string }) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const data = await intelligenceApi.getDailyMission();
        setMission(data);
      } catch (e) {
        setMission({
          mission_title: "Neural Sync",
          mission_description: "Initialize your learning sequence by exploring a new roadmap concept today.",
          reward_xp: 100,
          module_link: "/dashboard/roadmaps"
        });
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchMission();
  }, [token]);

  const handleAccept = () => {
    setAccepted(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8B5CF6", "#06B6D4", "#F43F5E"]
    });
  };

  if (loading) return <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>SYNCING WITH CAREER ARCHITECT...</div>;
  if (!mission) return null;

  return (
    <div className="glass-card-premium" style={{ 
      padding: "28px", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column", 
      background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(244,63,94,0.05))", 
      position: "relative", 
      overflow: "hidden",
      borderRadius: 32,
      border: "1px solid rgba(139,92,246,0.2)",
      boxSizing: "border-box"
    }}>
      <div className="neural-pulse" style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)", filter: "blur(20px)", zIndex: 0 }} />
      <div className="animate-shimmer" style={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none" }} />
      
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, position: "relative", zIndex: 1 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(244,63,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F43F5E", boxShadow: "0 8px 16px rgba(244,63,94,0.1)" }}>
          <Rocket size={24} className={accepted ? "animate-bounce" : ""} />
        </div>
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 }}>Mission Control</h3>
          <p style={{ fontSize: 11, color: "#F43F5E", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>Directive Active</p>
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
        <h2 style={{ fontSize: "clamp(20px, 2.5vw, 26px)", fontWeight: 900, marginBottom: 12, color: "white", fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px", lineHeight: 1.2 }}>{mission.mission_title}</h2>
        <p style={{ fontSize: "clamp(13px, 1.5vw, 15px)", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24, fontWeight: 500 }}>
          {mission.mission_description}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: "6px 14px", borderRadius: 30, background: "rgba(139,92,246,0.15)", color: "#8B5CF6", fontSize: 11, fontWeight: 900, letterSpacing: 1, border: "1px solid rgba(139,92,246,0.2)" }}>
            +{mission.reward_xp} XP
          </div>
          <div style={{ color: "rgba(255,255,255,0.2)" }}><Shield size={18} /></div>
        </div>

        {!accepted ? (
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAccept}
            style={{ padding: "12px 24px", borderRadius: 14, border: "none", background: "white", color: "black", fontWeight: 900, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
          >
            Engage Mission <Sparkles size={14} />
          </motion.button>
        ) : (
          <motion.a 
            href={mission.module_link}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            style={{ padding: "12px 24px", borderRadius: 14, border: "none", background: "#F43F5E", color: "white", fontWeight: 900, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textDecoration: "none", boxShadow: "0 10px 20px rgba(244,63,94,0.3)" }}
          >
            Open Sequence <ArrowRight size={14} />
          </motion.a>
        )}
      </div>
    </div>
  );
}
