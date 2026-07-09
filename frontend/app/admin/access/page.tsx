"use client";

import { useEffect, useMemo, useState } from "react";
import { Fingerprint, DoorOpen, DoorClosed, Search, ShieldCheck, Copy, Download, Check } from "lucide-react";
import { supabase, type Member, type Payment } from "@/lib/supabase";
import { decideAccess, type AccessDecision } from "@/lib/access";

// Ready-to-run Node.js bridge (concatenation only, no template literals)
const BRIDGE_CODE = [
  '// Taleh GYM — ZKTeco door bridge (Node.js). npm i node-zklib && node bridge.js',
  'const ZKLib = require("node-zklib");',
  'const API = process.env.API_BASE || "https://taleh-gym.vercel.app";',
  'const KEY = process.env.ACCESS_API_KEY || "taleh-zkt-2026";',
  '',
  '(async () => {',
  '  const zk = new ZKLib(process.env.ZK_IP || "192.168.1.201", 4370, 10000, 4000);',
  '  await zk.createSocket();',
  '  console.log("Connected to ZKTeco terminal");',
  '',
  '  // Open the door in real time when a paid member scans',
  '  await zk.getRealTimeLogs(async (log) => {',
  '    const code = String(log.deviceUserId || log.userId || "").trim();',
  '    if (!code) return;',
  '    const r = await fetch(API + "/api/access/scan?key=" + KEY, {',
  '      method: "POST",',
  '      headers: { "Content-Type": "application/json" },',
  '      body: JSON.stringify({ code }),',
  '    });',
  '    const d = await r.json();',
  '    if (d.open) {',
  '      console.log("OPEN  " + d.name + " (" + d.days_left + " days left)");',
  '      if (typeof zk.unlock === "function") await zk.unlock(3); // open 3s',
  '    } else {',
  '      console.log("DENY  " + (d.name || code) + " — " + d.reason);',
  '    }',
  '  });',
  '})().catch((e) => { console.error(e); process.exit(1); });',
].join("\n");

type Row = Member & { decision: AccessDecision };

