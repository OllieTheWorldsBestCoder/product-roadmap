import { cache } from 'react';
import { LinearClient } from '@linear/sdk';

export type RoadmapProject = {
  id: string;
  name: string;
  description: string | null;
  snippet: string | null;
  status: 'backlog' | 'planned' | 'in_progress' | 'completed' | 'cancelled';
  targetDate: string | null;
  quarter: string | null;
  theme: string | null;
  isInternal: boolean;
  progress: number;
};

export type RoadmapData = {
  projects: RoadmapProject[];
};

// ── Linear client ────────────────────────────────────────────────────────────

export const getLinearClient = cache((): LinearClient => {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) throw new Error('LINEAR_API_KEY is not set');
  return new LinearClient({ apiKey });
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapStatus(stateName: string, stateType: string): RoadmapProject['status'] {
  switch (stateType) {
    case 'backlog':
    case 'triage':   return 'backlog';
    case 'unstarted': return 'planned';
    case 'started':  return 'in_progress';
    case 'completed': return 'completed';
    case 'cancelled': return 'cancelled';
    default: {
      const l = stateName.toLowerCase();
      if (l.includes('backlog') || l.includes('later')) return 'backlog';
      if (l.includes('todo') || l.includes('next') || l.includes('planned')) return 'planned';
      if (l.includes('progress') || l.includes('doing') || l.includes('now')) return 'in_progress';
      if (l.includes('done') || l.includes('complete')) return 'completed';
      if (l.includes('cancel')) return 'cancelled';
      return 'backlog';
    }
  }
}

// Quarter regex pattern
const QUARTER_RE = /^Q[1-4]\s+\d{4}$/;

function extractTheme(description: string | null): string | null {
  if (!description) return null;
  const m = description.match(/\*\*Theme:\*\*\s*([^\n]+)/);
  return m?.[1]?.trim() ?? null;
}

export function createSnippet(description: string | null, maxLength = 120): string | null {
  if (!description) return null;
  let text = description;
  text = text.replace(/\*\*Theme:\*\*[^\n]*\n*/g, '');
  text = text.replace(/^#{1,6}\s+/gm, '');
  text = text.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1');
  text = text.replace(/^\s*[-*]\s+/gm, '');
  text = text.replace(/^---+$/gm, '');
  text = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

// ── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Two modes depending on what's available:
 *  1. Initiative-based (LINEAR_INITIATIVE_ID set) — fetches projects linked to the initiative.
 *     Requires an API key with Product team read access (Marcus/Anders key).
 *  2. Issue-based fallback — fetches issues tagged BeachBody/LegDay.
 *     Works with Ollie's key.
 */
export async function fetchRoadmapData(showInternal: boolean): Promise<RoadmapData> {
  const client = getLinearClient();
  const initiativeId = process.env.LINEAR_INITIATIVE_ID;

  if (initiativeId) {
    return fetchFromInitiative(client, initiativeId, showInternal);
  }
  return fetchFromIssues(client, showInternal);
}

type RawProject = {
  id: string;
  name: string;
  description: string | null;
  content: string | null;      // full markdown body — preferred over description
  targetDate: string | null;
  progress: number;
  labelIds: string[];
  status: { type: string } | null;
};

async function fetchFromInitiative(
  client: LinearClient,
  initiativeId: string,
  showInternal: boolean,
): Promise<RoadmapData> {
  const BEACHBODY_ID = process.env.LINEAR_BEACHBODY_PROJECT_LABEL_ID ?? '';
  const LEGDAY_ID    = process.env.LINEAR_LEGDAY_PROJECT_LABEL_ID ?? '';

  // Raw GraphQL so we can request labelIds (not included in SDK default fetch)
  const apiKey = process.env.LINEAR_API_KEY!;
  const query = `{
    initiative(id: "${initiativeId}") {
      projects(first: 100) {
        nodes {
          id name description content targetDate progress labelIds
          status { type }
        }
      }
    }
  }`;

  const resp = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    cache: 'no-store',
  });
  const data = await resp.json() as { data: { initiative: { projects: { nodes: RawProject[] } } } };
  const rawProjects = data.data.initiative.projects.nodes;

  const projects: RoadmapProject[] = rawProjects
    .map((proj) => {
      const labelIds = proj.labelIds ?? [];

      const hasBeachBody = !BEACHBODY_ID || labelIds.includes(BEACHBODY_ID);
      const hasLegDay    = LEGDAY_ID ? labelIds.includes(LEGDAY_ID) : false;

      // Skip projects with neither label (untagged = not on roadmap)
      if (!hasBeachBody && !hasLegDay) return null;

      const isInternal = hasLegDay && !hasBeachBody;
      if (isInternal && !showInternal) return null;

      // Prefer content (full markdown body) over description (255-char summary)
      const fullText = proj.content ?? proj.description ?? null;

      return {
        id: proj.id,
        name: proj.name,
        description: fullText,
        snippet: createSnippet(fullText),
        status: mapProjectStatus(proj.status?.type ?? 'backlog'),
        targetDate: proj.targetDate ?? null,
        quarter: proj.targetDate ? targetDateToQuarter(proj.targetDate) : null,
        theme: extractTheme(fullText),
        isInternal,
        progress: proj.progress ?? 0,
      } satisfies RoadmapProject;
    })
    .filter((p): p is RoadmapProject => p !== null);

  projects.sort((a, b) =>
    sortQuarterStr(a.quarter) - sortQuarterStr(b.quarter) || a.name.localeCompare(b.name),
  );
  return { projects };
}

async function fetchFromIssues(
  client: LinearClient,
  showInternal: boolean,
): Promise<RoadmapData> {
  const labelFilter = showInternal
    ? { labels: { some: { name: { in: ['BeachBody', 'LegDay'] } } } }
    : { labels: { some: { name: { eq: 'BeachBody' } } } };

  const allProjects: RoadmapProject[] = [];
  let hasMore = true;
  let after: string | undefined;

  while (hasMore) {
    const result = await client.issues({ filter: labelFilter, first: 50, after });

    const withMeta = await Promise.all(
      result.nodes.map(async (issue) => ({
        issue,
        state: await issue.state,
        labels: await issue.labels(),
        milestone: await issue.projectMilestone,
      })),
    );

    for (const { issue, state, labels, milestone } of withMeta) {
      if (!state) continue;
      const labelNames = labels.nodes.map((l) => l.name);
      const isInternal = labelNames.includes('LegDay');
      const quarter = labelNames.find((n) => QUARTER_RE.test(n))
        ?? (milestone?.name ?? null);

      allProjects.push({
        id: issue.id,
        name: issue.title,
        description: issue.description ?? null,
        snippet: createSnippet(issue.description ?? null),
        status: mapStatus(state.name, state.type),
        targetDate: null,
        quarter,
        theme: extractTheme(issue.description ?? null),
        isInternal,
        progress: 0,
      });
    }

    hasMore = result.pageInfo.hasNextPage;
    after = result.pageInfo.endCursor;
  }

  allProjects.sort((a, b) =>
    sortQuarterStr(a.quarter) - sortQuarterStr(b.quarter) || a.name.localeCompare(b.name),
  );
  return { projects: allProjects };
}

function mapProjectStatus(type: string): RoadmapProject['status'] {
  switch (type) {
    case 'backlog':   return 'backlog';
    case 'planned':   return 'planned';
    case 'started':   return 'in_progress';
    case 'completed': return 'completed';
    case 'canceled':
    case 'cancelled': return 'cancelled';
    default:          return 'backlog';
  }
}

function targetDateToQuarter(date: string): string {
  const d = new Date(date + 'T00:00:00');
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `Q${q} ${d.getFullYear()}`;
}

function sortQuarterStr(q: string | null): number {
  if (!q) return 9999;
  const m = q.match(/^Q(\d)\s+(\d{4})$/);
  return m ? parseInt(m[2]) * 10 + parseInt(m[1]) : 9999;
}
