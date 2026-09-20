"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import dynamic from "next/dynamic";

const AssistantSidebar = dynamic(() => import("./AssistantSidebar").then(mod => mod.AssistantSidebar), {
  ssr: false,
});

export function GlobalAIFab() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          width: 56,
          height: 56,
          borderRadius: 28,
          background: "linear-gradient(135deg, #4F46E5, #EC4899)",
          border: "none",
          boxShadow: "0 10px 30px rgba(79, 70, 229, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 9997, // Just below sidebar backdrop
        }}
      >
        <Sparkles size={24} />
      </motion.button>

      <AssistantSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
