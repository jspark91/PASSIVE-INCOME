# Deployment Checklist

## 1. Current Public Test: DM-First

The current `/booking` page does not require Supabase. Visitors fill in the form, create a
copy-ready request message, then send it to ETHNIC HOUSE through Instagram DM.

Required before public deploy:

- Confirm Instagram profile: `https://www.instagram.com/ETHNIC_HOUSE_SILLIM/`
- Confirm Instagram DM link works on mobile: `https://ig.me/m/ETHNIC_HOUSE_SILLIM`
- Optional: set `NEXT_PUBLIC_KAKAO_CHANNEL_URL` if a Kakao channel/chat URL is ready.

## 2. Vercel

Import GitHub repository:

```text
https://github.com/jspark91/PASSIVE-INCOME
```

Use these settings:

- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Output: default Next.js

Optional environment variables for the DM-first version:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_KAKAO_CHANNEL_URL
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_META_PIXEL_ID
```

`NEXT_PUBLIC_SITE_URL` should be the final public URL, for example
`https://your-project.vercel.app` or a custom domain. Analytics IDs can be blank during the first
deploy.

## 3. After Deploy

Check:

```text
/
/booking
/booking?design=design-yoonseul-moon-whale&utm_source=instagram&utm_medium=paid_social
/artists
/api/health
/robots.txt
/sitemap.xml
```

Confirm:

- `/booking` creates a copy-ready DM message.
- The selected flash concept appears when using `?design=...`.
- The Instagram DM button opens `ig.me/m/ETHNIC_HOUSE_SILLIM`.
- The Instagram profile fallback opens correctly.

## 4. Optional Supabase V2

Use Supabase only when you want the site to store leads and use the admin workflow.

Create a new Supabase project for ETHNIC HOUSE, run:

```sql
-- Use Supabase SQL Editor
-- Paste and run supabase/schema.sql
```

Then optionally run:

```sql
-- Use Supabase SQL Editor
-- Paste and run supabase/seed.sql
```

Set these Vercel environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_ACCESS_TOKEN
```

Do not expose the service role key in browser code.

## 5. Before Paid Ads

- Replace sample artists and flash designs with real participating artists.
- Confirm artist consent for public portfolio use.
- Review privacy notice.
- Review tattoo/legal risk notes in `docs/legal-and-risk-notes.md`.
- Confirm cancellation/deposit rules.
