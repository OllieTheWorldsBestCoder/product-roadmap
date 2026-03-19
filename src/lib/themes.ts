// Theme → accent colour mapping (used on cards and filter pills)
export const THEME_COLORS: Record<string, string> = {
  'Entity database':           '#98a59c', // sage-600
  'Data management platform':  '#6b8cae', // muted blue-slate
  'Family trees':              '#5a9e8a', // teal
  'Workflows':                 '#8b7fce', // muted indigo
  'Integrations':              '#c4943a', // muted amber
  'Developer':                 '#9e7abd', // muted violet
};

export const THEME_ORDER = [
  'Entity database',
  'Data management platform',
  'Family trees',
  'Workflows',
  'Integrations',
  'Developer',
];

// Quarter helpers
export function getCurrentQuarter(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q} ${now.getFullYear()}`;
}

function parseQuarter(s: string): number {
  const m = s.match(/^Q(\d)\s+(\d{4})$/);
  return m ? parseInt(m[2]) * 10 + parseInt(m[1]) : 9999;
}

export function isCurrentQuarter(q: string): boolean {
  return q === getCurrentQuarter();
}

export function isPastQuarter(q: string): boolean {
  return parseQuarter(q) < parseQuarter(getCurrentQuarter());
}
