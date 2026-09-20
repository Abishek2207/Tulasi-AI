"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Camera, Server, Database, EyeOff, Check, X } from "lucide-react";

export default function PrivacyCenterPage() {
  const [cameraOptIn, setCameraOptIn] = useState(false);
  const [dataLocal, setDataLocal] = useState(true);

  return (
    <div style={{ padding: "40px", maxWidth: 900, margin: "0 auto", color: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
          <Shield size={32} />
        </div>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>Privacy Center</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", margin: "4px 0 0 0" }}>Manage your data, permissions, and AI privacy preferences.</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 24 }}>
        
        {/* Camera Permission */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, display: "flex", alignItems: "flex-start", gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(244, 114, 182, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f472b6", flexShrink: 0 }}>
            <Camera size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px 0" }}>Camera & Facial State Feature</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              Camera access is optional. TulasiAI can use local visual signals to adapt your learning experience (e.g., detecting if you are distracted or losing focus). 
              <strong> Camera frames are processed locally where technically possible and are not stored by default.</strong> We do not perform medical or psychological diagnosis.
            </p>
            <button 
              onClick={() => setCameraOptIn(!cameraOptIn)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: cameraOptIn ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${cameraOptIn ? "#10b981" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, color: cameraOptIn ? "#10b981" : "white", cursor: "pointer", fontWeight: 600 }}
            >
              {cameraOptIn ? <Check size={18} /> : <X size={18} />}
              {cameraOptIn ? "Global Opt-In Enabled" : "Require Prompt Each Time"}
            </button>
          </div>
        </div>

        {/* Local vs Cloud Data */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, display: "flex", alignItems: "flex-start", gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(96, 165, 250, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa", flexShrink: 0 }}>
            <Server size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px 0" }}>Data Processing</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              Choose how your learning data is processed. Local processing keeps data entirely on your device, while cloud processing enables deeper AI analytics.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={() => setDataLocal(true)}
                style={{ padding: "8px 16px", background: dataLocal ? "rgba(96, 165, 250, 0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${dataLocal ? "#60a5fa" : "transparent"}`, borderRadius: 8, color: dataLocal ? "#60a5fa" : "white", cursor: "pointer", fontWeight: 600 }}
              >
                Prefer Local Inference
              </button>
              <button 
                onClick={() => setDataLocal(false)}
                style={{ padding: "8px 16px", background: !dataLocal ? "rgba(96, 165, 250, 0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${!dataLocal ? "#60a5fa" : "transparent"}`, borderRadius: 8, color: !dataLocal ? "#60a5fa" : "white", cursor: "pointer", fontWeight: 600 }}
              >
                Allow Cloud Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Stored Data & Documents */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, display: "flex", alignItems: "flex-start", gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(251, 191, 36, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", flexShrink: 0 }}>
            <Database size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px 0" }}>Stored Documents & Resumes</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              Any screenshots, photos, or documents uploaded are processed securely. Extracted text can be viewed and deleted at any time. We do not store raw images indefinitely.
            </p>
            <button style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Clear All Extracted Data
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
