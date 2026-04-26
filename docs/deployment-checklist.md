# Deployment Checklist

## 1. Supabase

Create a new Supabase project for ETHNIC HOUSE.

Run the schema:

```sql
-- Use Supabase SQL Editor
-- Paste and run supabase/schema.sql
```

Then optionally run:

```sql
-- Use Supabase SQL Editor
-- Paste and run supabase/seed.sql
```

Copy these values from Supabase:

- Project URL -> `NEXT_PUBLIC_SUPABASE_URL`
- anon public key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- service_role key -> `SUPABASE_SERVICE_ROLE_KEY`

Do not expose the service role key in browser code.

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

Add environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_ACCESS_TOKEN
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_META_PIXEL_ID
```

`NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_META_PIXEL_ID` can be blank during the first deploy.

## 3. After Deploy

Check:

```text
/
/booking
/artists
/api/health
/admin/login
```

Submit a test booking from `/booking`, then log in at `/admin/login` with `ADMIN_ACCESS_TOKEN`.

Confirm:

- booking request appears in `/admin/leads`
- UTM fields are stored
- lead status update writes to `lead_events`

## 4. Before Paid Ads

- Replace sample artists and flash designs with real participating artists.
- Confirm artist consent for public portfolio use.
- Review privacy notice.
- Review tattoo/legal risk notes in `docs/legal-and-risk-notes.md`.
- Confirm cancellation/deposit rules.
