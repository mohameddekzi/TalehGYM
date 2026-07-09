"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, TrendingUp, TrendingDown, Wallet, Users } from "lucide-react";
import { supabase, type Payment, type Member, type Sale, type Expense } from "@/lib/supabase";
import { money, monthLabel } from "@/lib/format";

export default function ReportsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, m, s, e] = await Promise.all([
        supabase.from("payments").select("*"),
        supabase.from("members").select("*"),
        supabase.from("sales").select("*"),
        supabase.from("expenses").select("*"),
      ]);
      setPayments((p.data as Payment[]) ?? []);
      setMembers((m.data as Member[]) ?? []);
      setSales((s.data as Sale[]) ?? []);
      setExpenses((e.data as Expense[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
  const now = new Date();

  const monthly = useMemo(() => {
    const buckets: { label: string; key: string; membership: number; pos: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: monthLabel(d) + " " + d.getFullYear(), key: `${d.getFullYear()}-${d.getMonth()}`, membership: 0, pos: 0, expense: 0 });
    }
    for (const p of payments) { const b = buckets.find((x) => x.key === monthKey(new Date(p.paid_at))); if (b) b.membership += Number(p.amount); }
    for (const s of sales) { const b = buckets.find((x) => x.key === monthKey(new Date(s.created_at))); if (b) b.pos += Number(s.total); }
    for (const e of expenses) { const b = buckets.find((x) => x.key === monthKey(new Date(e.spent_at))); if (b) b.expense += Number(e.amount); }
    return buckets;
  }, [payments, sales, expenses]);

  const totals = useMemo(() => {
    const revenue = payments.reduce((s, p) => s + Number(p.amount), 0) + sales.reduce((s, x) => s + Number(x.total), 0);
    const expense = expenses.reduce((s, e) => s + Number(e.amount), 0);
    return { revenue, expense, net: revenue - expense, members: members.length };
  }, [payments, sales, expenses, members]);

  function exportCsv() {
    const headers = ["month", "membership_revenue", "pos_revenue", "expenses", "net"];
    const rows = monthly.map((b) => [b.label, b.membership, b.pos, b.expense, b.membership + b.pos - b.expense].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "taleh-financial-report.csv"; a.click(); URL.revokeObjectURL(url);
  }

  const kpis = [
    { label: "Total revenue", value: money(totals.revenue), icon: Wallet, a: "text-brand-green" },
    { label: "Total expenses", value: money(totals.expense), icon: TrendingDown, a: "text-red-400" },
    { label: "Net profit", value: money(totals.net), icon: TrendingUp, a: "text-brand-orange" },
    { label: "Members", value: totals.members, icon: Users, a: "text-brand-blue" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">Reports</h1>
          <p className="mt-1 text-sm text-muted">Financial, membership and operations reporting.</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-brand-green-dark">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {loading ? <p className="mt-10 text-sm text-muted">Loading reports…</p> : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="card p-5"><k.icon size={20} className={k.a} /><p className="mt-3 font-display text-2xl font-extrabold text-foreground">{k.value}</p><p className="text-xs text-subtle">{k.label}</p></div>
            ))}
          </div>

          <div className="card mt-5 overflow-hidden">
            <div className="border-b border-line/10 px-6 py-4"><h3 className="font-display text-base font-bold text-foreground">Monthly financial report · last 6 months</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-subtle">
                    <th className="px-5 py-3 font-medium">Month</th>
                    <th className="px-5 py-3 text-right font-medium">Membership</th>
                    <th className="px-5 py-3 text-right font-medium">POS sales</th>
                    <th className="px-5 py-3 text-right font-medium">Expenses</th>
                    <th className="px-5 py-3 text-right font-medium">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((b) => {
                    const net = b.membership + b.pos - b.expense;
                    return (
                      <tr key={b.key} className="border-b border-line/5 last:border-0">
                        <td className="px-5 py-3 font-medium text-foreground">{b.label}</td>
                        <td className="px-5 py-3 text-right text-muted">{money(b.membership)}</td>
                        <td className="px-5 py-3 text-right text-muted">{money(b.pos)}</td>
                        <td className="px-5 py-3 text-right text-red-400">-{money(b.expense)}</td>
                        <td className={`px-5 py-3 text-right font-semibold ${net >= 0 ? "text-brand-green" : "text-red-400"}`}>{money(net)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {[
              { label: "Active", n: members.filter((m) => m.status === "active").length, c: "text-brand-green" },
              { label: "Frozen", n: members.filter((m) => m.status === "frozen").length, c: "text-brand-blue" },
              { label: "Expired", n: members.filter((m) => m.status === "expired").length, c: "text-red-400" },
            ].map((x) => (
              <div key={x.label} className="card p-6"><p className="text-xs uppercase tracking-widest text-subtle">Membership · {x.label}</p><p className={`mt-2 font-display text-3xl font-extrabold ${x.c}`}>{x.n}</p></div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
