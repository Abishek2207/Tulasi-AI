import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protect all dashboard routes
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/profile') ||
        request.nextUrl.pathname.startsWith('/notes') ||
        request.nextUrl.pathname.startsWith('/hackathons') ||
        request.nextUrl.pathname.startsWith('/certificates') ||
        request.nextUrl.pathname.startsWith('/ai-hub') ||
        request.nextUrl.pathname.startsWith('/coding') ||
        request.nextUrl.pathname.startsWith('/learning') ||
        request.nextUrl.pathname.startsWith('/interviews') ||
        request.nextUrl.pathname.startsWith('/roadmaps') ||
        request.nextUrl.pathname.startsWith('/social') ||
        request.nextUrl.pathname.startsWith('/settings');

    if (isDashboardRoute && !user) {
        // If user is not signed in and trying to access protected route, redirect to login
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If user is logged in and trying to access login/register, redirect to dashboard
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
    if (isAuthRoute && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // Redirect root to dashboard if logged in, else login
    if (request.nextUrl.pathname === '/') {
        const url = request.nextUrl.clone()
        url.pathname = user ? '/dashboard' : '/login'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
