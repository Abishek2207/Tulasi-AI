"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Users, Trophy, Globe, MapPin, Bookmark, ExternalLink } from "lucide-react";

interface Hackathon {
  id: number;
  title: string;
  organizer: string;
  description: string;
  prize_pool: string;
  deadline: string;
  registration_link: string;
  tags: string;
  image_url: string;
  participants_count: number;
  status: string;
  bookmarked: boolean;
  applied: boolean;
  application_status: string;
  mode: string;
  difficulty: string;
  team_size: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  domains: string;
  currency: string;
  location?: string;
}

interface Props {
  hackathon: Hackathon;
  onBookmark: (id: number) => void;
  onApply: (id: number) => void;
  isBookmarking?: boolean;
  isApplying?: boolean;
}

export default function HackathonCard({ hackathon, onBookmark, onApply, isBookmarking, isApplying }: Props) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(hackathon.registration_deadline || hackathon.deadline).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Ended");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) setTimeLeft(`${days}d ${hours}h`);
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m`);
      else setTimeLeft(`${mins}m left`);
    }, 60000);

    // Initial run
    const targetInitial = new Date(hackathon.registration_deadline || hackathon.deadline).getTime();
    const nowInitial = new Date().getTime();
    const diffInitial = targetInitial - nowInitial;
    if (diffInitial > 0) {
      const d = Math.floor(diffInitial / (1000 * 60 * 60 * 24));
      const h = Math.floor((diffInitial % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setTimeLeft(`${d}d ${h}h`);
    } else {
      setTimeLeft("Ended");
    }

    return () => clearInterval(timer);
  }, [hackathon.registration_deadline, hackathon.deadline]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="glass-card"
      style={{
        padding: 0,
        overflow: "hidden",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        transition: "border-color 0.3s ease",
      }}
    >
      {/* Banner & Glass Overlays */}
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        <img
          src={hackathon.image_url}
          alt={hackathon.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }}
        />
        
        {/* Countdown Overlay */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: "rgba(10,10,15,0.6)", backdropFilter: "blur(12px)",
          padding: "6px 12px", borderRadius: 20,
          display: "flex", alignItems: "center", gap: 6,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}>
          <Clock size={12} className="text-brand" />
          <span style={{ fontSize: 11, fontWeight: 900, color: "white", letterSpacing: 0.5 }}>
            {timeLeft}
          </span>
        </div>

        {/* Mode & Difficulty Badge */}
        <div style={{
          position: "absolute", top: 12, right: 12, display: "flex", gap: 6
        }}>
          <div style={{
            background: hackathon.mode === "Online" ? "rgba(16,185,129,0.2)" : "rgba(139,92,246,0.2)",
            padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 900, color: "white",
            textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.1)"
          }}>
            {hackathon.mode}
          </div>
        </div>

        {/* Domains Overlay */}
        <div style={{
          position: "absolute", bottom: 12, left: 12, display: "flex", gap: 6, flexWrap: "wrap", right: 60
        }}>
          {(hackathon.domains || hackathon.tags || "").split(",").slice(0, 3).map((d) => (
            <span key={d} style={{
              background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)",
              padding: "3px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700, color: "white",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
              {d.trim()}
            </span>
          ))}
        </div>

        {/* Bookmark Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onBookmark(hackathon.id); }}
          disabled={isBookmarking}
          style={{
            position: "absolute", bottom: 12, right: 12,
            width: 36, height: 36, borderRadius: 10,
            background: hackathon.bookmarked ? "var(--brand-primary)" : "rgba(10,10,15,0.5)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s",
            color: hackathon.bookmarked ? "var(--bg-primary)" : "white"
          }}
        >
          <Bookmark size={16} fill={hackathon.bookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", lineHeight: 1.2 }}>{hackathon.title}</h3>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 14 }}>
          by {hackathon.organizer}
        </p>

        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 20, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {hackathon.description}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>Prize Pool</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Trophy size={14} className="text-brand" />
              <span style={{ fontSize: 15, fontWeight: 900, color: "var(--brand-primary)" }}>{hackathon.prize_pool}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>Difficulty</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>{hackathon.difficulty}</div>
          </div>
        </div>

        {/* Location / Meta */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
            <Users size={14} /> {hackathon.team_size}
          </div>
          {hackathon.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
              <MapPin size={14} /> {hackathon.location}
            </div>
          )}
          {hackathon.mode === "Online" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
              <Globe size={14} /> Virtual
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ marginTop: "auto", display: "flex", gap: 12 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (hackathon.registration_link) window.open(hackathon.registration_link, "_blank");
              onApply(hackathon.id);
            }}
            disabled={hackathon.applied || isApplying}
            className="btn-primary"
            style={{
              flex: 1, padding: "12px", borderRadius: 12, fontWeight: 900, fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: hackathon.applied ? 0.6 : 1,
              cursor: hackathon.applied ? "not-allowed" : "pointer"
            }}
          >
            {hackathon.applied ? "Applied" : "Apply Now"} <ExternalLink size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
