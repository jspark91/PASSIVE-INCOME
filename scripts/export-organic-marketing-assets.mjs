import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const dataPath = path.join(repoRoot, "src", "lib", "seo-pages.json");
const outputDir = path.join(repoRoot, "exports");
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://ethnichouseseoul.com").replace(
  /\/$/,
  ""
);

const designImages = {
  "design-yoonseul-moon-whale": "/images/artists/yoonseul/yoonseul-03-moon-whale.jpg",
  "design-yoonseul-star": "/images/artists/yoonseul/yoonseul-01-star.jpg",
  "design-yoonseul-butterflies": "/images/artists/yoonseul/yoonseul-07-butterflies.jpg",
  "design-yoonseul-iris-flower": "/images/artists/yoonseul/yoonseul-08-iris-flower.jpg",
  "design-yoonseul-moth-flow": "/images/artists/yoonseul/yoonseul-05-moth-flow.jpg",
  "design-yoonseul-pouring-moon": "/images/artists/yoonseul/yoonseul-04-pouring-moon.jpg",
  "design-moss-compass-whale": "/images/artists/moss/moss-01-compass-whale.jpg",
  "design-moss-character-mini": "/images/artists/moss/moss-05-mickey-mini.jpg",
  "design-moss-compass-forearm": "/images/artists/moss/moss-04-compass-forearm.jpg",
  "design-moss-geometric-sleeve": "/images/artists/moss/moss-02-geometric-sleeve.jpg",
  "design-moss-aztec-calendar": "/images/artists/moss/moss-08-aztec-calendar.jpg",
  "design-seowoo-full-sleeve-collage": "/images/artists/seowoo/seowoo-01-full-sleeve-collage.jpg",
  "design-seowoo-forearm-cards": "/images/artists/seowoo/seowoo-02-forearm-cards.jpg",
  "design-seowoo-gambler-sleeve": "/images/artists/seowoo/seowoo-03-gambler-sleeve.jpg",
  "design-seowoo-eye-clock-sleeve": "/images/artists/seowoo/seowoo-04-eye-clock-sleeve.jpg",
  "design-seowoo-reaper-chest": "/images/artists/seowoo/seowoo-05-reaper-chest.jpg",
  "design-sero-plum-brushwork": "/images/artists/sero/sero-01-plum-brushwork.jpg",
  "design-sero-birds-plum": "/images/artists/sero/sero-02-birds-plum.jpg",
  "design-sero-blue-plum": "/images/artists/sero/sero-03-blue-plum.jpg",
  "design-sero-wolf-plum": "/images/artists/sero/sero-04-wolf-plum.jpg",
  "design-hada-samurai-backpiece": "/images/artists/hada/hada-01-samurai-backpiece.jpg",
  "design-hada-maneki-neko-backpiece": "/images/artists/hada/hada-02-maneki-neko-backpiece.jpg",
  "design-hada-snake-chest-arm": "/images/artists/hada/hada-03-snake-chest-arm.jpg",
  "design-hada-leopard-chest": "/images/artists/hada/hada-04-leopard-chest.jpg",
  "design-woora-kabuto-thighs": "/images/artists/woora/woora-01-kabuto-thighs.jpg",
  "design-woora-dragon-sleeve": "/images/artists/woora/woora-02-dragon-sleeve.jpg",
  "design-woora-back-outline": "/images/artists/woora/woora-03-back-outline.jpg"
};

const artistNames = {
  yoonseul: "YOONSEUL",
  moss: "MOSS",
  seowoo: "SEOWOO",
  sero: "SERO",
  hada: "HADA",
  woora: "WOORA"
};

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

function pageUrl(page) {
  return `${siteUrl}/${page.slug}`;
}

function primaryImage(page) {
  const designId = page.featuredDesignIds.find((id) => designImages[id]);
  return `${siteUrl}${designImages[designId] ?? "/images/artists/yoonseul/yoonseul-03-moon-whale.jpg"}`;
}

function pageArtists(page) {
  return page.artistSlugs.map((slug) => artistNames[slug] ?? slug.toUpperCase()).join(", ");
}

function hashtags(page) {
  return page.socialHashtags.map((tag) => `#${tag.replace(/^#/, "")}`).join(" ");
}

const seoPages = JSON.parse(await readFile(dataPath, "utf8"));
await mkdir(outputDir, { recursive: true });

const pinterestRows = seoPages.map((page) => ({
  board: page.pinBoard,
  title: page.h1,
  description: `${page.subtitle} ${page.description}`,
  link: pageUrl(page),
  image: primaryImage(page)
}));

const instagramRows = seoPages.map((page) => ({
  page: page.slug,
  caption: `${page.h1}\n\n${page.subtitle}\n\nArtists: ${pageArtists(
    page
  )}\nBooking: ETHNIC HOUSE Seoul\n\nFor travelers visiting Korea: send your idea, size, placement, references, and travel dates.\n\n${hashtags(
    page
  )}`,
  hashtags: hashtags(page),
  link: pageUrl(page)
}));

const googleBusinessRows = seoPages.map((page) => ({
  title: page.h1,
  body: `${page.subtitle}\n\nETHNIC HOUSE helps international clients book with selected tattoo artists near Sillim Station. ${page.price}.`,
  cta: page.cta,
  link: pageUrl(page)
}));

await writeFile(
  path.join(outputDir, "pinterest-pins.csv"),
  toCsv(["board", "title", "description", "link", "image"], pinterestRows)
);
await writeFile(
  path.join(outputDir, "instagram-captions.csv"),
  toCsv(["page", "caption", "hashtags", "link"], instagramRows)
);
await writeFile(
  path.join(outputDir, "google-business-posts.csv"),
  toCsv(["title", "body", "cta", "link"], googleBusinessRows)
);

console.log(`Exported ${seoPages.length} organic marketing rows to ${outputDir}`);
