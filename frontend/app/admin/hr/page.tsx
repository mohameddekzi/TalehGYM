"use client";

import { useEffect, useMemo, useState } from "react";
import { UsersRound, Wallet, Building, UserPlus, Trash2, X } from "lucide-react";
import { supabase, type Employee } from "@/lib/supabase";
import { money, dateShort } from "@/lib/format";
import { PhotoInput } from "@/components/photo-input";

const DEPTS = ["Training", "Reception", "Finance", "Cleaning", "Security", "Management"];
const STATUSES: Employee["status"][] = ["active", "on_leave", "inactive"];
const statusStyle: Record<Employee["status"], string> = {
  active: "bg-brand-green/10 text-brand-green",
  on_leave: "bg-amber-400/10 text-amber-500",
  inactive: "bg-red-500/10 text-red-400",
};
const statusLabel: Record<Employee["status"], string> = { active: "Active", on_leave: "On leave", inactive: "Inactive" };

export default function HrPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const empty = { full_name: "", position: "", department: DEPTS[0], phone: "", email: "", salary: "", hire_date: new Date().toISOString().slice(0, 10), photo: "" };
  const [f, setF] = useState(empty);

  async function load() {
    const { data } = await supabase.from("employees").select("*").order("full_name");
    setItems((data as Employee[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!f.full_name.trim()) return;
    setSaving(true);
    const { data } = await supabase.from("employees").insert({
      full_name: f.full_name.trim(), position: f.position || null, department: f.department,
      phone: f.phone || null, email: f.email || null, salary: Number(f.salary) || 0,
      hire_date: f.hire_date, status: "active", photo: f.photo || null,
    }).select("*").single();
    setSaving(false);
    if (data) setItems((x) => [...x, data as Employee].sort((a, b) => a.full_name.localeCompare(b.full_name)));
    setF(empty); setShowAdd(false);
  }
  async function setStatus(id: string, status: Employee["status"]) {
    setItems((x) => x.map((e) => (e.id === id ? { ...e, status } : e)));
    await supabase.from("employees").update({ status }).eq("id", id);
  }
  async function remove(id: string) {
    if (!confirm("Ka saar shaqaalahan?")) return;
    setItems((x) => x.filter((e) => e.id !== id));
    await supabase.from("employees").delete().eq("id", id);
  }

  const stats = useMemo(() => ({
    total: items.length,
    payroll: items.filter((e) => e.status !== "inactive").reduce((s, e) => s + Number(e.salary), 0),
    depts: new Set(items.map((e) => e.department)).size,
  }), [items]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">HR · Employees</h1>
          <p className="mt-1 text-sm text-muted">Diiwaanka shaqaalaha, waaxaha iyo mushaharka.</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-brand-orange-dark">
          {showAdd ? <X size={15} /> : <UserPlus size={15} />} {showAdd ? "Xir" : "Ku dar shaqaale"}
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><UsersRound size={20} className="text-brand-orange" /><p className="mt-3 font-display text-3xl font-extrabold text-foreground">{stats.total}</p><p className="text-xs text-subtle">Shaqaale</p></div>
        <div className="card p-5"><Wallet size={20} className="text-brand-green" /><p className="mt-3 font-display text-3xl font-extrabold text-foreground">{money(stats.payroll)}</p><p className="text-xs text-subtle">Payroll / bishii</p></div>
        <div className="card p-5"><Building size={20} className="text-brand-blue" /><p className="mt-3 font-display text-3xl font-extrabold text-foreground">{stats.depts}</p><p className="text-xs text-subtle">Waaxo</p></div>
      </div>

      {showAdd ? (
        <form onSubmit={add} className="card mt-5 p-6">
          <h3 className="font-display text-base font-bold text-foreground">Shaqaale cusub</h3>
          <div className="mt-4"><PhotoInput value={f.photo} onChange={(v) => setF({ ...f, photo: v })} /></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <In label="Magaca buuxa" v={f.full_name} on={(v) => setF({ ...f, full_name: v })} />
            <In label="Jagada" v={f.position} on={(v) => setF({ ...f, position: v })} />
            <Sel label="Waaxda" v={f.department} on={(v) => setF({ ...f, department: v })} opts={DEPTS} />
            <In label="Telefoon" v={f.phone} on={(v) => setF({ ...f, phone: v })} />
            <In label="Email" v={f.email} on={(v) => setF({ ...f, email: v })} />
            <In label="Mushahar ($/bishii)" type="number" v={f.salary} on={(v) => setF({ ...f, salary: v })} />
            <In label="Taariikhda shaqada" type="date" v={f.hire_date} on={(v) => setF({ ...f, hire_date: v })} />
          </div>
          <button disabled={saving} className="mt-4 rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark disabled:opacity-60">
            {saving ? "Kaydinaya…" : "Diiwaan geli"}
          </button>
        </form>
      ) : null}

      <div className="card mt-5 overflow-hidden">
        {loading ? <p className="p-8 text-center text-sm text-muted">Loading…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-subtle">
                  <th className="px-5 py-3 font-medium">Shaqaale</th><th className="px-5 py-3 font-medium">Waaxda</th>
                  <th className="px-5 py-3 font-medium">Telefoon</th><th className="px-5 py-3 font-medium">Mushahar</th>
                  <th className="px-5 py-3 font-medium">Bilaabay</th><th className="px-5 py-3 font-medium">Xaalad</th><th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id} className="border-b border-line/5 last:border-0 hover:bg-line/[0.03]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {e.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={e.photo} alt={e.full_name} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-line/10 text-xs font-bold text-foreground">{e.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
                        )}
                        <div><p className="font-medium text-foreground">{e.full_name}</p><p className="text-xs text-subtle">{e.position}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted">{e.department}</td>
                    <td className="px-5 py-3 text-muted">{e.phone || "—"}</td>
                    <td className="px-5 py-3 font-semibold text-foreground">{money(e.salary)}</td>
                    <td className="px-5 py-3 text-muted">{dateShort(e.hire_date)}</td>
                    <td className="px-5 py-3">
                      <select value={e.status} onChange={(ev) => setStatus(e.id, ev.target.value as Employee["status"])}
                        className={`rounded-lg border border-line/10 bg-surface-2 px-2 py-1.5 text-xs font-semibold focus:outline-none ${statusStyle[e.status]}`}>
                        {STATUSES.map((s) => <option key={s} value={s} className="bg-surface-2 text-foreground">{statusLabel[s]}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => remove(e.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-red-400 hover:bg-red-500/10"><Trash2 size={15} /></button>
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

function In({ label, v, on, type = "text" }: { label: string; v: string; on: (x: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      <input type={type} value={v} onChange={(e) => on(e.target.value)} className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:outline-none" />
    </div>
  );
}
function Sel({ label, v, on, opts }: { label: string; v: string; on: (x: string) => void; opts: string[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      <select value={v} onChange={(e) => on(e.target.value)} className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:outline-none">
        {opts.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
