"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, Banknote, CreditCard, Dumbbell, Download } from "lucide-react";
import { supabase, type Payment } from "@/lib/supabase";
import { money, dateShort } from "@/lib/format";

const methodStyles: Record<string, string> = {
  "EVC Plus": "bg-brand-green/10 text-brand-green",
  "E-Dahab": "bg-brand-orange/10 text-brand-orange",
  "Bank Transfer": "bg-brand-blue/10 text-brand-blue",
  Cash: "bg-line/10 text-muted",
};

export default function FinancePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("payments").select("*").order("paid_at", { ascending: false });
      setPayments((data as Payment[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const now = new Date();
  const stats = useMemo(() => {
    const total = payments.reduce((s, p) => s + Number(p.amount), 0);
    const thisMonth = payments
      .filter((p) => { const d = new Date(p.paid_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .reduce((s, p) => s + Number(p.amount), 0);
    const membership = payments.filter((p) => p.type === "Membership").reduce((s, p) => s + Number(p.amount), 0);
    const pt = payments.filter((p) => p.type === "Personal Training").reduce((s, p) => s + Number(p.amount), 0);
    return { total, thisMonth, membership, pt };
  }, [payments]);

  const byMethod = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of payments) map.set(p.method, (map.get(p.method) ?? 0) + Number(p.amount));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [payments]);
  const maxMethod = Math.max(1, ...byMethod.map(([, v]) => v));

  function exportCsv() {
    const headers = ["paid_at", "member_name", "type", "method", "amount", "status"];
    const rows = payments.map((p) =>
      headers.map((h) => `"${String((p as Record<string, unknown>)[h] ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "taleh-payments.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const kpis = [
    { label: "Total revenue", value: money(stats.total), icon: Wallet, a: "text-brand-orange" },
    { label: "This month", value: money(stats.thisMonth), icon: Banknote, a: "text-brand-green" },
    { label: "Membership", value: money(stats.membership), icon: CreditCard, a: "text-brand-blue" },
    { label: "Personal training", value: money(stats.pt), icon: Dumbbell, a: "text-brand-orange" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">Finance</h1>
          <p className="mt-1 text-sm text-muted">Payments, revenue and methods across all branches.</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-brand-green-dark">
          <Download size={15} /> Export CSV
        </button>
      </div>

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
        <div className="card p-6">
          <h3 className="font-display text-base font-bold text-foreground">Revenue by method</h3>
          <div className="mt-5 space-y-4">
            {byMethod.map(([method, value]) => (
              <div key={method}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">{method}</span>
                  <span className="font-semibold text-foreground">{money(value)}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line/10">
                  <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${(value / maxMethod) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden lg:col-span-2">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted">Loading payments…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-subtle">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Member</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Method</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 50).map((p) => (
                    <tr key={p.id} className="border-b border-line/5 last:border-0 hover:bg-line/[0.03]">
                      <td className="px-5 py-3 text-muted">{dateShort(p.paid_at)}</td>
                      <td className="px-5 py-3 font-medium text-foreground">{p.member_name}</td>
                      <td className="px-5 py-3 text-muted">{p.type}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${methodStyles[p.method] ?? "bg-line/10 text-muted"}`}>
                          {p.method}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-foreground">{money(Number(p.amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
