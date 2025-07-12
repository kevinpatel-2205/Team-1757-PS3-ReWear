import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Debug logging (only for admin routes)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔍 Admin route access attempt')
    console.log('- Path:', request.nextUrl.pathname)
    console.log('- Token exists:', !!token)
    console.log('- Token preview:', token ? token.substring(0, 20) + '...' : 'none')
  }

  const user = token ? getUserFromToken(token) : null

  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('- User from token:', user ? { id: user.id, role: user.role } : 'null')
  }

  // Protected routes that require authentication
  const protectedRoutes = []  // Temporarily disable protection
  const adminRoutes = []       // Temporarily disable admin check

  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  const isAdminRoute = adminRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !user) {
    if (request.nextUrl.pathname.startsWith('/admin')) {
      console.log('❌ Redirecting to login: no user found')
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to home if non-admin tries to access admin routes
  if (isAdminRoute && user && user.role !== 'admin') {
    if (request.nextUrl.pathname.startsWith('/admin')) {
      console.log('❌ Redirecting to home: user role is', user.role, 'not admin')
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('✅ Allowing admin access')
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
