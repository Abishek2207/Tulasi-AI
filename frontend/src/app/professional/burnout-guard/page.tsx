"use client";

import React from "react";

export default function BurnoutGuard() {
  return (
    <div className="min-h-screen bg-[#05070D] p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-4">Health & Burnout Guard</h1>
        <p className="text-white/60 mb-8">Continuous learning shouldn't destroy your health. Let AI manage your load.</p>

        <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 p-8 rounded-3xl mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-4 h-4 rounded-full bg-[#F43F5E] animate-pulse" />
            <h2 className="text-xl font-bold text-[#F43F5E]">High Burnout Risk Detected</h2>
          </div>
          <p className="text-white/70">You've tracked over 55 working hours this week. Your learning blocks have been automatically reduced to 15-minute micro-sessions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="font-bold text-white/50 uppercase tracking-wider text-sm mb-4">Recommended Rest Schedule</h3>
            <ul className="space-y-3 text-white/80">
              <li>• Disconnect completely on Saturday</li>
              <li>• 15-min walk block scheduled at 2 PM</li>
              <li>• Screen-free hour before sleep</li>
            </ul>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="font-bold text-white/50 uppercase tracking-wider text-sm mb-4">Focus Optimization</h3>
            <p className="text-sm text-white/70">Implementing 50/10 Pomodoro logic. Next forced offline break is in 45 minutes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
