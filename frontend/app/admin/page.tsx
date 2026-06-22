"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Dumbbell, Users, Boxes, Mail, TrendingUp, ArrowRight,
} from "lucide-react";
import {
  supabase, type Member, type Payment, type MembershipType, type Group, type GymEvent,
} from "@/lib/supabase";
import { money, monthLabel } from "@/lib/format";
import { trainers } from "@/lib/content";
import { Calendar } from "@/components/admin/calendar";

export default function AdminDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [types, setTypes] = useState<MembershipType[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [events, setEvents] = useState<GymEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [m, p, t, g, e] = await Promise.all([
        supabase.from("members").select("*"),
        supabase.from("payments").select("*"),
        supabase.from("membership_types").select("*").order("price", { ascending: false }),
        supabase.from("groups").select("*"),
        supabase.from("events").select("*"),
      ]);
      setMembers((m.data as Member[]) ?? []);
      setPayments((p.data as Payment[]) ?? []);
      setTypes((t.data as MembershipType[]) ?? []);
      setGroups((g.data as Group[]) ?? []);
      setEvents((e.data as GymEvent[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const now = new Date();
  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

  const revenueSeries = useMemo(() => {
    const buckets: { label: string; key: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: monthLabel(d), key: `${d.getFullYear()}-${d.getMonth()}`, value: 0 });
    }
    for (const p of payments) {
      const b = buckets.find((x) => x.key === monthKey(new Date(p.paid_at)));
      if (b) b.value += Number(p.amount);
    }
    return buckets;
  }, [payments]);
  const maxRev = Math.max(1, ...revenueSeries.map((b) => b.value));
  const totalRevenue = payments.reduce((s, p) => s + Number(p.amount), 0);

  const cards = [
    { label: "Members", value: members.length, icon: Users, bg: "bg-brand-green", text: "text-ink-950" },
    { label: "Staff / Coaches", value: trainers.length, icon: Dumbbell, bg: "bg-brand-blue", text: "text-white" },
    { label: "Groups", value: groups.length, icon: Boxes, bg: "bg-brand-orange", text: "text-white" },
    { label: "Messages", value: 0, icon: Mail, bg: "bg-amber-400", text: "text-ink-950" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Welcome back to the Taleh GYM control center.</p>

      {/* Colored stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`relative overflow-hidden rounded-2xl ${c.bg} p-5 ${c.text} shadow-card`}>
            <c.icon size={40} className="opacity-30" />
            <div className="mt-3 flex items-end gap-2">
              <span className="font-display text-4xl font-extrabold leading-none">
                {loading ? "—" : c.value}
              </span>
              <span className="mb-1 text-sm font-medium opacity-90">{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar + side panels */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Calendar events={events} />
        </div>

        <div className="space-y-5">
          {/* Membership types */}
          <div className="card overflow-hidden">
            <div className="bg-brand-green px-5 py-4">
              <h3 className="font-display text-base font-bold text-ink-950">Membership</h3>
            </div>
            <ul className="divide-y divide-line/5 p-2">
              {types.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted">{money(t.price)}</span>
                </li>
              ))}
              {!loading && types.length === 0 ? <li className="px-3 py-4 text-sm text-muted">No membership types.</li> : null}
            </ul>
          </div>

          {/* Group list */}
          <div className="card overflow-hidden">
            <div className="bg-brand-orange px-5 py-4">
              <h3 className="font-display text-base font-bold text-white">Group List</h3>
            </div>
            <ul className="divide-y divide-line/5 p-2">
              {groups.map((g) => (
                <li key={g.id} className="flex items-center gap-3 px-3 py-3">
                  <span className="h-9 w-9 rounded-full" style={{ backgroundColor: g.color }} />
                  <span className="text-sm font-medium text-foreground">{g.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Revenue analytics */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground">Revenue · last 6 months</h3>
            <span className="inline-flex items-center gap-1 text-xs text-brand-green">
              <TrendingUp size={13} /> {money(totalRevenue)} total
            </span>
          </div>
          <div className="mt-6 flex h-40 items-end justify-between gap-3">
            {revenueSeries.map((b) => (
              <div key={b.key} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] text-subtle">{money(b.value)}</span>
                <div className="w-full rounded-t-md bg-brand-gradient" style={{ height: `${(b.value / maxRev) * 120 + 4}px` }} />
                <span className="text-[11px] text-subtle">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

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
                  <p className="text-xs text-subtle">{m.plan}</p>
                </div>
                <span className="text-[11px] text-subtle">{m.member_code}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
