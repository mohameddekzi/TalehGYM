"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users, UserCheck, Wallet, CalendarCheck, TrendingUp, ArrowRight,
} from "lucide-react";
import { supabase, type Member, type Payment, type Attendance } from "@/lib/supabase";
import { money, monthLabel, dateShort } from "@/lib/format";

export default function AdminOverview() {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [m, p, a] = await Promise.all([
        supabase.from("members").select("*").order("created_at", { ascending: false }),
        supabase.from("payments").select("*"),
        supabase.from("attendance").select("*"),
      ]);
      setMembers((m.data as Member[]) ?? []);
      setPayments((p.data as Payment[]) ?? []);
      setAttendance((a.data as Attendance[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const now = new Date();
  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

  const stats = useMemo(() => {
    const thisMonth = monthKey(now);
    const revenueThisMonth = payments
      .filter((p) => monthKey(new Date(p.paid_at)) === thisMonth)
      .reduce((s, p) => s + Number(p.amount), 0);
    const weekAgo = new Date(now.getTime() - 7 * 864e5);
    const visitsThisWeek = attendance.filter((a) => new Date(a.checked_in_at) >= weekAgo).length;
    return {
      total: members.length,
      active: members.filter((m) => m.status === "active").length,
      revenueThisMonth,
      visitsThisWeek,
      totalRevenue: payments.reduce((s, p) => s + Number(p.amount), 0),
    };
  }, [members, payments, attendance]);

  // Revenue for the last 6 months
  const revenueSeries = useMemo(() => {
    const buckets: { label: string; key: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: monthLabel(d), key: `${d.getFullYear()}-${d.getMonth()}`, value: 0 });
    }
    for (const p of payments) {
      const k = monthKey(new Date(p.paid_at));
      const b = buckets.find((x) => x.key === k);
      if (b) b.value += Number(p.amount);
    }
    return buckets;
  }, [payments]);

  const byPlan = useMemo(() => {
    const order = ["Starter", "Pro", "Elite"];
    return order.map((plan) => ({
      plan,
      count: members.filter((m) => m.plan === plan).length,
    }));
  }, [members]);

  const byBranch = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of members) {
      const b = (m.branch ?? "Unassigned").replace("Taleh GYM — ", "");
      map.set(b, (map.get(b) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [members]);

  const maxRev = Math.max(1, ...revenueSeries.map((b) => b.value));
  const maxPlan = Math.max(1, ...byPlan.map((b) => b.count));
  const maxBranch = Math.max(1, ...byBranch.map(([, c]) => c));

  const kpis = [
    { label: "Total members", value: stats.total, icon: Users, a: "text-brand-orange" },
    { label: "Active members", value: stats.active, icon: UserCheck, a: "text-brand-green" },
    { label: "Revenue · this month", value: money(stats.revenueThisMonth), icon: Wallet, a: "text-brand-blue" },
    { label: "Check-ins · 7 days", value: stats.visitsThisWeek, icon: CalendarCheck, a: "text-brand-orange" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Overview</h1>
      <p className="mt-1 text-sm text-muted">Live analytics across all Taleh GYM branches.</p>

      {loading ? (
        <p className="mt-10 text-sm text-muted">Loading analytics…</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="card p-5">
                <k.icon size={20} className={k.a} />
                <p className="mt-3 font-display text-2xl font-extrabold text-foreground">{k.value}</p>
                <p className="text-xs text-subtle">{k.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {/* Revenue chart */}
            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-foreground">Revenue · last 6 months</h3>
                <span className="inline-flex items-center gap-1 text-xs text-brand-green">
                  <TrendingUp size={13} /> {money(stats.totalRevenue)} total
                </span>
              </div>
              <div className="mt-6 flex h-44 items-end justify-between gap-3">
                {revenueSeries.map((b) => (
                  <div key={b.key} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-[10px] text-subtle">{money(b.value)}</span>
                    <div className="w-full rounded-t-md bg-brand-gradient" style={{ height: `${(b.value / maxRev) * 130 + 4}px` }} />
                    <span className="text-[11px] text-subtle">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Members by plan */}
            <div className="card p-6">
              <h3 className="font-display text-base font-bold text-foreground">Members by plan</h3>
              <div className="mt-5 space-y-4">
                {byPlan.map((p, i) => (
                  <div key={p.plan}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">{p.plan}</span>
                      <span className="font-semibold text-foreground">{p.count}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line/10">
                      <div
                        className={`h-full rounded-full ${["bg-brand-blue", "bg-brand-orange", "bg-brand-green"][i]}`}
                        style={{ width: `${(p.count / maxPlan) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {/* Members by branch */}
            <div className="card p-6 lg:col-span-2">
              <h3 className="font-display text-base font-bold text-foreground">Members by branch</h3>
              <div className="mt-5 space-y-3.5">
                {byBranch.map(([branch, count]) => (
                  <div key={branch} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 truncate text-sm text-muted">{branch}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line/10">
                      <div className="h-full rounded-full bg-brand-orange" style={{ width: `${(count / maxBranch) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right text-sm font-semibold text-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent registrations */}
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-foreground">Recent sign-ups</h3>
                <Link href="/admin/members" className="inline-flex items-center gap-1 text-xs text-brand-orange hover:underline">
                  All <ArrowRight size={12} />
                </Link>
              </div>
              <ul className="mt-4 space-y-3">
                {members.slice(0, 6).map((m) => (
                  <li key={m.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.full_name}</p>
                      <p className="text-xs text-subtle">{m.plan} · {dateShort(m.created_at)}</p>
                    </div>
                    <span className="text-[11px] text-subtle">{m.member_code}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
