insert into public.artists (
  name,
  slug,
  instagram,
  bio_en,
  bio_ko,
  styles,
  starting_price_krw,
  languages,
  location,
  is_active
) values
(
  'Mina',
  'mina',
  'https://instagram.com/',
  'Fine-line and small symbolic tattoo artist. Good fit for first tattoos and simple travel-memory pieces.',
  null,
  array['fine-line', 'small tattoo', 'lettering'],
  100000,
  array['English booking support', 'Korean'],
  'Sillim, Seoul',
  true
),
(
  'June',
  'june',
  'https://instagram.com/',
  'Blackwork and Korean-inspired flash designs for compact one-day sessions.',
  null,
  array['blackwork', 'flash', 'korean-inspired'],
  120000,
  array['English booking support', 'Korean'],
  'Sillim, Seoul',
  true
),
(
  'Arin',
  'arin',
  'https://instagram.com/',
  'Lettering and friend/couple tattoo concepts with clear sizing and price guidance.',
  null,
  array['lettering', 'couple tattoo', 'minimal'],
  80000,
  array['English booking support', 'Korean'],
  'Sillim, Seoul',
  true
)
on conflict (slug) do update set
  instagram = excluded.instagram,
  bio_en = excluded.bio_en,
  bio_ko = excluded.bio_ko,
  styles = excluded.styles,
  starting_price_krw = excluded.starting_price_krw,
  languages = excluded.languages,
  location = excluded.location,
  is_active = excluded.is_active;

with flash_seed as (
  select 'mina' as artist_slug, 'Hangul memory word' as title, 'lettering' as style, '3-5 cm' as size_hint, 90000 as price_from_krw, 45 as duration_minutes
  union all select 'mina', 'Seoul line symbol', 'fine-line', '4-6 cm', 120000, 60
  union all select 'june', 'Small black flower', 'blackwork', '5-7 cm', 150000, 75
  union all select 'arin', 'Friendship mark set', 'couple tattoo', '2-4 cm each', 160000, 90
  union all select 'mina', 'Quiet moon line', 'fine-line', '3-4 cm', 100000, 45
  union all select 'june', 'Korean seal symbol', 'blackwork', '4-5 cm', 130000, 60
  union all select 'arin', 'Travel date script', 'lettering', '2-4 cm', 80000, 40
  union all select 'june', 'Minimal branch', 'small tattoo', '5-6 cm', 140000, 70
)
insert into public.flash_designs (
  artist_id,
  title,
  style,
  size_hint,
  price_from_krw,
  duration_minutes,
  is_available
)
select
  artists.id,
  flash_seed.title,
  flash_seed.style,
  flash_seed.size_hint,
  flash_seed.price_from_krw,
  flash_seed.duration_minutes,
  true
from flash_seed
join public.artists on artists.slug = flash_seed.artist_slug
where not exists (
  select 1
  from public.flash_designs existing
  where existing.artist_id = artists.id
    and existing.title = flash_seed.title
);
