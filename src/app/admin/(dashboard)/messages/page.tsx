import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { adminMessages } from "@/lib/admin/data";
import { setMessageStatus } from "@/lib/admin/actions";
import { Button, Card, Notice } from "@/components/admin/ui";
import AdminLoading from "../../loading";

type Search = Promise<{ ok?: string; error?: string }>;

export default function MessagesAdminPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <MessagesAdmin searchParams={searchParams} />
    </Suspense>
  );
}

async function MessagesAdmin({ searchParams }: { searchParams: Search }) {
  await requireAdmin(); // request-time auth check; also keeps this page off the build-time prerender
  const [{ ok, error }, messages] = await Promise.all([searchParams, adminMessages()]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-5xl">Messages</h1>
        <p className="mt-2 text-graphite">Submissions from the website contact form.</p>
      </div>
      <Notice ok={ok} error={error} />
      {messages.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No messages yet.</p>
        </Card>
      ) : (
        messages.map((m) => (
          <Card key={m.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold">
                  {m.name} <span className="font-normal text-muted">· {new Date(m.created_at).toLocaleString("en-CA", { timeZone: "America/Edmonton" })}</span>
                </p>
                <p className="text-sm text-graphite">
                  <a href={`mailto:${m.email}`} className="hover:underline">
                    {m.email}
                  </a>
                  {m.phone && <> · {m.phone}</>}
                </p>
                {m.subject && <p className="mt-2 font-semibold">{m.subject}</p>}
                <p className="mt-1 whitespace-pre-wrap text-[15px]">{m.message}</p>
              </div>
              <form action={setMessageStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={m.id} />
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold uppercase">{m.status}</span>
                {m.status !== "read" && (
                  <Button type="submit" name="status" value="read" tone="light">
                    Mark read
                  </Button>
                )}
                {m.status !== "archived" && (
                  <Button type="submit" name="status" value="archived" tone="light">
                    Archive
                  </Button>
                )}
              </form>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
