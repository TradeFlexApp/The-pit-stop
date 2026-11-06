import Image from "next/image";
import { clsx } from "clsx";
import { Pill } from "./Pill";

export function FeatureSection({
  id,
  eyebrow,
  title,
  text,
  cta,
  image,
  tone = "light",
  flip = false,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  text: string;
  cta: { label: string; href: string };
  image: { src: string; alt: string };
  tone?: "light" | "dark";
  flip?: boolean;
}) {
  const dark = tone === "dark";
  return (
    <section id={id} className={clsx(dark ? "bg-ink text-white" : "bg-paper text-ink")}>
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-0 md:grid-cols-2 md:gap-14 md:px-8 md:py-20">
        <div className={clsx("relative aspect-[4/3] w-full overflow-hidden md:rounded-3xl", flip && "md:order-2")}>
          <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="px-5 pb-14 md:px-0 md:pb-0">
          {eyebrow && <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>}
          <h2 className="display text-5xl md:text-7xl">{title}</h2>
          <p className={clsx("mt-5 max-w-xl text-lg leading-relaxed", dark ? "text-white/85" : "text-graphite")}>{text}</p>
          <div className="mt-8">
            <Pill href={cta.href} tone={dark ? "light" : "dark"} chevron full className="md:w-auto">
              {cta.label}
            </Pill>
          </div>
        </div>
      </div>
    </section>
  );
}
