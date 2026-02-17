// middleware.ts - Root level e rakhben (Frontend/middleware.ts)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  // Debug: log auth context for protected paths
  if (pathname.startsWith('/profile')) {
    console.log('[middleware] path:', pathname, 'token:', token ? 'present' : 'missing', 'userRole:', userRole);
  }

  // Public routes - authentication na lagbe
  const publicPaths = ['/', '/login', '/register', '/exam', '/courses',  '/results'];
  // const isPublicPath = publicPaths.includes(pathname);

  // Protected routes - logged in user access korbe
  const protectedPaths = ['/profile',];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // Admin routes - only admin/moderator
  const adminPaths = ['/admin/dashboard', '/admin/users', '/admin/exams', '/admin/anonymous-users'];
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));

  // ==========================================
  // Rule 1: Protected routes e token check
  // ==========================================
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ==========================================
  // Rule 2: Admin routes e role check
  // ==========================================
  if (isAdminPath) {
    if (!token) {
      // Not logged in -> redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      // Logged in but not admin -> redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ==========================================
  // Rule 3: Already logged in user login/register e jete parbe na
  // ==========================================
  if (token && (pathname === '/login' || pathname === '/register')) {
    // Check if admin
    if (userRole === 'ADMIN' || userRole === 'MODERATOR') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    // Regular user
    // return NextResponse.redirect(new URL('/exam', request.url));
  }

  // ==========================================
  // Rule 4: Allow access
  // ==========================================
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}