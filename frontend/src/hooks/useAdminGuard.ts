"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAdminGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const isLoading = status === "loading";
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAdmin, isLoading, router]);

  return { isAdmin, isLoading };
}
