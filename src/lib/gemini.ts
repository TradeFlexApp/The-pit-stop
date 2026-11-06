import "server-only";
import { GoogleGenAI } from "@google/genai";
import { geminiEnv } from "@/lib/env.server";

/**
 * Free-tier friendly default. Google's current guidance for new projects is
 * "3.5 Flash-Lite or 3.8 Flash"; both are free of charge on the Gemini API
 * (checked 2026-11-05 at aistudio.google.com/docs/pricing). Flash-Lite is the
 * fastest and has the most generous free limits, which suits short menu Q&A.
 * Override with GEMINI_MODEL (e.g. gemini-3.8-flash) without a code change.
 */
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";

let cachedClient: GoogleGenAI | null = null;

function client(): GoogleGenAI {
  if (!cachedClient) cachedClient = new GoogleGenAI({ apiKey: geminiEnv().apiKey });
  return cachedClient;
}

export function geminiModel(): string {
  return geminiEnv().model ?? DEFAULT_GEMINI_MODEL;
}

const SYSTEM_PROMPT = `You are the friendly online host for The Pit Stop, a smash burger restaurant.
Answer guests' questions about the menu, prices, ingredients, allergens, hours and location using ONLY the facts in the CONTEXT block.

Rules:
- Be brief and warm: one to three short sentences, plain language, no markdown headings or bullet lists.
- Quote prices exactly as given. If something is not in the context, say you are not sure and suggest calling the restaurant.
- For allergy questions, share what the menu lists, then remind the guest to tell staff about allergies when ordering, because the kitchen shares equipment.
- Never invent menu items, deals, hours or policies.
- Stay on topic. If asked about anything unrelated to the restaurant, politely steer back to the menu.`;

export class GeminiRateLimitError extends Error {
  constructor(message = "Gemini free-tier rate limit reached.") {
    super(message);
    this.name = "GeminiRateLimitError";
  }
}

export async function askMenuAssistant(opts: { question: string; context: string }): Promise<{ answer: string; model: string }> {
  const model = geminiModel();
  try {
    const response = await client().models.generateContent({
      model,
      contents: `CONTEXT:\n${opts.context}\n\nGUEST QUESTION: ${opts.question}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
        // Generous ceiling: on thinking-capable models reasoning tokens share this budget.
        maxOutputTokens: 1024,
      },
    });
    const answer = response.text?.trim();
    if (!answer) throw new Error("Gemini returned an empty response.");
    return { answer, model };
  } catch (err) {
    if (isRateLimit(err)) throw new GeminiRateLimitError();
    throw err;
  }
}

function isRateLimit(err: unknown): boolean {
  const e = err as { status?: number; code?: number; message?: string } | null;
  return e?.status === 429 || e?.code === 429 || /\b429\b|RESOURCE_EXHAUSTED|quota/i.test(e?.message ?? "");
}
