import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Define protected routes
const protectedRoutes = ['/dashboard', '/teachers', '/attendance', '/evaluations', '/notes', '/reports', '/notifications', '/settings'];
const authRoutes = ['/login'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('auth-token')?.value;

    // Check if user is authenticated
    const user = token ? verifyToken(token) : null;

    // Redirect authenticated users away from auth routes
    if (authRoutes.some(route => pathname.startsWith(route))) {
        if (user) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // Protect dashboard routes
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
        if (!user) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Redirect root to dashboard or login
    if (pathname === '/') {
        if (user) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
