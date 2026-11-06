import { Pill } from "./Pill";

/** Mobile-only floating order button, like the reference's sticky "Order online" bar. */
export function StickyOrderBar() {
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-40 md:hidden">
      <div className="pointer-events-auto">
        <Pill href="/#order" tone="dark" full size="lg" className="shadow-xl shadow-black/20">
          Order ahead
        </Pill>
      </div>
    </div>
  );
}
