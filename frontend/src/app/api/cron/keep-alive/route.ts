import { NextResponse } from "next/server";

export async function GET() {
  const RENDER_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://tulasi-ai-soda.onrender.com";
  
  try {
    const res = await fetch(`${RENDER_BACKEND_URL}/api/health`, {
      method: "GET",
      cache: "no-store",
    });
    
    if (res.ok) {
      console.log("[CRON] Pinged Render backend successfully.");
      return NextResponse.json({ status: "success", message: "Render backend pinged successfully." }, { status: 200 });
    } else {
      console.warn(`[CRON] Render backend returned status: ${res.status}`);
      return NextResponse.json({ status: "warning", message: `Render backend returned status: ${res.status}` }, { status: res.status });
    }
  } catch (err: any) {
    console.error("[CRON] Failed to ping Render backend:");
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
