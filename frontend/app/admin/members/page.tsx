"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users, UserCheck, Snowflake, CircleSlash, Search, Trash2, RefreshCw, Download,
  UserPlus, X, Fingerprint,
} from "lucide-react";
import { supabase, type Member, type MemberStatus } from "@/lib/supabase";
import { dateShort } from "@/lib/format";
import { branches, plans } from "@/lib/content";
import { PhotoInput } from "@/components/photo-input";

const statusStyles: Record<MemberStatus, string> = {
  active: "bg-brand-green/10 text-brand-green",
  frozen: "bg-brand-blue/10 text-brand-blue",
  expired: "bg-red-500/10 text-red-400",
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | MemberStatus>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState<Member | null>(null);
  const emptyForm = {
    full_name: "", phone: "", email: "", gender: "Female", date_of_birth: "",
    emergency_contact: "", plan: plans[0].name, branch: branches[0].name,
    goal: "General Fitness", photo: "",
  };
  const [form, setForm] = useState(emptyForm);

  function setField(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim()) return;
    setSaving(true);
    const { data, error: err } = await supabase.from("members").insert({
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      gender: form.gender || null,
      date_of_birth: form.date_of_birth || null,
      emergency_contact: form.emergency_contact.trim() || null,
      plan: form.plan,
      branch: form.branch,
      goal: form.goal,
      photo: form.photo || null,
      status: "active",
    }).select("*").single();
    setSaving(false);
    if (!err && data) {
      setMembers((m) => [data as Member, ...m]);
      setForm(emptyForm);
      setShowAdd(false);
      setAdded(data as Member);
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("members").select("*").order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setMembers((data as Member[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: MemberStatus) {
    setMembers((m) => m.map((x) => (x.id === id ? { ...x, status } : x)));
    await supabase.from("members").update({ status }).eq("id", id);
  }
  async function remove(id: string) {
    if (!confirm("Delete this member permanently?")) return;
    setMembers((m) => m.filter((x) => x.id !== id));
    await supabase.from("members").delete().eq("id", id);
  }

  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    frozen: members.filter((m) => m.status === "frozen").length,
    expired: members.filter((m) => m.status === "expired").length,
  }), [members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (filter !== "all" && m.status !== filter) return false;
      if (!q) return true;
      return [m.full_name, m.email, m.phone, m.member_code, m.branch]
        .filter(Boolean).some((v) => v!.toLowerCase().includes(q));
    });
  }, [members, query, filter]);

  function exportCsv() {
    const headers = ["member_code", "full_name", "email", "phone", "plan", "branch", "goal", "status", "created_at"];
    const rows = filtered.map((m) =>
      headers.map((h) => `"${String((m as Record<string, unknown>)[h] ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "taleh-members.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const kpis = [
    { label: "Total members", value: stats.total, icon: Users, a: "text-brand-orange" },
    { label: "Active", value: stats.active, icon: UserCheck, a: "text-brand-green" },
    { label: "Frozen", value: stats.frozen, icon: Snowflake, a: "text-brand-blue" },
    { label: "Expired", value: stats.expired, icon: CircleSlash, a: "text-red-400" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">Members</h1>
          <p className="mt-1 text-sm text-muted">All registrations across every branch.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowAdd((v) => !v)} className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-brand-orange-dark">
            {showAdd ? <X size={15} /> : <UserPlus size={15} />} {showAdd ? "Close" : "Add member"}
          </button>
          <button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-line/15 px-4 py-2 text-sm text-foreground hover:bg-line/5">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-brand-green-dark">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {showAdd ? (
        <form onSubmit={addMember} className="card mt-5 p-6">
          <h3 className="font-display text-base font-bold text-foreground">New member</h3>
          <div className="mt-4"><PhotoInput value={form.photo} onChange={(v) => setField("photo", v)} /></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AddField label="Full name" value={form.full_name} onChange={(v) => setField("full_name", v)} placeholder="e.g. Amina Warsame" />
            <AddField label="Phone" value={form.phone} onChange={(v) => setField("phone", v)} placeholder="+252 ..." />
            <AddField label="Email" value={form.email} onChange={(v) => setField("email", v)} placeholder="name@email.com" />
            <AddSelect label="Gender" value={form.gender} onChange={(v) => setField("gender", v)} options={["Female", "Male"]} />
            <AddField label="Date of birth" type="date" value={form.date_of_birth} onChange={(v) => setField("date_of_birth", v)} />
            <AddField label="Emergency contact" value={form.emergency_contact} onChange={(v) => setField("emergency_contact", v)} placeholder="Name & phone" />
            <AddSelect label="Plan" value={form.plan} onChange={(v) => setField("plan", v)} options={plans.map((p) => p.name)} />
            <AddSelect label="Branch" value={form.branch} onChange={(v) => setField("branch", v)} options={branches.map((b) => b.name)} />
            <AddSelect label="Goal" value={form.goal} onChange={(v) => setField("goal", v)} options={["Weight Loss", "Muscle Gain", "Strength", "General Fitness", "Athletic Performance"]} />
          </div>
          <button disabled={saving} className="mt-4 rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark disabled:opacity-60">
            {saving ? "Saving…" : "Create member"}
          </button>
        </form>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <k.icon size={20} className={k.a} />
            <p className="mt-3 font-display text-3xl font-extrabold text-foreground">{k.value}</p>
            <p className="text-xs text-subtle">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email, ID…"
            className="w-full rounded-full border border-line/10 bg-surface-2 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "active", "frozen", "expired"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-2 text-sm font-medium capitalize transition-colors ${
                filter === f ? "bg-brand-orange text-white" : "border border-line/15 text-muted hover:text-foreground"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card mt-5 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-muted">Loading members…</p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-red-400">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No members found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-subtle">
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Branch</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-line/5 last:border-0 hover:bg-line/[0.03]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {m.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.photo} alt={m.full_name} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-line/10 text-xs font-bold text-foreground">
                            {m.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                          </span>
                        )}
                        <div>
                          <p className="font-medium text-foreground">{m.full_name}</p>
                          <p className="flex items-center gap-1.5 text-xs text-subtle">
                            {m.member_code}
                            {m.fp_enrolled ? (
                              <span className="inline-flex items-center gap-0.5 text-brand-green" title="Fingerprint enrolled"><Fingerprint size={11} /></span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      <p>{m.phone || "—"}</p>
                      <p className="text-xs text-subtle">{m.email || ""}</p>
                    </td>
                    <td className="px-5 py-3 text-muted">{m.plan}</td>
                    <td className="px-5 py-3 text-muted">{(m.branch || "—").replace("Taleh GYM — ", "")}</td>
                    <td className="px-5 py-3 text-muted">{dateShort(m.created_at)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[m.status]}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <select value={m.status} onChange={(e) => setStatus(m.id, e.target.value as MemberStatus)}
                          className="rounded-lg border border-line/10 bg-surface-2 px-2 py-1.5 text-xs text-foreground focus:border-brand-orange/60 focus:outline-none">
                          <option value="active">Active</option>
                          <option value="frozen">Frozen</option>
                          <option value="expired">Expired</option>
                        </select>
                        <button onClick={() => remove(m.id)} aria-label="Delete member"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-red-400 hover:bg-red-500/10">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="mt-4 text-xs text-subtle">Showing {filtered.length} of {members.length} members · Data stored in Supabase</p>

      {added ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setAdded(null)}>
          <div className="w-full max-w-md rounded-2xl bg-background p-7 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-green/10"><UserCheck size={24} className="text-brand-green" /></div>
              <h3 className="mt-3 font-display text-lg font-bold text-foreground">Xubin la diiwaangeliyay</h3>
              <p className="mt-1 text-sm text-muted">{added.full_name}</p>
            </div>

            <div className="mt-5 rounded-xl border border-line/10 bg-surface-2 p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-subtle">Member Code (Device User ID)</p>
              <p className="mt-1 font-mono text-2xl font-extrabold text-brand-orange">{added.member_code}</p>
            </div>

            <div className="mt-5 rounded-xl border border-brand-orange/30 bg-brand-orange/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Fingerprint size={16} className="text-brand-orange" /> Tallaabada far-raaca (Access Control)
              </p>
              <ol className="mt-3 space-y-2 text-sm text-muted">
                <li><span className="font-semibold text-foreground">1.</span> Mashiinka ZKTeco: <span className="font-medium text-foreground">Menu → User → New</span>.</li>
                <li><span className="font-semibold text-foreground">2.</span> Geli <span className="font-mono text-brand-orange">{added.member_code}</span> sida <span className="font-medium text-foreground">User ID</span>, kadib ku duub far-raaca (hal mar).</li>
                <li><span className="font-semibold text-foreground">3.</span> Bridge-ku si automatic ah ayuu u kaydiyaa DB-ga + u geeyaa albaabka.</li>
              </ol>
              <p className="mt-3 text-xs text-subtle">Status hadda: <span className="font-semibold text-red-400">Fingerprint lama diiwaangelin</span> — wuu cagaari doonaa marka la duubo.</p>
            </div>

            <button onClick={() => setAdded(null)} className="mt-5 w-full rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark">Diyaar</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AddField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none" />
    </div>
  );
}

function AddSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:border-brand-orange/60 focus:outline-none">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
