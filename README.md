# ETHNIC HOUSE

A standalone web MVP for testing foreigner-friendly ETHNIC HOUSE tattoo booking demand in Seoul.

The first public test focuses on sending booking requests to ETHNIC HOUSE Instagram DM without requiring Supabase. The backend schema remains in the repository for a later lead database/admin workflow.

## MVP Goals

- Present an English landing page for ETHNIC HOUSE tattoo booking in Seoul.
- Show artist and flash design data.
- Generate copy-ready Instagram DM booking requests with travel dates, style, budget, contact details, and UTM source data.
- Keep the Supabase/admin lead workflow available for a later version.
- Keep this project separate from unrelated engineering work.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Optional Supabase lead database for v2
- Vercel
- GA4 and Meta Pixel hooks

## Local Development

Install Node.js 20 LTS or newer, then run:

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` only when you want to add optional values such as a Kakao channel URL, Supabase, or analytics IDs.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

## Booking Flow

The current `/booking` page does not write to a database. It creates a formatted booking message and links the visitor to:

- Instagram DM: `https://ig.me/m/ETHNIC_HOUSE_SILLIM`
- Instagram profile: `https://www.instagram.com/ETHNIC_HOUSE_SILLIM/`
- Optional Kakao channel URL through `NEXT_PUBLIC_KAKAO_CHANNEL_URL`

## Optional Backend And Deployment

The backend runs through Next.js server actions and route handlers. Supabase stores artists, flash designs, booking requests, lead events, reviews, and future partner shops.

Public booking API:

```http
POST /api/booking-requests
```

Admin lead API:

```http
GET /api/admin/leads
PATCH /api/admin/leads/:id/status
```

Admin API requests must send `x-admin-token: <ADMIN_ACCESS_TOKEN>`.

Run `supabase/schema.sql` or `supabase/migrations/202604260001_initial_schema.sql` in a new Supabase project, then set these Vercel environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_ACCESS_TOKEN
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_META_PIXEL_ID
```

See `docs/deployment-checklist.md` for the full public deployment checklist.
