import { NextResponse } from "next/server";
import { supabase, type Member } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_KEY = process.env.ACCESS_API_KEY || "taleh-zkt-2026";

/**
 * Central fingerprint templates for syncing any ZKTeco terminal from the DB.
 * GET /api/access/templates?key=...
 * The bridge pushes these to every terminal, so a finger enrolled once is
 * recognised on all devices and survives a device reset.
 */
export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get("key") !== API_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data } = await supabase
    .from("members").select("member_code, full_name, fp_template").eq("fp_enrolled", true);
  const rows = ((data as Member[]) ?? []).map((m) => ({
    member_code: m.member_code, name: m.full_name, template: m.fp_template ?? null,
  }));
  return NextResponse.json({ count: rows.length, members: rows });
}
