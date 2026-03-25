import { fetchRoadmapData } from '@/lib/linear';
import { getSessionContext } from '@/lib/session';
import { getReleases } from '@/lib/releases';
import { Header } from '@/components/header';
import { RoadmapHero } from '@/components/roadmap-hero';
import { RoadmapTimeline } from '@/components/roadmap-timeline';
import { ReleasesSection } from '@/components/releases-section';
import { RoadmapFooter } from '@/components/roadmap-footer';

export const dynamic = 'force-dynamic';

export default async function RoadmapPage() {
  const session = await getSessionContext();
  const { projects } = await fetchRoadmapData(session.isKernelTeam);
  const releases = getReleases(session.isKernelTeam);

  return (
    <div className="min-h-screen bg-bg">
      <Header isKernelTeam={session.isKernelTeam} />
      <RoadmapHero projects={projects} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <RoadmapTimeline projects={projects} isKernelTeam={session.isKernelTeam} />
      </main>
      <div className="border-t border-border-kernel" />
      <ReleasesSection releases={releases} isKernelTeam={session.isKernelTeam} />
      <RoadmapFooter isLoggedIn={session.isLoggedIn} user={session.user} />
    </div>
  );
}
