"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      if (localStorage.getItem("tulasi-pwa-dismissed")) return;
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    localStorage.setItem("tulasi-pwa-dismissed", "true");
    setShow(false);
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", bounce: 0.3 }}
          style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            zIndex: 9999, width: "min(420px, 90vw)",
            background: "rgba(15,15,22,0.95)", backdropFilter: "blur(24px)",
            borderRadius: 20, border: "1px solid rgba(167,139,250,0.3)",
            padding: "20px 24px", display: "flex", alignItems: "center", gap: 16,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(167,139,250,0.1)",
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(135deg, #A78BFA, #22D3EE)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
          }}>🪷</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 3 }}>Install Tulasi AI</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Add to your home screen for instant access</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={() => { localStorage.setItem("tulasi-pwa-dismissed", "true"); setShow(false); }} style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              Later
            </button>
            <button onClick={install} style={{ padding: "8px 16px", borderRadius: 10, background: "linear-gradient(135deg, #A78BFA, #22D3EE)", border: "none", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 800 }}>
              Install
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
