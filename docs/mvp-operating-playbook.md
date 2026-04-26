# MVP Operating Playbook

## Goal

Validate whether foreign travelers will send real tattoo booking requests to ETHNIC HOUSE before building a larger marketplace, database workflow, or mobile app.

## First Test Flow

1. Add 3-5 artists with clear style, starting price, and language notes.
2. Add 10-30 flash concepts with size and price guidance.
3. Send traffic to `/booking` with UTM parameters.
4. Visitor creates a DM message from the form.
5. Visitor sends the copied message to Instagram DM.
6. Manually track serious inquiries in Instagram, a spreadsheet, or Supabase v2 later.

## Metrics To Track

- Landing page visits
- DM message creations
- Actual Instagram DM inquiries
- DM creation to real DM rate
- Actual booked sessions
- Booking rate by country
- Booking rate by style
- Booking rate by artist
- Booking rate by UTM campaign
- Lost reason notes
- Ad spend per booked session

## Initial Campaign URLs

Use URLs like:

```text
/booking?source=google&utm_source=google&utm_medium=cpc&utm_campaign=seoul_tattoo_search
/booking?source=instagram&utm_source=meta&utm_medium=paid_social&utm_campaign=fine_line_test
```

## V1 Rules

- Keep matching manual.
- Do not add payment until booking demand is proven.
- Do not require Supabase until DM demand is proven.
- Do not add public artist self-signup.
- Do not add nationwide search.
- Do not take unverified partner studios.
