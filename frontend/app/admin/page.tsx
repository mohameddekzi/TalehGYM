"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users, UserCheck, Snowflake, CircleSlash, Search, Trash2,
  RefreshCw, Lock, Download, ShieldCheck,
} from "lucide-react";
import { supabase, type Member, type MemberStatus } from "@/lib/supabase";

const ADMIN_PASSCODE = "taleh2026"; // demo gate — replace with Supabase Auth in production

const statusStyles: Record<MemberStatus, string> = {
  active: "bg-brand-green/10 text-brand-green",
  frozen: "bg-brand-blue/10 text-brand-blue",
  expired: "bg-red-500/10 text-red-400",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | MemberStatus>("all");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("taleh_admin") === "1") {
      setAuthed(true);
    }
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setMembers((data as Member[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (authed) load();
  }, [authed]);

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
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [members, query, filter]);

  function exportCsv() {
    const headers = ["member_code", "full_name", "email", "phone", "plan", "branch", "goal", "status", "created_at"];
    const rows = filtered.map((m) =>
      headers.map((h) => `"${String((m as Record<string, unknown>)[h] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "taleh-members.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Passcode gate ──────────────────────────────────────────────
  if (!authed) {
    return (
      <section className="container-px flex min-h-[70vh] items-center justify-center py-16">
        <div className="card w-full max-w-sm p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-orange/10">
            <Lock className="text-brand-orange" size={22} />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-foreground">Admin access</h1>
          <p className="mt-1 text-sm text-muted">Enter the management passcode.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pass === ADMIN_PASSCODE) {
                sessionStorage.setItem("taleh_admin", "1");
                setAuthed(true);
              } else setError("Incorrect passcode.");
            }}
            className="mt-5 space-y-3"
          >
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Passcode"
              className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none"
            />
            {error ? <p className="text-xs text-red-400">{error}</p> : null}
            <button className="w-full rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark">
              Unlock
            </button>
          </form>
          <p className="mt-4 text-[11px] text-subtle">Demo passcode: taleh2026</p>
        </div>
      </section>
    );
  }

  const kpis = [
    { label: "Total members", value: stats.total, icon: Users, a: "text-brand-orange" },
    { label: "Active", value: stats.active, icon: UserCheck, a: "text-brand-green" },
    { label: "Frozen", value: stats.frozen, icon: Snowflake, a: "text-brand-blue" },
    { label: "Expired", value: stats.expired, icon: CircleSlash, a: "text-red-400" },
  ];

  return (
    <section className="container-px py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm text-subtle">
            <ShieldCheck size={15} className="text-brand-green" /> Super Admin
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-foreground">Members management</h1>
          <p className="mt-1 text-sm text-muted">All Taleh GYM registrations across every branch.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-line/15 px-4 py-2 text-sm text-foreground hover:bg-line/5">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-brand-green-dark">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <k.icon size={20} className={k.a} />
            <p className="mt-3 font-display text-3xl font-extrabold text-foreground">{k.value}</p>
            <p className="text-xs text-subtle">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email, ID…"
            className="w-full rounded-full border border-line/10 bg-surface-2 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "active", "frozen", "expired"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-2 text-sm font-medium capitalize transition-colors ${
                filter === f ? "bg-brand-orange text-white" : "border border-line/15 text-muted hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-line/5 last:border-0 hover:bg-line/[0.03]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{m.full_name}</p>
                      <p className="text-xs text-subtle">{m.member_code}</p>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      <p>{m.phone || "—"}</p>
                      <p className="text-xs text-subtle">{m.email || ""}</p>
                    </td>
                    <td className="px-5 py-3 text-muted">{m.plan}</td>
                    <td className="px-5 py-3 text-muted">{m.branch || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[m.status]}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={m.status}
                          onChange={(e) => setStatus(m.id, e.target.value as MemberStatus)}
                          className="rounded-lg border border-line/10 bg-surface-2 px-2 py-1.5 text-xs text-foreground focus:border-brand-orange/60 focus:outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="frozen">Frozen</option>
                          <option value="expired">Expired</option>
                        </select>
                        <button
                          onClick={() => remove(m.id)}
                          aria-label="Delete member"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-red-400 hover:bg-red-500/10"
                        >
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

      <p className="mt-4 text-xs text-subtle">
        Showing {filtered.length} of {members.length} members · Data stored in Supabase
      </p>
    </section>
  );
}
