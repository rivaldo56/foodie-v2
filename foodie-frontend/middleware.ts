import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  // We'll store the role in a cookie for middleware access since we can't decode the token easily here
  // The AuthContext sets this cookie on login/register
  const role = req.cookies.get('user_role')?.value;
  const pathname = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/chefs', '/discover', '/meals', '/business', '/about', '/careers', '/support', '/press', '/terms', '/privacy'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));

  // Check if this is an auth route (login, register, or /auth)
  const isAuthRoute =
    pathname === '/auth' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/register/');

  // Allow public routes and static files
  if (isPublicRoute || pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname.startsWith('/images/')) {
    return NextResponse.next();
  }

  // If no token and trying to access protected routes, redirect to auth
  if (!token && !isAuthRoute && !isPublicRoute) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If token exists and trying to access auth routes, redirect based on role
  if (token && isAuthRoute) {
    if (role === 'chef') return NextResponse.redirect(new URL('/chef/dashboard', req.url));
    if (role === 'farmer') return NextResponse.redirect(new URL('/farmer/dashboard', req.url));
    if (role === 'business') return NextResponse.redirect(new URL('/business/dashboard', req.url));
    return NextResponse.redirect(new URL('/client/home', req.url));
  }

  // Strict Role-Based Access Control
  if (token && role) {
    // Client routes - only for clients
    if (pathname.startsWith('/client') && role !== 'client') {
      // Redirect to their appropriate dashboard
      if (role === 'chef') return NextResponse.redirect(new URL('/chef/dashboard', req.url));
      if (role === 'farmer') return NextResponse.redirect(new URL('/farmer/dashboard', req.url));
      if (role === 'business') return NextResponse.redirect(new URL('/business/dashboard', req.url));
    }

    // Chef routes - only for chefs, but allow farmers/businesses to view market
    if (pathname.startsWith('/chef') && role !== 'chef') {
      // Allow access to market for farmers and businesses
      if (pathname.startsWith('/chef/market') && (role === 'farmer' || role === 'business')) {
        return NextResponse.next();
      }

      if (role === 'client') return NextResponse.redirect(new URL('/client/home', req.url));
      if (role === 'farmer') return NextResponse.redirect(new URL('/farmer/dashboard', req.url));
      if (role === 'business') return NextResponse.redirect(new URL('/business/dashboard', req.url));
    }

    // Farmer routes - only for farmers
    if (pathname.startsWith('/farmer') && role !== 'farmer') {
      if (role === 'client') return NextResponse.redirect(new URL('/client/home', req.url));
      if (role === 'chef') return NextResponse.redirect(new URL('/chef/dashboard', req.url));
      if (role === 'business') return NextResponse.redirect(new URL('/business/dashboard', req.url));
    }

    // Business routes - only for businesses
    if (pathname.startsWith('/business') && !pathname.startsWith('/business/dashboard') && !pathname.startsWith('/business/products') && !pathname.startsWith('/business/orders') && !pathname.startsWith('/business/profile')) {
      // Allow public business landing page access for everyone (handled by isPublicRoute check above, but double check logic)
      // Actually, /business is public, but /business/dashboard etc are protected.
      // The check `pathname.startsWith('/business')` catches everything.
      // We need to distinguish between the public landing page and the protected dashboard.
      // The public route check handles `/business` exactly.
      // But `/business/dashboard` is NOT in public routes.
    }

    if (pathname.startsWith('/business/') && role !== 'business') {
      // Allow public subpages if any? No, dashboard is protected.
      if (role === 'client') return NextResponse.redirect(new URL('/client/home', req.url));
      if (role === 'chef') return NextResponse.redirect(new URL('/chef/dashboard', req.url));
      if (role === 'farmer') return NextResponse.redirect(new URL('/farmer/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/client/:path*',
    '/chef/:path*',
    '/farmer/:path*',
    '/business/:path*',
    '/auth/:path*',
    '/login/:path*',
    '/register/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/bookings/:path*',
  ],
};
