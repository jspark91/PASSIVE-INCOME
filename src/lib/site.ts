export const siteName = "ETHNIC HOUSE";
export const siteDescription =
  "English-friendly tattoo booking at ETHNIC HOUSE in Sillim, Seoul.";
export const instagramProfileUrl = "https://www.instagram.com/ETHNIC_HOUSE_SILLIM/";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
