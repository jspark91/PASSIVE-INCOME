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
    id: "artist-moss",
    name: "MOSS",
    slug: "moss",
    instagram: null,
    bio_en:
      "Black and grey tattoo artist focused on geometric sleeves, ornamental composition, dotwork shading, and large-scale realism.",
    bio_ko: null,
    styles: ["black and grey", "geometric", "ornamental", "dotwork", "realism", "large-scale"],
    starting_price_krw: null,
    languages: ["English booking support", "Korean"],
    location: "Sillim, Seoul",
    is_active: true
  },
  {
    id: "artist-seowoo",
    name: "SEOWOO",
    slug: "seowoo",
    instagram: null,
    bio_en:
      "Black and grey large-scale artist for full sleeves, dark realism, portrait elements, clocks, cards, skulls, and narrative compositions.",
    bio_ko: null,
    styles: ["black and grey", "realism", "full sleeve", "dark art", "portrait", "large-scale"],
    starting_price_krw: null,
    languages: ["English booking support", "Korean"],
    location: "Sillim, Seoul",
    is_active: true
  },
  {
    id: "artist-sero",
    name: "SERO",
    slug: "sero",
    instagram: null,
    bio_en:
      "Watercolor and oriental brushwork artist using plum blossoms, birds, animals, dragons, and soft color accents.",
    bio_ko: null,
    styles: ["watercolor", "oriental", "brushwork", "floral", "animal", "color accent"],
    starting_price_krw: null,
    languages: ["English booking support", "Korean"],
    location: "Sillim, Seoul",
    is_active: true
  },
  {
    id: "artist-hada",
    name: "HADA",
    slug: "hada",
    instagram: null,
    bio_en:
      "Large-scale irezumi and Japanese traditional tattoo artist for backpieces, chest panels, sleeves, dragons, samurai, masks, flowers, and color work.",
    bio_ko: null,
    styles: ["irezumi", "japanese traditional", "horimono", "color", "large-scale", "backpiece"],
    starting_price_krw: null,
    languages: ["English booking support", "Korean"],
    location: "Sillim, Seoul",
    is_active: true
  },
  {
    id: "artist-woora",
    name: "WOORA",
    slug: "woora",
    instagram: null,
    bio_en:
      "Irezumi artist focused on bold Japanese traditional sleeves, dragons, kabuto, peonies, backpiece outlines, and large-scale color composition.",
    bio_ko: null,
    styles: ["irezumi", "japanese traditional", "dragon", "kabuto", "color", "large-scale"],
    starting_price_krw: null,
    languages: ["English booking support", "Korean"],
    location: "Sillim, Seoul",
    is_active: true
  }
];

const yoonseulImageBase = "/images/artists/yoonseul";
const mossImageBase = "/images/artists/moss";
const seowooImageBase = "/images/artists/seowoo";
const seroImageBase = "/images/artists/sero";
const hadaImageBase = "/images/artists/hada";
const wooraImageBase = "/images/artists/woora";

