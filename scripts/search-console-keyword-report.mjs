import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, "exports");
const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL;
const accessToken = process.env.GOOGLE_OAUTH_ACCESS_TOKEN;

const today = new Date();
const endDate = new Date(today);
endDate.setDate(today.getDate() - 3);
const startDate = new Date(endDate);
startDate.setDate(endDate.getDate() - 28);

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function toCsv(headers, rows) {
  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
  ].join("\n");
}

if (!siteUrl || !accessToken) {
  console.log(
    [
      "Search Console export is configured but not connected yet.",
      "Set SEARCH_CONSOLE_SITE_URL and GOOGLE_OAUTH_ACCESS_TOKEN to query the Search Analytics API.",
      "Example:",
      "  SEARCH_CONSOLE_SITE_URL=https://ethnichouseseoul.com",
      "  GOOGLE_OAUTH_ACCESS_TOKEN=<oauth_access_token>",
      "The script will write exports/search-console-opportunities.csv."
    ].join("\n")
  );
  process.exit(0);
}

const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
  siteUrl
)}/searchAnalytics/query`;

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    dimensions: ["query", "page"],
    rowLimit: 25000
  })
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Search Console API failed: ${response.status} ${body}`);
}

const result = await response.json();
const rows = (result.rows ?? [])
  .map((row) => ({
    query: row.keys?.[0] ?? "",
    page: row.keys?.[1] ?? "",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0
  }))
  .filter((row) => row.impressions >= 100 && row.clicks <= 3 && row.position >= 8 && row.position <= 30)
  .sort((a, b) => b.impressions - a.impressions);

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "search-console-opportunities.csv"),
  toCsv(["query", "page", "clicks", "impressions", "ctr", "position"], rows)
);

console.log(`Exported ${rows.length} Search Console opportunities to ${outputDir}`);
