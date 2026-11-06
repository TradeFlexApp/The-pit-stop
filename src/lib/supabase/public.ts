import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";

/**
 * Cookie-less, read-only Supabase client for public content (menu, hours, promotions).
 * It touches no request-time APIs, so it is safe inside "use cache" functions.
 */
export function createPublicClient() {
  const { url, publishableKey } = publicEnv();
  return createSupabaseClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
