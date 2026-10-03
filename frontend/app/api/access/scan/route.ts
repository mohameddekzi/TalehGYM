import { NextResponse } from "next/server";
import { supabase, type Member, type Payment } from "@/lib/supabase";
import { decideAccess } from "@/lib/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_KEY = process.env.ACCESS_API_KEY || "taleh-zkt-2026";

/**
 * Real-time door punch — POST /api/access/scan
 * Body: { "code": "TG-2026-1001" }  Header: x-api-key or ?key=
 * The ZKTeco terminal (via a small bridge) posts a scan; we decide access
 * and, if allowed, record a fingerprint check-in. Returns the decision so
 * the door can open or stay locked.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const key = req.headers.get("x-api-key") || url.searchParams.get("key");
  if (key !== API_KEY) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim();
  const device = String(body.device ?? "").trim();
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 400 });

  const { data: member } = await supabase
    .from("members").select("*").eq("member_code", code).maybeSingle();
  const m = member as Member | null;
  const { data: pays } = await supabase
    .from("payments").select("*").eq("member_id", m?.id ?? "");

  const decision = decideAccess(m, (pays as Payment[]) ?? []);

  if (decision.allowed && m) {
    await supabase.from("attendance").insert({
      member_id: m.id,
      member_name: m.full_name,
      branch: m.branch,
      checked_in_at: new Date().toISOString(),
      checked_out_at: null,
      method: device ? `Fingerprint · ${device}` : "Fingerprint",
    });
  }

  return NextResponse.json({
    open: decision.allowed,
    code,
    device: device || null,
    name: m?.full_name ?? null,
    ...decision,
  });
}
