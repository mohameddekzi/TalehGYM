"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Star } from "lucide-react";
import { supabase, type Member, type Payment, type Attendance } from "@/lib/supabase";
import { money } from "@/lib/format";
import { branches as branchInfo } from "@/lib/content";

export default function BranchesPage() {
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

  const branchToId = useMemo(() => {
    const map = new Map<string, string>(); // member_id -> branch
    for (const m of members) map.set(m.id, m.branch ?? "Unassigned");
    return map;
  }, [members]);

  const rows = useMemo(() => {
    return branchInfo.map((b) => {
      const mem = members.filter((m) => m.branch === b.name);
      const revenue = payments
        .filter((p) => p.member_id && branchToId.get(p.member_id) === b.name)
        .reduce((s, p) => s + Number(p.amount), 0);
      const visits = attendance.filter((a) => a.branch === b.name).length;
      const active = mem.filter((m) => m.status === "active").length;
      return { ...b, members: mem.length, active, revenue, visits };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [members, payments, attendance, branchToId]);

  const totals = useMemo(() => ({
    members: members.length,
    revenue: payments.reduce((s, p) => s + Number(p.amount), 0),
    visits: attendance.length,
  }), [members, payments, attendance]);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Branches</h1>
      <p className="mt-1 text-sm text-muted">Performance across all {branchInfo.length} Taleh GYM branches.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs text-subtle">Network members</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-foreground">{totals.members}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-subtle">Network revenue</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-foreground">{money(totals.revenue)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-subtle">Total check-ins</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-foreground">{totals.visits}</p>
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted">Loading branches…</p>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {rows.map((b) => (
            <div key={b.name} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl border border-line/5 bg-surface-2">
                    <Building2 size={20} className="text-brand-orange" />
                  </div>
                  <div>
                    <p className="font-display text-base font-bold text-foreground">{b.name.replace("Taleh GYM — ", "")}</p>
                    <p className="text-xs text-subtle">{b.city}</p>
                  </div>
                </div>
                {b.flagship ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-2.5 py-1 text-[11px] font-semibold text-brand-green">
                    <Star size={11} fill="currentColor" /> Flagship
                  </span>
                ) : null}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-line/5 bg-surface-2 p-3">
                  <p className="font-display text-lg font-extrabold text-foreground">{b.members}</p>
                  <p className="text-[11px] text-subtle">Members</p>
                </div>
                <div className="rounded-xl border border-line/5 bg-surface-2 p-3">
                  <p className="font-display text-lg font-extrabold text-brand-green">{money(b.revenue)}</p>
                  <p className="text-[11px] text-subtle">Revenue</p>
                </div>
                <div className="rounded-xl border border-line/5 bg-surface-2 p-3">
                  <p className="font-display text-lg font-extrabold text-brand-blue">{b.visits}</p>
                  <p className="text-[11px] text-subtle">Check-ins</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
