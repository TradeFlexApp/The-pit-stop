import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";

/** Supabase client for Client Components (browser). Uses the publishable key; RLS applies. */
export function createClient() {
  const { url, publishableKey } = publicEnv();
  return createBrowserClient<Database>(url, publishableKey);
}
