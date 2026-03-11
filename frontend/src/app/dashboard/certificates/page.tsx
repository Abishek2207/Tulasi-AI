"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

const CERTS = [
  { id: "ai-prompt", title: "AI Prompt Engineering", date: "Mar 15, 2026", duration: "10 Hours", track: "Artificial Intelligence" },
  { id: "react-adv", title: "Advanced React Patterns", date: "Feb 28, 2026", duration: "25 Hours", track: "Frontend Engineering" },
  { id: "sys-design", title: "System Design Masters", date: "Jan 10, 2026", duration: "40 Hours", track: "Backend Engineering" },
  { id: "leetcode-100", title: "Problem Solver 100", date: "Locked", duration: "100 Problems", track: "Algorithms", locked: true },
];

export default function CertificatesPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Student Name";
  const [selectedCert, setSelectedCert] = useState<typeof CERTS[0] | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60, position: "relative" }}>
      
      {/* Hide all this content when printing */}
      <div className="no-print">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 12 }}>
            Your <span className="gradient-text" style={{ background: "linear-gradient(135deg, #FFD93D, #FF6B6B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Credentials</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
            View and download verified certificates for completing Tulasi AI learning tracks.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {CERTS.map((cert) => (
            <motion.div 
              key={cert.id}
              whileHover={{ y: -5, scale: 1.02 }}
              className="dash-card"
              style={{ padding: 24, border: "1px solid rgba(255,217,61,0.2)", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "linear-gradient(135deg, #FFD93D, #FF6B6B)", filter: "blur(40px)", opacity: 0.2 }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 40 }}>🎓</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>{cert.date}</span>
              </div>
              
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8, lineHeight: 1.3 }}>{cert.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>Track: {cert.track} • {cert.duration}</p>
              
              {cert.locked ? (
                <button 
                  disabled
                  className="btn btn-secondary" 
                  style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px dashed rgba(255,255,255,0.2)", color: "var(--text-muted)", cursor: "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  🔒 Locked ({cert.duration})
                </button>
              ) : (
                <button 
                  onClick={() => setSelectedCert(cert)}
                  className="btn btn-primary" 
                  style={{ width: "100%", background: "linear-gradient(135deg, #FFD93D, #FF6B6B)", color: "#111", fontWeight: 800, padding: 12, borderRadius: 12, border: "none" }}
                >
                  View Certificate
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal / Print Preview Layer */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="no-print"
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}
            onClick={() => setSelectedCert(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: "var(--background)", padding: 24, borderRadius: 24, border: "1px solid var(--border)", position: "relative", maxWidth: 900, width: "100%" }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedCert(null)}
                style={{ position: "absolute", top: 24, right: 24, background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: 32, height: 32, borderRadius: 16, cursor: "pointer", zIndex: 10 }}
              >✕</button>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Certificate Preview</h2>
                <button onClick={handlePrint} className="btn btn-primary" style={{ background: "linear-gradient(135deg, #FFD93D, #FF6B6B)", color: "#111", padding: "10px 24px", borderRadius: 12, fontWeight: 700, border: "none" }}>📥 Download PDF</button>
              </div>

              {/* Landscape scaled-down preview */}
              <div style={{ width: "100%", aspectRatio: "1.414", background: "white", color: "black", borderRadius: 12, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40, border: "8px double #111" }}>
                
                <div style={{ position: "absolute", top: 30, left: 30, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, background: "black", borderRadius: 8 }} />
                  <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-1px" }}>TULASI AI</span>
                </div>

                <div style={{ marginTop: 20 }}>
                  <h3 style={{ fontSize: 18, color: "#666", textTransform: "uppercase", letterSpacing: "4px", marginBottom: 16 }}>Certificate of Completion</h3>
                  <h1 style={{ fontSize: 48, fontWeight: 400, fontFamily: "serif", fontStyle: "italic", marginBottom: 32, borderBottom: "1px solid #ccc", paddingBottom: 8 }}>{userName}</h1>
                  <p style={{ fontSize: 16, color: "#444", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.6 }}>
                    Has successfully completed the <strong>{selectedCert.duration}</strong> learning track in 
                    <br/><span style={{ fontSize: 24, fontWeight: 700, color: "#111", display: "block", marginTop: 8 }}>{selectedCert.title}</span> 
                    validating their expertise and mastery in <strong>{selectedCert.track}</strong>.
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "0 40px", marginTop: "auto" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ borderBottom: "1px solid #333", width: 150, marginBottom: 8 }}><img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_John_Hancock.svg" height={40} style={{ opacity: 0.6 }} /></div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Lead Instructor</div>
                  </div>
                  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 80, height: 80, border: "4px solid #FFD93D", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 8, color: "#FFD93D", fontWeight: 900 }}>v1</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{selectedCert.date}</div>
                  </div>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual Print Layout (Only visible during print) */}
      {selectedCert && (
        <div id="cert-print-container" style={{ 
          width: "297mm", height: "210mm", /* A4 Landscape strictly */
          background: "white", color: "black", 
          padding: "20mm", boxSizing: "border-box",
          fontFamily: "'Helvetica Neue', Arial, sans-serif"
        }}>
          <div style={{ border: "10px double #111", width: "100%", height: "100%", padding: "20mm", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative" }}>
                 <div style={{ position: "absolute", top: 20, left: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, background: "black", borderRadius: 8 }} />
                  <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-1px" }}>TULASI AI</span>
                </div>

                <div style={{ marginTop: 60 }}>
                  <h3 style={{ fontSize: 24, color: "#666", textTransform: "uppercase", letterSpacing: "6px", marginBottom: 24 }}>Certificate of Completion</h3>
                  <h1 style={{ fontSize: 72, fontWeight: 400, fontFamily: "serif", fontStyle: "italic", marginBottom: 40, borderBottom: "2px solid #ccc", paddingBottom: 16 }}>{userName}</h1>
                  <p style={{ fontSize: 20, color: "#444", maxWidth: 800, margin: "0 auto 60px", lineHeight: 1.6 }}>
                    Has successfully completed the <strong>{selectedCert.duration}</strong> learning track in 
                    <br/><span style={{ fontSize: 32, fontWeight: 700, color: "#111", display: "block", marginTop: 12 }}>{selectedCert.title}</span> 
                    validating their expertise and mastery in <strong>{selectedCert.track}</strong>.
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "0 60px", marginTop: "auto" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ borderBottom: "2px solid #333", width: 200, marginBottom: 16, height: 60 }}></div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>Lead Instructor</div>
                  </div>
                  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 100, height: 100, border: "6px solid #FFD93D", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 12, color: "#FFD93D", fontWeight: 900 }}>v1</div>
                    <div style={{ fontSize: 16, color: "#666", fontWeight: 600 }}>Issued: {selectedCert.date}</div>
                  </div>
                </div>
          </div>
        </div>
      )}

      {/* CSS for PDF Print Setup */}
      <style>{`
        #cert-print-container { display: none; }
        
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { background: white; margin: 0; padding: 0; }
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          
          #cert-print-container {
            display: block !important;
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
          }
          #cert-print-container * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
}
