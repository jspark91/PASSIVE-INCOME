import { ArtistCard } from "@/components/ArtistCard";
import { getArtists } from "@/lib/data";

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
        ETHNIC HOUSE artists
      </p>
      <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-tight text-ink-900 sm:text-7xl">
        Selected artists for compact Seoul appointments.
      </h1>
      <p className="mt-6 max-w-2xl leading-7 text-ink-700">
        V1 starts with a curated roster connected to the Sillim test studio. Artist availability,
        quote, and deposit instructions are confirmed manually before the appointment is held.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </section>
  );
}
