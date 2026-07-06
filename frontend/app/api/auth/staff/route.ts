import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, passcode } = await req.json();
    const db = await getDb();
    const user = await db.collection("staff_users").findOne({
      email: String(email ?? "").trim().toLowerCase(),
      passcode: String(passcode ?? ""),
    });
    if (!user) return NextResponse.json({ error: "invalid" }, { status: 401 });
    return NextResponse.json({ name: user.name, role: user.role });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
