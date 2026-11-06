import Image from "next/image";
import type { LocationView } from "@/data/types";
import { HeroVideo } from "./HeroVideo";

export function Hero({ location }: { location: LocationView }) {
  return (
    <section className="relative flex min-h-[88svh] items-end overflow-hidden bg-ink text-white">
      {/* Ambient griddle video (generated with Higgsfield); poster + still fallback for reduced motion */}
      <HeroVideo src="/media/hero.mp4" poster="/media/hero-poster.jpg" />
      <Image src="/media/hero-poster.jpg" alt="" fill sizes="100vw" className="hidden object-cover motion-reduce:block" />
      <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/10 to-ink/40" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 pt-40 md:px-8 md:pb-20">
        <p className="mb-3 text-sm font-semibold text-white/90 md:text-lg">
          Smash burgers &amp; breakfast in {location.city}, Alberta
        </p>
        <h1 className="display text-[clamp(3rem,9vw,7.5rem)]">Smashed on MacKenzie Blvd</h1>
      </div>
    </section>
  );
}
