alter table public.booking_requests
  add column if not exists preferred_design_id uuid references public.flash_designs(id),
  add column if not exists matched_artist_id uuid references public.artists(id),
  add column if not exists quoted_price_krw integer,
  add column if not exists lost_reason text;

create index if not exists booking_requests_preferred_design_id_idx
  on public.booking_requests(preferred_design_id);

create index if not exists booking_requests_matched_artist_id_idx
  on public.booking_requests(matched_artist_id);
