"use client";

import React, { useEffect, useState } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import { BrainCircuit, Info } from "lucide-react";
import { API_URL } from "@/lib/api";

interface SkillRadarProps {
  token: string;
}

export function SkillRadar({ token }: SkillRadarProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/intelligence/skill-profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.radar_data) setData(result.radar_data);
      } catch (e) {
        console.error("Failed to fetch radar data", e);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  if (loading) return (
    <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
      Calibrating Neural Shape...
    </div>
  );

  return (
    <div style={{ padding: "28px", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6" }}>
            <BrainCircuit size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>Skill Intelligence</h3>
            <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Engineering Profile</p>
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.2)", cursor: "help" }}>
          <Info size={18} />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 240, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Student"
              dataKey="A"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.3}
              animationBegin={300}
              animationDuration={1500}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", marginBottom: 2 }}>Top Dimension</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#8B5CF6" }}>{data.reduce((prev, current) => (prev.A > current.A) ? prev : current).subject}</div>
        </div>
        <div style={{ padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", marginBottom: 2 }}>Symmetry Score</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#06B6D4" }}>{Math.round(data.reduce((acc, curr) => acc + curr.A, 0) / 6)}%</div>
        </div>
      </div>
    </div>
  );
}
