"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, TrendingUp, TrendingDown, Wallet, Receipt } from "lucide-react";
import { supabase, type Payment, type Member, type Sale, type Expense } from "@/lib/supabase";
import { money, monthLabel } from "@/lib/format";
import { TAX_RATE } from "@/lib/shifts";

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

  const memberById = useMemo(() => {
    const map = new Map<string, Member>();
    for (const m of members) map.set(m.id, m);
    return map;
  }, [members]);

  // Staff (free) members are excluded from the finance report entirely.
  const billable = useMemo(
    () => payments.filter((p) => !(p.member_id && memberById.get(p.member_id)?.is_staff)),
    [payments, memberById]
  );

  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
  const now = new Date();

  const monthly = useMemo(() => {
    const buckets: { label: string; key: string; membership: number; tax: number; pos: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: monthLabel(d) + " " + d.getFullYear(), key: `${d.getFullYear()}-${d.getMonth()}`, membership: 0, tax: 0, pos: 0, expense: 0 });
    }
    for (const p of billable) {
      const b = buckets.find((x) => x.key === monthKey(new Date(p.paid_at)));
      if (!b) continue;
      b.membership += Number(p.amount);
      if (p.member_id && memberById.get(p.member_id)?.tax) b.tax += Number(p.amount) * TAX_RATE;
    }
    for (const s of sales) { const b = buckets.find((x) => x.key === monthKey(new Date(s.created_at))); if (b) b.pos += Number(s.total); }
    for (const e of expenses) { const b = buckets.find((x) => x.key === monthKey(new Date(e.spent_at))); if (b) b.expense += Number(e.amount); }
    return buckets;
  }, [billable, sales, expenses, memberById]);

  // Per-member summary — one row per member (no duplicate people)
  const perMember = useMemo(() => {
    const map = new Map<string, { name: string; code: string; total: number; tax: number; count: number }>();
    for (const p of billable) {
      const m = p.member_id ? memberById.get(p.member_id) : undefined;
      const key = p.member_id || p.member_name || "—";
      const row = map.get(key) || { name: m?.full_name || p.member_name || "—", code: m?.member_code || "—", total: 0, tax: 0, count: 0 };
      row.total += Number(p.amount);
      if (m?.tax) row.tax += Number(p.amount) * TAX_RATE;
      row.count += 1;
      map.set(key, row);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [billable, memberById]);

  const totals = useMemo(() => {
    const membership = billable.reduce((s, p) => s + Number(p.amount), 0);
    const pos = sales.reduce((s, x) => s + Number(x.total), 0);
    const tax = perMember.reduce((s, r) => s + r.tax, 0);
    const expense = expenses.reduce((s, e) => s + Number(e.amount), 0);
    return { revenue: membership + pos, tax, expense, net: membership + pos - expense };
  }, [billable, sales, expenses, perMember]);

  function exportCsv() {
    const headers = ["member_code", "member_name", "payments", "total_paid", "tax_5pct"];
    const rows = perMember.map((r) => [r.code, `"${r.name}"`, r.count, r.total.toFixed(2), r.tax.toFixed(2)].join(","));
    const csv = [headers.join(","), ...rows, "", `TOTAL,,,${totals.revenue.toFixed(2)},${totals.tax.toFixed(2)}`].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "taleh-finance-report.csv"; a.click(); URL.revokeObjectURL(url);
  }

  const kpis = [
    { label: "Total revenue", value: money(totals.revenue), icon: Wallet, a: "text-brand-green" },
    { label: "Tax collected (5%)", value: money(totals.tax), icon: Receipt, a: "text-brand-orange" },
    { label: "Total expenses", value: money(totals.expense), icon: TrendingDown, a: "text-red-400" },
    { label: "Net profit", value: money(totals.net), icon: TrendingUp, a: "text-brand-blue" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">Finance Report</h1>
          <p className="mt-1 text-sm text-muted">Dakhliga, cashuurta 5%, iyo faa&apos;iidada — shaqaalaha (free) kama mid aha.</p>
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

          {/* Monthly */}
          <div className="card mt-5 overflow-hidden">
            <div className="border-b border-line/10 px-6 py-4"><h3 className="font-display text-base font-bold text-foreground">Warbixin bille · 6-dii bilood ee la soo dhaafay</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-subtle">
                    <th className="px-5 py-3 font-medium">Bisha</th>
                    <th className="px-5 py-3 text-right font-medium">Membership</th>
                    <th className="px-5 py-3 text-right font-medium">Tax 5%</th>
                    <th className="px-5 py-3 text-right font-medium">POS</th>
                    <th className="px-5 py-3 text-right font-medium">Kharash</th>
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
                        <td className="px-5 py-3 text-right text-brand-orange">{money(b.tax)}</td>
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

          {/* Per-member (no duplicates) */}
          <div className="card mt-5 overflow-hidden">
            <div className="border-b border-line/10 px-6 py-4">
              <h3 className="font-display text-base font-bold text-foreground">Dakhliga xubin kasta <span className="text-xs font-normal text-subtle">(hal qof — hal saf)</span></h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-subtle">
                    <th className="px-5 py-3 font-medium">Member ID</th>
                    <th className="px-5 py-3 font-medium">Magaca</th>
                    <th className="px-5 py-3 text-right font-medium">Lacag bixin</th>
                    <th className="px-5 py-3 text-right font-medium">Wadarta</th>
                    <th className="px-5 py-3 text-right font-medium">Tax 5%</th>
                  </tr>
                </thead>
                <tbody>
                  {perMember.map((r) => (
                    <tr key={r.code + r.name} className="border-b border-line/5 last:border-0 hover:bg-line/[0.03]">
                      <td className="px-5 py-3 font-mono text-xs text-foreground">{r.code}</td>
                      <td className="px-5 py-3 font-medium text-foreground">{r.name}</td>
                      <td className="px-5 py-3 text-right text-muted">{r.count}</td>
                      <td className="px-5 py-3 text-right font-semibold text-foreground">{money(r.total)}</td>
                      <td className="px-5 py-3 text-right text-brand-orange">{money(r.tax)}</td>
                    </tr>
                  ))}
                  {perMember.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted">Lacag bixin ma jirto.</td></tr>
                  ) : (
                    <tr className="border-t border-line/10 bg-surface-2/40 font-semibold">
                      <td className="px-5 py-3 text-foreground" colSpan={3}>WADARTA</td>
                      <td className="px-5 py-3 text-right text-brand-green">{money(totals.revenue)}</td>
                      <td className="px-5 py-3 text-right text-brand-orange">{money(totals.tax)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
