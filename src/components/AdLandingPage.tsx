import Link from "next/link";
import { ArrowRight, CalendarDays, Instagram, MapPin, ShieldCheck } from "lucide-react";
import type { Artist, FlashDesign } from "@/types/domain";
import { formatUsdStartingPrice } from "@/lib/format";
import { instagramDmUrl, instagramProfileUrl } from "@/lib/site";

type AdLandingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  campaign: string;
  primaryCta: string;
  secondaryCta: string;
  audienceNote: string;
  bookingFocus: string[];
  artists: Artist[];
  designs: FlashDesign[];
};

function bookingHref(campaign: string) {
  const params = new URLSearchParams({
    source: "landing",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: campaign
  });

  return `/booking?${params.toString()}`;
}

export function AdLandingPage({
  eyebrow,
  title,
  description,
  campaign,
  primaryCta,
  secondaryCta,
  audienceNote,
  bookingFocus,
  artists,
  designs
}: AdLandingPageProps) {
  const featuredDesigns = designs.slice(0, 6);
  const featuredArtists = artists.slice(0, 3);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink-900 text-white">
        <div className="absolute inset-0 opacity-45">
          <div className="grid h-full grid-cols-2 gap-2 p-2 sm:grid-cols-3 lg:grid-cols-6">
            {featuredDesigns.map((design, index) => (
              <div
                key={design.id}
                className={[
                  "relative min-h-52 overflow-hidden rounded-sm bg-ink-700",
                  index % 3 === 0 ? "sm:row-span-2" : ""
                ].join(" ")}
              >
                {design.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={design.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-end bg-[radial-gradient(circle_at_35%_25%,rgba(247,243,239,0.22),transparent_28%),linear-gradient(145deg,#5b4637,#1c1511)] p-4">
                    <span className="text-xs uppercase tracking-[0.24em] text-white/75">
                      {design.style ?? "tattoo"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/72 to-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-100">
            {eyebrow}
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-none sm:text-7xl lg:text-8xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-ink-100 sm:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={bookingHref(campaign)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-ink-900"
            >
              {primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={instagramDmUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white"
            >
              <Instagram className="h-4 w-4" />
              {secondaryCta}
            </a>
          </div>
          <div className="mt-10 grid max-w-3xl gap-3 text-sm text-ink-100 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Sillim, Seoul
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Appointment only
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              English booking support
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
              Booking support
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
              Send your idea first. We match the right artist manually.
            </h2>
            <p className="mt-5 leading-7 text-ink-700">{audienceNote}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {bookingFocus.map((item) => (
              <div key={item} className="border border-ink-100 bg-ink-50 p-5">
                <p className="font-semibold text-ink-900">{item}</p>
                <p className="mt-3 text-sm leading-6 text-ink-700">
                  Include size, placement, travel dates, and reference images so we can check
                  availability before you visit.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
                Price guide
              </p>
              <h2 className="mt-3 text-4xl font-semibold text-ink-900">
                USD guide before a custom quote.
              </h2>
            </div>
            <Link
              href={bookingHref(campaign)}
              className="inline-flex items-center justify-center rounded-md bg-ink-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Request quote
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Small lettering", "from $60", "Compact text, date, or short word."],
              ["Mini tattoo", "from $75", "Small travel-memory pieces and symbols."],
              ["Fine-line tattoo", "from $90", "Simple linework with clean placement."]
            ].map(([label, price, note]) => (
              <div key={label} className="bg-white p-6">
                <p className="text-sm text-ink-700">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-ink-900">{price}</p>
                <p className="mt-3 text-sm leading-6 text-ink-700">{note}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-ink-700">
            Final pricing depends on size, placement, detail, artist, and design complexity.
            Deposit instructions are shared manually before confirmation.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
                Artists
              </p>
              <h2 className="mt-3 text-4xl font-semibold text-ink-900">
                Current ETHNIC HOUSE roster
              </h2>
            </div>
            <a
              href={instagramProfileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-moss-700"
            >
              View Instagram
            </a>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featuredArtists.map((artist) => (
              <article key={artist.id} className="border border-ink-100 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss-700">
                  {artist.location}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-ink-900">{artist.name}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-700">{artist.bio_en}</p>
                <p className="mt-4 text-sm font-semibold text-ink-900">
                  {formatUsdStartingPrice(artist.starting_price_krw)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-100">
            ETHNIC HOUSE SILLIM
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Ready to check availability?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-ink-100">
            Use the booking form for a structured request, or open Instagram DM if you already
            know your idea.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={bookingHref(campaign)}
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-ink-900"
            >
              Open booking form
            </Link>
            <a
              href={instagramDmUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white"
            >
              DM ETHNIC HOUSE
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
