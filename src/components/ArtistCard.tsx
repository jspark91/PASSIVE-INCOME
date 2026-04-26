import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatKrw } from "@/lib/format";
import type { Artist } from "@/types/domain";

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <article className="rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">{artist.name}</h3>
          <p className="mt-1 text-sm text-ink-700">{artist.location}</p>
        </div>
        <span className="rounded-full bg-moss-500 px-3 py-1 text-xs font-medium text-white">
          From {formatKrw(artist.starting_price_krw)}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-ink-700">{artist.bio_en}</p>
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
    </article>
  );
}

