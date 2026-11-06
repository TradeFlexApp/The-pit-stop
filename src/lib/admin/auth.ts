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

/** True when the email is in ADMIN_EMAILS or in public.admin_users. */
export async function isAllowedAdmin(email: string): Promise<boolean> {
  const e = email.toLowerCase();
  if (envAllowlist().includes(e)) return true;
  try {
    const { data } = await createAdminClient().from("admin_users").select("user_id").eq("email", e).maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
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
  return (await isAllowedAdmin(user.email)) ? user : null;
}

/** Use at the top of admin server components / actions. Redirects when not allowed. */
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login?error=not-allowed");
  return user;
}
