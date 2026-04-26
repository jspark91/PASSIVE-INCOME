import { BookingForm } from "./BookingForm";
import { getArtists } from "@/lib/data";

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const artists = await getArtists();

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">
        Booking request
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-ink-900">Book a tattoo in Seoul</h1>
      <p className="mt-4 max-w-3xl leading-7 text-ink-700">
        Tell us your travel dates, preferred style, size, placement, budget, and contact
        method. V1 uses manual matching so we can learn what foreign travelers actually request.
      </p>
      <div className="mt-8">
        <BookingForm
          artists={artists.map((artist) => ({ id: artist.id, name: artist.name }))}
          source={first(searchParams?.source)}
          utm_source={first(searchParams?.utm_source)}
          utm_medium={first(searchParams?.utm_medium)}
          utm_campaign={first(searchParams?.utm_campaign)}
          preferred_artist_id={first(searchParams?.artist)}
        />
      </div>
    </section>
  );
}