export const sampleDesigns: FlashDesign[] = [
  {
    id: "design-yoonseul-moon-whale",
    artist_id: "artist-yoonseul",
    title: "Moon and whale brushwork",
    style: "abstract brushwork",
    size_hint: "shoulder and upper back",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-03-moon-whale.jpg`,
    is_available: true
  },
  {
    id: "design-hada-samurai-backpiece",
    artist_id: "artist-hada",
    title: "Samurai backpiece",
    style: "irezumi",
    size_hint: "full backpiece",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${hadaImageBase}/hada-01-samurai-backpiece.jpg`,
    is_available: true
  },
  {
    id: "design-woora-kabuto-thighs",
    artist_id: "artist-woora",
    title: "Kabuto thigh pair",
    style: "irezumi",
    size_hint: "both thighs",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${wooraImageBase}/woora-01-kabuto-thighs.jpg`,
    is_available: true
  },
  {
    id: "design-hada-maneki-neko-backpiece",
    artist_id: "artist-hada",
    title: "Maneki-neko backpiece",
    style: "japanese traditional",
    size_hint: "full backpiece",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${hadaImageBase}/hada-02-maneki-neko-backpiece.jpg`,
    is_available: true
  },
  {
    id: "design-woora-dragon-sleeve",
    artist_id: "artist-woora",
    title: "Dragon sleeve",
    style: "japanese traditional",
    size_hint: "full sleeve",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${wooraImageBase}/woora-02-dragon-sleeve.jpg`,
    is_available: true
  },
  {
    id: "design-hada-snake-chest-arm",
    artist_id: "artist-hada",
    title: "Snake chest and arm",
    style: "horimono",
    size_hint: "chest and arm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${hadaImageBase}/hada-03-snake-chest-arm.jpg`,
    is_available: true
  },
  {
    id: "design-woora-back-outline",
    artist_id: "artist-woora",
    title: "Backpiece outline",
    style: "irezumi",
    size_hint: "full backpiece",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${wooraImageBase}/woora-03-back-outline.jpg`,
    is_available: true
  },
  {
    id: "design-hada-leopard-chest",
    artist_id: "artist-hada",
    title: "Leopard chest panel",
    style: "japanese traditional",
    size_hint: "chest panel",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${hadaImageBase}/hada-04-leopard-chest.jpg`,
    is_available: true
  },
  {
    id: "design-moss-compass-whale",
    artist_id: "artist-moss",
    title: "Compass whale forearm",
    style: "geometric",
    size_hint: "forearm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${mossImageBase}/moss-01-compass-whale.jpg`,
    is_available: true
  },
  {
    id: "design-seowoo-full-sleeve-collage",
    artist_id: "artist-seowoo",
    title: "Full sleeve collage",
    style: "large-scale",
    size_hint: "full sleeve",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${seowooImageBase}/seowoo-01-full-sleeve-collage.jpg`,
    is_available: true
  },
  {
    id: "design-sero-plum-brushwork",
    artist_id: "artist-sero",
    title: "Plum blossom brushwork",
    style: "brushwork",
    size_hint: "forearm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${seroImageBase}/sero-01-plum-brushwork.jpg`,
    is_available: true
  },
  {
    id: "design-yoonseul-pouring-moon",
    artist_id: "artist-yoonseul",
    title: "Pouring moon blackwork",
    style: "moon",
    size_hint: "upper arm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-04-pouring-moon.jpg`,
    is_available: true
  },
  {
    id: "design-moss-compass-forearm",
    artist_id: "artist-moss",
    title: "Compass dotwork forearm",
    style: "dotwork",
    size_hint: "forearm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${mossImageBase}/moss-04-compass-forearm.jpg`,
    is_available: true
  },
  {
    id: "design-seowoo-reaper-chest",
    artist_id: "artist-seowoo",
    title: "Reaper chest piece",
    style: "dark art",
    size_hint: "chest and sleeve",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${seowooImageBase}/seowoo-05-reaper-chest.jpg`,
    is_available: true
  },
  {
    id: "design-sero-birds-plum",
    artist_id: "artist-sero",
    title: "Birds and plum blossoms",
    style: "watercolor",
    size_hint: "ribs",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${seroImageBase}/sero-02-birds-plum.jpg`,
    is_available: true
  },
  {
    id: "design-yoonseul-iris-flower",
    artist_id: "artist-yoonseul",
    title: "Iris flower brushwork",
    style: "fine-line",
    size_hint: "forearm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-08-iris-flower.jpg`,
    is_available: true
  },
  {
    id: "design-moss-aztec-calendar",
    artist_id: "artist-moss",
    title: "Aztec calendar blackwork",
    style: "ornamental",
    size_hint: "thigh",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${mossImageBase}/moss-08-aztec-calendar.jpg`,
    is_available: true
  },
  {
    id: "design-seowoo-eye-clock-sleeve",
    artist_id: "artist-seowoo",
    title: "Eye and clock sleeve",
    style: "realism",
    size_hint: "upper arm sleeve",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${seowooImageBase}/seowoo-04-eye-clock-sleeve.jpg`,
    is_available: true
  },
  {
    id: "design-sero-dragon",
    artist_id: "artist-sero",
    title: "Dragon mistwork",
    style: "oriental",
    size_hint: "forearm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${seroImageBase}/sero-05-dragon.jpg`,
    is_available: true
  },
  {
    id: "design-yoonseul-moon-flow",
    artist_id: "artist-yoonseul",
    title: "Moon flow tattoo",
    style: "abstract brushwork",
    size_hint: "upper arm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-02-moon-flow.jpg`,
    is_available: true
  },
  {
    id: "design-yoonseul-butterflies",
    artist_id: "artist-yoonseul",
    title: "Butterfly trio linework",
    style: "butterfly",
    size_hint: "upper arm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-07-butterflies.jpg`,
    is_available: true
  },
  {
    id: "design-yoonseul-moth-flow",
    artist_id: "artist-yoonseul",
    title: "Moth flow tattoo",
    style: "fine-line",
    size_hint: "upper arm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-05-moth-flow.jpg`,
    is_available: true
  },
  {
    id: "design-yoonseul-star",
    artist_id: "artist-yoonseul",
    title: "Halftone star wrap",
    style: "blackwork",
    size_hint: "upper arm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${yoonseulImageBase}/yoonseul-01-star.jpg`,
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
    id: "design-moss-geometric-sleeve",
    artist_id: "artist-moss",
    title: "Geometric sleeve detail",
    style: "ornamental",
    size_hint: "forearm sleeve",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${mossImageBase}/moss-02-geometric-sleeve.jpg`,
    is_available: true
  },
  {
    id: "design-moss-polynesian-sleeve",
    artist_id: "artist-moss",
    title: "Polynesian sleeve",
    style: "ornamental",
    size_hint: "chest and full sleeve",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${mossImageBase}/moss-03-polynesian-sleeve.jpg`,
    is_available: true
  },
  {
    id: "design-moss-character-mini",
    artist_id: "artist-moss",
    title: "Small character tattoo",
    style: "fine-line",
    size_hint: "upper arm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${mossImageBase}/moss-05-mickey-mini.jpg`,
    is_available: true
  },
  {
    id: "design-moss-illustrative-portrait",
    artist_id: "artist-moss",
    title: "Illustrative portrait",
    style: "realism",
    size_hint: "thigh",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${mossImageBase}/moss-06-illustrative-portrait.jpg`,
    is_available: true
  },
  {
    id: "design-moss-portrait-detail",
    artist_id: "artist-moss",
    title: "Portrait detail study",
    style: "portrait",
    size_hint: "large detail",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${mossImageBase}/moss-07-portrait-detail.jpg`,
    is_available: true
  },
  {
    id: "design-seowoo-forearm-cards",
    artist_id: "artist-seowoo",
    title: "Forearm cards sleeve",
    style: "black and grey",
    size_hint: "forearm sleeve",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${seowooImageBase}/seowoo-02-forearm-cards.jpg`,
    is_available: true
  },
  {
    id: "design-seowoo-gambler-sleeve",
    artist_id: "artist-seowoo",
    title: "Gambler sleeve",
    style: "dark art",
    size_hint: "full arm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${seowooImageBase}/seowoo-03-gambler-sleeve.jpg`,
    is_available: true
  },
  {
    id: "design-sero-blue-plum",
    artist_id: "artist-sero",
    title: "Blue plum branch",
    style: "watercolor",
    size_hint: "forearm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${seroImageBase}/sero-03-blue-plum.jpg`,
    is_available: true
  },
  {
    id: "design-sero-wolf-plum",
    artist_id: "artist-sero",
    title: "Wolf and plum blossoms",
    style: "animal",
    size_hint: "upper arm",
    price_from_krw: null,
    duration_minutes: null,
    image_url: `${seroImageBase}/sero-04-wolf-plum.jpg`,
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
    style: "abstract brushwork",
    size_cm: "12 cm",
    placement: "upper arm",
    budget_krw: 300000,
    reference_image_url: null,
    preferred_artist_id: "artist-yoonseul",
    preferred_design_id: "design-yoonseul-moon-whale",
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
