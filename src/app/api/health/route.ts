import { NextResponse, connection } from "next/server";
import { configurationStatus } from "@/lib/env.server";

/** Deploy check: reports which integrations have their env vars set (booleans only). */
export async function GET() {
  // Cache Components is on: opt this handler into request-time rendering so it reflects live env.
  await connection();
  return NextResponse.json({ ok: true, ...configurationStatus() });
}
