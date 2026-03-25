'use client';

import { useState } from 'react';
import { Lock, ChevronDown } from 'lucide-react';
import { THEME_COLORS, THEME_ORDER } from '@/lib/themes';
import { cn } from '@/lib/utils';
import type { Release } from '@/lib/releases';

type Props = {
  releases: Release[];
  isKernelTeam: boolean;
};

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ReleasesSection({ releases, isKernelTeam }: Props) {
  // Group releases by category
  const byCategory = new Map<string, Release[]>();
  for (const r of releases) {
    const arr = byCategory.get(r.category) ?? [];
    arr.push(r);
    byCategory.set(r.category, arr);
  }

  // Sort categories by THEME_ORDER, then alphabetically for unknowns
  const categories = [...byCategory.keys()].sort((a, b) => {
    const ai = THEME_ORDER.indexOf(a);
    const bi = THEME_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  // Start with all categories collapsed
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (cat: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  if (releases.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Section header */}
      <div className="mb-10">
        <p className="text-[12px] font-medium tracking-widest uppercase text-sage-600 mb-2">
          Changelog
        </p>
        <h2 className="text-[24px] sm:text-[28px] font-semibold text-ink leading-tight">
          Product releases
        </h2>
      </div>

      {/* Accordion by category */}
      <div className="flex flex-col gap-3">
        {categories.map((category) => {
          const color = THEME_COLORS[category] ?? '#98a59c';
          const items = byCategory.get(category) ?? [];
          const isOpen = open.has(category);

          return (
            <div key={category} className="rounded-xl border border-border-kernel bg-white shadow-sm overflow-hidden">
              {/* Accordion header */}
              <button
                type="button"
                onClick={() => toggle(category)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-sage-100/40 transition-colors"
              >
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[15px] font-semibold text-ink flex-1 min-w-0">
                  {category}
                </span>
                <span className="text-[12px] font-medium text-muted-text px-2 py-0.5 rounded-full bg-sage-100">
                  {items.length} {items.length === 1 ? 'release' : 'releases'}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-text transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>

              {/* Accordion content */}
              {isOpen && (
                <div className="border-t border-border-kernel/60">
                  {items.map((release, i) => (
                    <div
                      key={`${release.date}-${i}`}
                      className={cn(
                        'px-5 py-4',
                        i < items.length - 1 && 'border-b border-border-kernel/40',
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <time className="text-[12px] text-muted-text tabular-nums">
                          {formatDate(release.date)}
                        </time>
                        {isKernelTeam && release.internal && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                            <Lock className="h-3 w-3 text-amber-600" />
                            Internal
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] font-semibold text-ink leading-snug mb-1 line-clamp-2">
                        {release.title}
                      </p>
                      <p className="text-[13px] text-muted-text leading-relaxed line-clamp-3 break-words">
                        {release.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
