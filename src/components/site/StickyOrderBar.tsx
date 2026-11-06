import { Pill } from "./Pill";

/** Mobile-only bottom order bar: translucent white strip with a black pill, like the reference's bottom bar. */
export function StickyOrderBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/85 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto max-w-7xl p-3">
        <Pill href="/#order" tone="dark" full size="lg">
          Order ahead
        </Pill>
      </div>
    </div>
  );
}
