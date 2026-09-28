"use client";

import React from "react";
import { Presentation, Clock, Bell } from "lucide-react";

/**
 * Presentation Coach — COMING SOON
 *
 * This feature (camera, microphone, MediaPipe, face/pose/eye-contact detection)
 * is intentionally disabled. It is not yet launched and must not be activated.
 *
 * DO NOT add camera / mic / MediaPipe / SpeechRecognition functionality here
 * until this feature is officially launched and the Coming Soon gate is removed.
 */
export default function PresentationCoachPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)",
        padding: "40px 20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "480px",
          padding: "48px 40px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "72px",
            height: "72px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))",
            border: "1px solid rgba(99,102,241,0.4)",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <Presentation size={36} color="#a78bfa" />
        </div>

        {/* Badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 14px",
            background: "rgba(251,191,36,0.1)",
            border: "1px solid rgba(251,191,36,0.3)",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#fbbf24",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          <Clock size={12} />
          Coming Soon
        </span>

        {/* Title */}
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: "12px",
            lineHeight: 1.2,
          }}
        >
          Presentation Coach
        </h1>

        {/* Description */}
        <p
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: "0.95rem",
            lineHeight: 1.7,
            marginBottom: "32px",
          }}
        >
          AI-powered real-time presentation coaching with delivery analysis,
          body language feedback, and slide critique is being prepared for launch.
          Stay tuned.
        </p>

        {/* Notify CTA */}
        <button
          disabled
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 28px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))",
            border: "1px solid rgba(99,102,241,0.35)",
            borderRadius: "12px",
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "not-allowed",
          }}
        >
          <Bell size={16} />
          Notify Me on Launch
        </button>

        <p style={{ marginTop: "20px", fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>
          Available exclusively on Tulasi AI Pro
        </p>
      </div>
    </div>
  );
}
