import { NextResponse, type NextRequest } from 'next/server'

const protectedPaths = ['/aluno', '/professor', '/checkout']
const authPaths = ['/login', '/cadastro']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // For API proxy requests: inject Authorization header from cookie
  if (pathname.startsWith('/api/') && token) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('Authorization', `Bearer ${token}`)
    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  // Protected routes: redirect to /login if no token
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Auth routes: redirect to home if already logged in
  if (authPaths.some((p) => pathname.startsWith(p))) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/aluno/:path*',
    '/professor/:path*',
    '/checkout/:path*',
    '/login',
    '/cadastro',
    '/api/:path*',
  ],
}
