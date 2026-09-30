"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Search, MessageCircle, Mail, Printer, X } from "lucide-react";
import { supabase, type Payment, type Member } from "@/lib/supabase";
import { money, dateShort } from "@/lib/format";
import { invoiceNo, invoiceText, waLink, emailLink } from "@/lib/messaging";

export default function InvoicesPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Record<string, Member>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<Payment | null>(null);

  useEffect(() => {
    (async () => {
      const [p, m] = await Promise.all([
        supabase.from("payments").select("*").order("paid_at", { ascending: false }),
        supabase.from("members").select("*"),
      ]);
      setPayments((p.data as Payment[]) ?? []);
      const map: Record<string, Member> = {};
      for (const x of (m.data as Member[]) ?? []) map[x.id] = x;
      setMembers(map);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p) => [p.member_name, p.type, invoiceNo(p)].filter(Boolean).some((v) => v!.toLowerCase().includes(q)));
  }, [payments, query]);

  function memberOf(p: Payment) { return p.member_id ? members[p.member_id] : undefined; }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">Invoices</h1>
          <p className="mt-1 text-sm text-muted">Send receipts to members via WhatsApp or email.</p>
        </div>
        <div className="relative min-w-[220px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search invoice, member…"
            className="w-full rounded-full border border-line/10 bg-surface-2 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none" />
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        {loading ? <p className="p-8 text-center text-sm text-muted">Loading…</p> : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No invoices.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-subtle">
                  <th className="px-5 py-3 font-medium">Invoice</th><th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Amount</th><th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Send</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const m = memberOf(p);
                  return (
                    <tr key={p.id} className="border-b border-line/5 last:border-0 hover:bg-line/[0.03]">
                      <td className="px-5 py-3"><p className="font-mono text-xs text-foreground">{invoiceNo(p)}</p><p className="text-xs text-subtle">{p.type}</p></td>
                      <td className="px-5 py-3 text-muted">{p.member_name}</td>
                      <td className="px-5 py-3 font-semibold text-foreground">{money(p.amount)}</td>
                      <td className="px-5 py-3 text-muted">{dateShort(p.paid_at)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <a href={waLink(m?.phone ?? null, invoiceText(p))} target="_blank" rel="noopener noreferrer" title="WhatsApp"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-brand-green hover:bg-brand-green/10"><MessageCircle size={15} /></a>
                          <a href={emailLink(m?.email ?? null, `${invoiceNo(p)} — Taleh GYM`, invoiceText(p))} title="Email"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-brand-blue hover:bg-brand-blue/10"><Mail size={15} /></a>
                          <button onClick={() => setView(p)} title="View / Print"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-muted hover:bg-line/5"><Printer size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {view ? <InvoiceModal payment={view} member={memberOf(view)} onClose={() => setView(null)} /> : null}
    </div>
  );
}

function InvoiceModal({ payment, member, onClose }: { payment: Payment; member?: Member; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-background p-7 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-2xl font-extrabold"><span className="text-brand-green">TALEH</span> <span className="text-brand-blue">GYM</span></p>
            <p className="mt-1 text-xs text-subtle">Iskoyska, Mogadishu · +252 61 000 0001</p>
          </div>
          <button onClick={onClose} className="text-subtle hover:text-foreground print:hidden"><X size={18} /></button>
        </div>
        <div className="mt-5 rounded-xl border border-line/10 bg-surface-2 p-4 text-sm">
          <div className="flex justify-between"><span className="text-subtle">Invoice</span><span className="font-mono text-foreground">{invoiceNo(payment)}</span></div>
          <div className="mt-2 flex justify-between"><span className="text-subtle">Macmiil</span><span className="text-foreground">{payment.member_name}</span></div>
          <div className="mt-2 flex justify-between"><span className="text-subtle">Nooc</span><span className="text-foreground">{payment.type}</span></div>
          <div className="mt-2 flex justify-between"><span className="text-subtle">Hab</span><span className="text-foreground">{payment.method}</span></div>
          <div className="mt-2 flex justify-between"><span className="text-subtle">Taariikh</span><span className="text-foreground">{payment.paid_at}</span></div>
          <div className="mt-3 flex justify-between border-t border-line/10 pt-3"><span className="font-semibold text-foreground">Wadarta</span><span className="font-display text-xl font-extrabold text-brand-orange">{money(payment.amount)}</span></div>
          <p className="mt-2 text-center text-xs font-semibold text-brand-green">LA BIXIYAY ✓</p>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 print:hidden">
          <a href={waLink(member?.phone ?? null, invoiceText(payment))} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-green px-3 py-2.5 text-xs font-semibold text-ink-950"><MessageCircle size={14} /> WhatsApp</a>
          <a href={emailLink(member?.email ?? null, `${invoiceNo(payment)} — Taleh GYM`, invoiceText(payment))}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line/15 px-3 py-2.5 text-xs font-semibold text-foreground"><Mail size={14} /> Email</a>
          <button onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line/15 px-3 py-2.5 text-xs font-semibold text-foreground"><Printer size={14} /> Print</button>
        </div>
      </div>
    </div>
  );
}
