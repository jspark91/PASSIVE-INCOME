import rawSeoPages from "@/lib/seo-pages.json";

export type SeoFaqItem = {
  q: string;
  a: string;
};

export type SeoPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  styleTags: string[];
  price: string;
  galleryStyles: string[];
  artistSlugs: string[];
  featuredDesignIds: string[];
  cta: string;
  faq: SeoFaqItem[];
  socialHashtags: string[];
  pinBoard: string;
};

export const seoPages = rawSeoPages as SeoPage[];

export function getSeoPageBySlug(slug: string) {
  return seoPages.find((page) => page.slug === slug) ?? null;
}

export const seoPageLinks = seoPages.map((page) => ({
  href: `/${page.slug}`,
  label: page.h1,
  price: page.price
}));
