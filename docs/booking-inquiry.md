# Structured booking inquiries

The `/booking` page collects an English guest inquiry before any appointment is
confirmed. It supports an artist recommendation or a selected artist/work, travel
dates, placement, size, style, budget, and private reference images.

## Submission and review

- The browser submits multipart form data to `POST /api/booking-inquiries`.
- Only a successful persisted request displays an inquiry number. Sending an
  inquiry does not confirm an appointment or take a payment.
- Review requests at `/admin/leads`; use the existing admin login. Original intake
  details and reference images remain available when the operator updates notes.
- Instagram remains an optional follow-up channel. No notification is sent to a
  third party by this flow.

## Storage

Configured Supabase continues to store booking rows. When no database is
configured, inquiries use private local storage; configured database failures must
return an error rather than silently switching stores.

`BOOKING_DATA_DIR` selects the private booking directory. On the NAS the Compose
configuration uses `/data/chat/bookings`, inside the existing named data volume,
so records and references survive application container rebuilds. Local development
defaults to a private data directory. Back up this directory alongside the database.

Reference files are limited to three JPEG, PNG, or WebP images, at most 2 MiB per
file. The server validates the actual image signature and stores generated file
names outside public assets. Downloads require admin access. Reference links may
also be supplied without uploading a file.

The original inquiry is preserved for review. The current age confirmation follows
the site's existing 18+ policy. No marketing subscription, response-time promise,
deposit rule, or cancellation policy is introduced by this change.

## Release boundary

This website change starts from production source commit
`714e03f472c6b1fbd62482acae702937eac0d390`. The existing checkout's unpublished
Android, ready-to-ink inventory, and MySQL changes are separate and are not included
in this website release.

Run `npm run lint`, `npm run typecheck`, `npm run test:booking`, and `npm run build`
before publishing. Website lint excludes the separate `desktop-calendar` app;
its pre-existing JavaScript warnings are outside this website change.

For real HTTP checks, start the local server with a synthetic `ADMIN_ACCESS_TOKEN`
and an isolated `BOOKING_DATA_DIR` inside the checkout's ignored `.data` directory.
Set `BOOKING_SMOKE_ADMIN_TOKEN` to that token and `BOOKING_SMOKE_DATA_DIR` to the
same directory, then run `npm run test:booking:http`. The default test URL is
`http://127.0.0.1:3101`; override it with `BOOKING_SMOKE_BASE_URL`. The script
rejects non-local hosts and requires the local database to be unconfigured.
Synthetic records remain available for manual administrator review. Do not run
submission tests against production customer records.
