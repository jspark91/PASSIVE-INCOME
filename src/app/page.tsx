import Link from "next/link";
import { ArrowRight, CalendarCheck, Languages, MapPin, ShieldCheck } from "lucide-react";
import { ArtistCard } from "@/components/ArtistCard";
import { DesignCard } from "@/components/DesignCard";
import { getArtists, getFlashDesigns } from "@/lib/data";

export default async function HomePage() {
  const [artists, designs] = await Promise.all([getArtists(), getFlashDesigns()]);

  return (
    <>
      <section className="bg-ink-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-300">
              English-friendly Seoul tattoo booking
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              A small tattoo for your Korea trip, matched with an available Seoul artist.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-100">
              Send your idea, travel dates, style, size, and budget. We help organize the
              booking details with artists at the first test studio, Ethnic House Sillim.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-ink-900"
              >
                Submit your tattoo idea
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/artists"
                className="inline-flex items-center justify-center rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white"
              >
                View artists
              </Link>
            </div>
          </div>
          <div className="rounded-lg bg-white/10 p-5">
            <div className="grid gap-4">
              {[
                {
                  icon: Languages,
                  title: "English booking support",
                  text: "Clear request form, price guidance, and aftercare information."
                },
                {
                  icon: CalendarCheck,
                  title: "Travel-date matching",
                  text: "Built for visitors with limited time in Seoul."
                },
                {
                  icon: MapPin,
                  title: "First studio in Sillim",
                  text: "Initial test location before adding other Seoul partner studios."
                },
                {
                  icon: ShieldCheck,
                  title: "Manual quality control",
                  text: "V1 uses curated artists and manual matching instead of open signup."
                }
              ].map((item) => (
                <div key={item.title} className="rounded-lg bg-white/10 p-4">
                  <item.icon className="h-5 w-5 text-ink-100" />
                  <h2 className="mt-3 font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-ink-100">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">
              First test artists
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-ink-900">Curated for compact sessions</h2>
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

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">
              Flash concepts
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-ink-900">Simple ideas to test demand</h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {designs.slice(0, 4).map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 rounded-lg bg-ink-900 p-8 text-white md:grid-cols-[1fr_0.7fr]">
          <div>
            <h2 className="text-2xl font-semibold">How it works</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {["Send your idea", "Get matched", "Confirm date and price", "Visit the studio"].map(
                (step, index) => (
                  <div key={step} className="rounded-lg bg-white/10 p-4">
                    <span className="text-sm font-semibold text-ink-100">0{index + 1}</span>
                    <p className="mt-2 font-semibold">{step}</p>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="rounded-lg bg-white p-5 text-ink-900">
            <h3 className="font-semibold">Price guide</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt>Small lettering</dt>
                <dd>from KRW 80,000</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Mini tattoo</dt>
                <dd>from KRW 100,000</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Fine-line tattoo</dt>
                <dd>from KRW 120,000</dd>
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

