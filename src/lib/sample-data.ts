import type { Artist, BookingRequest, FlashDesign } from "@/types/domain";

export const sampleArtists: Artist[] = [
  {
    id: "artist-yoonseul",
    name: "YOONSEUL",
    slug: "yoonseul",
    instagram: "https://www.instagram.com/yoonseultattoo/",
    bio_en:
      "Abstract brushwork, moon motifs, butterfly linework, blackwork, and realism tattoos with expressive movement.",
    bio_ko: null,
    styles: ["abstract brushwork", "moon", "butterfly", "fine-line", "blackwork", "realism"],
    starting_price_krw: null,
    languages: ["English booking support", "Korean"],
    location: "Sillim, Seoul",
    is_active: true
  },
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

const yoonseulImageBase = "/images/artists/yoonseul";

export const sampleDesigns: FlashDesign[] = [
  {
    id: "design-yoonseul-star",
    artist_id: "artist-yoonseul",
    title: "Halftone star wrap",
    style: "blackwork",
    size_hint: "custom sizing",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-01-star.jpg`,
    is_available: true
  },
  {
    id: "design-yoonseul-moon-flow",
    artist_id: "artist-yoonseul",
    title: "Moon flow brushwork",
    style: "abstract brushwork",
    size_hint: "upper arm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-02-moon-flow.jpg`,
    is_available: true
  },
  {
    id: "design-yoonseul-moon-whale",
    artist_id: "artist-yoonseul",
    title: "Moon and whale",
    style: "abstract brushwork",
    size_hint: "shoulder and upper back",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-03-moon-whale.jpg`,
    is_available: true
  },
  {
    id: "design-yoonseul-pouring-moon",
    artist_id: "artist-yoonseul",
    title: "Pouring moon",
    style: "moon",
    size_hint: "upper arm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-04-pouring-moon.jpg`,
    is_available: true
  },
  {
    id: "design-yoonseul-moth-flow",
    artist_id: "artist-yoonseul",
    title: "Moth flow linework",
    style: "fine-line",
    size_hint: "upper arm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-05-moth-flow.jpg`,
    is_available: true
  },
  {
    id: "design-yoonseul-owl-realism",
    artist_id: "artist-yoonseul",
    title: "Owl realism",
    style: "realism",
    size_hint: "lower leg",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-06-owl-realism.jpg`,
    is_available: true
  },
  {
    id: "design-yoonseul-butterflies",
    artist_id: "artist-yoonseul",
    title: "Butterfly linework",
    style: "butterfly",
    size_hint: "upper arm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-07-butterflies.jpg`,
    is_available: true
  },
  {
    id: "design-yoonseul-iris-flower",
    artist_id: "artist-yoonseul",
    title: "Iris flower",
    style: "fine-line",
    size_hint: "forearm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-08-iris-flower.jpg`,
    is_available: true
  },
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
