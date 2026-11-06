import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Uses the publishable key, so Row Level Security applies (public read-only data).
 * Cookie handling follows the official @supabase/ssr pattern so auth can be added later.
 */
export async function createClient() {
  const cookieStore = await cookies(); // request-time first, so prerenders bail out before env is read
  const { url, publishableKey } = publicEnv();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only. Safe to ignore
          // when a middleware/proxy refreshes sessions, and irrelevant without auth.
        }
      },
    },
  });
}
