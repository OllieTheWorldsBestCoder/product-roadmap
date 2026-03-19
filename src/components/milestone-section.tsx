import { CheckCircle2 } from 'lucide-react';
import { RoadmapCard } from '@/components/roadmap-card';
import { cn } from '@/lib/utils';
import type { RoadmapProject } from '@/lib/linear';

type Props = {
  title: string;
  subtitle?: string;
  projects: RoadmapProject[];
  isKernelTeam: boolean;
  isCurrent: boolean;
  isPast: boolean;
  selectedId: string | null;
  onSelect: (p: RoadmapProject) => void;
};

export function MilestoneSection({ title, subtitle, projects, isKernelTeam, isCurrent, isPast, selectedId, onSelect }: Props) {
  const allShipped = isPast && projects.length > 0 && projects.every((p) => p.status === 'completed');
  const shippedCount = projects.filter((p) => p.status === 'completed').length;

  return (
    <div className={cn(isPast && 'opacity-80')}>
      {/* Section header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1.5">
          {/* Quarter label */}
          <h2 className={cn(
            'text-[18px] font-semibold',
            isPast ? 'text-ink/50' : 'text-ink',
          )}>
            {title}
          </h2>

          {/* Current quarter badge */}
          {isCurrent && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-100 border border-sage-300 text-[11px] font-semibold text-sage-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sage-600" />
              </span>
              Current quarter
            </span>
          )}

          {/* Past + all shipped */}
          {isPast && allShipped && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-sage-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All shipped
            </span>
          )}

          {/* Past + partially shipped */}
          {isPast && !allShipped && shippedCount > 0 && (
            <span className="text-[11px] text-muted-text">
              {shippedCount} shipped
            </span>
          )}

          {/* Item count */}
          <span className={cn(
            'text-[12px] font-medium px-2 py-0.5 rounded-full',
            isPast ? 'bg-ink/6 text-ink/40' : 'bg-sage-100 text-sage-600',
          )}>
            {projects.length} {projects.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {subtitle && !isPast && (
          <p className="text-[13px] text-muted-text max-w-2xl leading-relaxed">{subtitle}</p>
        )}
      </div>

      {/* Divider line for past quarters */}
      {isPast && (
        <div className="h-px w-full bg-border-kernel mb-6" />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <RoadmapCard
            key={p.id}
            project={p}
            isKernelTeam={isKernelTeam}
            isSelected={selectedId === p.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
