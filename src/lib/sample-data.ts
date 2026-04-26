import type { Artist, BookingRequest, FlashDesign } from "@/types/domain";

export const sampleArtists: Artist[] = [
  {
    id: "artist-mina",
    name: "Mina",
    slug: "mina",
    instagram: "https://instagram.com/",
    bio_en:
      "Fine-line and small symbolic tattoo artist. Good fit for first tattoos and simple travel-memory pieces.",
    bio_ko: null,
    styles: ["fine-line", "small tattoo", "lettering"],
    starting_price_krw: 100000,
    languages: ["English booking support", "Korean"],
    location: "Sillim, Seoul",
    is_active: true
  },
  {
    id: "artist-june",
    name: "June",
    slug: "june",
    instagram: "https://instagram.com/",
    bio_en: "Blackwork and Korean-inspired flash designs for compact one-day sessions.",
    bio_ko: null,
    styles: ["blackwork", "flash", "korean-inspired"],
    starting_price_krw: 120000,
    languages: ["English booking support", "Korean"],
    location: "Sillim, Seoul",
    is_active: true
  },
  {
    id: "artist-arin",
    name: "Arin",
    slug: "arin",
    instagram: "https://instagram.com/",
    bio_en: "Lettering and friend/couple tattoo concepts with clear sizing and price guidance.",
    bio_ko: null,
    styles: ["lettering", "couple tattoo", "minimal"],
    starting_price_krw: 80000,
    languages: ["English booking support", "Korean"],
    location: "Sillim, Seoul",
    is_active: true
  }
];

export const sampleDesigns: FlashDesign[] = [
  {
    id: "design-hangul-memory",
    artist_id: "artist-mina",
    title: "Hangul memory word",
    style: "lettering",
    size_hint: "3-5 cm",
    price_from_krw: 90000,
    duration_minutes: 45,
    image_url: null,
    is_available: true
  },
  {
    id: "design-seoul-line",
    artist_id: "artist-mina",
    title: "Seoul line symbol",
    style: "fine-line",
    size_hint: "4-6 cm",
    price_from_krw: 120000,
    duration_minutes: 60,
    image_url: null,
    is_available: true
  },
  {
    id: "design-black-flower",
    artist_id: "artist-june",
    title: "Small black flower",
    style: "blackwork",
    size_hint: "5-7 cm",
    price_from_krw: 150000,
    duration_minutes: 75,
    image_url: null,
    is_available: true
  },
  {
    id: "design-friend-mark",
    artist_id: "artist-arin",
    title: "Friendship mark set",
    style: "couple tattoo",
    size_hint: "2-4 cm each",
    price_from_krw: 160000,
    duration_minutes: 90,
    image_url: null,
    is_available: true
  },
  {
    id: "design-moon-line",
    artist_id: "artist-mina",
    title: "Quiet moon line",
    style: "fine-line",
    size_hint: "3-4 cm",
    price_from_krw: 100000,
    duration_minutes: 45,
    image_url: null,
    is_available: true
  },
  {
    id: "design-seal-symbol",
    artist_id: "artist-june",
    title: "Korean seal symbol",
    style: "blackwork",
    size_hint: "4-5 cm",
    price_from_krw: 130000,
    duration_minutes: 60,
    image_url: null,
    is_available: true
  },
  {
    id: "design-script-date",
    artist_id: "artist-arin",
    title: "Travel date script",
    style: "lettering",
    size_hint: "2-4 cm",
    price_from_krw: 80000,
    duration_minutes: 40,
    image_url: null,
    is_available: true
  },
  {
    id: "design-branch-mini",
    artist_id: "artist-june",
    title: "Minimal branch",
    style: "small tattoo",
    size_hint: "5-6 cm",
    price_from_krw: 140000,
    duration_minutes: 70,
    image_url: null,
    is_available: true
  }
];

export const sampleLeads: BookingRequest[] = [
  {
    id: "sample-lead-1",
    name: "Sample traveler",
    nationality: "United States",
    language: "English",
    email: "sample@example.com",
    instagram: "@sample",
    whatsapp: null,
    travel_start: "2026-05-10",
    travel_end: "2026-05-15",
    preferred_date: "2026-05-12",
    preferred_time: "Afternoon",
    style: "fine-line",
    size_cm: "5 cm",
    placement: "inner arm",
    budget_krw: 150000,
    reference_image_url: null,
    preferred_artist_id: "artist-mina",
    preferred_design_id: "design-seoul-line",
    matched_artist_id: null,
    quoted_price_krw: null,
    lost_reason: null,
    status: "new",
    source: "sample",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "seoul_tattoo_test",
    memo: "Sample row shown when Supabase is not configured.",
    created_at: new Date().toISOString()
  }
];
