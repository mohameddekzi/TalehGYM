import { NextResponse } from "next/server";
import { getDb, serialize } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db.collection("attendance").find().sort({ checked_in_at: -1 }).limit(300).toArray();
    return NextResponse.json(docs.map(serialize));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
