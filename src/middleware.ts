import { NextResponse } from 'next/server';
import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

const workosMiddleware = authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    // Allow all paths unauthenticated — no forced login anywhere.
    // The session cookie is still read/refreshed so withAuth() works server-side.
    unauthenticatedPaths: ['/(.*)', '/api/health', '/auth/callback'],
  },
});

export default function middleware(...args: Parameters<typeof workosMiddleware>) {
  if (process.env.DEV_BYPASS_AUTH) return NextResponse.next();
  return workosMiddleware(...args);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon.svg|kernel.svg).*)'],
};
