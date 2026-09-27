"use client";

import React, { useState } from 'react';
import AdaptiveCameraUX from '@/components/dashboard/AdaptiveCameraUX';
import { Presentation, FileText, CheckCircle, BrainCircuit } from 'lucide-react';

export default function PresentationCoachPage() {
  const [pitchText, setPitchText] = useState("");
  const [cameraState, setCameraState] = useState("uncertain");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const handleStateChange = (state: any) => {
    setCameraState(state);
  };

  const submitPitch = async () => {
    setIsAnalyzing(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("presentation_text", pitchText);
      // We rely on MediaPipe for camera metrics securely on the client.
      
      const token = localStorage.getItem("token") || "";
      const res = await fetch("http://localhost:8000/api/presentation-analysis", {
        method: "POST",
        headers: {
          "Authorization": Bearer 
        },
        body: formData
      });
      const data = await res.json();
      setFeedback(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto", color: "white" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
        <Presentation color="#818cf8" />
        Communication & Presentation Coach
      </h1>
      <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "32px" }}>
        Practice your pitch. TulasiAI will track your presentation delivery locally and provide real-time feedback alongside AI slide understanding.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={20} color="#818cf8" />
              Your Pitch Script / Slides
            </h2>
            <textarea 
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              placeholder="Paste your presentation text or pitch here..."
              style={{ width: "100%", height: "200px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", padding: "12px", resize: "none" }}
            />
            <button 
              onClick={submitPitch}
              disabled={isAnalyzing || !pitchText}
              style={{ width: "100%", padding: "12px", marginTop: "16px", background: pitchText ? "#4F46E5" : "#374151", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: pitchText ? "pointer" : "not-allowed" }}
            >
              {isAnalyzing ? "Analyzing Pitch..." : "Analyze Presentation"}
            </button>
          </div>
        </div>

        <div>
          <AdaptiveCameraUX onStateChange={handleStateChange} />
          
          {feedback && (
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "16px", padding: "24px", marginTop: "24px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "#10b981" }}>
                <CheckCircle size={20} />
                Analysis Complete
              </h2>
              
              <div style={{ marginBottom: "16px" }}>
                <strong style={{ color: "rgba(255,255,255,0.9)" }}>Slide Analysis:</strong>
                <p style={{ color: "rgba(255,255,255,0.7)", whiteSpace: "pre-wrap", fontSize: "0.9rem", marginTop: "8px" }}>
                  {feedback.slide_analysis}
                </p>
              </div>
              
              <div style={{ marginBottom: "16px" }}>
                <strong style={{ color: "rgba(255,255,255,0.9)" }}>Anticipated Q&A:</strong>
                <p style={{ color: "rgba(255,255,255,0.7)", whiteSpace: "pre-wrap", fontSize: "0.9rem", marginTop: "8px" }}>
                  {feedback.judge_qa}
                </p>
              </div>

              <div>
                <strong style={{ color: "rgba(255,255,255,0.9)" }}>Delivery Metrics:</strong>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", marginTop: "8px" }}>
                  {feedback.delivery_metrics}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
