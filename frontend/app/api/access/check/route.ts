import { NextResponse } from "next/server";
import { supabase, type Member, type Payment } from "@/lib/supabase";
import { decideAccess } from "@/lib/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_KEY = process.env.ACCESS_API_KEY || "taleh-zkt-2026";

/**
 * ZKTeco door check — GET /api/access/check?code=TG-2026-1001&key=...
 * Returns whether the member may enter based on their monthly subscription.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("key") !== API_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const code = url.searchParams.get("code")?.trim();
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 400 });

  const { data: member } = await supabase
    .from("members").select("*").eq("member_code", code).maybeSingle();
  const { data: pays } = await supabase
    .from("payments").select("*").eq("member_id", (member as Member | null)?.id ?? "");

  const decision = decideAccess(member as Member | null, (pays as Payment[]) ?? []);
  return NextResponse.json({
    code,
    name: (member as Member | null)?.full_name ?? null,
    ...decision,
  });
}
