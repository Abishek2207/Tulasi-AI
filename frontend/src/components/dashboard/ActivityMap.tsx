"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Generate random activity data for demonstration (Apple-level aesthetic)
const generateActivityData = (days = 140) => {
  return Array.from({ length: days }).map(() => Math.floor(Math.random() * 4));
};

export function ActivityMap() {
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    setData(generateActivityData(147)); // 21 columns x 7 rows
  }, []);

  const getColor = (level: number) => {
    switch (level) {
      case 1: return "rgba(124, 58, 237, 0.4)"; // light violet
      case 2: return "rgba(124, 58, 237, 0.7)"; // med violet
      case 3: return "rgba(6, 182, 212, 1)";    // cyan (hot)
      default: return "rgba(255, 255, 255, 0.03)"; // empty
    }
  };

  return (
    <div className="glass-card p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-outfit)" }}>Activity Engine</h3>
          <p className="text-sm text-gray-400">Your engagement trajectory over the last 140 days.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: getColor(0) }} />
            <div className="w-3 h-3 rounded-sm" style={{ background: getColor(1) }} />
            <div className="w-3 h-3 rounded-sm" style={{ background: getColor(2) }} />
            <div className="w-3 h-3 rounded-sm" style={{ background: getColor(3) }} />
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="flex gap-1 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {Array.from({ length: 21 }).map((_, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, rowIndex) => {
              const itemIndex = colIndex * 7 + rowIndex;
              const level = data[itemIndex] || 0;
              return (
                <motion.div
                  key={rowIndex}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: itemIndex * 0.005 }}
                  whileHover={{ scale: 1.2, zIndex: 10, outline: "1px solid rgba(255,255,255,0.5)" }}
                  className="w-4 h-4 rounded-sm cursor-pointer"
                  style={{
                    background: getColor(level),
                    boxShadow: level > 1 ? `0 0 10px ${getColor(level)}` : "none"
                  }}
                  title={`Activity Level: ${level}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
