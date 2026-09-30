"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, MessageCircle, Mail, Search, DollarSign } from "lucide-react";
import { supabase, type Member, type Payment } from "@/lib/supabase";
import { decideAccess } from "@/lib/access";
import { reminderText, waLink, emailLink } from "@/lib/messaging";
import { dateShort } from "@/lib/format";

type Row = Member & { days_left: number | null; paid_until: string | null };

export default function PendingPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const [m, p] = await Promise.all([
        supabase.from("members").select("*").order("full_name"),
        supabase.from("payments").select("*"),
      ]);
      const members = (m.data as Member[]) ?? [];
      const pays = (p.data as Payment[]) ?? [];
      const pending = members
        .map((mem) => {
          const d = decideAccess(mem, pays.filter((x) => x.member_id === mem.id));
          return { ...mem, days_left: d.days_left, paid_until: d.paid_until, allowed: d.allowed };
        })
        .filter((r) => !r.allowed && r.status !== "frozen")
        .sort((a, b) => (a.days_left ?? -9999) - (b.days_left ?? -9999));
      setRows(pending);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.full_name, r.phone, r.member_code].filter(Boolean).some((v) => v!.toLowerCase().includes(q)));
  }, [rows, query]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/10"><AlertCircle size={22} className="text-red-400" /></div>
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">Pending Payments</h1>
          <p className="mt-0.5 text-sm text-muted">Members whose monthly subscription is due — send a reminder.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card p-5"><AlertCircle size={20} className="text-red-400" /><p className="mt-3 font-display text-3xl font-extrabold text-foreground">{rows.length}</p><p className="text-xs text-subtle">Members pending</p></div>
        <div className="card p-5"><DollarSign size={20} className="text-brand-orange" /><p className="mt-3 font-display text-3xl font-extrabold text-foreground">{rows.length}</p><p className="text-xs text-subtle">Reminders to send</p></div>
      </div>

      <div className="mt-6 relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search member, phone, ID…"
          className="w-full rounded-full border border-line/10 bg-surface-2 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none" />
      </div>

      <div className="card mt-5 overflow-hidden">
        {loading ? <p className="p-8 text-center text-sm text-muted">Loading…</p> : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-brand-green">🎉 Dhammaan xubnuhu way bixiyeen — pending ma jiro.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-subtle">
                  <th className="px-5 py-3 font-medium">Member</th><th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Overdue</th><th className="px-5 py-3 font-medium">Lapsed on</th>
                  <th className="px-5 py-3 font-medium">Reminder</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-line/5 last:border-0 hover:bg-line/[0.03]">
                    <td className="px-5 py-3"><p className="font-medium text-foreground">{r.full_name}</p><p className="text-xs text-subtle">{r.member_code} · {r.plan}</p></td>
                    <td className="px-5 py-3 text-muted">{r.phone || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                        {r.days_left != null ? `${Math.abs(r.days_left)} maalmood` : "No payment"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted">{r.paid_until ? dateShort(r.paid_until) : "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <a href={waLink(r.phone, reminderText(r, r.days_left))} target="_blank" rel="noopener noreferrer" title="WhatsApp reminder"
                          className="inline-flex items-center gap-1.5 rounded-full bg-brand-green px-3 py-1.5 text-xs font-semibold text-ink-950"><MessageCircle size={13} /> WhatsApp</a>
                        <a href={emailLink(r.email, "Xusuusin lacag — Taleh GYM", reminderText(r, r.days_left))} title="Email reminder"
                          className="inline-flex items-center gap-1.5 rounded-full border border-line/15 px-3 py-1.5 text-xs font-semibold text-foreground"><Mail size={13} /> Email</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
