import { NextResponse } from "next/server";
import { getDb, serialize } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db.collection("membership_types").find().sort({ price: -1 }).toArray();
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
      name: String(b.name ?? "").trim(),
      price: Number(b.price) || 0,
      duration_days: Number(b.duration_days) || 30,
      color: b.color ?? "#F58220",
      created_at: new Date().toISOString(),
    };
    const res = await db.collection("membership_types").insertOne(doc);
    return NextResponse.json(serialize({ _id: res.insertedId, ...doc }));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
