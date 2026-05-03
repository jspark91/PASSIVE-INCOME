import type { MetadataRoute } from "next";
import { getArtists } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const artists = await getArtists();

  const publicRoutes = [
    { path: "", priority: 1 },
    { path: "/tattoo-in-seoul", priority: 0.9 },
    { path: "/korea-trip-tattoo", priority: 0.9 },
    { path: "/irezumi", priority: 0.85 },
    { path: "/booking", priority: 0.8 },
    { path: "/artists", priority: 0.7 },
    { path: "/faq", priority: 0.6 },
    { path: "/aftercare", priority: 0.6 },
    { path: "/privacy", priority: 0.4 }
  ].map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority
  }));

  const artistRoutes = artists.map((artist) => ({
    url: `${siteUrl}/artists/${artist.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6
  }));

  return [...publicRoutes, ...artistRoutes];
}
