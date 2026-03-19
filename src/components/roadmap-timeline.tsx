'use client';

import { useState, useMemo } from 'react';
import { MilestoneSection } from '@/components/milestone-section';
import { DetailPanel } from '@/components/detail-panel';
import { QUARTER_SUBTITLES } from '@/components/roadmap-hero';
import { THEME_ORDER, THEME_COLORS, getCurrentQuarter, isCurrentQuarter, isPastQuarter } from '@/lib/themes';
import { cn } from '@/lib/utils';
import type { RoadmapProject } from '@/lib/linear';

type Props = {
  projects: RoadmapProject[];
  isKernelTeam: boolean;
};

function sortQuarter(a: string, b: string): number {
  const parse = (s: string) => { const m = s.match(/^Q(\d)\s+(\d{4})$/); return m ? parseInt(m[2]) * 10 + parseInt(m[1]) : 9999; };
  return parse(a) - parse(b);
}

export function RoadmapTimeline({ projects, isKernelTeam }: Props) {
  const [selected, setSelected] = useState<RoadmapProject | null>(null);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);

  const onSelect = (p: RoadmapProject) => setSelected((prev) => prev?.id === p.id ? null : p);

  // Derive the themes that actually appear in this dataset
  const presentThemes = useMemo(() => {
    const seen = new Set(projects.map((p) => p.theme).filter(Boolean));
    return THEME_ORDER.filter((t) => seen.has(t));
  }, [projects]);

  // Apply theme filter
  const filtered = activeTheme ? projects.filter((p) => p.theme === activeTheme) : projects;

  // Group by quarter
  const byQuarter = new Map<string, RoadmapProject[]>();
  const unscheduled: RoadmapProject[] = [];
  for (const p of filtered) {
    if (p.quarter) {
      const arr = byQuarter.get(p.quarter) ?? [];
      arr.push(p);
      byQuarter.set(p.quarter, arr);
    } else {
      unscheduled.push(p);
    }
  }
  const quarters = [...byQuarter.keys()].sort(sortQuarter);

  if (projects.length === 0) {
    return <div className="flex items-center justify-center py-24 text-muted-text text-[14px]">No roadmap items available.</div>;
  }

  return (
    <div>
      {/* Theme filter pills */}
      {presentThemes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-10">
          <button
            type="button"
            onClick={() => setActiveTheme(null)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all',
              activeTheme === null
                ? 'bg-ink text-white'
                : 'bg-white border border-border-kernel text-muted-text hover:border-ink/30 hover:text-ink',
            )}
          >
            All
          </button>
          {presentThemes.map((theme) => {
            const color = THEME_COLORS[theme] ?? '#98a59c';
            const isActive = activeTheme === theme;
            return (
              <button
                key={theme}
                type="button"
                onClick={() => setActiveTheme(isActive ? null : theme)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all',
                  isActive
                    ? 'bg-white border-2 text-ink shadow-sm'
                    : 'bg-white border border-border-kernel text-muted-text hover:border-ink/30 hover:text-ink',
                )}
                style={isActive ? { borderColor: color } : undefined}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                {theme}
              </button>
            );
          })}
        </div>
      )}

      {/* Quarter sections */}
      <div className="space-y-16">
        {quarters.map((q) => (
          <MilestoneSection
            key={q}
            title={q}
            subtitle={QUARTER_SUBTITLES[q]}
            projects={byQuarter.get(q) ?? []}
            isKernelTeam={isKernelTeam}
            isCurrent={isCurrentQuarter(q)}
            isPast={isPastQuarter(q)}
            selectedId={selected?.id ?? null}
            onSelect={onSelect}
          />
        ))}
        {unscheduled.length > 0 && (
          <MilestoneSection
            title="Unscheduled"
            projects={unscheduled}
            isKernelTeam={isKernelTeam}
            isCurrent={false}
            isPast={false}
            selectedId={selected?.id ?? null}
            onSelect={onSelect}
          />
        )}
      </div>

      <DetailPanel project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
