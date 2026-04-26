import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatKrw } from "@/lib/format";
import type { Artist } from "@/types/domain";

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <article className="border border-ink-100 bg-white">
      <div className="flex aspect-[4/3] items-center justify-center bg-ink-900 text-4xl font-semibold text-white">
        {artist.name.slice(0, 1)}
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss-700">
          {artist.location}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-ink-900">{artist.name}</h3>
        <p className="mt-3 text-sm leading-6 text-ink-700">{artist.bio_en}</p>
        <p className="mt-4 text-sm font-medium text-ink-900">
          From {formatKrw(artist.starting_price_krw)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {artist.styles.map((style) => (
            <span key={style} className="rounded-full bg-ink-50 px-3 py-1 text-xs text-ink-700">
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
