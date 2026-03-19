import Image from 'next/image';

type HeaderProps = {
  isLoggedIn: boolean;
  isKernelTeam: boolean;
  user: { email: string; firstName: string | null } | null;
};

async function SignInButton() {
  const { getSignInUrl } = await import('@workos-inc/authkit-nextjs');
  const url = await getSignInUrl();
  return (
    <a
      href={url}
      className="text-[13px] font-medium text-white/60 hover:text-white transition-colors"
    >
      Sign in
    </a>
  );
}

async function SignOutButton({ firstName }: { firstName: string | null }) {
  const { signOut } = await import('@workos-inc/authkit-nextjs');
  const action = async () => { 'use server'; await signOut(); };
  return (
    <form action={action} className="flex items-center gap-3">
      {firstName && <span className="text-[13px] text-white/40">{firstName}</span>}
      <button
        type="submit"
        className="text-[13px] font-medium text-white/60 hover:text-white transition-colors"
      >
        Sign out
      </button>
    </form>
  );
}

export async function Header({ isLoggedIn, isKernelTeam, user }: HeaderProps) {
  return (
    <header className="bg-ink border-b border-white/8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Image src="/kernel.svg" alt="Kernel" width={120} height={40} className="shrink-0 brightness-0 invert" />
            {isKernelTeam && (
              <span className="text-[11px] font-medium rounded-full px-2 py-0.5 bg-sage-600/20 text-sage-400 border border-sage-600/20">
                Kernel team
              </span>
            )}
          </div>
          <div>
            {isLoggedIn ? (
              <SignOutButton firstName={user?.firstName ?? null} />
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
