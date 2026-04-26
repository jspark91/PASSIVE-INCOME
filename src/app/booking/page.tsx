import { BookingForm } from "./BookingForm";
import { getArtists, getFlashDesigns } from "@/lib/data";

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const [artists, designs] = await Promise.all([getArtists(), getFlashDesigns()]);
  const selectedDesignId = first(query?.design);
  const selectedDesign = designs.find((design) => design.id === selectedDesignId);
  const selectedArtistId = first(query?.artist) ?? selectedDesign?.artist_id;

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
          source={first(query?.source)}
          utm_source={first(query?.utm_source)}
          utm_medium={first(query?.utm_medium)}
          utm_campaign={first(query?.utm_campaign)}
          preferred_artist_id={selectedArtistId}
          preferred_design_id={selectedDesignId}
          preferred_design_title={selectedDesign?.title}
          initial_style={selectedDesign?.style ?? undefined}
        />
      </div>
    </section>
  );
}
