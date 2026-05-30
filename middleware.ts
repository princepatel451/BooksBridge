import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PROTECTED_ROUTES = ['/dashboard', '/cart', '/orders', '/profile', '/wishlist', '/seller', '/admin', '/checkout', '/messages', '/notifications']
const SELLER_ROUTES = ['/seller']
const ADMIN_ROUTES = ['/admin']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  if (!isProtected) return NextResponse.next()

  const token = req.cookies.get('auth-token')?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  const payload = verifyToken(token)
  if (!payload) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Role checks for seller and admin routes
  if (SELLER_ROUTES.some(r => pathname.startsWith(r)) && payload.role !== 'SELLER' && payload.role !== 'ADMIN') {
    // Allow onboarding for buyers wanting to become sellers
    if (!pathname.startsWith('/seller/onboard')) {
      return NextResponse.redirect(new URL('/seller/onboard', req.url))
    }
  }

  if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) && payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Add user info to headers for SSR
  const headers = new Headers(req.headers)
  headers.set('x-user-id', payload.userId)
  headers.set('x-user-role', payload.role)
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
