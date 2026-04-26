create extension if not exists pgcrypto;

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  instagram text,
  bio_en text,
  bio_ko text,
  styles text[] not null default '{}',
  starting_price_krw integer,
  languages text[] not null default '{}',
  location text not null default 'Sillim, Seoul',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.flash_designs (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references public.artists(id) on delete cascade,
  title text not null,
  style text,
  size_hint text,
  price_from_krw integer,
  duration_minutes integer,
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nationality text,
  language text,
  email text,
  instagram text,
  whatsapp text,
  travel_start date,
  travel_end date,
  preferred_date date,
  preferred_time text,
  style text,
  size_cm text,
  placement text,
  budget_krw integer,
  reference_image_url text,
  preferred_artist_id uuid references public.artists(id),
  preferred_design_id uuid references public.flash_designs(id),
  matched_artist_id uuid references public.artists(id),
  quoted_price_krw integer,
  lost_reason text,
  status text not null default 'new',
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  memo text,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid references public.booking_requests(id) on delete cascade,
  event_type text not null,
  note text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid references public.booking_requests(id),
  artist_id uuid references public.artists(id),
  rating integer check (rating between 1 and 5),
  review_text text,
  image_url text,
  country text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  area text,
  address text,
  instagram text,
  contact_name text,
  contact_phone text,
  contact_email text,
  commission_type text,
  commission_value numeric,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists booking_requests_status_idx on public.booking_requests(status);
create index if not exists booking_requests_created_at_idx on public.booking_requests(created_at desc);
create index if not exists booking_requests_utm_source_idx on public.booking_requests(utm_source);
create index if not exists booking_requests_preferred_design_id_idx on public.booking_requests(preferred_design_id);
create index if not exists booking_requests_matched_artist_id_idx on public.booking_requests(matched_artist_id);
create index if not exists flash_designs_artist_id_idx on public.flash_designs(artist_id);

alter table public.artists enable row level security;
alter table public.flash_designs enable row level security;
alter table public.booking_requests enable row level security;
alter table public.lead_events enable row level security;
alter table public.reviews enable row level security;
alter table public.partner_shops enable row level security;

drop policy if exists "Public can read active artists" on public.artists;
create policy "Public can read active artists"
  on public.artists for select
  using (is_active = true);

drop policy if exists "Public can read available flash designs" on public.flash_designs;
create policy "Public can read available flash designs"
  on public.flash_designs for select
  using (is_available = true);

drop policy if exists "Public can read public reviews" on public.reviews;
create policy "Public can read public reviews"
  on public.reviews for select
  using (is_public = true);

-- Booking inserts and admin reads/writes are handled by the server-side service role key.
-- Do not expose SUPABASE_SERVICE_ROLE_KEY to client-side code.
