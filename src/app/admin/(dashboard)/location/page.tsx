import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { adminLocation } from "@/lib/admin/data";
import { saveHours, saveLocation } from "@/lib/admin/actions";
import { dayName } from "@/lib/format";
import { Button, Card, Checkbox, Field, Input, Notice } from "@/components/admin/ui";
import AdminLoading from "../../loading";

type Search = Promise<{ ok?: string; error?: string }>;

export default function LocationAdminPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <LocationAdmin searchParams={searchParams} />
    </Suspense>
  );
}

async function LocationAdmin({ searchParams }: { searchParams: Search }) {
  await requireAdmin(); // request-time auth check; also keeps this page off the build-time prerender
  const [{ ok, error }, loc] = await Promise.all([searchParams, adminLocation()]);
  const hours = (loc?.business_hours ?? []).slice().sort((a, b) => a.day_of_week - b.day_of_week);
  const hourFor = (d: number) => hours.find((h) => h.day_of_week === d);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-5xl">Location &amp; hours</h1>
        <p className="mt-2 text-graphite">Address, phone, opening hours, delivery apps and social links.</p>
      </div>
      <Notice ok={ok} error={error} />

      <form action={saveLocation}>
        {loc && <input type="hidden" name="id" value={loc.id} />}
        {loc && <input type="hidden" name="slug" value={loc.slug} />}
        <Card title="Address & contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Restaurant name">
              <Input name="name" defaultValue={loc?.name ?? "The Pit Stop"} required />
            </Field>
            <Field label="Phone" hint="Shown on the site and used for the call buttons">
              <Input name="phone" defaultValue={loc?.phone ?? ""} />
            </Field>
            <Field label="Address line 1">
              <Input name="address_line1" defaultValue={loc?.address_line1 ?? ""} required />
            </Field>
            <Field label="Address line 2">
              <Input name="address_line2" defaultValue={loc?.address_line2 ?? ""} />
            </Field>
            <Field label="City">
              <Input name="city" defaultValue={loc?.city ?? "Fort McMurray"} required />
            </Field>
            <Field label="Province">
              <Input name="region" defaultValue={loc?.region ?? "AB"} required />
            </Field>
            <Field label="Postal code">
              <Input name="postal_code" defaultValue={loc?.postal_code ?? ""} />
            </Field>
            <Field label="Country">
              <Input name="country" defaultValue={loc?.country ?? "CA"} />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" defaultValue={loc?.email ?? ""} />
            </Field>
            <Field label="Landmark" hint='e.g. "Across from the Oil Sands Discovery Centre"'>
              <Input name="landmark" defaultValue={loc?.landmark ?? ""} />
            </Field>
          </div>
        </Card>

        <Card title="Ordering & delivery links" className="mt-6">
          <p className="mb-4 text-sm text-graphite">Leave a field empty to show it as “coming soon” on the website. Paste the link the day you go live.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SkipTheDishes link">
              <Input name="skipthedishes_url" type="url" placeholder="https://www.skipthedishes.com/..." defaultValue={loc?.skipthedishes_url ?? ""} />
            </Field>
            <Field label="DoorDash link">
              <Input name="doordash_url" type="url" placeholder="https://www.doordash.com/store/..." defaultValue={loc?.doordash_url ?? ""} />
            </Field>
            <Field label="Online ordering link" hint="Optional: your own ordering page, if you add one later">
              <Input name="online_order_url" type="url" defaultValue={loc?.online_order_url ?? ""} />
            </Field>
            <Field label="Google Maps link" hint="Optional: used by the Get directions button">
              <Input name="google_maps_url" type="url" defaultValue={loc?.google_maps_url ?? ""} />
            </Field>
          </div>
        </Card>

        <Card title="Social links" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Instagram">
              <Input name="instagram_url" type="url" defaultValue={loc?.instagram_url ?? ""} />
            </Field>
            <Field label="Facebook">
              <Input name="facebook_url" type="url" defaultValue={loc?.facebook_url ?? ""} />
            </Field>
            <Field label="TikTok">
              <Input name="tiktok_url" type="url" defaultValue={loc?.tiktok_url ?? ""} />
            </Field>
          </div>
          <Button type="submit" className="mt-6">
            Save location
          </Button>
        </Card>
      </form>

      <Card title="Opening hours">
        {!loc ? (
          <p className="text-sm text-muted">Save the address first, then set the hours.</p>
        ) : (
          <form action={saveHours} className="space-y-3">
            <input type="hidden" name="location_id" value={loc.id} />
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const h = hourFor(d);
              return (
                <div key={d} className="grid items-center gap-3 rounded-xl border border-line p-3 sm:grid-cols-[8rem_1fr_1fr_auto]">
                  <span className="font-semibold">{dayName(d)}</span>
                  <Field label="Opens">
                    <Input name={`opens_${d}`} type="time" defaultValue={h?.opens_at?.slice(0, 5) ?? "07:00"} />
                  </Field>
                  <Field label="Closes">
                    <Input name={`closes_${d}`} type="time" defaultValue={h?.closes_at?.slice(0, 5) ?? "18:00"} />
                  </Field>
                  <Checkbox name={`closed_${d}`} label="Closed" defaultChecked={h?.is_closed ?? false} className="sm:pt-5" />
                </div>
              );
            })}
            <Button type="submit">Save hours</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
