import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArtistCard } from "@/components/ArtistCard";
import { getArtists, getFlashDesigns } from "@/lib/data";

export default async function HomePage() {
  const [artists, designs] = await Promise.all([getArtists(), getFlashDesigns()]);

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
            Seoul private tattoo studio
          </p>
          <h1 className="mt-5 text-6xl font-semibold leading-none text-ink-900 sm:text-8xl lg:text-9xl">
            ETHNIC HOUSE
          </h1>
          <p className="mt-4 text-sm font-medium text-ink-700">
            ETHNIC HOUSE SILLIM / 에스닉하우스 신림
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-ink-700 sm:text-lg">
            English-friendly booking support for small tattoos, lettering, fine-line work, and
            travel-memory pieces at ETHNIC HOUSE in Sillim, Seoul.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink-900 px-6 py-3 text-sm font-semibold text-white"
            >
              Make an appointment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/artists"
              className="inline-flex items-center justify-center rounded-md border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-900"
            >
              View artists
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {designs.slice(0, 8).map((design, index) => (
              <Link
                key={design.id}
                href={`/booking?design=${encodeURIComponent(design.id)}`}
                className={[
                  "group relative flex min-h-72 overflow-hidden rounded-md bg-ink-900",
                  index === 0 || index === 5 ? "lg:row-span-2 lg:min-h-[36rem]" : ""
                ].join(" ")}
              >
                {design.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={design.image_url}
                    alt={design.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(235,224,214,0.16),transparent_32%),linear-gradient(145deg,#3a2b22,#17110e)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="relative mt-auto p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-100">
                    {design.style ?? "custom"}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">{design.title}</h2>
                  <p className="mt-1 text-sm text-ink-100">{design.size_hint ?? "Size by request"}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
              Appointment only
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
              Curated sessions for travelers with limited time in Seoul.
            </h2>
          </div>
          <div className="grid gap-8 text-sm leading-7 text-ink-700 sm:grid-cols-3">
            <div>
              <p className="text-ink-900">01 / Request</p>
              <p className="mt-3">
                Send your travel dates, placement, size, budget, and reference images through the
                booking form.
              </p>
            </div>
            <div>
              <p className="text-ink-900">02 / Match</p>
              <p className="mt-3">
                We check artist availability, style fit, and the expected price range before
                confirming the next step.
              </p>
            </div>
            <div>
              <p className="text-ink-900">03 / Confirm</p>
              <p className="mt-3">
                Once date, quote, and deposit instructions are accepted, the studio appointment is
                reserved manually.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
              Artists
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-ink-900">Current booking roster</h2>
          </div>
          <Link href="/artists" className="hidden text-sm font-semibold text-moss-700 sm:inline-flex">
            All artists
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {artists.slice(0, 3).map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 bg-ink-50 p-6 md:grid-cols-[1fr_0.7fr] md:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
              Booking guide
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-ink-900">Price and policy are shared before confirmation.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-ink-700">
              Premium studios reduce poor-fit inquiries by making the minimum price, deposit,
              reference requirements, and cancellation policy clear before an appointment is held.
            </p>
          </div>
          <div className="bg-white p-6 text-ink-900">
            <h3 className="font-semibold">Price guide</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt>Small lettering</dt>
                <dd>from $60</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Mini tattoo</dt>
                <dd>from $75</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Fine-line tattoo</dt>
                <dd>from $90</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Custom design</dt>
                <dd>quote required</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
