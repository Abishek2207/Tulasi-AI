import { NextResponse } from 'next/server';

// This is a server-side Route Handler — localStorage is unavailable here.
// We ping the backend health endpoint without a user token (public endpoint).
export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://tulasi-ai-wgwl.onrender.com";
  try {
    const res = await fetch(`${backendUrl}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ success: true, message: "Backend pinged", backend_status: data.status, uptime: data.uptime_seconds });
    }
    return NextResponse.json({ success: false, status: res.status, message: "Backend returned non-200" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Backend unreachable", details: String(error) }, { status: 200 });
  }
}
