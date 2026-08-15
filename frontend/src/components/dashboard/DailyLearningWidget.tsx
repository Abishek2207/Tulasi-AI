"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { Calendar, PlayCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface DailyTask {
  id: number;
  title: string;
  description: string;
  estimated_minutes: number;
  status: string;
}

interface DailyLearningData {
  success: boolean;
  date: string;
  daily_time_minutes: number;
  adaptation_prompt: string | null;
  tasks: DailyTask[];
}

export function DailyLearningWidget() {
  const { data: session } = useSession();
  const [data, setData] = useState<DailyLearningData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.accessToken) {
      setLoading(false);
      return;
    }

    fetch(process.env.NEXT_PUBLIC_API_URL + "/api/v1/daily-learning/today", {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`
      }
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setData(res);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  const handleCompleteTask = async (taskId: number) => {
    if (!session?.user?.accessToken) return;
    try {
      await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/v1/daily-learning/task/${taskId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          time_spent_minutes: 30, // Mock for now
          difficulty_rating: 3,
          was_adapted: false
        })
      });
      // Refresh
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/v1/daily-learning/today", {
        headers: { Authorization: `Bearer ${session.user.accessToken}` }
      }).then(r => r.json());
      if (res.success) setData(res);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 16, marginBottom: 32 }}>
        <p style={{ color: "rgba(255,255,255,0.5)" }}>Loading today&apos;s adaptive tasks...</p>
      </div>
    );
  }

  if (!data || data.tasks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: "24px 32px",
        borderRadius: 24,
        background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.02))",
        border: "1px solid rgba(59,130,246,0.2)",
        marginBottom: 32
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Calendar color="#3B82F6" size={24} />
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>
          Today&apos;s Learning Goals
        </h2>
        <span style={{
          marginLeft: "auto", fontSize: 13, color: "rgba(255,255,255,0.6)",
          display: "flex", alignItems: "center", gap: 6, fontWeight: 600,
          background: "rgba(0,0,0,0.3)", padding: "6px 12px", borderRadius: 20
        }}>
          <Clock size={14} /> {data.daily_time_minutes} min scheduled
        </span>
      </div>

      {data.adaptation_prompt && (
        <div style={{
          padding: 16, borderRadius: 12, background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.2)", marginBottom: 16,
          display: "flex", alignItems: "flex-start", gap: 12
        }}>
          <AlertTriangle color="#F59E0B" size={20} />
          <div>
            <h4 style={{ margin: "0 0 4px 0", color: "#FBBF24", fontSize: 14 }}>Adaptive Check-in</h4>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              {data.adaptation_prompt}
            </p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.tasks.map(task => (
          <div key={task.id} style={{
            padding: 16, borderRadius: 16,
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: "0 0 4px 0" }}>
                {task.title}
              </h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                {task.description} • {task.estimated_minutes} min
              </p>
            </div>
            
            {task.status === "completed" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10B981", fontSize: 13, fontWeight: 700 }}>
                <CheckCircle size={18} /> Completed
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <button 
                  onClick={() => handleCompleteTask(task.id)}
                  style={{
                    padding: "8px 16px", borderRadius: 8, background: "rgba(16,185,129,0.15)",
                    color: "#10B981", border: "1px solid rgba(16,185,129,0.3)",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                  }}>
                  <CheckCircle size={14} /> Mark Done
                </button>
                <button style={{
                  padding: "8px 16px", borderRadius: 8, background: "#3B82F6",
                  color: "white", border: "none",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                }}>
                  <PlayCircle size={14} /> Start Session
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
