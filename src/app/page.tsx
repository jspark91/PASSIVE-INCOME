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
import { getArtists, getFlashDesigns } from "@/lib/data";
import { formatUsdStartingPrice } from "@/lib/format";

const styleFilters = ["All", "Fine-line", "Blackwork", "Abstract", "Oriental", "Realism"];

const travelerPackages = [
  {
    title: "Seoul Memory",
    description: "Small symbols, dates, travel marks",
    price: "from $75",
    image: "/images/artists/yoonseul/yoonseul-01-star.jpg"
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
    image: "/images/artists/yoonseul/yoonseul-07-butterflies.jpg"
  },
  {
    title: "Fine-line Custom",
    description: "Flowers, butterflies, minimal details",
    price: "from $90",
    image: "/images/artists/yoonseul/yoonseul-08-iris-flower.jpg"
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
  const heroImage = designs[0]?.image_url ?? "/images/artists/yoonseul/yoonseul-03-moon-whale.jpg";
  const recentWork = designs.slice(0, 12);

  return (
    <>
      <section className="relative isolate min-h-[78svh] overflow-hidden bg-ink-900 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt="ETHNIC HOUSE tattoo portfolio"
          className="absolute inset-0 h-full w-full object-cover"
        />
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

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {recentWork.map((design) => {
              const artist = artistById.get(design.artist_id);

              return (
                <Link
                  key={design.id}
                  href={`/booking?design=${encodeURIComponent(design.id)}`}
                  className="group min-w-0 overflow-hidden bg-white text-ink-900"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-ink-700">
                    {design.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={design.image_url}
                        alt={design.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-ink-700" />
                    )}
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="truncate text-xs font-semibold text-ink-900">
                      {artist?.name ?? "ETHNIC HOUSE"}
                    </p>
                    <p className="truncate text-xs text-ink-700">{design.style ?? "Custom"}</p>
                    <p className="text-xs font-medium text-moss-700">
                      {formatUsdStartingPrice(design.price_from_krw)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
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
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {artists.slice(0, 4).map((artist) => (
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

      <section className="bg-ink-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-100">
              How It Works
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Send. Match. Confirm.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              ["01", "Send your idea"],
              ["02", "Get artist match & quote"],
              ["03", "Confirm with deposit"]
            ].map(([step, label]) => (
              <div key={step} className="border border-white/10 p-5">
                <p className="text-xs font-semibold tracking-[0.2em] text-ink-100">{step}</p>
                <p className="mt-4 text-lg font-semibold">{label}</p>
              </div>
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
