"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { API_URL } from "@/lib/api";

export function CareerIntelligenceOnboardingCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // ONLY redirect to CI onboarding when user is explicitly visiting the career-intelligence page
    // Do NOT run this check on ALL dashboard pages — that breaks every other feature
    if (!pathname.startsWith("/dashboard/career-intelligence") || pathname.includes("/career-intelligence/onboarding")) {
      setChecking(false);
      return;
    }

    const checkProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const res = await fetch(`${API_URL}/api/v1/career-intelligence/profile`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (res.status === 404) {
          // Profile doesn't exist, redirect to onboarding
          router.push("/dashboard/career-intelligence/onboarding");
        }
      } catch (err) {
        console.error("Failed to check career intelligence profile", err);
      } finally {
        setChecking(false);
      }
    };

    checkProfile();
  }, [pathname, router]);

  return null;
}
