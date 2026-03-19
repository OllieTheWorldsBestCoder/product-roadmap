'use client';

import { X, Target, Tag, Lock, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RoadmapProject } from '@/lib/linear';

type Props = {
  project: RoadmapProject | null;
  onClose: () => void;
};

const statusConfig: Record<RoadmapProject['status'], { label: string; dotColor: string } | null> = {
  backlog:     null,
  planned:     null,
  in_progress: { label: 'In Progress', dotColor: 'bg-sage-600' },
  completed:   { label: 'Shipped',      dotColor: 'bg-sage-500' },
  cancelled:   { label: 'Cancelled',    dotColor: 'bg-red-400' },
};

function DescriptionRenderer({ text }: { text: string }) {
  const cleaned = text.replace(/\*\*Theme:\*\*[^\n]*\n*/g, '').trim();
  const lines = cleaned.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (!listItems.length) return;
    elements.push(
      <ul key={`l-${elements.length}`} className="space-y-2 pl-4 mt-1">
        {listItems.map((item, i) => (
          <li key={i} className="text-[14px] text-ink/70 leading-relaxed list-disc">
            <InlineText text={item} />
          </li>
        ))}
      </ul>,
    );
    listItems = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^---+$/.test(line.trim())) { flushList(); elements.push(<hr key={`hr-${i}`} className="border-border-kernel my-4" />); continue; }
    const hm = line.match(/^(#{1,4})\s+(.+)/);
    if (hm) { flushList(); elements.push(<h4 key={`h-${i}`} className="text-[14px] font-semibold text-ink mt-5 first:mt-0"><InlineText text={hm[2]} /></h4>); continue; }
    const bm = line.match(/^\s*[-*]\s+(.+)/);
    if (bm) { listItems.push(bm[1]); continue; }
    if (!line.trim()) { flushList(); continue; }
    flushList();
    elements.push(<p key={`p-${i}`} className="text-[14px] text-ink/70 leading-relaxed"><InlineText text={line} /></p>);
  }
  flushList();
  return <div className="space-y-3">{elements}</div>;
}

function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).map((part, i) => {
        if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
          return <strong key={i} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function DetailPanel({ project, onClose }: Props) {
  const isOpen = project !== null;
  const statusInfo = project ? statusConfig[project.status] : null;

  return (
    <>
      {/* Backdrop — dims the page, click to close */}
      <div
        className={cn(
          'fixed inset-0 z-30 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        style={{ background: 'rgba(52, 53, 57, 0.25)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating drawer — slides in from the right */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-40',
          'w-[520px] max-w-[90vw]',
          'bg-white flex flex-col',
          'rounded-l-2xl',
          'shadow-[−20px_0_60px_rgba(0,0,0,0.12),−1px_0_0_rgba(0,0,0,0.06)]',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{
          boxShadow: isOpen
            ? '-20px 0 60px rgba(52,53,57,0.12), -1px 0 0 rgba(0,0,0,0.05)'
            : 'none',
        }}
      >
        {project && (
          <>
            {/* Header */}
            <div className="px-7 pt-7 pb-5 flex items-start gap-4 shrink-0">
              <div className="flex-1 min-w-0">
                {statusInfo && (
                  <div className="flex items-center gap-1.5 mb-2.5">
                    {project.status === 'in_progress'
                      ? <Zap className="h-3 w-3 text-sage-600 fill-sage-600" />
                      : <CheckCircle2 className="h-3 w-3 text-sage-500" />
                    }
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-sage-600">
                      {statusInfo.label}
                    </span>
                  </div>
                )}
                <h2 className="text-[20px] font-semibold text-ink leading-snug tracking-tight">
                  {project.name}
                </h2>
                {project.isInternal && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Lock className="h-3 w-3 text-amber-600" />
                    <span className="text-[11px] font-medium text-amber-700">Internal. Not shown publicly.</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-1 p-2 rounded-xl text-muted-text hover:text-ink hover:bg-bg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Meta pills */}
            <div className="px-7 pb-5 flex items-center gap-3 flex-wrap shrink-0">
              {project.quarter && (
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink/70 bg-bg px-3 py-1.5 rounded-lg">
                  <Target className="h-3.5 w-3.5 text-muted-text" />
                  {project.quarter}
                </span>
              )}
              {project.theme && (
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink/70 bg-bg px-3 py-1.5 rounded-lg">
                  <Tag className="h-3.5 w-3.5 text-muted-text" />
                  {project.theme}
                </span>
              )}
              {project.progress > 0 && (
                <div className="flex items-center gap-2 ml-auto">
                  <div className="w-20 h-1.5 bg-sage-200 rounded-full overflow-hidden">
                    <div className="h-full bg-sage-500 rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                  <span className="text-[12px] text-muted-text tabular-nums">{Math.round(project.progress)}%</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="mx-7 border-t border-border-kernel shrink-0" />

            {/* Description — scrollable */}
            <div className="flex-1 overflow-y-auto px-7 py-6">
              {project.description ? (
                <DescriptionRenderer text={project.description} />
              ) : (
                <p className="text-[14px] text-muted-text italic">No description provided.</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
