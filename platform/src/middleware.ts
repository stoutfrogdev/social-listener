import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Middleware logic here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if the path requires authentication
        const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard')
        const isApiRoute = req.nextUrl.pathname.startsWith('/api/brands')

        if (isProtectedRoute || isApiRoute) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/brands/:path*',
  ],
}
