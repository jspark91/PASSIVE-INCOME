import type { Metadata } from "next";
import { Instagram } from "lucide-react";
import { BookingForm } from "./BookingForm";
import { getArtists, getFlashDesigns } from "@/lib/data";
import { instagramDmUrl, instagramProfileUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tattoo inquiry | ETHNIC HOUSE Seoul",
  description: "Plan your tattoo before your Korea trip. Share your idea, travel dates and artist preferences with ETHNIC HOUSE for tattoo booking support in Seoul."
};

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingPage({ searchParams }: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const [artists, designs] = await Promise.all([getArtists(), getFlashDesigns()]);
  const selectedDesignId = first(query?.design);
  const selectedDesign = designs.find((design) => design.id === selectedDesignId);
  const selectedArtistId = first(query?.artist) ?? selectedDesign?.artist_id;
  const selectedStyle = first(query?.style);

  return (
    <section className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-9 sm:px-6 sm:py-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
      <aside className="min-w-0 lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss-700">Tattoo booking support · Seoul</p>
        <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-[1.12] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.25rem]">Plan your tattoo before your Korea trip.</h1>
        <p className="mt-5 max-w-md text-base leading-7 text-ink-700">Tell us your idea and travel plans. Choose an artist you love, or let us help you find a match for your style.</p>
        <p className="mt-3 max-w-md text-sm leading-6 text-ink-700">Already in Korea or living here? You are welcome to inquire, too.</p>
        <div className="mt-7 hidden border-y border-ink-100 py-6 lg:block">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-700">From idea to appointment</h2>
          <ol className="mt-5 grid gap-5">
            {[
              ["01", "Share your idea", "Your style, references and available dates."],
              ["02", "Explore your options", "We check artist fit, availability and a quote."],
              ["03", "Confirm the details", "Review the artist, price, time and studio before booking."]
            ].map(([number, title, description]) => <li key={number} className="flex gap-3"><span className="mt-0.5 text-xs font-medium text-moss-700">{number}</span><div><h3 className="text-sm font-semibold text-ink-900">{title}</h3><p className="mt-1 text-sm leading-6 text-ink-700">{description}</p></div></li>)}
          </ol>
        </div>
        <div className="mt-6 hidden lg:block">
          <p className="text-sm font-medium text-ink-900">Prefer to talk on Instagram?</p>
          <p className="mt-1 text-sm leading-6 text-ink-700">You can contact us there instead. If you submit this form, there is no need to send it again by DM.</p>
          <a href={instagramDmUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-moss-700 underline underline-offset-4"><Instagram className="h-4 w-4" aria-hidden="true" />Message ETHNIC HOUSE</a>
          <a href={instagramProfileUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-ink-700 underline underline-offset-4">View our Instagram</a>
        </div>
      </aside>
      <div className="min-w-0">
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
          kakaoChannelUrl={process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL}
        />
        <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm leading-6 text-ink-700 lg:hidden">Prefer Instagram?<a href={instagramDmUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-moss-700 underline underline-offset-4"><Instagram className="h-4 w-4" aria-hidden="true" />Message ETHNIC HOUSE</a></p>
      </div>
    </section>
  );
}