import type { MetadataRoute } from "next";
import { getArtists } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const artists = await getArtists();

  const publicRoutes = ["", "/booking", "/artists", "/faq", "/aftercare", "/privacy"].map(
    (path) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7
    })
  );

  const artistRoutes = artists.map((artist) => ({
    url: `${siteUrl}/artists/${artist.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6
  }));

  return [...publicRoutes, ...artistRoutes];
}
