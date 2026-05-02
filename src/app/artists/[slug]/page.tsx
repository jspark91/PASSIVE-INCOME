import Link from "next/link";
import { notFound } from "next/navigation";
import { DesignCard } from "@/components/DesignCard";
import { getArtistBySlug, getDesignsForArtist } from "@/lib/data";
import { formatUsdGuideFromKrw } from "@/lib/format";

export default async function ArtistDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  const designs = await getDesignsForArtist(artist.id);

  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
          ETHNIC HOUSE artist
        </p>
        <h1 className="mt-4 text-6xl font-semibold leading-none text-ink-900 sm:text-8xl">
          {artist.name}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl leading-7 text-ink-700">{artist.bio_en}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {artist.styles.map((style) => (
            <span key={style} className="rounded-full bg-ink-50 px-3 py-1 text-xs text-ink-700">
              {style}
            </span>
          ))}
        </div>
        <dl className="mx-auto mt-8 grid max-w-3xl gap-4 text-sm text-ink-700 sm:grid-cols-3">
          <div>
            <dt className="font-semibold text-ink-900">Starting price</dt>
            <dd className="mt-1">{formatUsdGuideFromKrw(artist.starting_price_krw)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-900">Location</dt>
            <dd className="mt-1">{artist.location}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-900">Languages</dt>
            <dd className="mt-1">{artist.languages.join(", ")}</dd>
          </div>
        </dl>
        <Link
          href={`/booking?artist=${encodeURIComponent(artist.id)}`}
          className="mt-8 inline-flex rounded-md bg-ink-900 px-6 py-3 text-sm font-semibold text-white"
        >
          Make an appointment
        </Link>
      </div>

      <div className="bg-ink-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {designs.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
