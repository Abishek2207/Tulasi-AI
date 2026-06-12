"use client";

import React from "react";

export default function CareerDirectionPlanner() {
  const directions = [
    { target: "AI Backend Engineer", reason: "Leverages your current backend skills with high market demand.", salaryBoost: "+25%" },
    { target: "Cloud Architect", reason: "A natural progression for senior backend engineers focusing on scalable infrastructure.", salaryBoost: "+40%" },
    { target: "Engineering Manager", reason: "For those moving towards the leadership track.", salaryBoost: "+30%" }
  ];

  return (
    <div className="min-h-screen bg-[#05070D] p-8 text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black mb-4">Career Direction Planner</h1>
        <p className="text-white/60 mb-10">AI-generated paths to escape role stagnation and increase your salary potential.</p>

        <div className="grid gap-6">
          {directions.map((d, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2 text-[#0EA5E9]">{d.target}</h3>
                <p className="text-white/70 max-w-lg">{d.reason}</p>
              </div>
              <div className="text-center bg-[#0EA5E9]/10 p-4 rounded-xl border border-[#0EA5E9]/20">
                <div className="text-sm text-[#0EA5E9] font-bold uppercase tracking-wider mb-1">Estimated Impact</div>
                <div className="text-2xl font-black text-white">{d.salaryBoost} Salary</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
