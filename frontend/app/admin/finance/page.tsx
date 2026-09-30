"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, Banknote, CreditCard, Dumbbell, Download, Plus, X } from "lucide-react";
import { supabase, type Payment, type Member } from "@/lib/supabase";
import { money, dateShort } from "@/lib/format";

const METHODS = ["EVC Plus", "E-Dahab", "Bank Transfer", "Cash"];
const TYPES = ["Membership", "Personal Training", "Product"];

const methodStyles: Record<string, string> = {
  "EVC Plus": "bg-brand-green/10 text-brand-green",
  "E-Dahab": "bg-brand-orange/10 text-brand-orange",
  "Bank Transfer": "bg-brand-blue/10 text-brand-blue",
  Cash: "bg-line/10 text-muted",
};

export default function FinancePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ member_id: "", amount: "", method: METHODS[0], type: TYPES[0] });

  useEffect(() => {
    (async () => {
      const [p, m] = await Promise.all([
        supabase.from("payments").select("*").order("paid_at", { ascending: false }),
        supabase.from("members").select("*").order("full_name"),
      ]);
      setPayments((p.data as Payment[]) ?? []);
      setMembers((m.data as Member[]) ?? []);
      setLoading(false);
    })();
  }, []);

  async function recordPayment(e: React.FormEvent) {
    e.preventDefault();
    const member = members.find((x) => x.id === form.member_id);
    if (!member || !form.amount) return;
    setSaving(true);
    const { data, error } = await supabase.from("payments").insert({
      member_id: member.id, member_name: member.full_name,
      amount: Number(form.amount), method: form.method, type: form.type,
      status: "paid", paid_at: new Date().toISOString().slice(0, 10),
    }).select("*").single();
    setSaving(false);
    if (!error && data) {
      setPayments((x) => [data as Payment, ...x]);
      // A membership payment re-activates the member so the door opens for 30 days
      if (form.type === "Membership" && member.status !== "active") {
        await supabase.from("members").update({ status: "active" }).eq("id", member.id);
        setMembers((x) => x.map((m) => (m.id === member.id ? { ...m, status: "active" } : m)));
      }
      setForm({ member_id: "", amount: "", method: METHODS[0], type: TYPES[0] });
      setShowAdd(false);
    }
  }

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
        <div className="flex flex-wrap gap-2">
        <button onClick={() => setShowAdd((v) => !v)} className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-brand-orange-dark">
          {showAdd ? <X size={15} /> : <Plus size={15} />} {showAdd ? "Close" : "Record payment"}
        </button>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-brand-green-dark">
          <Download size={15} /> Export CSV
        </button>
        </div>
      </div>

      {showAdd ? (
        <form onSubmit={recordPayment} className="card mt-5 p-6">
          <h3 className="font-display text-base font-bold text-foreground">Record a payment</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Member</label>
              <select value={form.member_id} onChange={(e) => setForm((f) => ({ ...f, member_id: e.target.value }))}
                className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:border-brand-orange/60 focus:outline-none">
                <option value="">Select member…</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Amount ($)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="39"
                className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Method</label>
              <select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
                className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:border-brand-orange/60 focus:outline-none">
                {METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:border-brand-orange/60 focus:outline-none">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <button disabled={saving} className="mt-4 rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark disabled:opacity-60">
            {saving ? "Saving…" : "Save payment"}
          </button>
        </form>
      ) : null}

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
