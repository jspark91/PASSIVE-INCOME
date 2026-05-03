"use client";

import { useEffect, useMemo, useState } from "react";

export type HeroImageItem = {
  src: string;
  alt: string;
};

export function HeroImageRotator({ images }: { images: HeroImageItem[] }) {
  const safeImages = useMemo(
    () => images.filter((image) => image.src.trim().length > 0),
    [images]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (safeImages.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % safeImages.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [safeImages.length]);

  if (!safeImages.length) {
    return <div className="absolute inset-0 bg-ink-900" />;
  }

  return (
    <>
      {safeImages.map((image, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}
