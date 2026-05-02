import { ArtistCard } from "@/components/ArtistCard";
import { getArtists } from "@/lib/data";

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <section className="mx-auto max-w-7xl overflow-hidden px-4 py-14 sm:px-6 lg:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
        ETHNIC HOUSE artists
      </p>
      <h1 className="mt-4 max-w-[22rem] text-4xl font-semibold leading-tight text-ink-900 sm:max-w-4xl sm:text-7xl">
        Selected Artists
      </h1>
      <p className="mt-6 max-w-[22rem] leading-7 text-ink-700 sm:max-w-2xl">
        View work, choose a style, and book the artist.
      </p>
      <div className="mt-10 grid min-w-0 gap-6 md:grid-cols-4">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </section>
  );
}
