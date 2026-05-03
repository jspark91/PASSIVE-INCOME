"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatUsdStartingPrice } from "@/lib/format";
import type { FlashDesign } from "@/types/domain";

type WorkSliderItem = FlashDesign & {
  artistName: string;
};

export function WorkSlider({ designs }: { designs: WorkSliderItem[] }) {
  const sliderRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: "prev" | "next") {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    slider.scrollBy({
      left: direction === "next" ? slider.clientWidth * 0.9 : -slider.clientWidth * 0.9,
      behavior: "smooth"
    });
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollBy("prev")}
          aria-label="Previous work"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy("next")}
          aria-label="Next work"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-900"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={sliderRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {designs.map((design) => (
          <Link
            key={design.id}
            href={`/booking?design=${encodeURIComponent(design.id)}`}
            className="group min-w-[72vw] snap-start overflow-hidden bg-white text-ink-900 sm:min-w-[38vw] lg:min-w-[24vw]"
          >
            <div className="aspect-[4/5] overflow-hidden bg-ink-700">
              {design.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={design.image_url}
                  alt={design.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-ink-700" />
              )}
            </div>
            <div className="space-y-1 p-3">
              <p className="truncate text-xs font-semibold text-ink-900">{design.artistName}</p>
              <p className="truncate text-xs text-ink-700">{design.style ?? "Custom"}</p>
              <p className="text-xs font-medium text-moss-700">
                {formatUsdStartingPrice(design.price_from_krw)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
