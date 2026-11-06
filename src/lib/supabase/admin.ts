import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";
import { supabaseSecretKey } from "@/lib/env.server";

/**
 * Privileged Supabase client. Bypasses Row Level Security, so it must ONLY be
 * used inside server code (API routes, Server Actions) after validating input.
 * This is how orders, contact messages, newsletter sign-ups and AI logs are written.
 */
export function createAdminClient() {
  const { url } = publicEnv();
  return createSupabaseClient<Database>(url, supabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
