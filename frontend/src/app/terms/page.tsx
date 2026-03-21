"use client";

import Link from "next/link";
import { TulasiLogo } from "@/components/TulasiLogo";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "var(--font-inter)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px" }}>
        
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", textDecoration: "none", marginBottom: 32, fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <TulasiLogo size={48} />
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, fontFamily: "var(--font-display)" }}>Terms of Service</h1>
            <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0", fontSize: 14 }}>Effective Date: March 2026</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 48, borderRadius: 24, fontSize: 16, lineHeight: 1.8, color: "var(--text-secondary)" }}>
          <h2 style={{ color: "white", fontSize: 24, marginTop: 0 }}>1. Acceptance of Terms</h2>
          <p>By accessing or using the Tulasi AI platform, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>

          <h2 style={{ color: "white", fontSize: 24, marginTop: 40 }}>2. Subscription Plan Guidelines</h2>
          <p>Tulasi AI operates on a freemium model. Free tier users are limited to 10 daily chats (expandable via Referral XP). Tulasi Pro grants unlimited access. Subscription fees are processed securely via Razorpay and are non-refundable for the current billing cycle.</p>

          <h2 style={{ color: "white", fontSize: 24, marginTop: 40 }}>3. Acceptable Use Policy</h2>
          <p>You agree not to deliberately overload the AI endpoints, reverse engineer the platform logic, or generate malicious or illegal material using Tulasi AI models. Account termination may result from violating these terms.</p>

          <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: 14 }}>
            For legal inquiries, contact legal@tulasiai.com.
          </div>
        </div>
      </div>
    </div>
  );
}
