'use client';

import { Lock, CheckCircle2, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { THEME_COLORS } from '@/lib/themes';
import type { RoadmapProject } from '@/lib/linear';

type Props = {
  project: RoadmapProject;
  isKernelTeam: boolean;
  isSelected: boolean;
  onSelect: (p: RoadmapProject) => void;
};

export function RoadmapCard({ project, isKernelTeam, isSelected, onSelect }: Props) {
  const isShipped = project.status === 'completed';
  const isInProgress = project.status === 'in_progress';
  const isNext = project.status === 'planned';
  const themeColor = project.theme ? (THEME_COLORS[project.theme] ?? '#98a59c') : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(project)}
      className={cn(
        'group w-full text-left rounded-xl border bg-white transition-all duration-150',
        'flex flex-col overflow-hidden',
        'hover:shadow-md hover:-translate-y-px',
        isShipped && 'opacity-75 hover:opacity-100',
        isSelected
          ? 'ring-2 ring-sage-600/30 border-sage-500 shadow-md -translate-y-px'
          : 'border-border-kernel shadow-sm hover:border-sage-400',
      )}
    >
      <div className="p-5 flex flex-col flex-1">
        {/* Status badge */}
        {(isShipped || isInProgress || isNext) && (
          <div className="flex items-center gap-1.5 mb-3">
            {isInProgress ? (
              <>
                <Zap className="h-3 w-3 text-sage-600 fill-sage-600" />
                <span className="text-[11px] font-semibold text-sage-600 uppercase tracking-wide">In Progress</span>
              </>
            ) : isShipped ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-sage-500" />
                <span className="text-[11px] font-semibold text-sage-500 uppercase tracking-wide">Shipped</span>
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 text-muted-text" />
                <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wide">Coming soon</span>
              </>
            )}
          </div>
        )}

        {/* Internal badge */}
        {isKernelTeam && project.isInternal && (
          <div className="flex items-center gap-1 mb-3">
            <Lock className="h-3 w-3 text-amber-600" />
            <span className="text-[11px] font-medium text-amber-700 uppercase tracking-wide">Internal</span>
          </div>
        )}

        {/* Title */}
        <p className={cn(
          'text-[14px] font-semibold leading-snug line-clamp-2 mb-2',
          isShipped ? 'text-ink/60' : 'text-ink',
        )}>
          {project.name}
        </p>

        {/* Snippet */}
        {project.snippet && (
          <p className="text-[12px] text-muted-text leading-relaxed line-clamp-3 flex-1">
            {project.snippet}
          </p>
        )}

        {/* Footer — pinned to bottom */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-kernel/60">
          {project.theme && themeColor ? (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: themeColor, backgroundColor: `${themeColor}18` }}
            >
              {project.theme}
            </span>
          ) : (
            <span className="text-[11px] text-muted-text font-medium">{project.theme ?? ''}</span>
          )}
          {project.progress > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 bg-sage-200 rounded-full overflow-hidden">
                <div className="h-full bg-sage-500 rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
              <span className="text-[11px] text-muted-text tabular-nums">{Math.round(project.progress)}%</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
