import Link from "next/link";
import { Suspense } from "react";
import { signIn } from "@/lib/admin/actions";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { Button, Field, Input, Notice } from "@/components/admin/ui";
import { Wordmark } from "@/components/site/Wordmark";

type Search = Promise<{ error?: string }>;

export const metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function LoginPage({ searchParams }: { searchParams: Search }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" aria-label="Back to the website">
            <Wordmark className="text-5xl" />
          </Link>
          <p className="mt-2 text-sm text-muted">Staff sign in</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginForm({ searchParams }: { searchParams: Search }) {
  const { error } = await searchParams;
  const configured = hasPublicSupabaseEnv();
  const friendly = error === "not-allowed" ? "That account isn't on the admin list. Ask the owner to add it." : error;
  return (
    <form action={signIn} className="space-y-4 rounded-2xl border border-line bg-white p-6">
      {!configured && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          The database isn&apos;t connected yet. Add the Supabase keys from <code>.env.example</code> to enable the admin.
        </p>
      )}
      <Notice error={friendly} />
      <Field label="Email">
        <Input type="email" name="email" autoComplete="username" required disabled={!configured} />
      </Field>
      <Field label="Password">
        <Input type="password" name="password" autoComplete="current-password" required disabled={!configured} />
      </Field>
      <Button type="submit" className="w-full" disabled={!configured}>
        Sign in
      </Button>
      <p className="text-center text-xs text-muted">
        <Link href="/" className="inline-block py-2 hover:underline">
          Back to the website
        </Link>
      </p>
    </form>
  );
}
