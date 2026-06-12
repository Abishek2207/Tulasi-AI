"use client";

import React from "react";
import { motion } from "framer-motion";

export default function CareerRiskDashboard() {
  const risks = [
    { name: "AI Automation Risk", score: 65, color: "#F43F5E" },
    { name: "Layoff Risk", score: 30, color: "#10B981" },
    { name: "Salary Stagnation", score: 40, color: "#F59E0B" },
    { name: "Skill Obsolescence", score: 55, color: "#8B5CF6" }
  ];

  return (
    <div className="min-h-screen bg-[#05070D] p-8 text-white font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-2">Career Risk Dashboard</h1>
        <p className="text-white/60 mb-10">Real-time telemetry on your professional standing.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {risks.map((r, i) => (
            <motion.div key={r.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">{r.name}</h3>
              <div className="text-4xl font-black mb-2" style={{ color: r.color }}>{r.score}%</div>
              <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                <div className="h-full" style={{ width: `${r.score}%`, backgroundColor: r.color }} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-4">Overall Career Health</h2>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full border-8 border-[#10B981] flex items-center justify-center text-3xl font-black">68%</div>
            <p className="text-white/70 max-w-md leading-relaxed">
              Your profile is solid, but AI automation threatens your current role. We recommend learning Playwright and GenAI Testing workflows immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
