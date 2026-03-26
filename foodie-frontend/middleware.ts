import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

<<<<<<< HEAD
export function middleware(req: NextRequest) {
=======
export async function middleware(req: NextRequest) {
>>>>>>> bcccd1ca (feat: complete supabase eradication and auth hardening (pilot refactor))
  const token = req.cookies.get('token')?.value;
  // We'll store the role in a cookie for middleware access since we can't decode the token easily here
  // The AuthContext sets this cookie on login/register
  const role = req.cookies.get('user_role')?.value;
  const pathname = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/chefs', '/discover', '/meals', '/business', '/about', '/careers', '/support', '/press', '/terms', '/privacy'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
<<<<<<< HEAD

  // Check if this is an auth route (login, register, or /auth)
  const isAuthRoute =
    pathname === '/auth' ||
    pathname === '/login' ||
=======
  
  // Check if this is an auth route
  const isAuthRoute = 
    pathname === '/auth' || 
    pathname === '/login' || 
>>>>>>> bcccd1ca (feat: complete supabase eradication and auth hardening (pilot refactor))
    pathname === '/register' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/register/');

<<<<<<< HEAD
  // Allow public routes and static files
  if (isPublicRoute || pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname.startsWith('/images/')) {
=======
  // Allow public routes and static assets
  if (isPublicRoute || pathname.startsWith('/_next/') || pathname.startsWith('/api/')) {
>>>>>>> bcccd1ca (feat: complete supabase eradication and auth hardening (pilot refactor))
    return NextResponse.next();
  }

  // If no token and trying to access protected routes, redirect to auth
  if (!token && !isAuthRoute && !isPublicRoute) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

<<<<<<< HEAD
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
=======
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
>>>>>>> bcccd1ca (feat: complete supabase eradication and auth hardening (pilot refactor))
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/client/:path*',
    '/chef/:path*',
<<<<<<< HEAD
    '/farmer/:path*',
    '/business/:path*',
=======
    '/admin/:path*',
>>>>>>> bcccd1ca (feat: complete supabase eradication and auth hardening (pilot refactor))
    '/auth/:path*',
    '/login/:path*',
    '/register/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/bookings/:path*',
  ],
};
