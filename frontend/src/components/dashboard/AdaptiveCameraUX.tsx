"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Camera, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaceLandmarker, PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export type State = "focused" | "distracted" | "low engagement" | "no_face_detected" | "camera_unavailable" | "uncertain";

export interface AdaptiveCameraUXProps {
  onMetricsUpdate?: (metrics: any) => void;
  onStateChange?: (state: State) => void;
  isActive?: boolean;
}

export default function AdaptiveCameraUX({ onMetricsUpdate, onStateChange, isActive }: AdaptiveCameraUXProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentState, setCurrentState] = useState<State>("uncertain");
  const [showPrompt, setShowPrompt] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

  // Cumulative metrics for this recording session
  const statsRef = useRef({
    validFaceFrames: 0,
    cameraFacingFrames: 0,
    handZoneViolations: 0,
    postureChanges: 0,
    lastTorsoY: 0
  });

  useEffect(() => {
    async function initModel() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: false,
          runningMode: "VIDEO",
          numFaces: 1
        });
        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Failed to load MediaPipe Tasks", err);
      }
    }
    initModel();
    return () => {
      if (faceLandmarkerRef.current) faceLandmarkerRef.current.close();
      if (poseLandmarkerRef.current) poseLandmarkerRef.current.close();
    };
  }, []);

  const updateState = useCallback((newState: State) => {
    setCurrentState(prev => {
        if (prev !== newState && onStateChange) {
            onStateChange(newState);
        }
        return newState;
    });
  }, [onStateChange]);

  useEffect(() => {
    if (isActive === false) {
      // Reset stats when recording stops explicitly (if isActive is controlled and turns false)
      statsRef.current = {
        validFaceFrames: 0,
        cameraFacingFrames: 0,
        handZoneViolations: 0,
        postureChanges: 0,
        lastTorsoY: 0
      };
    }
  }, [isActive]);

  useEffect(() => {
    let animationFrameId: number;
    let isComponentMounted = true;
    let lastFrameTime = 0;

    const predictWebcam = async () => {
      // If isActive is explicitly false, don't predict (if undefined, we assume it's true/active for legacy pages)
      if (isActive === false) return;
      if (!videoRef.current || !faceLandmarkerRef.current || !poseLandmarkerRef.current || !stream || !isComponentMounted) return;
      
      const video = videoRef.current;
      
      // Throttle inference slightly to save CPU, approx 10 FPS is enough for posture
      if (video.readyState >= 2 && performance.now() - lastFrameTime > 100) {
        lastFrameTime = performance.now();
        const startTimeMs = performance.now();
        try {
          let currentEyeContactDrop = false;
          let currentHandViolation = false;
          let currentPostureChange = false;

          // 1. FACE TRACKING (Eye Contact Proxy)
          const faceResults = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);
          if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
            statsRef.current.validFaceFrames++;
            const nose = faceResults.faceLandmarks[0][1];
            const leftCheek = faceResults.faceLandmarks[0][234];
            const rightCheek = faceResults.faceLandmarks[0][454];
            const ratio = (nose.x - leftCheek.x) / (rightCheek.x - nose.x);
            
            // If facing forward, the distance from nose to cheeks is roughly equal (ratio ~ 1.0)
            if (ratio > 2.0 || ratio < 0.5) {
              updateState("low engagement");
              currentEyeContactDrop = true;
            } else {
              updateState("focused");
              statsRef.current.cameraFacingFrames++;
            }
          } else {
            updateState("no_face_detected");
          }

          // 2. POSE TRACKING (Hand Zone & Posture)
          const poseResults = poseLandmarkerRef.current.detectForVideo(video, startTimeMs);
          if (poseResults.landmarks && poseResults.landmarks.length > 0) {
             const leftWrist = poseResults.landmarks[0][15];
             const rightWrist = poseResults.landmarks[0][16];
             const leftShoulder = poseResults.landmarks[0][11];
             const rightShoulder = poseResults.landmarks[0][12];
             const leftHip = poseResults.landmarks[0][23];
             const rightHip = poseResults.landmarks[0][24];
             
             const shoulderY = Math.min(leftShoulder.y, rightShoulder.y);
             const hipY = Math.max(leftHip.y, rightHip.y);
             
             // Hand zone violation: hands above shoulders or below hips (if visible)
             if ((leftWrist.visibility > 0.6 && (leftWrist.y < shoulderY || leftWrist.y > hipY)) ||
                 (rightWrist.visibility > 0.6 && (rightWrist.y < shoulderY || rightWrist.y > hipY))) {
                 currentHandViolation = true;
             }

             // Posture alignment tracking (torso shift)
             const torsoY = (shoulderY + hipY) / 2;
             if (statsRef.current.lastTorsoY !== 0) {
                 if (Math.abs(torsoY - statsRef.current.lastTorsoY) > 0.15) {
                     currentPostureChange = true;
                     statsRef.current.lastTorsoY = torsoY; // update baseline
                 }
             } else {
                 statsRef.current.lastTorsoY = torsoY;
             }
          }

          if (onMetricsUpdate && isActive) {
             // Calculate explicit percentage
             const eyeContactPct = statsRef.current.validFaceFrames > 0 
                ? Math.round((statsRef.current.cameraFacingFrames / statsRef.current.validFaceFrames) * 100) 
                : 0;

             onMetricsUpdate({
                 eyeContactDrop: currentEyeContactDrop, // raw frame drop event
                 handZoneViolation: currentHandViolation, // raw frame violation event
                 postureChange: currentPostureChange, // raw frame posture shift event
                 eyeContactPercentage: eyeContactPct // cumulative score
             });
          }

        } catch (e) {
          console.error("Inference error:", e);
        }
      }
      
      if (isComponentMounted) {
        animationFrameId = window.requestAnimationFrame(predictWebcam);
      }
    };

    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadeddata = () => {
        if (isComponentMounted) predictWebcam();
      };
    }
    
    return () => {
      isComponentMounted = false;
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [stream, updateState, isActive, onMetricsUpdate]);

  const requestCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
    setHasPermission(null);
    updateState("uncertain");
    setShowPrompt(true);
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Camera size={20} color="#818cf8" />
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Real-Time Delivery Tracker</h3>
        </div>
        {stream && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, textTransform: "uppercase", fontWeight: 600, color: currentState === 'focused' ? '#10b981' : '#f59e0b' }}>
              {currentState.replace("_", " ")}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!stream && showPrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 16 }}>
              <strong>Camera & Mic access required.</strong> TulasiAI processes your video securely on your device using MediaPipe to provide visual metrics without uploading video streams. Audio processing relies on your browser's Web Speech API.
            </p>
            <button 
              onClick={requestCamera}
              disabled={!isModelLoaded}
              style={{ background: isModelLoaded ? "#4F46E5" : "#4b5563", border: "none", color: "white", padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: isModelLoaded ? "pointer" : "not-allowed" }}
            >
              {isModelLoaded ? "Enable Camera & Mic" : "Loading Edge Models..."}
            </button>
            {hasPermission === false && (
              <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12 }}>Permission denied. Please allow access.</p>
            )}
          </motion.div>
        )}

        {stream && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: "100%", borderRadius: 12, transform: "scaleX(-1)", background: "black" }} 
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>
              <span>Local processing active</span>
              <button onClick={stopCamera} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}>Turn Off</button>
            </div>
            
            {/* Visual Guide for Recommended Zone */}
            <div style={{ marginTop: "16px", padding: "16px", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "8px", textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>
               RECOMMENDED GESTURE ZONE<br/>(Shoulder to Waist)
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
