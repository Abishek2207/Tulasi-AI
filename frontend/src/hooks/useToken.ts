/**
 * useToken — Hard Reset Token Hook
 * SINGLE SOURCE OF TRUTH: localStorage
 */
import { useEffect, useState } from "react";

export function useToken(): string {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("token");
      if (stored) {
        setToken(stored);
      }
    }
  }, []);

  return token;
}
