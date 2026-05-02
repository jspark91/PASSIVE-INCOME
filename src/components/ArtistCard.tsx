import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

  return (
    <article className="min-w-0 w-full max-w-[calc(100vw-2rem)] overflow-hidden border border-ink-100 bg-white md:max-w-none">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-ink-900 text-4xl font-semibold text-white">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={`${artist.name} portfolio preview`}
            className="h-full w-full object-cover"
          />
        ) : (
          artist.name.slice(0, 1)
        )}
      </div>
      <div className="min-w-0 p-5">
        <p className="break-words text-xs font-semibold uppercase tracking-[0.2em] text-moss-700">
          {artist.location}
        </p>
        <h3 className="mt-3 break-words text-2xl font-semibold text-ink-900">{artist.name}</h3>
        <p className="mt-3 break-words text-sm leading-6 text-ink-700">{artist.bio_en}</p>
        <p className="mt-4 text-sm font-medium text-ink-900">
          {formatUsdStartingPrice(artist.starting_price_krw)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {artist.styles.map((style) => (
            <span
              key={style}
              className="max-w-full rounded-full bg-ink-50 px-3 py-1 text-xs text-ink-700"
            >
              {style}
            </span>
          ))}
        </div>
        <Link
          href={`/artists/${artist.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-moss-700"
        >
          View artist
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
