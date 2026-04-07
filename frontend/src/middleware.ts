import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  // Supabase sets its own cookies starting with sb-
  const hasSupabaseCookie = Array.from(request.cookies.getAll()).some(c => c.name.startsWith('sb-'));

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  // If no auth token found, redirect to /auth
  if (!token && !hasSupabaseCookie) {
    if (!isAuthPage) {
      const authUrl = new URL('/auth', request.url);
      return NextResponse.redirect(authUrl);
    }
  } else {
    // If logged in and trying to go to /auth or /, redirect to /dashboard
    if (isAuthPage || request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (images folder)
     * - auth/callback (OAuth callback)
     * - robots.txt, sitemap.xml, manifest.json, sw.js, workbox-*
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|auth/callback|robots.txt|sitemap.xml|manifest.json|sw.js|workbox-).*)',
  ],
};
