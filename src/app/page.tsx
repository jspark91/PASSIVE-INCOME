import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  HeartPulse,
  MapPin,
  MessageCircle,
  ShieldCheck
} from "lucide-react";
import { ArtistCard } from "@/components/ArtistCard";
import { HeroImageRotator } from "@/components/HeroImageRotator";
import { SocialContactRail } from "@/components/SocialContactRail";
import { WorkSlider } from "@/components/WorkSlider";
import { getArtists, getFlashDesigns } from "@/lib/data";
import { isIrezumiArtist, isIrezumiDesign } from "@/lib/irezumi";

const styleFilters = ["All", "Fine-line", "Blackwork", "Abstract", "Oriental", "Realism"];

const travelerPackages = [
  {
    title: "Seoul Memory",
    description: "Small symbols, dates, travel marks",
    price: "from $75",
    image: "/images/artists/sero/sero-02-birds-plum.jpg"
  },
  {
    title: "Small Lettering",
    description: "Names, dates, short phrases",
    price: "from $60",
    image: "/images/artists/moss/moss-05-mickey-mini.jpg"
  },
  {
    title: "Friend / Couple",
    description: "Matching small designs",
    price: "from $60 / person",
    image: "/images/artists/sero/sero-03-blue-plum.jpg"
  },
  {
    title: "Fine-line Custom",
    description: "Flowers, butterflies, minimal details",
    price: "from $90",
    image: "/images/artists/moss/moss-01-compass-whale.jpg"
  }
];

const styleSearchCards = [
  {
    href: "/fine-line-tattoo-seoul",
    label: "Fine-line Tattoo",
    price: "from $90",
    image: "/images/artists/sero/sero-02-birds-plum.jpg"
  },
  {
    href: "/blackwork-tattoo-seoul",
    label: "Blackwork Tattoo",
    price: "quote required",
    image: "/images/artists/moss/moss-02-geometric-sleeve.jpg"
  },
  {
    href: "/small-tattoo-seoul",
    label: "Small Tattoo",
    price: "from $75",
    image: "/images/artists/moss/moss-05-mickey-mini.jpg"
  },
  {
    href: "/travel-tattoo-seoul",
    label: "Travel Tattoo",
    price: "from $75",
    image: "/images/artists/sero/sero-01-plum-brushwork.jpg"
  },
  {
    href: "/minimal-tattoo-seoul",
    label: "Minimal Tattoo",
    price: "from $75",
    image: "/images/artists/yoonseul/yoonseul-08-iris-flower.jpg"
  },
  {
    href: "/tattoo-price-seoul",
    label: "Tattoo Price Seoul",
    price: "guide",
    image: "/images/artists/seowoo/seowoo-02-forearm-cards.jpg"
  },
  {
    href: "/english-speaking-tattoo-seoul",
    label: "English-speaking Booking",
    price: "quote required",
    image: "/images/artists/moss/moss-04-compass-forearm.jpg"
  },
  {
    href: "/korean-tattoo-artist-seoul",
    label: "Korean Tattoo Artist",
    price: "selected artists",
    image: "/images/artists/seowoo/seowoo-04-eye-clock-sleeve.jpg"
  }
];

const priceGuides = [
  { title: "Lettering", price: "from $60" },
  { title: "Mini tattoo", price: "from $75" },
  { title: "Fine-line", price: "from $90" },
  { title: "Custom", price: "quote required" }
];

const trustItems = [
  { label: "English support", Icon: MessageCircle },
  { label: "Near Sillim Station", Icon: MapPin },
  { label: "18+ only", Icon: ShieldCheck },
  { label: "Clear price", Icon: BadgeCheck },
  { label: "Aftercare guide", Icon: HeartPulse },
  { label: "Appointment only", Icon: CalendarCheck }
];

