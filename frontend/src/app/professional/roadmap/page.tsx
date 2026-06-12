"use client";

import React from "react";

export default function RoadmapPlanner() {
  const roadmap = [
    { day: 1, topic: "Intro to Playwright", time: "60 mins", task: "Set up project and run first test" },
    { day: 2, topic: "API Testing", time: "60 mins", task: "Write 3 API tests" },
    { day: 3, topic: "GenAI in QA", time: "45 mins", task: "Explore prompt engineering for test generation" },
  ];

  const certs = [
    { title: "Automated Tests with Playwright", provider: "Microsoft Learn", url: "#" },
    { title: "Generative AI Fundamentals", provider: "Coursera", url: "#" }
  ];

  return (
    <div className="min-h-screen bg-[#05070D] p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black mb-4">Daily Adaptive Learning Plan</h1>
        <p className="text-white/60 mb-10">Your customized schedule to close skill gaps and earn real certifications.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold mb-4">3-Day Sprint</h2>
            {roadmap.map(r => (
              <div key={r.day} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[#10B981] font-bold text-sm mb-1">DAY {r.day} • {r.time}</div>
                  <h3 className="text-lg font-bold">{r.topic}</h3>
                  <p className="text-white/50 text-sm mt-1">Task: {r.task}</p>
                </div>
                <input type="checkbox" className="w-6 h-6 rounded border-white/20 bg-black/50 accent-[#10B981]" />
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-[#10B981]/10 border border-[#10B981]/20 p-6 rounded-2xl text-center">
              <div className="text-3xl font-black text-[#10B981]">🔥 4</div>
              <div className="text-sm font-bold text-[#10B981]/70 uppercase tracking-widest mt-1">Day Streak</div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Recommended Certifications</h2>
              <div className="space-y-4">
                {certs.map((c, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-xl">
                    <div className="text-xs text-white/50 uppercase tracking-wider mb-1">{c.provider}</div>
                    <h3 className="font-bold text-sm mb-3">{c.title}</h3>
                    <a href={c.url} className="text-[#0EA5E9] text-sm font-bold hover:underline">Start Course →</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
