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
http://ethichouseseoul.com
```

Current sitemap target:

```text
http://ethichouseseoul.com/sitemap.xml
```

Google decides when and where the page appears. The code can provide clear brand signals, but it
cannot force instant ranking before the site is deployed, crawled, and indexed.

## If Self Hosting From This PC

The local LAN URL is not enough for Google. Google must reach the site from the public internet.

Minimum requirements:

- Run the server on `0.0.0.0:3000`.
- Open Windows Firewall inbound TCP `3000`.
- Configure router port forwarding to this PC.
- Prefer using a real domain or dynamic DNS such as DuckDNS.
- Start the server with `-SiteUrl "https://your-domain.com"` so canonical and sitemap URLs use the public domain.

If using DuckDNS with external port `80` forwarded to this PC's internal port `3000`, start with:

```powershell
.\scripts\start-ethnic-house-server.cmd -SiteUrl "http://ethnichouse.duckdns.org"
```

If using external port `3000`, start with:

```powershell
.\scripts\start-ethnic-house-server.cmd -SiteUrl "http://ethnichouse.duckdns.org:3000"
```
