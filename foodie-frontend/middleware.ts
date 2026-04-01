import { NextResponse, type NextRequest } from 'next/server';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access')?.value;
  const pathname = request.nextUrl.pathname;

  let user = null;
  if (token) {
    user = parseJwt(token);
  }

  // 1. Authentication Guard: Redirect to /login if not logged in for protected routes
  const protectedPrefixes = ['/admin', '/client', '/chef', '/profile', '/book'];
  const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Admin Authorization Guard
  if (pathname.startsWith('/admin')) {
    const userRole = user?.role;
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 3. Role-based Dashboard Redirect
  if (pathname === '/' && user) {
    if (user.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (user.role === 'chef') {
      const target = user.onboarding_status === 'complete' ? '/chef/dashboard' : '/chef-onboarding';
      return NextResponse.redirect(new URL(target, request.url));
    } else {
      const target = user.onboarding_status === 'complete' ? '/client/home' : '/onboarding';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
    '/chef/:path*',
    '/profile/:path*',
    '/api/:path*',
    '/book/:path*',
  ],
};
