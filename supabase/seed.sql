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
  '파인라인과 미니타투 중심의 테스트 작가입니다.',
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
  '블랙워크와 한국 여행 기념 플래시 도안 중심의 테스트 작가입니다.',
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
  '레터링과 우정/커플 타투 중심의 테스트 작가입니다.',
  array['lettering', 'couple tattoo', 'minimal'],
  80000,
  array['English booking support', 'Korean'],
  'Sillim, Seoul',
  true
)
on conflict (slug) do nothing;

insert into public.flash_designs (
  artist_id,
  title,
  style,
  size_hint,
  price_from_krw,
  duration_minutes,
  is_available
)
select artists.id, 'Hangul memory word', 'lettering', '3-5 cm', 90000, 45, true
from public.artists
where slug = 'mina'
on conflict do nothing;

insert into public.flash_designs (
  artist_id,
  title,
  style,
  size_hint,
  price_from_krw,
  duration_minutes,
  is_available
)
select artists.id, 'Small black flower', 'blackwork', '5-7 cm', 150000, 75, true
from public.artists
where slug = 'june'
on conflict do nothing;

