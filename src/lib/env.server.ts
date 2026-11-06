import "server-only";
import { z } from "zod";
import { hasPublicSupabaseEnv } from "@/lib/env";

/** Server-only secrets. Never import this file from a client component. */
const ServerEnvSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().min(1).optional(),
});

function raw() {
  return {
    // New projects issue `sb_secret_...` keys; the legacy service_role JWT still works until end of 2026.
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || undefined,
  };
}

export function supabaseSecretKey(): string {
  const key = raw().SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not set (see .env.example).");
  return key;
}

export function geminiEnv(): { apiKey: string; model?: string } {
  const parsed = ServerEnvSchema.pick({ GEMINI_API_KEY: true, GEMINI_MODEL: true }).safeParse(raw());
  if (!parsed.success) throw new Error("GEMINI_API_KEY is not set (see .env.example).");
  return { apiKey: parsed.data.GEMINI_API_KEY, model: parsed.data.GEMINI_MODEL };
}

/** Booleans only: safe to expose on a health endpoint. */
export function configurationStatus() {
  const r = raw();
  return {
    supabase: hasPublicSupabaseEnv(),
    supabaseSecret: Boolean(r.SUPABASE_SECRET_KEY),
    gemini: Boolean(r.GEMINI_API_KEY),
  };
}
