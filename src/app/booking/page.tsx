import { BookingForm } from "./BookingForm";
import { getArtists, getFlashDesigns } from "@/lib/data";

const instagramDmUrl = "https://ig.me/m/ETHNIC_HOUSE_SILLIM";
const instagramProfileUrl = "https://www.instagram.com/ETHNIC_HOUSE_SILLIM/";

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
  const kakaoChannelUrl = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL;

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">
        Booking request
      </p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
        Book a tattoo in Seoul
      </h1>
      <p className="mt-4 max-w-[20rem] break-words leading-7 text-ink-700 sm:max-w-3xl">
        Send your idea and travel dates. We will reply with artist availability and price.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={instagramDmUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-md bg-ink-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Open Instagram DM now
        </a>
        <a
          href={instagramProfileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-md border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-900"
        >
          View ETHNIC HOUSE Instagram
        </a>
      </div>
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
          kakaoChannelUrl={kakaoChannelUrl}
        />
      </div>
    </section>
  );
}