export default function AccessControlPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "allowed" | "blocked">("all");
  const [copied, setCopied] = useState(false);

  function copyBridge() {
    navigator.clipboard?.writeText(BRIDGE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  function downloadBridge() {
    const url = URL.createObjectURL(new Blob([BRIDGE_CODE], { type: "text/javascript" }));
    const a = document.createElement("a");
    a.href = url; a.download = "zkteco-bridge.js"; a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    (async () => {
      const [m, p] = await Promise.all([
        supabase.from("members").select("*").order("full_name"),
        supabase.from("payments").select("*"),
      ]);
      const members = (m.data as Member[]) ?? [];
      const pays = (p.data as Payment[]) ?? [];
      setRows(members.map((mem) => ({ ...mem, decision: decideAccess(mem, pays.filter((x) => x.member_id === mem.id)) })));
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => ({
    allowed: rows.filter((r) => r.decision.allowed).length,
    blocked: rows.filter((r) => !r.decision.allowed).length,
  }), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "allowed" && !r.decision.allowed) return false;
      if (filter === "blocked" && r.decision.allowed) return false;
      if (!q) return true;
      return [r.full_name, r.member_code, r.phone].filter(Boolean).some((v) => v!.toLowerCase().includes(q));
    });
  }, [rows, query, filter]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-orange/10">
          <Fingerprint size={22} className="text-brand-orange" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">Access Control</h1>
          <p className="mt-0.5 text-sm text-muted">Door entry by monthly subscription — synced to the ZKTeco fingerprint terminal.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><DoorOpen size={20} className="text-brand-green" /><p className="mt-3 font-display text-3xl font-extrabold text-foreground">{stats.allowed}</p><p className="text-xs text-subtle">Allowed in</p></div>
        <div className="card p-5"><DoorClosed size={20} className="text-red-400" /><p className="mt-3 font-display text-3xl font-extrabold text-foreground">{stats.blocked}</p><p className="text-xs text-subtle">Blocked (unpaid/inactive)</p></div>
        <div className="card p-5"><ShieldCheck size={20} className="text-brand-blue" /><p className="mt-3 font-display text-3xl font-extrabold text-foreground">{rows.length}</p><p className="text-xs text-subtle">Enrolled members</p></div>
      </div>

      {/* ZKTeco integration card */}
      <div className="card mt-5 p-6">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground"><Fingerprint size={16} className="text-brand-orange" /> ZKTeco terminal API</h3>
        <p className="mt-1 text-sm text-muted">Point your device bridge at these endpoints (auth via <code className="text-brand-orange">?key=</code> or <code className="text-brand-orange">x-api-key</code>).</p>
        <div className="mt-4 space-y-2 overflow-x-auto rounded-xl border border-line/10 bg-surface-2 p-4 font-mono text-xs text-muted">
          <p><span className="text-brand-green">POST</span> /api/access/scan  <span className="text-subtle">{'{ "code": "TG-2026-1001" }'}</span> → opens the door if paid</p>
          <p><span className="text-brand-blue">GET</span>  /api/access/check?code=TG-2026-1001 → single decision</p>
          <p><span className="text-brand-blue">GET</span>  /api/access/list → all allowed member codes (device sync)</p>
        </div>
      </div>

      {/* Node.js bridge */}
      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/10 px-6 py-4">
          <div>
            <h3 className="font-display text-base font-bold text-foreground">Node.js door bridge</h3>
            <p className="text-xs text-muted">Run this on a PC/Raspberry Pi on the door&apos;s network to open it for paid members.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyBridge} className="inline-flex items-center gap-2 rounded-full border border-line/15 px-4 py-2 text-sm text-foreground hover:bg-line/5">
              {copied ? <Check size={15} className="text-brand-green" /> : <Copy size={15} />} {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={downloadBridge} className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-brand-orange-dark">
              <Download size={15} /> Download .js
            </button>
          </div>
        </div>
        <pre className="max-h-72 overflow-auto bg-surface-2 p-5 text-xs leading-relaxed text-muted"><code>{BRIDGE_CODE}</code></pre>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search member, ID, phone…"
            className="w-full rounded-full border border-line/10 bg-surface-2 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none" />
        </div>
        <div className="flex gap-1.5">
          {(["all", "allowed", "blocked"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-2 text-sm font-medium capitalize transition-colors ${filter === f ? "bg-brand-orange text-white" : "border border-line/15 text-muted hover:text-foreground"}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card mt-5 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-muted">Loading access list…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No members.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-subtle">
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Access</th>
                  <th className="px-5 py-3 font-medium">Reason</th>
                  <th className="px-5 py-3 font-medium">Paid until</th>
                  <th className="px-5 py-3 font-medium">Days left</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-line/5 last:border-0 hover:bg-line/[0.03]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar member={r} />
                        <div>
                          <p className="font-medium text-foreground">{r.full_name}</p>
                          <p className="text-xs text-subtle">{r.member_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {r.decision.allowed ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 px-2.5 py-1 text-xs font-semibold text-brand-green"><DoorOpen size={13} /> Allowed</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400"><DoorClosed size={13} /> Blocked</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted">{r.decision.reason}</td>
                    <td className="px-5 py-3 text-muted">{r.decision.paid_until ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={r.decision.days_left != null && r.decision.days_left < 0 ? "text-red-400" : r.decision.days_left != null && r.decision.days_left <= 3 ? "text-brand-orange" : "text-muted"}>
                        {r.decision.days_left ?? "—"}
                      </span>
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

function Avatar({ member }: { member: Member }) {
  if (member.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={member.photo} alt={member.full_name} className="h-9 w-9 rounded-full object-cover" />;
  }
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-line/10 text-xs font-bold text-foreground">
      {member.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
    </span>
  );
}
