import { NextResponse, after } from "next/server";
import { z } from "zod";
import { formatMenuForPrompt, getSiteContent } from "@/lib/data/menu";
import { askMenuAssistant, GeminiRateLimitError } from "@/lib/gemini";
import { createAdminClient } from "@/lib/supabase/admin";

const Body = z.object({
  question: z.string().trim().min(2, "Ask a slightly longer question.").max(500, "Keep questions under 500 characters."),
  sessionId: z.string().trim().max(64).optional(),
});

/**
 * POST /api/ask  { question: string, sessionId?: string }
 * Answers a guest's question about the menu, hours or location with Gemini,
 * grounded in the live site content. Returns { answer, model }.
 */
export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }
  const { question, sessionId } = parsed.data;
  const started = Date.now();

  try {
    const content = await getSiteContent();
    const context = formatMenuForPrompt(content);
    const { answer, model } = await askMenuAssistant({ question, context });

    // Log after the response is sent so the guest never waits on it.
    after(() => logChat({ session_id: sessionId ?? null, question, answer, model, latency_ms: Date.now() - started }));

    return NextResponse.json({ answer, model });
  } catch (err) {
    if (err instanceof GeminiRateLimitError) {
      return NextResponse.json(
        { error: "Our menu assistant is busy right now. Please try again in a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    console.error("[api/ask]", err);
    return NextResponse.json({ error: "Something went wrong answering that. Please try again." }, { status: 500 });
  }
}

async function logChat(entry: { session_id: string | null; question: string; answer: string; model: string; latency_ms: number }) {
  try {
    const { error } = await createAdminClient().from("ai_chat_logs").insert(entry);
    if (error) console.warn("[api/ask] could not log chat:", error.message);
  } catch (err) {
    console.warn("[api/ask] could not log chat:", err instanceof Error ? err.message : err);
  }
}
