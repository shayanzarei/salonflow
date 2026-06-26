"use client";

import { useEffect, useState } from "react";

export interface CarouselImage {
  src: string;
  alt: string;
}

/**
 * The "Visagie" photo carousel. Shows three portraits at a time on desktop,
 * one on mobile, with prev/next controls and dots. Pure client state — index
 * drives a translateX over a flex track whose items are sized to the visible
 * count, so there's no measuring of DOM widths.
 */
export function ProfessionalCarousel({ images }: { images: CarouselImage[] }) {
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const compute = () => setPerView(window.innerWidth < 768 ? 1 : 3);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const maxIndex = Math.max(0, images.length - perView);
  // Clamp when perView changes (e.g. resize past the current window).
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, images.length - perView)));
  }, [perView, images.length]);

  if (images.length === 0) return null;

  const step = 100 / perView;
  const pages = maxIndex + 1;

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * step}%)` }}
        >
          {images.map((img, i) => (
            <div
              key={`${img.src}-${i}`}
              className="shrink-0 px-2 sm:px-3"
              style={{ flexBasis: `${step}%`, maxWidth: `${step}%` }}
            >
              <div className="overflow-hidden bg-[var(--pro-cream-2)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="aspect-[3/4] h-full w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {images.length > perView && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-2xl text-[var(--pro-ink)] transition-opacity disabled:opacity-30 sm:-left-4"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
            disabled={index >= maxIndex}
            className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-2xl text-[var(--pro-ink)] transition-opacity disabled:opacity-30 sm:-right-4"
          >
            ›
          </button>

          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: pages }).map((_, p) => (
              <button
                key={p}
                type="button"
                aria-label={`Go to slide ${p + 1}`}
                onClick={() => setIndex(p)}
                className="h-2 w-2 rounded-full transition-colors"
                style={{ background: p === index ? "var(--pro-gold)" : "var(--pro-line)" }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
