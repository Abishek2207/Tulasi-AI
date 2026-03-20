import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tulasiai.up.railway.app';
    const parsedUrl = backendUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    
    // Ping the backend health endpoint
    const response = await fetch(`${parsedUrl}/api/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    if (response.ok) {
      return NextResponse.json({ success: true, message: "Backend pinged successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: "Backend ping failed" }, { status: response.status });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
