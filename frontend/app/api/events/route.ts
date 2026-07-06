import { NextResponse } from "next/server";
import { getDb, serialize } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db.collection("events").find().sort({ event_date: 1 }).toArray();
    return NextResponse.json(docs.map(serialize));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const db = await getDb();
    const doc = {
      title: String(b.title ?? "").trim(),
      event_date: b.event_date,
      start_time: b.start_time ?? null,
      type: b.type ?? "class",
      color: b.color ?? "#1E2ED1",
      created_at: new Date().toISOString(),
    };
    const res = await db.collection("events").insertOne(doc);
    return NextResponse.json(serialize({ _id: res.insertedId, ...doc }));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
