import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    const path = req.nextUrl.pathname

    // Protected routes: redirect to login if not authenticated
    const isProtectedRoute = path.startsWith('/dashboard') ||
        path.startsWith('/chatbot') ||
        path.startsWith('/editor') ||
        path.startsWith('/notes') ||
        path.startsWith('/roadmap') ||
        path.startsWith('/interview') ||
        path.startsWith('/reels') ||
        path.startsWith('/groups') ||
        path.startsWith('/resume') ||
        path.startsWith('/certificates') ||
        path.startsWith('/ai-hub')

    if (!session && isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // Auth routes: redirect to dashboard if already authenticated
    const isAuthRoute = path === '/login' || path === '/register' || path === '/forgot-password'

    if (session && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login',
        '/register',
        '/forgot-password',
        '/chatbot/:path*',
        '/editor/:path*',
        '/notes/:path*',
        '/roadmap/:path*',
        '/interview/:path*',
        '/reels/:path*',
        '/groups/:path*',
        '/resume/:path*',
        '/certificates/:path*',
        '/ai-hub/:path*'
    ]
}
