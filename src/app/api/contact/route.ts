import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const Body = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(120),
  email: z.email("Please enter a valid email address.").max(254),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5, "Please write a short message.").max(4000),
  // Honeypot: real users never fill this hidden field.
  website: z.string().max(200).optional(),
});

/**
 * POST /api/contact  { name, email, phone?, subject?, message }
 * Stores a contact-form submission. Writes go through the server-side secret key,
 * so the table stays locked down for the public (RLS with no policies).
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
  const { name, email, phone, subject, message, website } = parsed.data;

  // Bot filled the honeypot: pretend it worked, store nothing.
  if (website) return NextResponse.json({ ok: true });

  try {
    const { error } = await createAdminClient().from("contact_messages").insert({
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[api/contact]", err);
    return NextResponse.json({ error: "We couldn't send your message. Please try again or call us." }, { status: 500 });
  }
}
