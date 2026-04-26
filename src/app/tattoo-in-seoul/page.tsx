import type { Metadata } from "next";
import { AdLandingPage } from "@/components/AdLandingPage";
import { getArtists, getFlashDesigns } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tattoo in Seoul for Foreigners",
  description:
    "English-friendly tattoo booking support at ETHNIC HOUSE in Sillim, Seoul. Small tattoo, fine-line, lettering, and travel-memory tattoo requests.",
  alternates: {
    canonical: "/tattoo-in-seoul"
  }
};

export default async function TattooInSeoulPage() {
  const [artists, designs] = await Promise.all([getArtists(), getFlashDesigns()]);

  return (
    <AdLandingPage
      eyebrow="Tattoo in Seoul"
      title="Book an English-friendly tattoo session in Seoul."
      description="ETHNIC HOUSE helps foreign visitors request small tattoos, lettering, fine-line work, and Korea trip memory pieces with clear booking support before the appointment."
      campaign="tattoo_in_seoul"
      primaryCta="Request a Seoul tattoo"
      secondaryCta="DM now"
      audienceNote="This page is built for travelers already in Seoul or arriving soon. Send your preferred date, size, placement, and reference image so we can check artist availability quickly."
      bookingFocus={[
        "Same-week Seoul requests",
        "Small tattoo and lettering",
        "Fine-line travel pieces",
        "English booking support"
      ]}
      artists={artists}
      designs={designs}
    />
  );
}
