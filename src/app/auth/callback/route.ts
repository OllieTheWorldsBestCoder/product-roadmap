import { handleAuth } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';

const authHandler = handleAuth({ returnPathname: '/' });

export async function GET(request: NextRequest) {
  const response = await authHandler(request);

  // handleAuth constructs the redirect from request.url, which inside Docker
  // resolves to the container's internal address (0.0.0.0:10000).
  // Override with the public app URL.
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (location) {
      try {
        const parsed = new URL(location);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://roadmap.kernel.ai';
        const publicUrl = new URL(parsed.pathname + parsed.search, appUrl);
        return NextResponse.redirect(publicUrl, { headers: response.headers });
      } catch {
        // fall through to original response
      }
    }
  }

  return response;
}
