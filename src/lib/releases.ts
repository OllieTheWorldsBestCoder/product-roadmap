import releasesData from '@/data/releases.json';

export type Release = {
  date: string;
  title: string;
  category: string;
  description: string;
  internal?: boolean;
};

export function getReleases(showInternal: boolean): Release[] {
  const releases = releasesData as Release[];
  if (showInternal) return releases;
  return releases.filter((r) => !r.internal);
}
