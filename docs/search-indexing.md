# Search Indexing Checklist

This project now includes brand SEO signals for:

- `ETHNIC HOUSE`
- `ETHNIC HOUSE SILLIM`
- `ETHNIC_HOUSE_SILLIM`
- `에스닉하우스`
- `에스닉하우스 신림`
- `신림 에스닉하우스`

## Required For Google Search

1. Deploy the site to a public URL.
2. Set `NEXT_PUBLIC_SITE_URL` to the public URL in the hosting provider.
3. Confirm these URLs work:
   - `/`
   - `/robots.txt`
   - `/sitemap.xml`
4. Add the public URL to Google Search Console.
5. Submit `/sitemap.xml`.
6. Use URL Inspection for the homepage and request indexing.

Current target public URL:

```text
https://ethnichouseseoul.com
```

Current sitemap target:

```text
https://ethnichouseseoul.com/sitemap.xml
```

Google decides when and where the page appears. The code can provide clear brand signals, but it
cannot force instant ranking before the site is deployed, crawled, and indexed.

## Organic Keyword Page System

Keyword landing pages are generated from:

```text
src/lib/seo-pages.json
```

The dynamic route is:

```text
src/app/(seo)/[slug]/page.tsx
```

Current pages include image-first routes such as:

- `/small-tattoo-seoul`
- `/fine-line-tattoo-seoul`
- `/irezumi-tattoo-seoul`
- `/hangul-tattoo-seoul`
- `/blackwork-tattoo-seoul`
- `/tattoo-price-seoul`
- `/walk-in-tattoo-seoul`

Do not create duplicate thin pages. Each keyword page should have:

- real portfolio images
- real artist names
- a style-specific CTA
- price guidance or `quote required`
- visible FAQ if FAQ structured data is included

## Social Export Scripts

Generate reusable social content CSV files:

```powershell
npm run marketing:export
```

This writes:

```text
exports/pinterest-pins.csv
exports/instagram-captions.csv
exports/google-business-posts.csv
```

`exports/` is ignored because these are generated working files.

Search Console opportunity export is scaffolded here:

```powershell
$env:SEARCH_CONSOLE_SITE_URL="https://ethnichouseseoul.com"
$env:GOOGLE_OAUTH_ACCESS_TOKEN="<oauth_access_token>"
npm run marketing:search-console
```

The report filters for queries with impressions but low clicks and mid-page rankings so those
keyword pages can be strengthened with better titles, images, and CTAs.

## If Self Hosting From This PC

The local LAN URL is not enough for Google. Google must reach the site from the public internet.

Minimum requirements:

- Run the Next.js server on `127.0.0.1:3000`.
- Run Caddy on `80/443`.
- Open Windows Firewall inbound TCP `80,443`.
- Configure router port forwarding to this PC for `80` and `443`.
- Prefer using a real domain or dynamic DNS such as DuckDNS.
- Start the HTTPS stack with `.\scripts\start-ethnic-house-https-server.cmd` so canonical and sitemap URLs use the public domain.

If using DuckDNS with external port `80` forwarded to this PC's internal port `3000`, start with:

```powershell
.\scripts\start-ethnic-house-server.cmd -SiteUrl "http://ethnichouse.duckdns.org"
```

If using external port `3000`, start with:

```powershell
.\scripts\start-ethnic-house-server.cmd -SiteUrl "http://ethnichouse.duckdns.org:3000"
```
