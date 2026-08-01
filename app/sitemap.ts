import type { MetadataRoute } from 'next';
import { getAllSpecies } from '@/lib/data';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const speciesUrls = getAllSpecies().map((s) => ({
    url: `${SITE_URL}/species/${s.id}`,
  }));

  return [{ url: SITE_URL }, ...speciesUrls];
}
