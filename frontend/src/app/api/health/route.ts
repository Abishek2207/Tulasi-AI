import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

/**
 * Frontend Health Proxy / Redirect Warning
 * This route exists to prevent 404 errors when the browser incorrectly
 * pings the frontend port (3000) for backend health (10000).
 */
export async function GET() {
  const backendUrl = API_URL;
  
  return NextResponse.json({
    status: "frontend_active",
    message: "You are reaching the frontend API. The real backend is at the URL below.",
    backend_target: backendUrl,
    timestamp: new Date().toISOString()
  });
}
