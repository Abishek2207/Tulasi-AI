"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, ChevronDown, Check, Settings, Sparkles } from "lucide-react";

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const models = [
    { id: "gemini", name: "Gemini 2.5 Pro", desc: "Best overall logic", color: "#6366f1" },
    { id: "openrouter", name: "Gemma 2 9B", desc: "Reliable fallback", color: "#10b981" },
    { id: "groq", name: "Llama 3 8B", desc: "Lightning fast", color: "#f59e0b" },
    { id: "ollama", name: "Local Llama 3", desc: "Private & offline", color: "#8b5cf6" },
  ];

  useEffect(() => {
    // Optionally fetch initial preference from /api/v1/users/me
    const fetchPref = async () => {
      try {
        const res = await fetch("/api/v1/users/me");
        if (res.ok) {
          const data = await res.json();
          if (data.preferred_model) setSelectedModel(data.preferred_model);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPref();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectModel = async (id: string) => {
    setSelectedModel(id);
    setIsOpen(false);
    
    // Save to backend
    try {
      await fetch("/api/v1/users/preferences/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: id })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const activeModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          padding: "8px 16px", borderRadius: 100, cursor: "pointer",
          color: "white", fontSize: 13, fontWeight: 500, transition: "all 0.2s"
        }}
      >
        <Cpu size={16} color={activeModel.color} />
        {activeModel.name}
        <ChevronDown size={14} style={{ opacity: 0.5 }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", top: "100%", right: 0, marginTop: 8,
              width: 240, background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              zIndex: 50, overflow: "hidden", padding: 8
            }}
          >
            <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Select AI Engine
            </div>
            
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => selectModel(model.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", background: selectedModel === model.id ? "rgba(255,255,255,0.05)" : "transparent",
                  border: "none", borderRadius: 10, cursor: "pointer", textAlign: "left",
                  transition: "background 0.2s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: model.color }} />
                  <div>
                    <div style={{ color: "white", fontSize: 14, fontWeight: selectedModel === model.id ? 600 : 400 }}>
                      {model.name}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                      {model.desc}
                    </div>
                  </div>
                </div>
                {selectedModel === model.id && <Check size={16} color="white" />}
              </button>
            ))}
            
            <div style={{ padding: "12px 12px 4px 12px", marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              <Settings size={14} /> Advanced settings
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
