import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/projects', '/profile', '/settings'];

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const pathname = request.nextUrl.pathname;

  // If no session, only allow access to login page
  if (!session) {
    if (pathname === '/login') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If has session but on login page, redirect to dashboard
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Only check onboarding status for protected routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/check-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionCookie: session }),
      });

      const data = await response.json();

      if (!data.isAuthenticated || data.userDeleted) {
        // Si l'utilisateur n'est plus authentifié ou a été supprimé, on supprime le cookie et on redirige vers login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('session');
        return response;
      }

      if (!data.onboardingCompleted && pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/projects/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/onboarding/:path*'
  ],
};
