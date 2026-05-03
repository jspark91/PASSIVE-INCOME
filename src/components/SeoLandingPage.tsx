import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";
import { ArtistCard } from "@/components/ArtistCard";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import type { SeoPage } from "@/lib/seo-pages";
import type { Artist, FlashDesign } from "@/types/domain";

type SeoLandingPageProps = {
  page: SeoPage;
  artists: Artist[];
  designs: FlashDesign[];
};

function normalize(value?: string | null) {
  return (value ?? "").toLowerCase().trim();
}

function bookingHref(page: SeoPage) {
  const params = new URLSearchParams({
    source: "organic",
    utm_source: "google",
    utm_medium: "seo",
    utm_campaign: page.slug,
    style: page.styleTags[0] ?? page.h1
  });

  return `/booking?${params.toString()}`;
}

function uniqueDesigns(items: FlashDesign[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function selectArtists(page: SeoPage, artists: Artist[]) {
  const slugSet = new Set(page.artistSlugs);
  const styleTerms = page.galleryStyles.map(normalize);
  const directMatches = artists.filter((artist) => slugSet.has(artist.slug));
  const styleMatches = artists.filter((artist) =>
    artist.styles.some((style) => styleTerms.some((term) => normalize(style).includes(term)))
  );

  return [...directMatches, ...styleMatches].filter(
    (artist, index, list) => list.findIndex((candidate) => candidate.id === artist.id) === index
  );
}

function selectDesigns(page: SeoPage, artists: Artist[], designs: FlashDesign[]) {
  const artistBySlug = new Map(artists.map((artist) => [artist.slug, artist]));
  const artistIds = new Set(
    page.artistSlugs
      .map((slug) => artistBySlug.get(slug)?.id)
      .filter((artistId): artistId is string => Boolean(artistId))
  );
  const styleTerms = page.galleryStyles.map(normalize);

  const featured = page.featuredDesignIds
    .map((id) => designs.find((design) => design.id === id))
    .filter((design): design is FlashDesign => Boolean(design));

  const related = designs.filter((design) => {
    const designStyle = normalize(design.style);
    const styleMatch = styleTerms.some(
      (term) => designStyle.includes(term) || term.includes(designStyle)
    );

    return artistIds.has(design.artist_id) || styleMatch;
  });

  return uniqueDesigns([...featured, ...related, ...designs]).slice(0, 12);
}

function getArtistName(artists: Artist[], design: FlashDesign) {
  return artists.find((artist) => artist.id === design.artist_id)?.name ?? "ETHNIC HOUSE";
}

export function SeoLandingPage({ page, artists, designs }: SeoLandingPageProps) {
  const bookingUrl = bookingHref(page);
  const relatedArtists = selectArtists(page, artists);
  const gallery = selectDesigns(page, artists, designs);
  const heroImage = gallery.find((design) => design.image_url)?.image_url ?? designs[0]?.image_url;

  return (
    <>
      <SeoJsonLd page={page} />

      <section className="relative isolate overflow-hidden bg-ink-900 text-white">
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-black/68" />
        <div className="relative mx-auto grid min-h-[72svh] max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-100">
              Organic tattoo guide
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-none sm:text-7xl">
              {page.h1}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-7 text-ink-50">{page.subtitle}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={bookingUrl}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-ink-900"
              >
                {page.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#gallery"
                className="inline-flex items-center justify-center rounded-md border border-white/35 px-6 py-3 text-sm font-semibold text-white"
              >
                View Work
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {page.styleTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-ink-50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.slice(0, 6).map((design, index) => (
              <Link
                key={design.id}
                href={`/booking?design=${encodeURIComponent(design.id)}`}
                className={[
                  "group overflow-hidden rounded-sm bg-ink-800",
                  index === 0 ? "col-span-2 row-span-2 sm:col-span-2" : ""
                ].join(" ")}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  {design.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={design.image_url}
                      alt={`${page.h1} portfolio by ${getArtistName(artists, design)}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
                <Images className="h-4 w-4" />
                Recent Work
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-ink-900 sm:text-5xl">
                Image-first portfolio
              </h2>
            </div>
            <p className="text-sm font-semibold text-moss-700">{page.price}</p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {gallery.map((design) => (
              <Link
                key={design.id}
                href={`/booking?design=${encodeURIComponent(design.id)}`}
                className="group overflow-hidden border border-ink-100 bg-white"
              >
                <div className="aspect-[3/4] overflow-hidden bg-ink-900">
                  {design.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={design.image_url}
                      alt={`${page.h1} example: ${design.title} by ${getArtistName(
                        artists,
                        design
                      )}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-ink-900">{design.title}</p>
                  <p className="mt-1 text-xs text-ink-700">
                    {getArtistName(artists, design)} / {design.style ?? "custom"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
              Artists
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink-900 sm:text-5xl">
              Match the style to the artist.
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink-700">
              Every request still gets checked manually for size, placement, timing, and artist
              fit.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArtists.slice(0, 6).map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-100">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Fast answers</h2>
          </div>
          <div className="space-y-3">
            {page.faq.map((item) => (
              <details key={item.q} className="border border-white/10 p-5">
                <summary className="cursor-pointer text-base font-semibold">{item.q}</summary>
                <p className="mt-4 text-sm leading-6 text-ink-100">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
              ETHNIC HOUSE SEOUL
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-ink-900 sm:text-5xl">
              Ready to check availability?
            </h2>
          </div>
          <Link
            href={bookingUrl}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink-900 px-6 py-3 text-sm font-semibold text-white"
          >
            {page.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
