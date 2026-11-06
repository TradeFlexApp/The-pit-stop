import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { hasPublicSupabaseEnv } from "@/lib/env";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function envAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * True when the signed-in account is an admin: a public.admin_users row bound to the
 * account id (preferred), or an email listed in ADMIN_EMAILS. Public sign-up must stay
 * disabled in Supabase so an allowlisted address cannot be claimed by a stranger.
 */
export async function isAllowedAdmin(user: User): Promise<boolean> {
  const email = user.email?.toLowerCase();
  if (!email) return false;
  try {
    const { data } = await createAdminClient().from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    if (data) return true;
  } catch {
    /* table missing or unreachable: fall through to the env allowlist */
  }
  return envAllowlist().includes(email);
}

/** The signed-in user if they are an allowed admin, otherwise null. */
export async function getAdminUser(): Promise<User | null> {
  await connection(); // request-time: never evaluated during the build-time prerender
  if (!hasPublicSupabaseEnv()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return (await isAllowedAdmin(user)) ? user : null;
}

/** Use at the top of admin server components / actions. Redirects when not allowed. */
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login?error=not-allowed");
  return user;
}
