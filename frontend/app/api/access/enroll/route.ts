import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_KEY = process.env.ACCESS_API_KEY || "taleh-zkt-2026";

/**
 * Store a member's fingerprint template centrally (enrol once).
 * POST /api/access/enroll  body: { code, template }  auth: key / x-api-key
 * The bridge uploads the template captured on the enrolment terminal so the
 * database keeps it once — the member is never re-enrolled.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const key = req.headers.get("x-api-key") || url.searchParams.get("key");
  if (key !== API_KEY) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim();
  const template = body.template ? String(body.template) : null;
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 400 });

  const { error } = await supabase
    .from("members")
    .update({ fp_enrolled: true, fp_template: template })
    .eq("member_code", code);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, code });
}
