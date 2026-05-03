import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArtistCard } from "@/components/ArtistCard";
import { DesignCard } from "@/components/DesignCard";
import { getArtists, getFlashDesigns } from "@/lib/data";
import { isIrezumiArtist, isIrezumiDesign } from "@/lib/irezumi";

export const metadata: Metadata = {
  title: "Irezumi Tattoo in Seoul | ETHNIC HOUSE",
  description:
    "Japanese traditional tattoo booking in Seoul with HADA and WOORA. Irezumi backpieces, sleeves, dragons, kabuto, flowers, and color work."
};

export default async function IrezumiPage() {
  const [artists, designs] = await Promise.all([getArtists(), getFlashDesigns()]);
  const irezumiArtists = artists.filter(isIrezumiArtist);
  const irezumiArtistIds = new Set(irezumiArtists.map((artist) => artist.id));
  const irezumiDesigns = designs.filter(
    (design) => irezumiArtistIds.has(design.artist_id) || isIrezumiDesign(design)
  );
  const heroImage =
    irezumiDesigns[0]?.image_url ?? "/images/artists/hada/hada-01-samurai-backpiece.jpg";

  return (
    <>
      <section className="relative isolate min-h-[68svh] overflow-hidden bg-ink-900 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt="Irezumi tattoo portfolio"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex min-h-[68svh] max-w-7xl items-end px-4 pb-10 pt-24 sm:px-6 lg:pb-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-100">
              Irezumi / Japanese Traditional
            </p>
            <h1 className="mt-4 break-words text-5xl font-semibold leading-none sm:text-7xl lg:text-8xl">
              Traditional Japanese tattoo in Seoul
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-7 text-ink-50">
              Backpieces, sleeves, dragons, samurai, kabuto, flowers, and color work by HADA and
              WOORA.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/booking?style=irezumi"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-ink-50 px-6 py-3 text-sm font-semibold text-ink-900"
              >
                Book Irezumi Consultation
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#irezumi-work"
                className="inline-flex items-center justify-center rounded-md border border-white/45 px-6 py-3 text-sm font-semibold text-white"
              >
                View Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-700">
                Irezumi Artists
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-ink-900 sm:text-5xl">
                HADA and WOORA
              </h2>
            </div>
            <Link
              href="/booking?style=irezumi"
              className="hidden items-center gap-2 text-sm font-semibold text-moss-700 sm:inline-flex"
            >
              Book
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {irezumiArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </div>
      </section>

      <section id="irezumi-work" className="bg-ink-900">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-100">
                Irezumi Work
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
                Large-scale Japanese traditional pieces
              </h2>
            </div>
            <Link
              href="/booking?style=irezumi"
              className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-ink-900 sm:shrink-0"
            >
              Book consultation
            </Link>
          </div>

          <div className="mt-8 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {irezumiDesigns.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
