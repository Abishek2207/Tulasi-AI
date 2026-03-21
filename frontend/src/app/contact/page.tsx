"use client";

import Link from "next/link";
import { TulasiLogo } from "@/components/TulasiLogo";
import { ArrowLeft, Mail, MessageSquare, Twitter } from "lucide-react";

export default function Contact() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "var(--font-inter)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px" }}>
        
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", textDecoration: "none", marginBottom: 32, fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <TulasiLogo size={48} />
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, fontFamily: "var(--font-display)" }}>Contact Support</h1>
            <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0", fontSize: 14 }}>We generally respond within 24 hours.</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 48, borderRadius: 24, fontSize: 16, lineHeight: 1.8, color: "var(--text-secondary)" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
             <div style={{ background: "rgba(124,58,237,0.1)", padding: 12, borderRadius: 12 }}><Mail color="#A78BFA" /></div>
             <div>
               <h3 style={{ margin: 0, color: "white", fontSize: 18 }}>Email Us</h3>
               <p style={{ margin: 0, fontSize: 14 }}>support@tulasiai.com</p>
             </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
             <div style={{ background: "rgba(6,182,212,0.1)", padding: 12, borderRadius: 12 }}><MessageSquare color="#06B6D4" /></div>
             <div>
               <h3 style={{ margin: 0, color: "white", fontSize: 18 }}>Join our Discord</h3>
               <p style={{ margin: 0, fontSize: 14 }}>Live community support & feature requests.</p>
             </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
             <div style={{ background: "rgba(29, 161, 242, 0.1)", padding: 12, borderRadius: 12 }}><Twitter color="#1DA1F2" /></div>
             <div>
               <h3 style={{ margin: 0, color: "white", fontSize: 18 }}>Twitter / X</h3>
               <p style={{ margin: 0, fontSize: 14 }}>@TulasiAI</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
