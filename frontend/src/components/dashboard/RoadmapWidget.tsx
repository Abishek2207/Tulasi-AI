"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Target, Clock, ArrowRight, CheckCircle2, Circle, Map as MapIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface RoadmapTask {
  id?: string;
  skill?: string;
  topic?: string;
  description?: string;
  type: string;
  duration_min?: number;
  hrs?: number;
  resource_url?: string;
  completed: boolean;
}

interface RoadmapDay {
  day?: number;
  week?: number;
  label: string;
  focus: string;
  total_hours?: number;
  duration_hrs?: number;
  tasks: RoadmapTask[];
  tip?: string;
}

export function RoadmapWidget({ userType = "student" }: { userType?: string }) {
  const [roadmap, setRoadmap] = useState<RoadmapDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [hoursPreference, setHoursPreference] = useState(2);

  const fetchRoadmap = async (hours: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("tulasi_token");
      if (!token) return;

      const endpoint = userType === "student" ? "/api/roadmap/career/student" : "/api/roadmap/career/professional";
      
      const payload = userType === "student" 
        ? { days: 7, hours_per_day: hours, focus: "DSA" }
        : { target_skill: "AI" }; // Default for professional

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data.roadmap || []);
      }
    } catch (err) {
      console.error("Failed to load roadmap:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap(hoursPreference);
  }, [hoursPreference, userType]);

  const handleTimeChange = (hrs: number) => {
    setHoursPreference(hrs);
  };

  const toggleTask = (taskId: string) => {
    // Optimistic UI update (Backend sync would happen here in production)
    setRoadmap(prev => prev.map(day => ({
      ...day,
      tasks: day.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    })));
  };

  if (loading) {
    return (
      <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "24px", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <Skeleton height={24} />
          <Skeleton height={32} />
        </div>
        <Skeleton height={150} />
      </div>
    );
  }

  if (roadmap.length === 0) return null;

  const currentDayData = roadmap.find(d => d.day === activeDay) || roadmap[0];
  const isProfessional = userType === "professional";

  return (
    <div style={{ 
      background: "rgba(255,255,255,0.015)", 
      border: "1px solid rgba(255,255,255,0.04)", 
      borderRadius: "24px", 
      padding: "28px",
      display: "flex", 
      flexDirection: "column", 
      gap: "24px" 
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "white", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <MapIcon size={20} color="var(--brand-primary)" />
            {isProfessional ? "Personalized Upskilling Path" : "AI Placement Roadmap"}
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
            Curated by your AI Mentor based on your goals.
          </p>
        </div>

        {/* TIME CONTROLS (Only for Student) */}
        {!isProfessional && (
          <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "4px" }}>
            {[1, 2, 4].map(hrs => (
              <button
                key={hrs}
                onClick={() => handleTimeChange(hrs)}
                style={{
                  padding: "6px 14px",
                  background: hoursPreference === hrs ? "var(--brand-primary)" : "transparent",
                  color: hoursPreference === hrs ? "white" : "var(--text-muted)",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {hrs}hr/day
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TIMELINE NAV */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", scrollbarWidth: "none" }}>
        {roadmap.map((day) => {
          const isActive = day.day === activeDay;
          const label = isProfessional ? day.label : `Day ${day.day}`;
          return (
            <button
              key={day.day || day.week || Math.random()}
              onClick={() => setActiveDay(day.day || day.week || 1)}
              style={{
                flexShrink: 0,
                padding: "10px 16px",
                background: isActive ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isActive ? "rgba(139, 92, 246, 0.3)" : "rgba(255,255,255,0.05)"}`,
                borderRadius: "12px",
                color: isActive ? "white" : "var(--text-muted)",
                fontWeight: isActive ? 700 : 600,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* TODAY'S TASKS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>
            {isProfessional ? currentDayData.focus : `Focus: ${currentDayData.focus}`}
          </span>
          <span style={{ fontSize: "12px", color: "var(--brand-primary)", fontWeight: 600, background: "rgba(139, 92, 246, 0.1)", padding: "4px 8px", borderRadius: "10px" }}>
            <Clock size={12} style={{ display: "inline", marginRight: "4px", marginBottom: "-2px" }} />
            {isProfessional ? `${currentDayData.duration_hrs} hours` : `${currentDayData.total_hours}h scheduled`}
          </span>
        </div>

        {currentDayData.tasks.map((task, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            style={{
              padding: "16px",
              background: task.completed ? "rgba(16, 185, 129, 0.05)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${task.completed ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.03)"}`,
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onClick={() => toggleTask(task.id || `task-${idx}`)}
          >
            <div style={{ color: task.completed ? "#10B981" : "rgba(255,255,255,0.2)" }}>
              {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ 
                margin: 0, fontSize: "14px", fontWeight: 600, 
                color: task.completed ? "var(--text-muted)" : "white",
                textDecoration: task.completed ? "line-through" : "none"
              }}>
                {isProfessional ? task.description : task.topic}
              </h4>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                <Target size={12} /> {task.type.toUpperCase()}
                {!isProfessional && ` • ${Math.round((task.duration_min || 0) / 60)}h ${(task.duration_min || 0) % 60}m`}
                {isProfessional && ` • ${task.hrs || 0}h`}
              </span>
            </div>
            {task.resource_url && !task.completed && (
              <a href={task.resource_url} target="_blank" onClick={(e) => e.stopPropagation()} style={{ color: "var(--brand-primary)", padding: "8px", background: "rgba(139,92,246,0.1)", borderRadius: "8px" }}>
                <ArrowRight size={16} />
              </a>
            )}
          </motion.div>
        ))}

        {currentDayData.tip && (
          <div style={{ marginTop: "12px", padding: "12px 16px", background: "rgba(245, 158, 11, 0.05)", borderLeft: "3px solid #F59E0B", borderRadius: "0 8px 8px 0", fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
            💡 <strong>Pro Tip:</strong> {currentDayData.tip}
          </div>
        )}
      </div>
    </div>
  );
}
