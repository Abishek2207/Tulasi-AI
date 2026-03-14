import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tulasi-api-ldcw.onrender.com';
    
    // Ping the backend's root or health endpoint
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
      // Short timeout to not hang the Vercel cron function
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      return NextResponse.json({ success: true, message: 'Backend pinged successfully' });
    } else {
      return NextResponse.json(
        { success: false, message: `Backend responded with status: ${response.status}` },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Keep-alive cron error:', error);
    // Ignore abort errors as the ping is still sent
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ success: true, message: 'Ping sent (timed out waiting for response)' });
    }
    return NextResponse.json(
      { success: false, message: 'Failed to ping backend', error: String(error) },
      { status: 500 }
    );
  }
}
