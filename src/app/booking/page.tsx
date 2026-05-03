import { BookingForm } from "./BookingForm";
import { getArtists, getFlashDesigns } from "@/lib/data";
import { instagramDmUrl, instagramProfileUrl } from "@/lib/site";

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
  const selectedStyle = first(query?.style);
  const kakaoChannelUrl = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL;

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:py-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">Book by DM</p>
        <h1 className="mt-3 max-w-[20rem] text-3xl font-semibold leading-tight text-ink-900 sm:max-w-none sm:text-6xl">
          Book a tattoo in Seoul
        </h1>
        <p className="mt-4 max-w-[20rem] leading-7 text-ink-700 sm:max-w-md">
          Send a short request. We will reply with artist, quote, and available time.
        </p>
        <div className="mt-6 grid gap-3 sm:max-w-sm">
          <a
            href={instagramDmUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center bg-ink-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Instagram DM
          </a>
          <a
            href={instagramProfileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-900"
          >
            View Instagram
          </a>
        </div>
        <div className="mt-8 grid gap-3 text-sm text-ink-700">
          <p>1. Send your idea</p>
          <p>2. Get artist and quote</p>
          <p>3. Confirm your booking</p>
        </div>
      </div>

      <div>
        <BookingForm
          artists={artists.map((artist) => ({ id: artist.id, name: artist.name }))}
          source={first(query?.source)}
          utm_source={first(query?.utm_source)}
          utm_medium={first(query?.utm_medium)}
          utm_campaign={first(query?.utm_campaign)}
          preferred_artist_id={selectedArtistId}
          preferred_design_id={selectedDesignId}
          preferred_design_title={selectedDesign?.title}
          initial_style={selectedDesign?.style ?? selectedStyle ?? undefined}
          kakaoChannelUrl={kakaoChannelUrl}
        />
      </div>
    </section>
  );
}
