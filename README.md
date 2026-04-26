# Seoul Ink Booking

A standalone web MVP for testing foreigner-friendly tattoo booking demand in Seoul.

The first version focuses on collecting booking requests, tracking acquisition data, and manually matching foreign travelers with available tattoo artists at the initial test studio, Ethnic House Sillim.

## MVP Goals

- Present an English landing page for Seoul tattoo booking.
- Show artist and flash design data.
- Collect booking requests with travel dates, style, budget, contact details, and UTM source data.
- Provide a lightweight admin lead workflow.
- Keep this project separate from unrelated engineering work.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Vercel
- GA4 and Meta Pixel hooks

## Local Development

Install Node.js 20 LTS or newer, then run:

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in Supabase and analytics values before testing live data writes.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

## Backend And Deployment

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
