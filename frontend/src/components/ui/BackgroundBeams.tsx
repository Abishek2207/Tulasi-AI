"use client";
import React, { useEffect, useState } from "react";

/** Ambient floating particle animations for premium dashboard background (Phase 5) */
export function BackgroundBeams() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none", background: "var(--bg-primary)" }}>
      {/* Soft blurred gradient orbs mimicking Notion AI/Stripe's background style */}
      <div style={{ 
        position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%", 
        background: "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15), transparent 60%)", 
        filter: "blur(80px)" 
      }} />
      <div style={{ 
        position: "absolute", bottom: "-20%", right: "-10%", width: "60%", height: "60%", 
        background: "radial-gradient(ellipse at center, rgba(56, 189, 248, 0.12), transparent 60%)", 
        filter: "blur(100px)" 
      }} />
      <div style={{ 
        position: "absolute", top: "40%", left: "60%", width: "30%", height: "40%", 
        background: "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.08), transparent 60%)", 
        filter: "blur(60px)" 
      }} />
      
      {/* Floating particles network overlay (CSS dots) */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15,
        backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)", backgroundSize: "32px 32px"
      }} />
    </div>
  );
}
