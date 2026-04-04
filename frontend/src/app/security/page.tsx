"use client";

import Link from "next/link";
import { TulasiLogo } from "@/components/TulasiLogo";
import { ArrowLeft, ShieldCheck, Lock, Server, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function SecurityPolicy() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "var(--font-inter)" }}>
      {/* Grid Background Overlay */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.05, pointerEvents: "none", zIndex: 0, backgroundImage: `radial-gradient(var(--text-muted) 0.5px, transparent 0.5px)`, backgroundSize: "24px 24px" }} />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", textDecoration: "none", marginBottom: 32, fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 56 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(10, 132, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(10, 132, 255, 0.2)" }}>
            <ShieldCheck size={32} color="#0A84FF" />
          </div>
          <div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 42px)", fontWeight: 900, margin: 0, fontFamily: "var(--font-outfit)", letterSpacing: "-1px" }}>Security Architecture</h1>
            <p style={{ color: "var(--text-muted)", margin: "8px 0 0 0", fontSize: 15, fontWeight: 500 }}>Hardened protocols for the Tulasi AI Engine.</p>
          </div>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Section 1: Data Encryption */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card" style={{ padding: "clamp(32px, 6vw, 48px)", borderRadius: 32, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <Lock size={20} color="white" />
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "white" }}>1. End-to-End Encryption</h2>
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text-secondary)", margin: 0 }}>
              All data in transit is protected using **TLS 1.3** with AES-256-GCM encryption. API communication between the frontend (Vercel) and the neural backend (Render) is strictly enforced over HTTPS with HSTS headers to prevent MITM attacks.
            </p>
          </motion.div>

          {/* Section 2: Infrastructure */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: "clamp(32px, 6vw, 48px)", borderRadius: 32, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <Server size={20} color="white" />
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "white" }}>2. Isolated Infrastructure</h2>
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text-secondary)", margin: 0 }}>
              Our production databases (PostgreSQL) are siloed within a Private Virtual Cloud (VPC), unreachable from the public internet. Access is restricted to specific internal IP ranges used by our application instances, ensuring multiple layers of network isolation.
            </p>
          </motion.div>

          {/* Section 3: Identity */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: "clamp(32px, 6vw, 48px)", borderRadius: 32, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <Users size={20} color="white" />
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "white" }}>3. Identity & Access (IAM)</h2>
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text-secondary)", margin: 0 }}>
              Tulasi AI utilizes industry-standard **JWT (JSON Web Tokens)** for session management. Passwords are never stored in plaintext; we use high-entropy salted hashing (**bcrypt** with adaptive cost factors) to protect user credentials against rainbow table and brute-force attacks.
            </p>
          </motion.div>

          {/* Section 4: Security Disclosure */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} style={{ padding: "24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 32 }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
              For vulnerability disclosures or security-specific inquiries, please contact our founder directly via the <Link href="/contact" style={{ color: "white", textDecoration: "underline" }}>Secure Channel</Link>.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
