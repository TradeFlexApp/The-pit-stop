import type { ValueProp } from "@/data/types";

export function ValueProps({ items }: { items: ValueProp[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-mist py-14 md:py-20" aria-label="Why The Pit Stop">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <ul className="grid gap-4 md:grid-cols-3">
          {items.map((v) => (
            <li key={v.title} className="rounded-3xl bg-white p-8 shadow-sm">
              <h3 className="display text-4xl">{v.title}</h3>
              <p className="mt-3 leading-relaxed text-graphite">{v.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
