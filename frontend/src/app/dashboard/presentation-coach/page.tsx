"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Presentation,
  CheckCircle2,
  AlertCircle,
  Camera,
  Mic,
  Loader2,
  Play,
  Square,
  Activity,
} from "lucide-react";
import {
  FilesetResolver,
  FaceLandmarker,
  PoseLandmarker,
  HandLandmarker,
} from "@mediapipe/tasks-vision";
import toast from "react-hot-toast";

type CoachState =
  | "INITIALIZING"
  | "REQUESTING_CAMERA"
  | "REQUESTING_MIC"
  | "MODELS_LOADING"
  | "READY"
  | "RECORDING"
  | "PROCESSING"
  | "COMPLETED"
  | "PERMISSION_DENIED"
  | "CAMERA_UNAVAILABLE"
  | "MIC_UNAVAILABLE"
  | "MODEL_LOAD_FAILED"
  | "BROWSER_UNSUPPORTED"
  | "GPU_UNAVAILABLE"
  | "PROCESSING_DEGRADED";

interface SessionMetrics {
  totalFrames: number;
  faceDetectedFrames: number;
  eyeContactFrames: number;
  postureScoreAcc: number;
  gestureFrames: number;
  speakingFrames: number;
  pauseCount: number;
  durationMs: number;
}

const VISION_WASM =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

