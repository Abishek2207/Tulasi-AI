"use client";

import React from "react";

export default function CommunicationPractice() {
  return (
    <div className="min-h-screen bg-[#05070D] p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-4">AI Communication & Leadership Coach</h1>
        <p className="text-white/60 mb-8">Practice high-stakes conversations privately. Screenshots are disabled in this environment.</p>

        <div className="grid gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl mb-1">Promotion Conversation</h3>
              <p className="text-white/50 text-sm">Practice advocating for your next level with our AI Manager.</p>
            </div>
            <button className="bg-[#8B5CF6] text-white font-bold py-2 px-6 rounded-xl">Start Session</button>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl mb-1">Peer-to-Peer System Design</h3>
              <p className="text-white/50 text-sm">Live technical discussion practice with a real peer.</p>
            </div>
            <button className="bg-[#10B981] text-white font-bold py-2 px-6 rounded-xl">Find Peer</button>
          </div>
        </div>

        <div className="mt-12 bg-black/40 border border-white/5 p-8 rounded-3xl text-center">
          <h2 className="text-lg font-bold text-white/40 mb-2">Private Performance Report</h2>
          <p className="text-white/30 text-sm">Complete a session to generate your confidential clarity and confidence scores.</p>
        </div>
      </div>
    </div>
  );
}
