export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden bg-ink py-4 text-white" aria-hidden="true">
      <div className="flex w-max animate-marquee whitespace-nowrap motion-reduce:animate-none">
        {row.map((text, i) => (
          <span key={i} className="display flex items-center text-3xl md:text-5xl">
            <span className="px-6 md:px-10">{text}</span>
            <span className="text-brand">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
