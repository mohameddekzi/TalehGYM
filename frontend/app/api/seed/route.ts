import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEED_KEY = process.env.SEED_KEY || "taleh-seed-2026";
const BRANCHES = ["Iskoyska Taleh GYM", "Bulaxuubay GYM"];
const METHODS = ["EVC Plus", "E-Dahab", "Bank Transfer", "Cash"];
const iso = (d: Date) => d.toISOString();
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export async function POST(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (key !== SEED_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const db = await getDb();
    const now = new Date();
    const year = now.getFullYear();

    // Reset collections
    for (const c of ["members", "payments", "attendance", "membership_types", "groups", "events", "staff_users", "portal_users"]) {
      await db.collection(c).deleteMany({});
    }

    // Members
    const seedMembers = [
      { full_name: "Fadumo Ahmed", email: "fadumo@example.com", phone: "+252 61 1112233", gender: "Female", plan: "Pro", goal: "Weight Loss", status: "active" },
      { full_name: "Omar Diriye", email: "omar@example.com", phone: "+252 61 2223344", gender: "Male", plan: "Elite", goal: "Muscle Gain", status: "active" },
      { full_name: "Hodan Yusuf", email: "hodan@example.com", phone: "+252 63 3334455", gender: "Female", plan: "Starter", goal: "General Fitness", status: "frozen" },
      { full_name: "Ahmed Nur", email: "ahmed@example.com", phone: "+252 90 4445566", gender: "Male", plan: "Pro", goal: "Strength", status: "active" },
      { full_name: "Sahra Ali", email: "sahra@example.com", phone: "+252 61 5556677", gender: "Female", plan: "Pro", goal: "Athletic Performance", status: "expired" },
    ];
    const memberDocs = seedMembers.map((m, i) => ({
      ...m,
      member_code: `TG-${year}-${String(1001 + i).padStart(4, "0")}`,
      branch: BRANCHES[i % 2],
      date_of_birth: null,
      emergency_contact: null,
      created_at: iso(new Date(now.getTime() - (seedMembers.length - i) * 864e5)),
    }));
    const ins = await db.collection("members").insertMany(memberDocs);
    const ids = Object.values(ins.insertedIds);

    // Payments: 3 months membership + PT for Pro/Elite
    const price = (plan: string) => (plan === "Elite" ? 79 : plan === "Pro" ? 39 : 19);
    const payments: Record<string, unknown>[] = [];
    memberDocs.forEach((m, i) => {
      for (let g = 0; g < 3; g++) {
        const d = new Date(now.getFullYear(), now.getMonth() - g, 3);
        payments.push({ member_id: ids[i].toString(), member_name: m.full_name, amount: price(m.plan), method: pick(METHODS), type: "Membership", status: "paid", paid_at: d.toISOString().slice(0, 10), created_at: iso(d) });
      }
      if (m.plan === "Pro" || m.plan === "Elite") {
        const d = new Date(now.getTime() - Math.floor(Math.random() * 45) * 864e5);
        payments.push({ member_id: ids[i].toString(), member_name: m.full_name, amount: 60, method: pick(["EVC Plus", "E-Dahab", "Cash"]), type: "Personal Training", status: "paid", paid_at: d.toISOString().slice(0, 10), created_at: iso(d) });
      }
    });
    await db.collection("payments").insertMany(payments);

    // Attendance: ~6 per member over last 14 days
    const attendance: Record<string, unknown>[] = [];
    memberDocs.forEach((m, i) => {
      for (let k = 0; k < 6; k++) {
        const start = new Date(now.getTime() - Math.floor(Math.random() * 14) * 864e5 - Math.floor(Math.random() * 6) * 36e5);
        const out = new Date(start.getTime() + 60 * 60e3 + Math.floor(Math.random() * 40) * 60e3);
        attendance.push({ member_id: ids[i].toString(), member_name: m.full_name, branch: m.branch, checked_in_at: iso(start), checked_out_at: iso(out), method: pick(["QR", "Manual"]), created_at: iso(start) });
      }
    });
    await db.collection("attendance").insertMany(attendance);

    // Membership types
    await db.collection("membership_types").insertMany([
      { name: "Platinum Membership", price: 79, duration_days: 30, color: "#A855F7", created_at: iso(now) },
      { name: "Gold Membership", price: 39, duration_days: 30, color: "#F5B301", created_at: iso(now) },
      { name: "Silver Membership", price: 19, duration_days: 30, color: "#94A3B8", created_at: iso(now) },
    ]);

    // Groups
    await db.collection("groups").insertMany([
      { name: "Body Building", description: "Strength and hypertrophy focused training", color: "#F58220", created_at: iso(now) },
      { name: "Aerobics", description: "High-energy cardio classes", color: "#16C13A", created_at: iso(now) },
      { name: "General Training", description: "All-round fitness programming", color: "#1E2ED1", created_at: iso(now) },
      { name: "Weight Loss", description: "Fat-loss focused coaching", color: "#EF4444", created_at: iso(now) },
      { name: "Yoga", description: "Mobility, flexibility and recovery", color: "#A855F7", created_at: iso(now) },
    ]);

    // Events (current month)
    const som = new Date(now.getFullYear(), now.getMonth(), 1);
    const ev = (day: number, title: string, t: string, type: string, color: string) => ({
      title, event_date: new Date(som.getFullYear(), som.getMonth(), day).toISOString().slice(0, 10), start_time: t, type, color, created_at: iso(now),
    });
    await db.collection("events").insertMany([
      ev(22, "Ladies Day", "09:00", "event", "#1E2ED1"),
      ev(23, "Public Event", "05:00", "event", "#1E2ED1"),
      ev(24, "Public Event", "06:00", "event", "#1E2ED1"),
      ev(24, "Zumba Class", "12:00", "class", "#16C13A"),
      ev(25, "HWX Classes", "09:00", "class", "#F58220"),
      ev(25, "HWX Classes", "12:00", "class", "#F58220"),
    ]);

    // Staff users
    await db.collection("staff_users").insertMany([
      { name: "Super Admin", email: "admin@taleh.gym", passcode: "admin123", role: "admin", created_at: iso(now) },
      { name: "Finance Officer", email: "finance@taleh.gym", passcode: "finance123", role: "accountant", created_at: iso(now) },
      { name: "Reception Staff", email: "staff@taleh.gym", passcode: "staff123", role: "staff", created_at: iso(now) },
    ]);

    // Portal users
    await db.collection("portal_users").insertMany([
      { name: "Fadumo Ahmed", email: "fadumo@taleh.gym", passcode: "member123", role: "member", created_at: iso(now) },
      { name: "Omar Diriye", email: "omar@taleh.gym", passcode: "member123", role: "member", created_at: iso(now) },
      { name: "Ayaan Warsame", email: "ayaan@taleh.gym", passcode: "coach123", role: "coach", created_at: iso(now) },
      { name: "Lena Hassan", email: "lena@taleh.gym", passcode: "coach123", role: "coach", created_at: iso(now) },
    ]);

    return NextResponse.json({
      ok: true,
      members: memberDocs.length,
      payments: payments.length,
      attendance: attendance.length,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
