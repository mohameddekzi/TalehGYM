import { NextResponse } from "next/server";
import { getDb, serialize } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db.collection("members").find().sort({ created_at: -1 }).toArray();
    return NextResponse.json(docs.map(serialize));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.full_name?.trim()) {
      return NextResponse.json({ error: "full_name is required" }, { status: 400 });
    }
    const db = await getDb();
    const count = await db.collection("members").countDocuments();
    const year = new Date().getFullYear();
    const member_code = `TG-${year}-${String(1001 + count).padStart(4, "0")}`;
    const doc = {
      member_code,
      full_name: body.full_name.trim(),
      email: body.email ?? null,
      phone: body.phone ?? null,
      gender: body.gender ?? null,
      date_of_birth: body.date_of_birth ?? null,
      emergency_contact: body.emergency_contact ?? null,
      plan: body.plan ?? "Starter",
      branch: body.branch ?? null,
      goal: body.goal ?? null,
      status: "active",
      created_at: new Date().toISOString(),
    };
    const res = await db.collection("members").insertOne(doc);
    return NextResponse.json({ id: res.insertedId.toString(), member_code });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
