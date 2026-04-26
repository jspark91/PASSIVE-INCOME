import Link from "next/link";
import { notFound } from "next/navigation";
import { DesignCard } from "@/components/DesignCard";
import { getArtistBySlug, getDesignsForArtist } from "@/lib/data";
import { formatKrw } from "@/lib/format";

export default async function ArtistDetailPage({
  params
}: {
  params: { slug: string };
}) {
  const artist = await getArtistBySlug(params.slug);

  if (!artist) {
    notFound();
  }

  const designs = await getDesignsForArtist(artist.id);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-lg border border-ink-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">
            Artist profile
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-ink-900">{artist.name}</h1>
          <p className="mt-4 leading-7 text-ink-700">{artist.bio_en}</p>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-ink-900">Starting price</dt>
              <dd className="mt-1 text-ink-700">{formatKrw(artist.starting_price_krw)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-900">Location</dt>
              <dd className="mt-1 text-ink-700">{artist.location}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-900">Languages</dt>
              <dd className="mt-1 text-ink-700">{artist.languages.join(", ")}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            {artist.styles.map((style) => (
              <span key={style} className="rounded-full bg-ink-50 px-3 py-1 text-xs text-ink-700">
                {style}
              </span>
            ))}
          </div>
          <Link
            href={`/booking?artist=${encodeURIComponent(artist.id)}`}
            className="mt-8 inline-flex w-full justify-center rounded-md bg-ink-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Book this artist
          </Link>
        </aside>
        <div>
          <h2 className="text-2xl font-semibold text-ink-900">Available flash concepts</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {designs.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

