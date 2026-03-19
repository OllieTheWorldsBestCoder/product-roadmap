import Image from 'next/image';

type HeaderProps = {
  isKernelTeam: boolean;
};

export function Header({ isKernelTeam }: HeaderProps) {
  return (
    <header className="bg-ink border-b border-white/8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-3">
          <Image src="/kernel.svg" alt="Kernel" width={120} height={40} className="shrink-0 brightness-0 invert" />
          {isKernelTeam && (
            <span className="text-[11px] font-medium rounded-full px-2 py-0.5 bg-sage-600/20 text-sage-400 border border-sage-600/20">
              Kernel team
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
