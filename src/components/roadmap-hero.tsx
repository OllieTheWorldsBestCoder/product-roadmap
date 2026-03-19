import Image from 'next/image';
import type { RoadmapProject } from '@/lib/linear';

type HeroProps = {
  projects: RoadmapProject[];
};

const QUARTER_SUBTITLES: Record<string, string> = {
  'Q1 2026': 'Foundation: KERN ID, Salesforce stability, and the data management essentials your team needs now.',
  'Q2 2026': 'Expansion: Self-serve configuration, deeper hierarchies, and integrations that put Kernel everywhere you work.',
  'Q3 2026': 'Depth: Complex entity structures, contact intelligence, and workflows that close the loop on territory planning.',
};

export function RoadmapHero({ projects }: HeroProps) {
  const counts = projects.reduce<Record<string, number>>((acc, p) => {
    if (p.quarter) acc[p.quarter] = (acc[p.quarter] ?? 0) + 1;
    return acc;
  }, {});

  const quarters = Object.keys(counts).sort((a, b) => {
    const parse = (s: string) => { const m = s.match(/^Q(\d)\s+(\d{4})$/); return m ? parseInt(m[2]) * 10 + parseInt(m[1]) : 9999; };
    return parse(a) - parse(b);
  });

  return (
    <div className="relative text-white overflow-hidden" style={{ backgroundColor: '#2d3d34' }}>
      {/* Wave background — next/image for proper resampling + quality */}
      <Image
        src="/hero-waves.png"
        alt=""
        fill
        priority
        quality={100}
        className="object-cover"
      />
      {/* Dark overlay so text stays readable */}
      <div className="absolute inset-0 bg-ink/55" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="max-w-3xl">
          <p className="text-[12px] font-medium tracking-widest uppercase text-sage-400 mb-4">
            Product Roadmap · 2026
          </p>
          <h1 className="text-[32px] sm:text-[40px] font-semibold leading-tight mb-5 text-white">
            What we&apos;re building
          </h1>
          <p className="text-[16px] leading-relaxed text-white/60 max-w-2xl">
            From the KERN ID to territory planning, every item here makes Kernel&apos;s
            entity data more complete, more trusted, and more deeply embedded in how
            your revenue team works.
          </p>
        </div>

        {/* Quarter summary pills */}
        {quarters.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-10">
            {quarters.map((q) => (
              <div key={q} className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/5">
                <span className="text-[13px] font-semibold text-white">{q}</span>
                <span className="h-3.5 w-px bg-white/20" />
                <span className="text-[12px] text-white/50">{counts[q]} items</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


export { QUARTER_SUBTITLES };
