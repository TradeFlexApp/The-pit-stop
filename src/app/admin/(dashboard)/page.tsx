import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { adminCounts } from "@/lib/admin/data";
import { Card, LinkButton } from "@/components/admin/ui";
import AdminLoading from "../loading";

export default function AdminHome() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  await requireAdmin(); // request-time auth check; also keeps this page off the build-time prerender
  const counts = await adminCounts();
  const tiles = [
    { label: "Menu items", value: counts.items, href: "/admin/menu" },
    { label: "Categories", value: counts.categories, href: "/admin/menu" },
    { label: "Live promotions", value: counts.promotions, href: "/admin/promotions" },
    { label: "New messages", value: counts.newMessages, href: "/admin/messages" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-5xl">Overview</h1>
        <p className="mt-2 text-graphite">Anything you save here goes live on the website right away.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label}>
            <p className="text-sm text-muted">{t.label}</p>
            <p className="display mt-1 text-5xl">{t.value}</p>
            <LinkButton href={t.href} className="mt-4">
              Manage
            </LinkButton>
          </Card>
        ))}
      </div>
      <Card title="Quick actions">
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/admin/menu/new" tone="dark">
            Add a menu item
          </LinkButton>
          <LinkButton href="/admin/location">Update hours</LinkButton>
          <LinkButton href="/admin/location">Delivery links (Skip / DoorDash)</LinkButton>
          <LinkButton href="/admin/promotions">Post a special</LinkButton>
        </div>
      </Card>
    </div>
  );
}
