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
    <div style={{ padding: "28px", height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(244,63,94,0.05))", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)", filter: "blur(20px)" }} />
      
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(244,63,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F43F5E" }}>
          <Rocket size={22} className={accepted ? "animate-bounce" : ""} />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>Mission Control</h3>
          <p style={{ fontSize: 11, color: "#F43F5E", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Daily Directive</p>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, color: "white", fontFamily: "var(--font-outfit)" }}>{mission.mission_title}</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
          {mission.mission_description}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ padding: "4px 10px", borderRadius: 20, background: "rgba(139,92,246,0.15)", color: "#8B5CF6", fontSize: 12, fontWeight: 900 }}>
            +{mission.reward_xp} XP
          </div>
          <div style={{ color: "rgba(255,255,255,0.2)" }}><Shield size={16} /></div>
        </div>

        {!accepted ? (
          <button 
            onClick={handleAccept}
            style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "white", color: "black", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            Engage Mission <Sparkles size={14} />
          </button>
        ) : (
          <motion.a 
            href={mission.module_link}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "#F43F5E", color: "white", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
          >
            Go to Module <ArrowRight size={14} />
          </motion.a>
        )}
      </div>
    </div>
  );
}
