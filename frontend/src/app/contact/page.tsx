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
               <p style={{ margin: 0, fontSize: 14 }}>
                  <a href="mailto:abishekramamoorthy22@gmail.com" style={{ color: "var(--brand-secondary)", textDecoration: "none" }}>abishekramamoorthy22@gmail.com</a>
               </p>
             </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
             <div style={{ background: "rgba(16,185,129,0.1)", padding: 12, borderRadius: 12 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
             </div>
             <div>
               <h3 style={{ margin: 0, color: "white", fontSize: 18 }}>Phone</h3>
               <p style={{ margin: 0, fontSize: 14 }}>
                  <a href="tel:6369538345" style={{ color: "var(--brand-secondary)", textDecoration: "none" }}>+91 63695 38345</a>
               </p>
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

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 32, padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
             <div style={{ background: "rgba(225, 48, 108, 0.1)", padding: 12, borderRadius: 12 }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
             </div>
             <div>
               <h3 style={{ margin: 0, color: "white", fontSize: 18 }}>Instagram</h3>
               <p style={{ margin: 0, fontSize: 14 }}>
                  <a href="https://www.instagram.com/_.abi22._/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand-accent)", textDecoration: "none" }}>@_.abi22._</a>
               </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
