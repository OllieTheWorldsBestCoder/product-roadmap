import { fetchRoadmapData } from '@/lib/linear';
import { getSessionContext } from '@/lib/session';
import { Header } from '@/components/header';
import { RoadmapHero } from '@/components/roadmap-hero';
import { RoadmapTimeline } from '@/components/roadmap-timeline';

export const dynamic = 'force-dynamic';

export default async function RoadmapPage() {
  const session = await getSessionContext();
  const { projects } = await fetchRoadmapData(session.isKernelTeam);

  return (
    <div className="min-h-screen bg-bg">
      <Header
        isLoggedIn={session.isLoggedIn}
        isKernelTeam={session.isKernelTeam}
        user={session.user}
      />
      <RoadmapHero projects={projects} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <RoadmapTimeline projects={projects} isKernelTeam={session.isKernelTeam} />
      </main>
    </div>
  );
}
