"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users, UserCheck, Snowflake, CircleSlash, Search, Trash2, RefreshCw, Download,
} from "lucide-react";
import { supabase, type Member, type MemberStatus } from "@/lib/supabase";
import { dateShort } from "@/lib/format";

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
        <div className="flex gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-line/15 px-4 py-2 text-sm text-foreground hover:bg-line/5">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-brand-green-dark">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

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
                      <p className="font-medium text-foreground">{m.full_name}</p>
                      <p className="text-xs text-subtle">{m.member_code}</p>
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
    </div>
  );
}
