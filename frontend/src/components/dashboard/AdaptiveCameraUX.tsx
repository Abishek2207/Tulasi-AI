"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, CameraOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type State = "focused" | "distracted" | "low engagement" | "neutral" | "uncertain";

interface AdaptiveCameraUXProps {
  onStateChange: (state: State) => void;
}

export default function AdaptiveCameraUX({ onStateChange }: AdaptiveCameraUXProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentState, setCurrentState] = useState<State>("uncertain");
  const [showPrompt, setShowPrompt] = useState(true);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Simulated ML State Detection
  useEffect(() => {
    if (!stream) return;
    
    // Start with focused
    setCurrentState("focused");
    onStateChange("focused");

    const interval = setInterval(() => {
      const states: State[] = ["focused", "focused", "focused", "distracted", "low engagement", "neutral"];
      const randomState = states[Math.floor(Math.random() * states.length)];
      setCurrentState(randomState);
      onStateChange(randomState);
    }, 15000); // Change state every 15 seconds randomly

    return () => clearInterval(interval);
  }, [stream, onStateChange]);

  const requestCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setHasPermission(true);
      setShowPrompt(false);
    } catch (err) {
      console.error("Camera access denied", err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setHasPermission(null);
    setCurrentState("uncertain");
    setShowPrompt(true);
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Camera size={20} color="#818cf8" />
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Adaptive UX Vision</h3>
        </div>
        {stream && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, textTransform: "uppercase", fontWeight: 600, color: currentState === "focused" ? "#10b981" : currentState === "distracted" ? "#ef4444" : "#f59e0b" }}>
              {currentState}
            </span>
            <button onClick={stopCamera} style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              Stop Camera
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!stream && showPrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <AlertCircle size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.5 }}>
                <strong>Camera access is optional.</strong> TulasiAI can use local visual signals to adapt your learning experience. Camera frames are processed locally where technically possible and are not stored by default.
              </p>
            </div>
            
            <button 
              onClick={requestCamera}
              style={{ background: "#4F46E5", border: "none", color: "white", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Enable Local Processing
            </button>
            {hasPermission === false && (
              <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12, margin: 0 }}>Permission denied. Check browser settings.</p>
            )}
          </motion.div>
        )}

        {stream && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }}>
            <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "16/9", background: "black" }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
              <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(0,0,0,0.6)", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
                LOCAL INFERENCE ACTIVE
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
