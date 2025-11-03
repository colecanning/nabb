export { default } from 'next-auth/middleware';

// Protect all routes except the login page, API routes, and static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - api/webhook (webhook endpoint)
     * - api/process-reel (background processing endpoint - protected by internal secret)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - saves (public save detail pages)
     */
    '/((?!api/auth|api/webhook|api/process-reel|_next/static|_next/image|favicon.ico|login|saves).*)',
  ],
};

