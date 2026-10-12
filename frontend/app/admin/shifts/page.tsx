"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Search, Users } from "lucide-react";
import { supabase, type Member } from "@/lib/supabase";
import { SHIFTS } from "@/lib/shifts";

export default function ShiftsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<string>("all");

  async function load() {
    const { data } = await supabase.from("members").select("*").eq("is_staff", false).order("full_name");
    setMembers((data as Member[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function setShift(id: string, shift: string) {
    setMembers((m) => m.map((x) => (x.id === id ? { ...x, shift: shift || null } : x)));
    await supabase.from("members").update({ shift: shift || null }).eq("id", id);
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of SHIFTS) c[s] = members.filter((m) => m.shift === s).length;
    c[""] = members.filter((m) => !m.shift).length;
    return c;
  }, [members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (tab !== "all" && (m.shift || "") !== tab) return false;
      if (!q) return true;
      return [m.full_name, m.member_code, m.phone].filter(Boolean).some((v) => v!.toLowerCase().includes(q));
    });
  }, [members, query, tab]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-orange/10"><Clock size={22} className="text-brand-orange" /></div>
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">Attendance Shifts</h1>
          <p className="mt-0.5 text-sm text-muted">U qoondee xubnaha waqtiyada (Ragga / Dumar).</p>
        </div>
      </div>

      {/* Shift cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SHIFTS.map((s) => (
          <button key={s} onClick={() => setTab(tab === s ? "all" : s)}
            className={`card p-5 text-left transition-colors ${tab === s ? "ring-1 ring-brand-orange/60" : ""}`}>
            <div className="flex items-center justify-between">
              <Clock size={18} className={s.includes("Dumar") ? "text-brand-green" : "text-brand-blue"} />
              <span className="inline-flex items-center gap-1 rounded-full bg-line/10 px-2 py-0.5 text-xs font-semibold text-foreground"><Users size={11} /> {counts[s] || 0}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">{s.split(" · ")[0]}</p>
            <p className="text-xs text-subtle">{s.split(" · ")[1]}</p>
          </button>
        ))}
        <button onClick={() => setTab(tab === "" ? "all" : "")}
          className={`card p-5 text-left transition-colors ${tab === "" ? "ring-1 ring-brand-orange/60" : ""}`}>
          <div className="flex items-center justify-between">
            <Clock size={18} className="text-subtle" />
            <span className="inline-flex items-center gap-1 rounded-full bg-line/10 px-2 py-0.5 text-xs font-semibold text-foreground"><Users size={11} /> {counts[""] || 0}</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">Aan la qoondayn</p>
          <p className="text-xs text-subtle">No shift assigned</p>
        </button>
      </div>

      <div className="mt-6 relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search member…"
          className="w-full rounded-full border border-line/10 bg-surface-2 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none" />
      </div>

      <div className="card mt-5 overflow-hidden">
        {loading ? <p className="p-8 text-center text-sm text-muted">Loading…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-subtle">
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Shift</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-line/5 last:border-0 hover:bg-line/[0.03]">
                    <td className="px-5 py-3"><p className="font-medium text-foreground">{m.full_name}</p><p className="text-xs text-subtle">{m.member_code}</p></td>
                    <td className="px-5 py-3 text-muted">{m.plan}</td>
                    <td className="px-5 py-3">
                      <select value={m.shift || ""} onChange={(e) => setShift(m.id, e.target.value)}
                        className="rounded-lg border border-line/10 bg-surface-2 px-3 py-1.5 text-xs text-foreground focus:border-brand-orange/60 focus:outline-none">
                        <option value="">— Dooro shift —</option>
                        {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
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
