"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Camera, CameraOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaceLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

type State = "focused" | "distracted" | "low engagement" | "neutral" | "uncertain" | "camera_unavailable" | "no_face_detected";

interface AdaptiveCameraUXProps {
  onStateChange: (state: State) => void;
}

export default function AdaptiveCameraUX({ onStateChange }: AdaptiveCameraUXProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentState, setCurrentState] = useState<State>("uncertain");
  const [showPrompt, setShowPrompt] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const isPredictingRef = useRef<boolean>(false);
  const animationRef = useRef<number>(0);

  // Initialize MediaPipe
  useEffect(() => {
    async function initModel() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: false,
          runningMode: "VIDEO",
          numFaces: 1
        });
        faceLandmarkerRef.current = faceLandmarker;
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Failed to load FaceLandmarker", err);
      }
    }
    initModel();
    return () => {
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  const updateState = useCallback((newState: State) => {
    setCurrentState(prev => {
      if (prev !== newState) {
        onStateChange(newState);
      }
      return newState;
    });
  }, [onStateChange]);

  useEffect(() => {
    let animationFrameId: number;
    let isActive = true;

    const predictWebcam = async () => {
      if (!videoRef.current || !faceLandmarkerRef.current || !stream || !isActive) return;
      
      const video = videoRef.current;
      
      if (video.readyState >= 2) {
        const startTimeMs = performance.now();
        try {
          const results = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);
          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            const nose = landmarks[1];
            const leftCheek = landmarks[234];
            const rightCheek = landmarks[454];
            
            const leftDist = nose.x - leftCheek.x;
            const rightDist = rightCheek.x - nose.x;
            const ratio = leftDist / rightDist;
            
            if (ratio > 2.5 || ratio < 0.4) {
              updateState("low engagement");
            } else {
              updateState("focused");
            }
          } else {
            updateState("no_face_detected");
          }
        } catch (e) {
          console.error("Inference error:", e);
        }
      }
      
      if (isActive) {
        animationFrameId = window.requestAnimationFrame(predictWebcam);
      }
    };

    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadeddata = () => {
        if (isActive) predictWebcam();
      };
    }
    
    return () => {
      isActive = false;
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [stream, updateState]);

  const requestCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setHasPermission(true);
      setShowPrompt(false);
      updateState("uncertain");
    } catch (err) {
      console.error("Camera access denied", err);
      setHasPermission(false);
      updateState("camera_unavailable");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    isPredictingRef.current = false;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    setHasPermission(null);
    updateState("uncertain");
    setShowPrompt(true);
  };

  const getStateColor = (state: State) => {
    switch (state) {
      case "focused": return "#10b981";
      case "distracted": return "#ef4444";
      case "low engagement": return "#f59e0b";
      case "no_face_detected": return "#f43f5e";
      case "camera_unavailable": return "#6b7280";
      default: return "#818cf8";
    }
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Camera size={20} color="#818cf8" />
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Adaptive UX Vision (MediaPipe)</h3>
        </div>
        {stream && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, textTransform: "uppercase", fontWeight: 600, color: getStateColor(currentState) }}>
              {currentState.replace("_", " ")}
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
                <strong>Camera access is optional.</strong> TulasiAI uses MediaPipe to process frames locally and estimate head pose. No frames or biometric data are recorded or sent to servers.
              </p>
            </div>
            
            <button 
              onClick={requestCamera}
              disabled={!isModelLoaded}
              style={{ background: isModelLoaded ? "#4F46E5" : "#4b5563", border: "none", color: "white", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: isModelLoaded ? "pointer" : "not-allowed" }}
            >
              {isModelLoaded ? "Enable Local Inference" : "Loading Model..."}
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
