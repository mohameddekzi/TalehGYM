"use client";

import { useEffect, useMemo, useState } from "react";
import { UserPlus, Trash2, Target } from "lucide-react";
import { supabase, type Lead } from "@/lib/supabase";

const STAGES: Lead["stage"][] = ["new", "contacted", "trial", "converted", "lost"];
const stageStyle: Record<Lead["stage"], string> = {
  new: "bg-brand-blue/10 text-brand-blue",
  contacted: "bg-brand-orange/10 text-brand-orange",
  trial: "bg-amber-400/10 text-amber-500",
  converted: "bg-brand-green/10 text-brand-green",
  lost: "bg-red-500/10 text-red-400",
};

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ name: "", phone: "", source: "Walk-in", interest: "" });

  async function load() {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return;
    const { data } = await supabase.from("leads").insert({ name: f.name.trim(), phone: f.phone || null, source: f.source, interest: f.interest || null, stage: "new" }).select("*").single();
    if (data) setLeads((x) => [data as Lead, ...x]);
    setF({ name: "", phone: "", source: "Walk-in", interest: "" });
  }
  async function setStage(id: string, stage: Lead["stage"]) {
    setLeads((x) => x.map((l) => (l.id === id ? { ...l, stage } : l)));
    await supabase.from("leads").update({ stage }).eq("id", id);
  }
  async function remove(id: string) {
    setLeads((x) => x.filter((l) => l.id !== id));
    await supabase.from("leads").delete().eq("id", id);
  }

  const counts = useMemo(() => Object.fromEntries(STAGES.map((s) => [s, leads.filter((l) => l.stage === s).length])), [leads]);
  const conversion = leads.length ? Math.round(((counts.converted || 0) / leads.length) * 100) : 0;

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">CRM — Leads</h1>
      <p className="mt-1 text-sm text-muted">Track prospects from first contact to conversion.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {STAGES.map((s) => (
          <div key={s} className="card p-4">
            <p className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${stageStyle[s]}`}>{s}</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-foreground">{counts[s] || 0}</p>
          </div>
        ))}
        <div className="card p-4">
          <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-green"><Target size={12} /> Conversion</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-foreground">{conversion}%</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <form onSubmit={add} className="card h-fit p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground"><UserPlus size={16} className="text-brand-orange" /> New lead</h3>
          <div className="mt-4 space-y-3">
            <In label="Name" v={f.name} on={(v) => setF({ ...f, name: v })} />
            <In label="Phone" v={f.phone} on={(v) => setF({ ...f, phone: v })} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Source</label>
              <select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:outline-none">
                {["Walk-in", "Instagram", "Facebook", "Referral", "Phone", "Website"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <In label="Interested in" v={f.interest} on={(v) => setF({ ...f, interest: v })} />
            <button className="w-full rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark">Add lead</button>
          </div>
        </form>

        <div className="card overflow-hidden lg:col-span-2">
          {loading ? <p className="p-8 text-center text-sm text-muted">Loading…</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-subtle">
                    <th className="px-5 py-3 font-medium">Lead</th><th className="px-5 py-3 font-medium">Source</th>
                    <th className="px-5 py-3 font-medium">Stage</th><th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b border-line/5 last:border-0 hover:bg-line/[0.03]">
                      <td className="px-5 py-3"><p className="font-medium text-foreground">{l.name}</p><p className="text-xs text-subtle">{l.phone} · {l.interest}</p></td>
                      <td className="px-5 py-3 text-muted">{l.source}</td>
                      <td className="px-5 py-3">
                        <select value={l.stage} onChange={(e) => setStage(l.id, e.target.value as Lead["stage"])} className={`rounded-lg border border-line/10 bg-surface-2 px-2 py-1.5 text-xs font-semibold capitalize focus:outline-none ${stageStyle[l.stage]}`}>
                          {STAGES.map((s) => <option key={s} value={s} className="bg-surface-2 text-foreground">{s}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => remove(l.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-red-400 hover:bg-red-500/10"><Trash2 size={15} /></button>
                      </td>
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

function In({ label, v, on }: { label: string; v: string; on: (x: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      <input value={v} onChange={(e) => on(e.target.value)} className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:outline-none" />
    </div>
  );
}
