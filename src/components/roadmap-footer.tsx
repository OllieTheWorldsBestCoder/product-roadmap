type FooterProps = {
  isLoggedIn: boolean;
  user: { email: string; firstName: string | null } | null;
};

async function SignInLink() {
  const { getSignInUrl } = await import('@workos-inc/authkit-nextjs');
  const url = await getSignInUrl();
  return (
    <a href={url} className="text-muted-text hover:text-ink transition-colors">
      Kernel team? Sign in
    </a>
  );
}

async function SignOutLink({ firstName }: { firstName: string | null }) {
  const { signOut } = await import('@workos-inc/authkit-nextjs');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://roadmap.kernel.ai';
  const action = async () => {
    'use server';
    await signOut({ returnTo: appUrl });
  };
  return (
    <form action={action} className="inline">
      {firstName && (
        <span className="text-muted-text mr-2">{firstName}</span>
      )}
      <button type="submit" className="text-muted-text hover:text-ink transition-colors">
        Sign out
      </button>
    </form>
  );
}

export async function RoadmapFooter({ isLoggedIn, user }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-border-kernel py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <p className="text-[12px] text-muted-text">
          &copy; {new Date().getFullYear()} Kernel
        </p>
        <div className="text-[12px]">
          {isLoggedIn ? (
            <SignOutLink firstName={user?.firstName ?? null} />
          ) : (
            <SignInLink />
          )}
        </div>
      </div>
    </footer>
  );
}
