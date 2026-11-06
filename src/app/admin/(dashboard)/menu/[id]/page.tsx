import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { notFound } from "next/navigation";
import { adminCategories, adminItem } from "@/lib/admin/data";
import { deleteItem, saveItem } from "@/lib/admin/actions";
import { Button, Card, Checkbox, Field, Input, LinkButton, Notice, Select, Textarea, dollars } from "@/components/admin/ui";
import AdminLoading from "../../../loading";

type Params = Promise<{ id: string }>;
type Search = Promise<{ ok?: string; error?: string }>;

export default function ItemPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <ItemEditor params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ItemEditor({ params, searchParams }: { params: Params; searchParams: Search }) {
  await requireAdmin(); // request-time auth check; also keeps this page off the build-time prerender
  const [{ id }, { ok, error }, categories] = await Promise.all([params, searchParams, adminCategories()]);
  const isNew = id === "new";
  const item = isNew ? null : await adminItem(id);
  if (!isNew && !item) notFound();

  const tiers = Object.fromEntries((item?.menu_item_tiers ?? []).map((t) => [t.code, t.price_cents]));
  const hasSizes = isNew ? false : Object.keys(tiers).length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            <Link href="/admin/menu" className="hover:underline">
              Menu
            </Link>{" "}
            / {isNew ? "New item" : item?.name}
          </p>
          <h1 className="display mt-1 text-5xl">{isNew ? "Add item" : "Edit item"}</h1>
        </div>
        <LinkButton href="/admin/menu">Back to menu</LinkButton>
      </div>
      <Notice ok={ok} error={error} />

      <form action={saveItem} className="space-y-6" encType="multipart/form-data">
        {!isNew && <input type="hidden" name="id" value={item!.id} />}
        {!isNew && <input type="hidden" name="slug" value={item!.slug} />}

        <Card title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" className="sm:col-span-2">
              <Input name="name" defaultValue={item?.name ?? ""} required maxLength={120} />
            </Field>
            <Field label="Category">
              <Select name="category_id" defaultValue={item?.category_id ?? categories[0]?.id ?? ""} required>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Badge" hint="Optional, e.g. Fan favourite, New, Spicy">
              <Input name="badge" defaultValue={item?.badge ?? ""} maxLength={40} />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea name="description" defaultValue={item?.description ?? ""} maxLength={1000} />
            </Field>
          </div>
        </Card>

        <Card title="Pricing">
          <div className="space-y-4">
            <Checkbox name="has_sizes" label="Burger with engine sizes (1500 / 2500 / 3500)" defaultChecked={hasSizes} />
            <div className="grid gap-4 sm:grid-cols-3">
              {(["1500", "2500", "3500"] as const).map((code, i) => (
                <Field key={code} label={`${code} · ${["Single", "Double", "Triple"][i]} ($)`}>
                  <Input name={`tier_${code}`} type="number" step="0.01" min="0" defaultValue={dollars(tiers[code])} placeholder="0.00" />
                </Field>
              ))}
            </div>
            <Field label="Single price ($)" hint="Used when the item has no sizes" className="sm:max-w-xs">
              <Input name="price" type="number" step="0.01" min="0" defaultValue={hasSizes ? "" : dollars(item?.price_cents)} placeholder="0.00" />
            </Field>
          </div>
        </Card>

        <Card title="Photo">
          <div className="flex flex-wrap items-start gap-6">
            <div className="relative size-32 overflow-hidden rounded-xl bg-mist">
              {item?.image_url && <Image src={item.image_url} alt="" fill sizes="128px" className="object-cover" />}
            </div>
            <div className="space-y-3">
              <Field label="Upload a new photo" hint="JPG, PNG or WEBP, under 8 MB. Square photos look best.">
                <Input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="h-auto py-2" />
              </Field>
              {item?.image_url && <Checkbox name="remove_image" label="Remove the current photo" />}
            </div>
          </div>
        </Card>

        <Card title="Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tags" hint="Comma-separated: bestseller, spicy, vegetarian, vegan, signature">
              <Input name="tags" defaultValue={item?.tags.join(", ") ?? ""} />
            </Field>
            <Field label="Allergens" hint="Comma-separated: gluten, dairy, egg, soy, nuts">
              <Input name="allergens" defaultValue={item?.allergens.join(", ") ?? ""} />
            </Field>
            <Field label="Calories" hint="Optional">
              <Input name="calories" type="number" min="0" defaultValue={item?.calories ?? ""} />
            </Field>
            <Field label="Order within category" hint="Lower numbers show first">
              <Input name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} />
            </Field>
            <div className="flex flex-wrap gap-6 sm:col-span-2">
              <Checkbox name="is_available" label="Available (untick to show as sold out)" defaultChecked={item?.is_available ?? true} />
              <Checkbox name="is_featured" label="Featured on the home page" defaultChecked={item?.is_featured ?? false} />
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" tone="dark">
            {isNew ? "Add item" : "Save changes"}
          </Button>
        </div>
      </form>

      {!isNew && (
        <form action={deleteItem} className="border-t border-line pt-6">
          <input type="hidden" name="id" value={item!.id} />
          <Button type="submit" tone="danger">
            Delete this item
          </Button>
        </form>
      )}
    </div>
  );
}