export default async function HomePage() {
  const [artists, designs] = await Promise.all([getArtists(), getFlashDesigns()]);
  const artistById = new Map(artists.map((artist) => [artist.id, artist]));
  const irezumiArtists = artists.filter(isIrezumiArtist);
  const irezumiArtistIds = new Set(irezumiArtists.map((artist) => artist.id));
  const mainDesigns = designs.filter(
    (design) => !irezumiArtistIds.has(design.artist_id) && !isIrezumiDesign(design)
  );
  const heroDesigns = mainDesigns.filter((design) => design.artist_id !== "artist-yoonseul").slice(0, 6);
  const heroImages = (heroDesigns.length ? heroDesigns : mainDesigns.slice(0, 6)).map((design) => ({
    src: design.image_url ?? "",
    alt: design.title
  }));
  const recentWork = mainDesigns.slice(0, 12).map((design) => ({
    ...design,
    artistName: artistById.get(design.artist_id)?.name ?? "ETHNIC HOUSE"
  }));

  return (
    <>
      <section className="relative isolate min-h-[78svh] overflow-hidden bg-ink-900 text-white">
        <HeroImageRotator images={heroImages} />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex min-h-[78svh] max-w-7xl items-end px-4 pb-10 pt-24 sm:px-6 lg:pb-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-100">
              Seoul tattoo booking
            </p>
            <h1 className="mt-4 break-words text-5xl font-semibold leading-none sm:text-7xl lg:text-8xl">
              ETHNIC HOUSE SEOUL
            </h1>
            <p className="mt-5 max-w-md text-lg leading-7 text-ink-50">
              Tattoo booking for travelers in Seoul.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-ink-50 px-6 py-3 text-sm font-semibold text-ink-900"
              >
                Book Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#work"
                className="inline-flex items-center justify-center rounded-md border border-white/45 px-6 py-3 text-sm font-semibold text-white"
              >
                View Work
              </Link>
            </div>
          </div>
        </div>
        <SocialContactRail />
      </section>

      <section id="work" className="bg-ink-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-100">
                Recent Work
              </p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Choose your style</h2>
            </div>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-end sm:overflow-visible">
              {styleFilters.map((filter) => (
                <span
                  key={filter}
                  className="shrink-0 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-ink-50"
                >
                  {filter}
                </span>
              ))}
            </div>
          </div>

          <WorkSlider designs={recentWork} />
        </div>
      </section>

      <section id="artists" className="bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
                Selected Artists
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-ink-900 sm:text-5xl">
                Choose Your Artist
              </h2>
            </div>
            <Link
              href="/artists"
              className="hidden items-center gap-2 text-sm font-semibold text-moss-700 sm:inline-flex"
            >
              All artists
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {artists.slice(0, 6).map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
            Popular for Travelers
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {travelerPackages.map((item) => (
              <Link
                key={item.title}
                href="/booking"
                className="group overflow-hidden border border-ink-100 bg-white"
              >
                <div className="aspect-[4/5] overflow-hidden bg-ink-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-ink-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-ink-700">{item.description}</p>
                  <p className="mt-3 text-sm font-semibold text-moss-700">{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="prices" className="bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
                Starting Prices
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-ink-900 sm:text-5xl">
                Clear price before booking.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {priceGuides.map((item) => (
                <div key={item.title} className="border border-ink-100 bg-white p-5">
                  <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                  <p className="mt-3 text-sm text-moss-700">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-5 text-ink-700">
            Final price depends on size, placement, detail, color, and artist.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {trustItems.map(({ label, Icon }) => (
              <div key={label} className="border border-ink-100 p-4">
                <Icon className="h-5 w-5 text-moss-700" />
                <p className="mt-4 text-sm font-semibold text-ink-900">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
                Tattoo Guides
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-ink-900 sm:text-5xl">
                Search by style
              </h2>
            </div>
            <Link
              href="/tattoo-in-seoul"
              className="inline-flex items-center gap-2 text-sm font-semibold text-moss-700"
            >
              Tattoo in Seoul
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {styleSearchCards.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="group overflow-hidden bg-white transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="aspect-[4/5] overflow-hidden bg-ink-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={page.image}
                    alt={page.label}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <span className="text-sm font-semibold text-ink-900">{page.label}</span>
                  <span className="shrink-0 text-xs font-semibold text-moss-700">{page.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="location" className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
              Location
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-ink-900 sm:text-5xl">
              Sillim Station 10-644
            </h2>
            <p className="mt-4 max-w-md leading-7 text-ink-700">
              ETHNIC HOUSE SEOUL near Sillim Station. Book before visiting so we can confirm artist
              availability.
            </p>
            <Link
              href="https://www.google.com/maps/search/?api=1&query=%EC%8B%A0%EB%A6%BC%EC%97%AD%2010-644"
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-ink-900 px-6 py-3 text-sm font-semibold text-white"
            >
              Open Google Maps
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden bg-ink-100">
            <iframe
              title="ETHNIC HOUSE Seoul map"
              src="https://www.google.com/maps?q=%EC%8B%A0%EB%A6%BC%EC%97%AD%2010-644&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[360px] w-full border-0 sm:h-[440px]"
            />
          </div>
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-100">
              Reviews
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">
              Client reviews coming soon.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink-50 px-6 py-3 text-sm font-semibold text-ink-900"
            >
              Start Booking
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/artists"
              className="inline-flex items-center justify-center rounded-md border border-white/20 px-6 py-3 text-sm font-semibold text-white"
            >
              View Artists
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
