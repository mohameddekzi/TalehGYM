import { NextResponse } from "next/server";
import { supabase, type Member, type Payment } from "@/lib/supabase";
import { decideAccess } from "@/lib/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_KEY = process.env.ACCESS_API_KEY || "taleh-zkt-2026";

/**
 * Bulk access list for syncing the ZKTeco device — GET /api/access/list?key=...
 * The bridge enables the "allowed" member codes and disables the rest.
 */
export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get("key") !== API_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [{ data: members }, { data: payments }] = await Promise.all([
    supabase.from("members").select("*"),
    supabase.from("payments").select("*"),
  ]);
  const ms = (members as Member[]) ?? [];
  const ps = (payments as Payment[]) ?? [];

  const rows = ms.map((m) => {
    const d = decideAccess(m, ps.filter((p) => p.member_id === m.id));
    return { member_code: m.member_code, name: m.full_name, allowed: d.allowed, reason: d.reason, paid_until: d.paid_until, days_left: d.days_left };
  });

  return NextResponse.json({
    count: rows.length,
    allowed: rows.filter((r) => r.allowed).map((r) => r.member_code),
    members: rows,
  });
}
