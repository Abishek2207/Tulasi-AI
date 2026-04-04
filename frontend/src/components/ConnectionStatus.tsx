"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";

export function ConnectionStatus() {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [tokenPresent, setTokenPresent] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      // Check Token
      const token = localStorage.getItem("token");
      setTokenPresent(!!token);

      // Check API Health
      try {
        const res = await fetch(`${API_URL}/api/health`, { cache: 'no-store', headers: {"Content-Type":"application/json","Authorization":`Bearer ${localStorage.getItem("token")}`}, credentials:"omit", mode:"cors" });
        if (res.ok) {
          setApiOnline(true);
          setLastError(null);
        } else {
          setApiOnline(false);
          setLastError(`HTTP ${res.status}`);
        }
      } catch (err: unknown) {
      const error = err as Error;
        setApiOnline(false);
        setLastError(error.message || "Connection Failed");
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 p-4 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md shadow-2xl text-[11px] font-mono min-w-[180px]"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-white/40 uppercase tracking-widest font-bold">System Debug</span>
        <button onClick={() => setShow(false)} className="text-white/20 hover:text-white">✕</button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white/60">API:</span>
        <span className={apiOnline ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
          {apiOnline === null ? "..." : apiOnline ? "ONLINE" : "OFFLINE"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white/60">TOKEN:</span>
        <span className={tokenPresent ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
          {tokenPresent ? "PRESENT" : "MISSING"}
        </span>
      </div>

      {lastError && (
        <div className="mt-1 pt-1 border-t border-white/5">
          <span className="text-rose-400/80 block leading-tight truncate max-w-[150px]" title={lastError}>
            ERR: {lastError}
          </span>
        </div>
      )}

      {!apiOnline && apiOnline !== null && (
        <div className="mt-1 text-[9px] text-white/30 italic">
          Railway may be sleeping...
        </div>
      )}
    </motion.div>
  );
}

