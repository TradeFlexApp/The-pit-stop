"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/** Ambient, muted, looping hero video with a pause control (WCAG 2.2.2). Hidden under reduced motion. */
export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  function toggle() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  }

  return (
    <>
      <video ref={ref} className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden" autoPlay muted loop playsInline preload="metadata" poster={poster} aria-hidden="true">
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={paused}
        aria-label={paused ? "Play background video" : "Pause background video"}
        className="absolute right-5 top-24 z-10 inline-flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60 motion-reduce:hidden md:right-8"
      >
        {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
      </button>
    </>
  );
}
