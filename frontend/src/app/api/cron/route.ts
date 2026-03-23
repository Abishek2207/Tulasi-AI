import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://tulasiai.up.railway.app";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json();
    return NextResponse.json({
      pinged: true,
      backend_status: data.status || "unknown",
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
      const error = err as Error;
    return NextResponse.json({
      pinged: false,
      error: error.message || "Failed to reach backend",
      timestamp: new Date().toISOString(),
    }, { status: 200 }); // Always 200 so Vercel doesn't disable the cron
  }
}
