"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface SyncIndicatorProps {
  lastSynced?: string | null; // ISO timestamp
  isLoading?: boolean;
  error?: boolean;
}

export function SyncIndicator({ lastSynced, isLoading, error }: SyncIndicatorProps) {
  const [, setTick] = useState(0);

  // Re-render every minute so "X mins ago" updates
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#F43F5E" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F43F5E", display: "inline-block" }} />
        Sync failed
      </span>
    );
  }

  if (isLoading) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", display: "inline-block",
          animation: "syncPulse 1s ease-in-out infinite",
        }} />
        Syncing…
        <style>{`@keyframes syncPulse { 0%,100%{opacity:1}50%{opacity:0.3} }`}</style>
      </span>
    );
  }

  if (!lastSynced) return null;

  const ago = formatDistanceToNow(new Date(lastSynced), { addSuffix: true });

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block",
        boxShadow: "0 0 6px #10B981",
        animation: "syncLive 3s ease-in-out infinite",
      }} />
      Last synced {ago}
      <style>{`@keyframes syncLive { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
    </span>
  );
}
