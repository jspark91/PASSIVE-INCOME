import Link from "next/link";
import { Clock } from "lucide-react";
import { formatUsdGuideFromKrw } from "@/lib/format";
import type { FlashDesign } from "@/types/domain";

export function DesignCard({ design }: { design: FlashDesign }) {
  return (
    <article className="overflow-hidden rounded-md border border-ink-100 bg-white">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-ink-900 text-center text-sm text-ink-100">
        {design.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={design.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(235,224,214,0.16),transparent_32%),linear-gradient(145deg,#3a2b22,#17110e)]" />
            <span className="relative px-6 text-xs uppercase tracking-[0.2em]">
              Portfolio image pending
            </span>
          </>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-ink-900">{design.title}</h3>
        <p className="mt-1 text-sm text-ink-700">
          {design.style ?? "custom"} / {design.size_hint ?? "size TBD"}
        </p>
        <p className="mt-3 text-sm font-medium text-ink-900">
          From {formatUsdGuideFromKrw(design.price_from_krw)}
        </p>
        {design.duration_minutes ? (
          <p className="mt-2 flex items-center gap-2 text-xs text-ink-700">
            <Clock className="h-3.5 w-3.5" />
            About {design.duration_minutes} min
          </p>
        ) : null}
        <Link
          href={`/booking?design=${encodeURIComponent(design.id)}`}
          className="mt-4 inline-flex rounded-md bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Request this style
        </Link>
      </div>
    </article>
  );
}
