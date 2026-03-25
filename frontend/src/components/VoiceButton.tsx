"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useVoiceEngine, VoiceState } from "@/hooks/useVoiceEngine";

const STATE_CONFIG: Record<VoiceState, { color: string; label: string; pulse: boolean }> = {
  idle:       { color: "#8B5CF6", label: "Voice",      pulse: false },
  listening:  { color: "#22C55E", label: "Listening…", pulse: true  },
  processing: { color: "#F59E0B", label: "Thinking…",  pulse: true  },
  speaking:   { color: "#3B82F6", label: "Speaking…",  pulse: true  },
  error:      { color: "#EF4444", label: "Error",       pulse: false },
};

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  aiResponse?: string;
  size?: "sm" | "md" | "lg";
}

export function VoiceButton({ onTranscript, aiResponse, size = "md" }: VoiceButtonProps) {
  const { state, transcript, isSupported, toggle, speak, cancelSpeech } = useVoiceEngine({
    onTranscript,
  });

  // Speak AI response when it comes in
  if (aiResponse && state === "idle") {
    // Called from parent — parent effect handles triggering speak
  }

  if (!isSupported) return null;

  const cfg = STATE_CONFIG[state];
  const dim = size === "sm" ? 36 : size === "lg" ? 52 : 44;
  const iconSize = size === "sm" ? 14 : size === "lg" ? 22 : 18;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <motion.button
        onClick={state === "speaking" ? cancelSpeech : toggle}
        animate={{ scale: cfg.pulse ? [1, 1.08, 1] : 1 }}
        transition={cfg.pulse ? { repeat: Infinity, duration: 1.2 } : {}}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        style={{
          width: dim,
          height: dim,
          borderRadius: "50%",
          border: `2px solid ${cfg.color}50`,
          background: `radial-gradient(circle, ${cfg.color}22, ${cfg.color}08)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: cfg.pulse ? `0 0 20px ${cfg.color}40` : "none",
          transition: "box-shadow 0.3s ease",
          outline: "none",
          color: cfg.color,
          position: "relative",
        }}
        aria-label={cfg.label}
      >
        {state === "processing" ? (
          <Loader2 size={iconSize} style={{ animation: "spin 0.8s linear infinite" }} />
        ) : state === "speaking" ? (
          <VolumeX size={iconSize} />
        ) : state === "listening" ? (
          <MicOff size={iconSize} />
        ) : (
          <Mic size={iconSize} />
        )}
      </motion.button>

      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.6)",
              maxWidth: 180,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            "{transcript}"
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
