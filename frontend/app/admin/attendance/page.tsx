"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, CalendarDays, Clock, QrCode } from "lucide-react";
import { supabase, type Attendance } from "@/lib/supabase";
import { dateShort, timeShort } from "@/lib/format";

export default function AttendancePage() {
  const [rows, setRows] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("attendance").select("*").order("checked_in_at", { ascending: false }).limit(300);
      setRows((data as Attendance[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 864e5);

  const stats = useMemo(() => {
    const today = rows.filter((r) => new Date(r.checked_in_at) >= startOfDay).length;
    const week = rows.filter((r) => new Date(r.checked_in_at) >= weekAgo).length;
    const qr = rows.filter((r) => r.method === "QR").length;
    const qrRate = rows.length ? Math.round((qr / rows.length) * 100) : 0;
    return { today, week, qrRate, total: rows.length };
  }, [rows]);

  // Visits per day for the last 7 days
  const perDay = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const next = new Date(d.getTime() + 864e5);
      const count = rows.filter((r) => {
        const t = new Date(r.checked_in_at);
        return t >= d && t < next;
      }).length;
      days.push({ label: d.toLocaleDateString("en-US", { weekday: "short" }), count });
    }
    return days;
  }, [rows]);

  const maxDay = Math.max(1, ...perDay.map((d) => d.count));

  function duration(r: Attendance): string {
    if (!r.checked_out_at) return "—";
    const mins = Math.round((new Date(r.checked_out_at).getTime() - new Date(r.checked_in_at).getTime()) / 60000);
    return `${mins} min`;
  }

  const kpis = [
    { label: "Check-ins today", value: stats.today, icon: CalendarCheck, a: "text-brand-orange" },
    { label: "Check-ins · 7 days", value: stats.week, icon: CalendarDays, a: "text-brand-green" },
    { label: "QR check-in rate", value: `${stats.qrRate}%`, icon: QrCode, a: "text-brand-blue" },
    { label: "Records", value: stats.total, icon: Clock, a: "text-brand-orange" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Attendance</h1>
      <p className="mt-1 text-sm text-muted">QR and manual check-ins across all branches.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <k.icon size={20} className={k.a} />
            <p className="mt-3 font-display text-2xl font-extrabold text-foreground">{k.value}</p>
            <p className="text-xs text-subtle">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="card mt-5 p-6">
        <h3 className="font-display text-base font-bold text-foreground">Daily check-ins · last 7 days</h3>
        <div className="mt-6 flex h-40 items-end justify-between gap-3">
          {perDay.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[11px] text-subtle">{d.count}</span>
              <div className="w-full rounded-t-md bg-brand-gradient" style={{ height: `${(d.count / maxDay) * 120 + 4}px` }} />
              <span className="text-[11px] text-subtle">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-5 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-muted">Loading attendance…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-subtle">
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Branch</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">In / Out</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 60).map((r) => (
                  <tr key={r.id} className="border-b border-line/5 last:border-0 hover:bg-line/[0.03]">
                    <td className="px-5 py-3 font-medium text-foreground">{r.member_name}</td>
                    <td className="px-5 py-3 text-muted">{(r.branch || "—").replace("Taleh GYM — ", "")}</td>
                    <td className="px-5 py-3 text-muted">{dateShort(r.checked_in_at)}</td>
                    <td className="px-5 py-3 text-muted">
                      {timeShort(r.checked_in_at)} – {r.checked_out_at ? timeShort(r.checked_out_at) : "…"}
                    </td>
                    <td className="px-5 py-3 text-muted">{duration(r)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        r.method === "QR" ? "bg-brand-blue/10 text-brand-blue" : "bg-line/10 text-muted"
                      }`}>
                        {r.method}
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
