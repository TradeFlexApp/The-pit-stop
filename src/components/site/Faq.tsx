import { ChevronDown } from "lucide-react";
import type { FaqView } from "@/data/types";

export function Faq({ faqs }: { faqs: FaqView[] }) {
  if (!faqs.length) return null;
  return (
    <section id="faq" className="bg-paper py-16 md:py-24" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 id="faq-heading" className="display text-5xl md:text-7xl">
          Frequently asked questions
        </h2>
        <div className="mt-8 max-w-3xl divide-y divide-line border-b border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-6 py-4">
                <span className="display text-2xl md:text-3xl">{f.q}</span>
                <ChevronDown className="size-6 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="max-w-2xl pb-5 leading-relaxed text-graphite">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