export default function PresentationCoachPage() {
  const [state, setState] = useState<CoachState>("INITIALIZING");
  const [cameraInfo, setCameraInfo] = useState({
    width: 0,
    height: 0,
    fps: 0,
  });

  const [metrics, setMetrics] = useState({
    eyeContact: 0,
    posture: 0,
    gesture: 0,
    speaking: 0,
    pauseFrequency: 0,
    cameraFps: 0,
  });

  const [feedback, setFeedback] = useState<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  const lastVideoTimeRef = useRef<number>(-1);
  const lastFaceRunRef = useRef<number>(0);
  const lastPoseRunRef = useRef<number>(0);
  const lastHandRunRef = useRef<number>(0);
  const lastUiUpdateRef = useRef<number>(0);

  const sessionMetricsRef = useRef<SessionMetrics>({
    totalFrames: 0,
    faceDetectedFrames: 0,
    eyeContactFrames: 0,
    postureScoreAcc: 0,
    gestureFrames: 0,
    speakingFrames: 0,
    pauseCount: 0,
    durationMs: 0,
  });

  const isSpeakingRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);

  // Speech recognition (if available)
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");

  useEffect(() => {
    initCoach();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initCoach = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setState("BROWSER_UNSUPPORTED");
      return;
    }

    try {
      setState("REQUESTING_CAMERA");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 60, min: 30 },
        },
        audio: true,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraInfo({
            width: videoRef.current?.videoWidth || 0,
            height: videoRef.current?.videoHeight || 0,
            fps: stream.getVideoTracks()[0].getSettings().frameRate || 30,
          });
        };
      }

      // Initialize audio
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
        const source =
          audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 512;
        source.connect(analyserRef.current);
      }

      // Initialize Speech Recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          transcriptRef.current = currentTranscript;
        };
        recognitionRef.current = recognition;
      }

      setState("MODELS_LOADING");
      await initModels();
      setState("READY");
    } catch (err: any) {
      console.error(err);
      if (err.name === "NotAllowedError" || err.name === "SecurityError") {
        setState("PERMISSION_DENIED");
      } else if (err.name === "NotFoundError") {
        setState("CAMERA_UNAVAILABLE");
      } else {
        setState("MODEL_LOAD_FAILED");
      }
    }
  };

  const initModels = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(VISION_WASM);

      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        }
      );

      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
        }
      );

      handLandmarkerRef.current = await HandLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        }
      );
    } catch (error) {
      console.warn("GPU delegate failed, falling back to CPU", error);
      // Fallback to CPU if GPU fails (which happens on some browsers)
      const vision = await FilesetResolver.forVisionTasks(VISION_WASM);

      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        }
      );

      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
        }
      );

      handLandmarkerRef.current = await HandLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        }
      );
    }
  };

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    faceLandmarkerRef.current?.close();
    poseLandmarkerRef.current?.close();
    handLandmarkerRef.current?.close();
  };

  const startRecording = () => {
    if (state !== "READY") return;
    setState("RECORDING");

    sessionMetricsRef.current = {
      totalFrames: 0,
      faceDetectedFrames: 0,
      eyeContactFrames: 0,
      postureScoreAcc: 0,
      gestureFrames: 0,
      speakingFrames: 0,
      pauseCount: 0,
      durationMs: 0,
    };
    startTimeRef.current = performance.now();
    isSpeakingRef.current = false;
    transcriptRef.current = "";

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }

    lastVideoTimeRef.current = -1;
    processFrame();
  };

  const stopRecording = async () => {
    setState("PROCESSING");
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    sessionMetricsRef.current.durationMs =
      performance.now() - startTimeRef.current;

    // Calculate final metrics
    const sm = sessionMetricsRef.current;
    const durSec = sm.durationMs / 1000;
    const faceRatio = sm.faceDetectedFrames > 0 ? sm.faceDetectedFrames : 1;

    const finalMetrics = {
      duration_seconds: durSec,
      eye_contact_percentage: Math.min(
        100,
        (sm.eyeContactFrames / faceRatio) * 100
      ),
      posture_score: Math.min(100, sm.postureScoreAcc / sm.totalFrames || 0),
      gesture_activity: Math.min(
        100,
        (sm.gestureFrames / sm.totalFrames) * 100 * 2
      ), // scaled
      speaking_percentage: Math.min(
        100,
        (sm.speakingFrames / sm.totalFrames) * 100
      ),
      pause_frequency: (sm.pauseCount / (durSec || 1)) * 60,
    };

    try {
      // POST to backend
      const token = localStorage.getItem("token");
      const res = await fetch("/api/presentation-coach/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transcript: transcriptRef.current,
          metrics: finalMetrics,
        }),
      });

      if (!res.ok) throw new Error("Evaluation failed");
      const data = await res.json();
      setFeedback(data);
      setState("COMPLETED");
    } catch (e) {
      console.error(e);
      toast.error("Failed to analyze presentation.");
      setState("READY");
    }
  };

  const processFrame = () => {
    if (state !== "RECORDING" && state !== "READY") return; // Allow running in ready state for metrics? No, only RECORDING to save resources.

    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const now = performance.now();
    const sm = sessionMetricsRef.current;
    sm.totalFrames++;

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;

      // 1. Face (Target: 30 FPS, approx every 33ms)
      if (
        now - lastFaceRunRef.current >= 33 &&
        faceLandmarkerRef.current
      ) {
        lastFaceRunRef.current = now;
        const faceResult = faceLandmarkerRef.current.detectForVideo(
          video,
          now
        );
        if (faceResult.faceBlendshapes && faceResult.faceBlendshapes.length > 0) {
          sm.faceDetectedFrames++;

          // Eye contact estimation using eyeLookIn / eyeLookOut blendshapes
          // Extremely simplified for demonstration of capability
          const shapes = faceResult.faceBlendshapes[0].categories;
          const lookDownL = shapes.find((c) => c.categoryName === "eyeLookDownLeft")?.score || 0;
          const lookDownR = shapes.find((c) => c.categoryName === "eyeLookDownRight")?.score || 0;
          
          if (lookDownL < 0.3 && lookDownR < 0.3) {
            sm.eyeContactFrames++;
          }
        }
      }

      // 2. Pose (Target: 20 FPS, approx every 50ms)
      if (
        now - lastPoseRunRef.current >= 50 &&
        poseLandmarkerRef.current
      ) {
        lastPoseRunRef.current = now;
        const poseResult = poseLandmarkerRef.current.detectForVideo(
          video,
          now
        );
        if (poseResult.landmarks && poseResult.landmarks.length > 0) {
          const l = poseResult.landmarks[0];
          // Check shoulder alignment (landmarks 11 and 12)
          if (l[11] && l[12]) {
            const dy = Math.abs(l[11].y - l[12].y);
            const score = Math.max(0, 100 - dy * 500); // Penalty for unaligned shoulders
            sm.postureScoreAcc += score;
          }
        }
      }

      // 3. Hands (Target: 15 FPS, approx every 66ms)
      if (
        now - lastHandRunRef.current >= 66 &&
        handLandmarkerRef.current
      ) {
        lastHandRunRef.current = now;
        const handResult = handLandmarkerRef.current.detectForVideo(
          video,
          now
        );
        if (handResult.landmarks && handResult.landmarks.length > 0) {
          // Calculate movement from previous frame? Or simply presence of hands + spread
          sm.gestureFrames++;
        }
      }

      // 4. Audio
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        if (avg > 10) {
          sm.speakingFrames++;
          if (!isSpeakingRef.current) {
            isSpeakingRef.current = true;
          }
        } else {
          if (isSpeakingRef.current) {
            isSpeakingRef.current = false;
            sm.pauseCount++;
          }
        }
      }
    }

    // 5. UI Update (Target: 5 FPS to keep UI smooth)
    if (now - lastUiUpdateRef.current >= 200) {
      lastUiUpdateRef.current = now;
      const faceRatio = sm.faceDetectedFrames > 0 ? sm.faceDetectedFrames : 1;
      setMetrics({
        eyeContact: (sm.eyeContactFrames / faceRatio) * 100,
        posture: sm.postureScoreAcc / (sm.totalFrames || 1),
        gesture: (sm.gestureFrames / sm.totalFrames) * 100,
        speaking: (sm.speakingFrames / sm.totalFrames) * 100,
        pauseFrequency: sm.pauseCount,
        cameraFps:
          (sm.totalFrames / (now - startTimeRef.current)) * 1000 || 0,
      });
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const renderContent = () => {
    switch (state) {
      case "INITIALIZING":
      case "REQUESTING_CAMERA":
      case "REQUESTING_MIC":
      case "MODELS_LOADING":
      case "PROCESSING":
        return (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold mb-2">
              {state === "MODELS_LOADING"
                ? "Loading Computer Vision Models..."
                : state === "PROCESSING"
                ? "Analyzing Presentation..."
                : "Initializing Presentation Coach..."}
            </h2>
            <p className="text-gray-400">
              Please wait while we prepare the environment.
            </p>
          </div>
        );
      case "PERMISSION_DENIED":
      case "CAMERA_UNAVAILABLE":
      case "MIC_UNAVAILABLE":
      case "BROWSER_UNSUPPORTED":
      case "MODEL_LOAD_FAILED":
        return (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Setup Failed</h2>
            <p className="text-gray-400 mb-4 text-center">
              {state === "PERMISSION_DENIED"
                ? "Camera or microphone permission was denied. Please allow access in your browser settings."
                : state === "BROWSER_UNSUPPORTED"
                ? "Your browser does not support the required MediaDevices API."
                : "Failed to initialize hardware or models. Please check your devices."}
            </p>
            <button
              onClick={initCoach}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium"
            >
              Retry
            </button>
          </div>
        );
      case "COMPLETED":
        return (
          <div className="flex flex-col items-center justify-center h-full text-white p-8 overflow-y-auto w-full max-w-4xl mx-auto">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-3xl font-bold mb-8">Presentation Complete</h2>

            {feedback && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-indigo-400 mb-4">
                    Overall Score
                  </h3>
                  <div className="text-5xl font-black text-white">
                    {feedback.overall_score}
                    <span className="text-2xl text-gray-500">/100</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-green-400 mb-2">
                    Strengths
                  </h3>
                  <ul className="list-disc pl-5 text-gray-300 mb-4 space-y-1">
                    {feedback.strengths?.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>

                  <h3 className="text-lg font-bold text-yellow-400 mb-2">
                    Areas for Improvement
                  </h3>
                  <ul className="list-disc pl-5 text-gray-300 space-y-1">
                    {feedback.areas_for_improvement?.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {feedback && (
              <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 mb-8 grid grid-cols-1 gap-4 text-sm text-gray-300">
                <div>
                  <span className="font-bold text-white block mb-1">
                    Eye Contact:
                  </span>
                  {feedback.eye_contact_feedback}
                </div>
                <div>
                  <span className="font-bold text-white block mb-1">
                    Posture:
                  </span>
                  {feedback.posture_feedback}
                </div>
                <div>
                  <span className="font-bold text-white block mb-1">
                    Gestures:
                  </span>
                  {feedback.gesture_feedback}
                </div>
                <div>
                  <span className="font-bold text-white block mb-1">
                    Vocal Delivery:
                  </span>
                  {feedback.vocal_feedback}
                </div>
                <div>
                  <span className="font-bold text-white block mb-1">
                    Content:
                  </span>
                  {feedback.content_feedback}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setFeedback(null);
                setState("READY");
              }}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium"
            >
              Practice Again
            </button>
          </div>
        );
      default:
        // READY or RECORDING
        return (
          <div className="flex flex-col w-full h-full">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-3">
                <Presentation className="text-indigo-400" />
                <h1 className="text-xl font-bold text-white">
                  Presentation Coach
                </h1>
              </div>
              <div className="flex gap-4">
                {state === "READY" ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Play size={18} />
                    Start Session
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Square size={18} />
                    End Session
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 p-6 relative">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-black relative border border-white/10 shadow-2xl">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  {state === "RECORDING" && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full border border-red-500/50 backdrop-blur">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-white text-sm font-medium tracking-wide">
                        RECORDING
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <div className="bg-black/50 px-3 py-1.5 rounded-full border border-white/10 text-white text-xs backdrop-blur flex items-center gap-1.5">
                      <Camera size={14} />
                      {cameraInfo.width}x{cameraInfo.height} @{" "}
                      {Math.round(cameraInfo.fps)}fps
                    </div>
                    <div className="bg-black/50 px-3 py-1.5 rounded-full border border-white/10 text-white text-xs backdrop-blur flex items-center gap-1.5">
                      <Mic size={14} />
                      Ready
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-80 border-l border-white/10 bg-black/20 p-6 flex flex-col gap-6 overflow-y-auto">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity size={18} className="text-indigo-400" />
                  Live Metrics
                </h3>

                <MetricRow
                  label="Eye Contact"
                  value={metrics.eyeContact}
                  unit="%"
                  color="bg-blue-500"
                />
                <MetricRow
                  label="Posture Score"
                  value={metrics.posture}
                  unit="/100"
                  color="bg-green-500"
                />
                <MetricRow
                  label="Gesture Activity"
                  value={metrics.gesture}
                  unit="%"
                  color="bg-purple-500"
                />
                <MetricRow
                  label="Speaking Time"
                  value={metrics.speaking}
                  unit="%"
                  color="bg-yellow-500"
                />
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400 font-medium">
                    Pauses/Min
                  </span>
                  <span className="text-lg font-bold text-white">
                    {metrics.pauseFrequency.toFixed(1)}
                  </span>
                </div>
                {state === "RECORDING" && (
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-400 font-medium">
                      Process FPS
                    </span>
                    <span className="text-sm font-bold text-gray-300">
                      ~{Math.round(metrics.cameraFps)} fps
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {renderContent()}
    </div>
  );
}

function MetricRow({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400 font-medium">{label}</span>
        <span className="text-sm font-bold text-white">
          {Math.round(value)}
          {unit}
        </span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
