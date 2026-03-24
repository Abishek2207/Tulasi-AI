import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    
    if (res.ok) {
      return NextResponse.json({ success: true, message: "Backend pinged successfully" });
    }
    return NextResponse.json({ success: false, status: res.status });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Ping failed" }, { status: 500 });
  }
}
