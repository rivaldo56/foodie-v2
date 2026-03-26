import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const pathname = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/chefs', '/discover', '/meals', '/business', '/about', '/careers', '/support', '/press', '/terms', '/privacy'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  
  // Check if this is an auth route
  const isAuthRoute = 
    pathname === '/auth' || 
    pathname === '/login' || 
    pathname === '/register' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/register/');

  // Allow public routes and static assets
  if (isPublicRoute || pathname.startsWith('/_next/') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // If no token and trying to access protected routes, redirect to auth
  if (!token && !isAuthRoute && !isPublicRoute) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If token exists, do rigorous backend validation instead of trusting the client
  if (token) {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const verifyRes = await fetch(`${backendUrl}/api/users/verify/`, {
        headers: { 'Authorization': `Token ${token}` },
        cache: 'no-store'
      });
      
      if (!verifyRes.ok) {
        // Invalid token - clear cookie and redirect
        const response = NextResponse.redirect(new URL('/auth', req.url));
        response.cookies.delete('token');
        return response;
      }
      
      const userData = await verifyRes.json();
      const role = userData.role;

      // Handle auth route redirection if already logged in
      if (isAuthRoute) {
        return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
      }

      // Role-based route protection
      if (pathname.startsWith('/client/') && role !== 'client') {
        return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
      }
      if (pathname.startsWith('/chef/') && role !== 'chef' && role !== 'admin') {
        return NextResponse.redirect(new URL(`/client/home`, req.url));
      }
      if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL(`/client/home`, req.url));
      }
      
      return NextResponse.next();
      
    } catch (error) {
      console.error('Middleware token verification failed:', error);
      // Let it pass through to client components which should handle network failures
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/client/:path*',
    '/chef/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/login/:path*',
    '/register/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/bookings/:path*',
  ],
};
