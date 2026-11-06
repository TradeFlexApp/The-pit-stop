// Convert between <input type="datetime-local"> values (no timezone) and UTC instants,
// always in the restaurant's timezone, regardless of where the server runs.

export const SITE_TZ = "America/Edmonton";

function partsAt(tz: string, ms: number) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(ms))
      .map((x) => [x.type, x.value])
  );
  const h = Number(p.hour);
  return { y: Number(p.year), mo: Number(p.month), d: Number(p.day), h: h === 24 ? 0 : h, mi: Number(p.minute), s: Number(p.second) };
}

function offsetAt(tz: string, ms: number): number {
  const q = partsAt(tz, ms);
  return Date.UTC(q.y, q.mo - 1, q.d, q.h, q.mi, q.s) - ms;
}

/** "YYYY-MM-DDTHH:mm[:ss]" typed in zone `tz` -> ISO instant. Empty -> null. Throws on malformed input. */
export function localInputToIso(value: string, tz = SITE_TZ): string | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!m) throw new Error("Enter dates as a date and time (for example 2026-11-20 11:00).");
  const guess = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6] ?? 0));
  // Two passes so values on either side of a DST change settle correctly.
  let ms = guess - offsetAt(tz, guess);
  ms = guess - offsetAt(tz, ms);
  return new Date(ms).toISOString();
}

/** ISO instant -> "YYYY-MM-DDTHH:mm" in zone `tz`, for a datetime-local input. */
export function isoToLocalInput(iso: string | null, tz = SITE_TZ): string {
  if (!iso) return "";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "";
  const q = partsAt(tz, ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${q.y}-${pad(q.mo)}-${pad(q.d)}T${pad(q.h)}:${pad(q.mi)}`;
}
