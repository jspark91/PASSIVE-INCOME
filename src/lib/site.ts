export const siteName = "ETHNIC HOUSE";
export const siteAlternateNames = ["ETHNIC HOUSE SEOUL", "ETHNIC HOUSE SILLIM", "ETHNIC_HOUSE_SILLIM"];
export const siteDescription =
  "ETHNIC HOUSE SEOUL. English-friendly tattoo booking for travelers in Sillim, Seoul.";
export const instagramProfileUrl = "https://www.instagram.com/ETHNIC_HOUSE_SILLIM/";
export const instagramDmUrl = "https://ig.me/m/ETHNIC_HOUSE_SILLIM";
export const whatsappContactUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() || "/booking";
export const lineContactUrl = process.env.NEXT_PUBLIC_LINE_URL?.trim() || "/booking";

const telegramBotUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim();

export const telegramContactUrl =
  process.env.NEXT_PUBLIC_TELEGRAM_URL?.trim() ||
  (telegramBotUsername ? `https://t.me/${telegramBotUsername.replace(/^@/, "")}` : "/booking");

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
