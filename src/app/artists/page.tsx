import { ArtistCard } from "@/components/ArtistCard";
import { getArtists } from "@/lib/data";

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">
        Artist directory
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-ink-900">English-booking supported artists</h1>
      <p className="mt-4 max-w-2xl leading-7 text-ink-700">
        V1 starts with a curated set of artists connected to the initial Sillim test studio.
        Add more artists only after booking demand and quality controls are validated.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </section>
  );
}

