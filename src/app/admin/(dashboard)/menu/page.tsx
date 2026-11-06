import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { adminCategories, adminItems } from "@/lib/admin/data";
import { deleteCategory, saveCategory } from "@/lib/admin/actions";
import { formatPrice } from "@/lib/format";
import { Button, Card, Checkbox, Field, Input, LinkButton, Notice } from "@/components/admin/ui";
import AdminLoading from "../../loading";

type Search = Promise<{ ok?: string; error?: string }>;

export default function MenuAdminPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <MenuAdmin searchParams={searchParams} />
    </Suspense>
  );
}

async function MenuAdmin({ searchParams }: { searchParams: Search }) {
  await requireAdmin(); // request-time auth check; also keeps this page off the build-time prerender
  const [{ ok, error }, categories, items] = await Promise.all([searchParams, adminCategories(), adminItems()]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-5xl">Menu</h1>
          <p className="mt-2 text-graphite">Edit items, prices, sizes and photos. Changes publish instantly.</p>
        </div>
        <LinkButton href="/admin/menu/new" tone="dark">
          + Add item
        </LinkButton>
      </div>
      <Notice ok={ok} error={error} />

      {categories.map((c) => {
        const rows = items.filter((i) => i.category_id === c.id);
        return (
          <Card key={c.id} title={c.name} action={<span className="text-sm text-muted">{c.is_active ? "Visible" : "Hidden"}</span>}>
            {rows.length === 0 ? (
              <p className="text-sm text-muted">No items yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {rows.map((i) => {
                  const tiers = (i.menu_item_tiers ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
                  return (
                    <li key={i.id} className="flex items-center gap-4 py-3">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-mist">
                        {i.image_url && <Image src={i.image_url} alt="" fill sizes="56px" className="object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/admin/menu/${i.id}`} className="font-semibold hover:underline">
                            {i.name}
                          </Link>
                          {i.badge && <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold uppercase">{i.badge}</span>}
                          {!i.is_available && <span className="rounded-full bg-steel px-2 py-0.5 text-[11px] font-bold uppercase text-graphite">Sold out</span>}
                          {i.is_featured && <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-bold uppercase text-graphite">Featured</span>}
                        </div>
                        <p className="text-sm text-graphite">
                          {tiers.length ? tiers.map((t) => `${t.code} ${formatPrice(t.price_cents)}`).join(" · ") : formatPrice(i.price_cents)}
                        </p>
                      </div>
                      <LinkButton href={`/admin/menu/${i.id}`}>Edit</LinkButton>
                    </li>
                  );
                })}
              </ul>
            )}

            <details className="mt-4 rounded-xl border border-line p-4">
              <summary className="cursor-pointer text-sm font-semibold">Category settings</summary>
              <form action={saveCategory} className="mt-4 grid gap-4 sm:grid-cols-2">
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="slug" value={c.slug} />
                <Field label="Name">
                  <Input name="name" defaultValue={c.name} required />
                </Field>
                <Field label="Order" hint="Lower numbers show first">
                  <Input name="sort_order" type="number" defaultValue={c.sort_order} />
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <Input name="description" defaultValue={c.description ?? ""} />
                </Field>
                <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                  <Checkbox name="is_active" label="Show on the website" defaultChecked={c.is_active} />
                  <Button type="submit">Save category</Button>
                </div>
              </form>
              {rows.length === 0 && (
                <form action={deleteCategory} className="mt-3">
                  <input type="hidden" name="id" value={c.id} />
                  <Button type="submit" tone="danger">
                    Delete empty category
                  </Button>
                </form>
              )}
            </details>
          </Card>
        );
      })}

      <Card title="Add a category">
        <form action={saveCategory} className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <Input name="name" placeholder="e.g. Specials" required />
          </Field>
          <Field label="Order">
            <Input name="sort_order" type="number" defaultValue={categories.length + 1} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Input name="description" placeholder="Short line shown under the category name" />
          </Field>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <Checkbox name="is_active" label="Show on the website" defaultChecked />
            <Button type="submit">Add category</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
