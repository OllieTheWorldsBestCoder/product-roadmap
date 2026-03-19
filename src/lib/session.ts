export type SessionContext = {
  isLoggedIn: boolean;
  isKernelTeam: boolean;
  user: { email: string; firstName: string | null } | null;
};

export async function getSessionContext(): Promise<SessionContext> {
  if (process.env.DEV_BYPASS_AUTH) {
    return {
      isLoggedIn: true,
      isKernelTeam: true,
      user: { email: 'dev@kernel.ai', firstName: 'Dev' },
    };
  }

  const { withAuth } = await import('@workos-inc/authkit-nextjs');
  const { user } = await withAuth({ ensureSignedIn: false });

  if (!user) return { isLoggedIn: false, isKernelTeam: false, user: null };

  return {
    isLoggedIn: true,
    isKernelTeam: user.email?.endsWith('@kernel.ai') ?? false,
    user: { email: user.email ?? '', firstName: user.firstName ?? null },
  };
}
