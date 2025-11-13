import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Public routes
  if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/api/auth')) {
    return
  }

  // Protect all other routes
  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', req.url))
  }

  // Role-based access control
  const userRole = req.auth?.user?.role

  if (pathname.startsWith('/manager') && userRole !== 'MANAGER') {
    return Response.redirect(new URL('/dashboard', req.url))
  }

  if (pathname.startsWith('/waiter') && userRole !== 'WAITER') {
    return Response.redirect(new URL('/dashboard', req.url))
  }

  if (pathname.startsWith('/kitchen') && userRole !== 'CHEF') {
    return Response.redirect(new URL('/dashboard', req.url))
  }

  if (pathname.startsWith('/cashier') && userRole !== 'CASHIER') {
    return Response.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
