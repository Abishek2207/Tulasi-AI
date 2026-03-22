"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/chat");
  }, [router]);
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Redirecting...</p>
    </div>
  );
}
