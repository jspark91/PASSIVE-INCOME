import type { Metadata } from "next";
import { AdLandingPage } from "@/components/AdLandingPage";
import { getArtists, getFlashDesigns } from "@/lib/data";

export const metadata: Metadata = {
  title: "Korea Trip Tattoo Booking",
  description:
    "Plan a small tattoo for your Korea trip with ETHNIC HOUSE SILLIM. English booking support for Seoul tattoo appointments.",
  alternates: {
    canonical: "/korea-trip-tattoo"
  }
};

export default async function KoreaTripTattooPage() {
  const [artists, designs] = await Promise.all([getArtists(), getFlashDesigns()]);

  return (
    <AdLandingPage
      eyebrow="Korea trip tattoo"
      title="Take home a small tattoo from your Korea trip."
      description="Plan your Seoul tattoo before you arrive. ETHNIC HOUSE collects your travel dates, preferred style, budget, and references, then helps match your request to an available artist."
      campaign="korea_trip_tattoo"
      primaryCta="Plan my tattoo"
      secondaryCta="Ask on Instagram"
      audienceNote="This page is built for travelers planning ahead. Share your Korea travel dates and preferred appointment window so the studio can check realistic timing before you land."
      bookingFocus={[
        "Pre-trip appointment planning",
        "Korea memory tattoo ideas",
        "Friend and couple requests",
        "Aftercare while traveling"
      ]}
      artists={artists}
      designs={designs}
    />
  );
}
