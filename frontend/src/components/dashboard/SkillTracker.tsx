"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Zap, Trophy, BrainCircuit, Server, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface SkillItem {
  name: string;
  progress: number;
  category: string;
}

export function SkillTracker({ userType = "student" }: { userType?: string }) {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDefault, setIsDefault] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const token = localStorage.getItem("tulasi_token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/profile/skills`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setSkills(data.skills || []);
          setIsDefault(data.is_default);
        }
      } catch (err) {
        console.error("Failed to load skills:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const getCategoryTheme = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes("placement") || lower.includes("dsa")) return { color: "#10B981", bg: "rgba(16, 185, 129, 0.1)", icon: <Target size={16} color="#10B981" /> };
    if (lower.includes("cloud") || lower.includes("devops")) return { color: "#06B6D4", bg: "rgba(6, 182, 212, 0.1)", icon: <Server size={16} color="#06B6D4" /> };
    if (lower.includes("ai") || lower.includes("machine")) return { color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)", icon: <BrainCircuit size={16} color="#8B5CF6" /> };
    if (lower.includes("architecture") || lower.includes("system")) return { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", icon: <Activity size={16} color="#F59E0B" /> };
    return { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)", icon: <Zap size={16} color="#3B82F6" /> };
  };

  const currentFocus = skills.length > 0 ? skills.reduce((prev, current) => 
    (current.progress < 100 && current.progress >= prev.progress) ? current : prev
  ) : null;

  return (
    <div style={{ 
      background: "rgba(255,255,255,0.015)", 
      border: "1px solid rgba(255,255,255,0.04)", 
      borderRadius: "24px", 
      padding: "24px",
      display: "flex", 
      flexDirection: "column", 
      gap: "20px" 
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "white", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <Trophy size={18} color="#FFD700" />
          Skill Progression Tracking
        </h3>
        {isDefault && !loading && (
          <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "8px", color: "var(--text-muted)" }}>
            RECOMMENDED BASELINE
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
        </div>
      ) : skills.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: "14px" }}>
          Configure your target skills in your profile to start tracking.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {skills.map((skill, idx) => {
            const theme = getCategoryTheme(skill.category);
            const isFocus = currentFocus && currentFocus.name === skill.name;
            
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {theme.icon}
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: isFocus ? "white" : "var(--text-secondary)" }}>
                      {skill.name}
                    </span>
                    {isFocus && (
                      <span style={{ fontSize: "10px", fontWeight: 800, color: theme.color, border: `1px solid ${theme.color}40`, padding: "2px 6px", borderRadius: "6px" }}>
                        CURRENT FOCUS
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)" }}>{skill.progress}%</span>
                </div>
                
                {/* Progress bar background */}
                <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                  {/* Fill inner */}
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.1 * idx }}
                    style={{ 
                      height: "100%", 
                      background: theme.color,
                      borderRadius: "4px",
                      boxShadow: `0 0 10px ${theme.color}80` 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
