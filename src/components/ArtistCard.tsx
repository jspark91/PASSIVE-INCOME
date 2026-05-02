import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { formatUsdStartingPrice } from "@/lib/format";
import type { Artist } from "@/types/domain";

const coverImages: Record<string, string> = {
  yoonseul: "/images/artists/yoonseul/yoonseul-03-moon-whale.jpg",
  moss: "/images/artists/moss/moss-02-geometric-sleeve.jpg",
  seowoo: "/images/artists/seowoo/seowoo-01-full-sleeve-collage.jpg",
  sero: "/images/artists/sero/sero-01-plum-brushwork.jpg"
};

export function ArtistCard({ artist }: { artist: Artist }) {
  const coverImage = coverImages[artist.slug];
  const styleLine = artist.styles.slice(0, 3).join(" / ");

  return (
    <article className="min-w-0 w-full max-w-[calc(100vw-2rem)] overflow-hidden border border-ink-100 bg-white md:max-w-none">
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-ink-900 text-4xl font-semibold text-white">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={`${artist.name} portfolio preview`}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          artist.name.slice(0, 1)
        )}
      </div>
      <div className="min-w-0 p-5">
        <h3 className="mt-3 break-words text-2xl font-semibold text-ink-900">{artist.name}</h3>
        <p className="mt-2 break-words text-sm text-ink-700">{styleLine}</p>
        <p className="mt-4 text-sm font-semibold text-moss-700">
          {formatUsdStartingPrice(artist.starting_price_krw)}
        </p>
        <div className="mt-5 grid gap-2">
          <Link
            href={`/artists/${artist.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-900"
          >
            View Work
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/booking?artist=${encodeURIComponent(artist.id)}`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Book This Artist
            <CalendarCheck className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
