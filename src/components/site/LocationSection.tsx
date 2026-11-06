import type { LocationView } from "@/data/types";
import { dayName, formatTime, telHref } from "@/lib/format";
import { Pill } from "./Pill";
import { TodayHours } from "./TodayHours";

export function LocationSection({ location }: { location: LocationView }) {
  const query = encodeURIComponent(`${location.address_line1}, ${location.city}, ${location.region} ${location.postal_code}`);
  const mapSrc = `https://www.google.com/maps?q=${query}&output=embed`;
  const directions = location.google_maps_url ?? `https://www.google.com/maps/search/?api=1&query=${query}`;
  const tel = telHref(location.phone);

  return (
    <section id="location" className="bg-paper py-16 md:py-24" aria-labelledby="location-heading">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 id="location-heading" className="display text-5xl md:text-7xl">
          Our location
        </h2>

        <div className="mt-8 overflow-hidden rounded-3xl bg-mist md:grid md:grid-cols-2">
          <div className="relative h-64 md:h-full md:min-h-[420px]">
            <iframe
              title={`Map to ${location.name}`}
              src={mapSrc}
              className="absolute inset-0 h-full w-full border-0 grayscale-[0.4]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="p-7 md:p-10">
            <p className="text-sm text-muted">{location.name}</p>
            <h3 className="display mt-1 text-4xl">
              {location.city}, {location.region}
            </h3>

            <dl className="mt-6 space-y-5 text-[15px]">
              <div>
                <dt className="text-sm text-muted">Address</dt>
                <dd className="mt-1">
                  {location.address_line1}
                  {location.address_line2 ? <>, {location.address_line2}</> : null}
                  <br />
                  {location.city}, {location.region} {location.postal_code}
                  {location.landmark && <span className="block text-graphite">{location.landmark}</span>}
                </dd>
              </div>
              {(location.phone || location.email) && (
                <div>
                  <dt className="text-sm text-muted">Contact</dt>
                  <dd className="mt-1 space-y-0.5">
                    {location.phone && (
                      <a href={tel} className="block hover:underline">
                        {location.phone}
                      </a>
                    )}
                    {location.email && (
                      <a href={`mailto:${location.email}`} className="block hover:underline">
                        {location.email}
                      </a>
                    )}
                  </dd>
                </div>
              )}
            </dl>

            <div className="my-6 border-t border-line" />

            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between font-semibold">
                <TodayHours hours={location.hours} timezone={location.timezone} />
                <span className="text-sm font-medium text-muted group-open:hidden">See hours</span>
                <span className="hidden text-sm font-medium text-muted group-open:inline">Hide hours</span>
              </summary>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  {location.hours.map((h) => (
                    <tr key={h.day_of_week} className="border-t border-line/70">
                      <th scope="row" className="py-2 text-left font-medium">
                        {dayName(h.day_of_week)}
                      </th>
                      <td className="py-2 text-right text-graphite">{h.is_closed ? "Closed" : `${formatTime(h.opens_at)} - ${formatTime(h.closes_at)}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Pill href={directions} tone="dark" full className="sm:w-auto">
                Get directions
              </Pill>
              {tel && (
                <Pill href={tel} tone="outline" full className="sm:w-auto">
                  Call to order
                </Pill>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
