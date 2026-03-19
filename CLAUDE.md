# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 3003
npm run build      # Production build
npm run lint       # ESLint
```

For local dev, copy `.env.example` to `.env.local` and fill in values. Set `DEV_BYPASS_AUTH=true` to skip WorkOS auth entirely.

## Architecture

**Single-route Next.js 15 app** (`force-dynamic`). One page, one data fetch, no mutations.

### Data flow

```
page.tsx
  getSessionContext()          → WorkOS session → { isLoggedIn, isKernelTeam, user }
  fetchRoadmapData(isKernelTeam)  → Linear API → { projects: RoadmapProject[] }
```

`fetchRoadmapData` has two modes selected by env var:

1. **Initiative mode** (`LINEAR_INITIATIVE_ID` set) — raw GraphQL fetch against a specific Linear initiative. Filters by `LINEAR_BEACHBODY_PROJECT_LABEL_ID` (public) and `LINEAR_LEGDAY_PROJECT_LABEL_ID` (internal/Kernel-team-only). Uses `content` field (full markdown) over `description` (255-char limit). Requires an API key with Product team read access.

2. **Issue fallback** — queries issues tagged with BeachBody/LegDay labels across the workspace. Used when `LINEAR_INITIATIVE_ID` is not set.

### Access control

- **Public users**: see only BeachBody-labelled projects
- **@kernel.ai users** (`isKernelTeam`): also see LegDay-labelled projects with an "Internal" lock badge
- Auth is handled by WorkOS authkit-nextjs middleware. All paths are unauthenticated by default (roadmap is public); the session cookie is still read to enrich kernel-team context.

### Theme extraction

Theme is extracted from the first line of a project's Linear `content` field: `**Theme:** Entity database`. The `THEME_COLORS` map in `src/lib/themes.ts` drives card pill colours and filter pill accent colours. Themes are ordered by `THEME_ORDER` for the filter bar.

### Quarter grouping

Quarter is derived from the project's Linear `targetDate` (e.g. `2026-03-31` → `Q1 2026`). `src/lib/themes.ts` has helpers for current/past quarter detection which drive the "Current quarter" pulse badge and past-quarter muted styling.

### Key env vars

| Var | Purpose |
|-----|---------|
| `LINEAR_API_KEY` | Must have Product team read access |
| `LINEAR_INITIATIVE_ID` | UUID of "Product Roadmap 2026" initiative |
| `LINEAR_BEACHBODY_PROJECT_LABEL_ID` | Project label ID for public items |
| `LINEAR_LEGDAY_PROJECT_LABEL_ID` | Project label ID for internal items |
| `WORKOS_CLIENT_ID` / `WORKOS_API_KEY` / `WORKOS_COOKIE_PASSWORD` | Shared with tracker.kernel.ai |
| `NEXT_PUBLIC_APP_URL` | Used by signOut `returnTo` redirect |
| `DEV_BYPASS_AUTH` | Set to `true` to skip WorkOS locally |

### Linear data conventions

- Project `description` = 255-char summary (used by Linear UI)
- Project `content` = full markdown (used by the app for detail panel)
- Description/content format: `**Theme:** [theme name]\n\n[benefit-driven copy]`
- No em dashes anywhere in copy
- Quarter set via project `targetDate`, not labels

### Deployment

Docker on Render (`product-roadmap` service). Auto-deploys on push to `main` of `OllieTheWorldsBestCoder/product-roadmap`. The `NEXT_PUBLIC_*` vars are baked into the client bundle at Docker build time — changing them requires a new deploy.
