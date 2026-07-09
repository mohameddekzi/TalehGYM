"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Users, Activity, UserMinus } from "lucide-react";
import { supabase, type Member, type Payment, type Attendance } from "@/lib/supabase";
import { money, monthLabel } from "@/lib/format";

export default function AnalyticsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [m, p, a] = await Promise.all([
        supabase.from("members").select("*"),
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

  const growth = useMemo(() => {
    const buckets: { label: string; key: string; joined: number; cumulative: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: monthLabel(d), key: `${d.getFullYear()}-${d.getMonth()}`, joined: 0, cumulative: 0 });
    }
    for (const m of members) { const b = buckets.find((x) => x.key === monthKey(new Date(m.created_at))); if (b) b.joined++; }
    let run = members.length - buckets.reduce((s, b) => s + b.joined, 0);
    for (const b of buckets) { run += b.joined; b.cumulative = run; }
    return buckets;
  }, [members]);

  const revenue = useMemo(() => {
    const buckets: { label: string; key: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); buckets.push({ label: monthLabel(d), key: `${d.getFullYear()}-${d.getMonth()}`, value: 0 }); }
    for (const p of payments) { const b = buckets.find((x) => x.key === monthKey(new Date(p.paid_at))); if (b) b.value += Number(p.amount); }
    return buckets;
  }, [payments]);

  const peakHours = useMemo(() => {
    const hours = new Array(24).fill(0);
    for (const a of attendance) hours[new Date(a.checked_in_at).getHours()]++;
    // show 5:00–22:00
    return Array.from({ length: 18 }, (_, i) => ({ h: i + 5, n: hours[i + 5] }));
  }, [attendance]);

  const churn = members.length ? Math.round((members.filter((m) => m.status === "expired").length / members.length) * 100) : 0;
  const active = members.filter((m) => m.status === "active").length;
  const maxGrow = Math.max(1, ...growth.map((b) => b.cumulative));
  const maxRev = Math.max(1, ...revenue.map((b) => b.value));
  const maxPeak = Math.max(1, ...peakHours.map((b) => b.n));

  const kpis = [
    { label: "Total members", value: members.length, icon: Users, a: "text-brand-orange" },
    { label: "Active rate", value: members.length ? Math.round((active / members.length) * 100) + "%" : "0%", icon: Activity, a: "text-brand-green" },
    { label: "Churn rate", value: churn + "%", icon: UserMinus, a: "text-red-400" },
    { label: "Total revenue", value: money(payments.reduce((s, p) => s + Number(p.amount), 0)), icon: TrendingUp, a: "text-brand-blue" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Analytics</h1>
      <p className="mt-1 text-sm text-muted">Growth, revenue, churn and peak-hour insights.</p>

      {loading ? <p className="mt-10 text-sm text-muted">Loading analytics…</p> : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="card p-5"><k.icon size={20} className={k.a} /><p className="mt-3 font-display text-2xl font-extrabold text-foreground">{k.value}</p><p className="text-xs text-subtle">{k.label}</p></div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="card p-6">
              <h3 className="font-display text-base font-bold text-foreground">Member growth</h3>
              <div className="mt-6 flex h-40 items-end justify-between gap-3">
                {growth.map((b) => (
                  <div key={b.key} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-[10px] text-subtle">{b.cumulative}</span>
                    <div className="w-full rounded-t-md bg-brand-gradient" style={{ height: `${(b.cumulative / maxGrow) * 120 + 4}px` }} />
                    <span className="text-[11px] text-subtle">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-display text-base font-bold text-foreground">Revenue trend</h3>
              <div className="mt-6 flex h-40 items-end justify-between gap-3">
                {revenue.map((b) => (
                  <div key={b.key} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-[10px] text-subtle">{money(b.value)}</span>
                    <div className="w-full rounded-t-md bg-brand-green/70" style={{ height: `${(b.value / maxRev) * 120 + 4}px` }} />
                    <span className="text-[11px] text-subtle">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card mt-5 p-6">
            <h3 className="font-display text-base font-bold text-foreground">Peak hours (check-ins)</h3>
            <div className="mt-6 flex h-36 items-end justify-between gap-1">
              {peakHours.map((b) => (
                <div key={b.h} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="w-full rounded-t bg-brand-blue/70" style={{ height: `${(b.n / maxPeak) * 110 + 2}px` }} />
                  <span className="text-[9px] text-subtle">{b.h}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
