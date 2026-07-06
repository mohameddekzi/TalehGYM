import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, passcode, role } = await req.json();
    const db = await getDb();
    const user = await db.collection("portal_users").findOne({
      email: String(email ?? "").trim().toLowerCase(),
      passcode: String(passcode ?? ""),
      role: String(role ?? ""),
    });
    if (!user) return NextResponse.json({ error: "invalid" }, { status: 401 });
    return NextResponse.json({ name: user.name, role: user.role, email: user.email });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
