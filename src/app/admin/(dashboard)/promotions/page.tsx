import Image from "next/image";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { adminPromotions } from "@/lib/admin/data";
import { deletePromotion, savePromotion } from "@/lib/admin/actions";
import { Button, Card, Checkbox, Field, Input, Notice, Textarea } from "@/components/admin/ui";
import { PhotoInput } from "@/components/admin/PhotoInput";
import { isoToLocalInput } from "@/lib/zoned-time";
import type { Promotion } from "@/types/database";
import AdminLoading from "../../loading";

type Search = Promise<{ ok?: string; error?: string }>;

export default function PromotionsAdminPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <PromotionsAdmin searchParams={searchParams} />
    </Suspense>
  );
}


function PromotionForm({ promo }: { promo?: Promotion }) {
  return (
    <form action={savePromotion} className="grid gap-4 sm:grid-cols-2" encType="multipart/form-data">
      {promo && <input type="hidden" name="id" value={promo.id} />}
      <Field label="Title" className="sm:col-span-2">
        <Input name="title" defaultValue={promo?.title ?? ""} required maxLength={120} />
      </Field>
      <Field label="Text" className="sm:col-span-2">
        <Textarea name="body" defaultValue={promo?.body ?? ""} maxLength={600} />
      </Field>
      <Field label="Button label" hint="Optional">
        <Input name="cta_label" defaultValue={promo?.cta_label ?? ""} maxLength={40} />
      </Field>
      <Field label="Button link" hint="e.g. /#menu or a full https:// link">
        <Input name="cta_url" defaultValue={promo?.cta_url ?? ""} />
      </Field>
      <Field label="Starts" hint="Optional, Fort McMurray time">
        <Input name="starts_at" type="datetime-local" defaultValue={isoToLocalInput(promo?.starts_at ?? null)} />
      </Field>
      <Field label="Ends" hint="Optional, Fort McMurray time">
        <Input name="ends_at" type="datetime-local" defaultValue={isoToLocalInput(promo?.ends_at ?? null)} />
      </Field>
      <div className="text-sm sm:col-span-2">
        <span className="font-semibold">Image (optional)</span>
        <div className="mt-1 flex items-start gap-4">
          {promo?.image_url && (
            <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-mist">
              <Image src={promo.image_url} alt="" fill sizes="64px" className="object-cover" />
            </span>
          )}
          <div className="flex-1">
            <PhotoInput hint="JPG, PNG or WEBP. Resized automatically." />
            {promo?.image_url && <Checkbox name="remove_image" label="Remove the current image" className="mt-2" />}
          </div>
        </div>
      </div>
      <Field label="Order">
        <Input name="sort_order" type="number" defaultValue={promo?.sort_order ?? 0} />
      </Field>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <Checkbox name="is_active" label="Active" defaultChecked={promo?.is_active ?? true} />
        <Button type="submit">{promo ? "Save" : "Add promotion"}</Button>
      </div>
    </form>
  );
}

async function PromotionsAdmin({ searchParams }: { searchParams: Search }) {
  await requireAdmin(); // request-time auth check; also keeps this page off the build-time prerender
  const [{ ok, error }, promos] = await Promise.all([searchParams, adminPromotions()]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-5xl">Promotions</h1>
        <p className="mt-2 text-graphite">Specials and announcements. Active promotions inside their dates show on the website.</p>
      </div>
      <Notice ok={ok} error={error} />
      <Card title="New promotion">
        <PromotionForm />
      </Card>
      {promos.map((p) => (
        <Card key={p.id} title={p.title} action={<span className="text-sm text-muted">{p.is_active ? "Active" : "Off"}</span>}>
          <PromotionForm promo={p} />
          <form action={deletePromotion} className="mt-4 border-t border-line pt-4">
            <input type="hidden" name="id" value={p.id} />
            <Button type="submit" tone="danger">
              Delete
            </Button>
          </form>
        </Card>
      ))}
    </div>
  );
}
