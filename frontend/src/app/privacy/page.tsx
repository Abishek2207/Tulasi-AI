"use client";

import Link from "next/link";
import { TulasiLogo } from "@/components/TulasiLogo";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "var(--font-inter)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px" }}>
        
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", textDecoration: "none", marginBottom: 32, fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <TulasiLogo size={48} />
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, fontFamily: "var(--font-display)" }}>Privacy Policy</h1>
            <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0", fontSize: 14 }}>Last updated: March 2026</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 48, borderRadius: 24, fontSize: 16, lineHeight: 1.8, color: "var(--text-secondary)" }}>
          <h2 style={{ color: "white", fontSize: 24, marginTop: 0 }}>1. Information We Collect</h2>
          <p>We strictly collect the minimum amount of data necessary to provide you with an Apple-level AI experience. This includes your email, name, and encrypted authentication tokens. Payment data is processed entirely by Razorpay; we do not store credit card numbers on our servers.</p>

          <h2 style={{ color: "white", fontSize: 24, marginTop: 40 }}>2. How We Use Your Data</h2>
          <p>Your session history, uploaded PDFs, and coding metrics are utilized exclusively to power your personalized gamification systems (XP, Streaks) and AI contextual memory. We NEVER sell your data to third-party advertisers.</p>

          <h2 style={{ color: "white", fontSize: 24, marginTop: 40 }}>3. Data Security & Encryption</h2>
          <p>All traffic between your browser and our Railway backend is AES-256 encrypted natively over HTTPS. Your passwords are one-way hashed using bcrypt. Our databases are strictly siloed behind VPCs.</p>

          <h2 style={{ color: "white", fontSize: 24, marginTop: 40 }}>4. Your Rights</h2>
          <p>You reserve the right to delete your Tulasi AI account natively from your dashboard, which automatically purges all your associated Chat, Document, and API records within 24 hours.</p>

          <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: 14 }}>
            For privacy queries, please reach us via the Contact page.
          </div>
        </div>
      </div>
    </div>
  );
}
