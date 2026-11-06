import Image from "next/image";
import type { LocationView } from "@/data/types";
import { telHref } from "@/lib/format";
import { Pill } from "./Pill";

export function CrewOrders({ location, image }: { location: LocationView; image: { src: string; alt: string } }) {
  const tel = telHref(location.phone);
  return (
    <section className="bg-ink text-white" aria-labelledby="crew-heading">
      <div className="relative aspect-[4/3] w-full md:hidden">
        <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover" />
      </div>
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:px-8 md:py-24">
        <div>
          <h2 id="crew-heading" className="display text-5xl md:text-7xl">
            Feeding the whole crew?
          </h2>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Shop lunches, site crews, office Fridays. Call the day before for anything over ten burgers and it&apos;ll be hot, boxed and labelled when you pull in.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Pill href={tel ?? "/#location"} tone="light" chevron>
              {tel ? `Call ${location.phone}` : "Call ahead"}
            </Pill>
            <Pill href="/#order" tone="ghost">
              Delivery options
            </Pill>
          </div>
        </div>
        <div className="relative hidden aspect-[4/3] overflow-hidden rounded-3xl md:block">
          <Image src={image.src} alt={image.alt} fill sizes="50vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
