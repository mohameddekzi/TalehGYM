import type { Metadata } from "next";
import {
  QrCode, Flame, CalendarCheck, TrendingDown, Dumbbell, Salad,
  Bell, CreditCard, ChevronRight,
} from "lucide-react";

export const metadata: Metadata = { title: "Member Dashboard" };

const weeklyVisits = [3, 4, 5, 4, 6, 5, 5];
const weightTrend = [82, 81.4, 80.9, 80.1, 79.6, 79.0, 78.2];

export default function DashboardPage() {
  const maxW = Math.max(...weightTrend);
  const minW = Math.min(...weightTrend);

  return (
    <section className="container-px py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Member portal · Preview</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-white">
            Good morning, Fadumo
          </h1>
          <p className="mt-1 text-sm text-brand-green">Pro membership · Hodan branch · Active</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-brand-green" /> Membership renews in 18 days
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-5 lg:col-span-2">
          {/* KPI row */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Flame, label: "Current streak", value: "23 days", a: "text-brand-orange" },
              { icon: CalendarCheck, label: "Visits this week", value: "5 / 6", a: "text-brand-green" },
              { icon: TrendingDown, label: "Weight change", value: "-3.8 kg", a: "text-brand-blue" },
            ].map((k) => (
              <div key={k.label} className="card p-5">
                <k.icon size={20} className={k.a} />
                <p className="mt-3 font-display text-2xl font-extrabold text-white">{k.value}</p>
                <p className="text-xs text-zinc-500">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Attendance */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-white">Weekly attendance</h3>
              <span className="text-xs text-zinc-500">Last 7 weeks</span>
            </div>
            <div className="mt-6 flex items-end justify-between gap-3">
              {weeklyVisits.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-brand-gradient"
                    style={{ height: `${(v / 6) * 110}px` }}
                  />
                  <span className="text-[11px] text-zinc-500">W{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-white">Weight progress</h3>
              <span className="text-xs text-brand-green">On track</span>
            </div>
            <div className="mt-6 flex h-32 items-end gap-2">
              {weightTrend.map((w, i) => {
                const pct = ((w - minW) / (maxW - minW || 1)) * 80 + 18;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-[10px] text-zinc-500">{w}</span>
                    <div className="w-full rounded-t bg-brand-blue/70" style={{ height: `${pct}px` }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's plan */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-6">
              <Dumbbell size={20} className="text-brand-orange" />
              <h3 className="mt-3 font-display text-base font-bold text-white">Today&apos;s workout</h3>
              <p className="mt-1 text-sm text-zinc-400">Upper body · Push</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                <li className="flex justify-between"><span>Bench press</span><span className="text-zinc-500">4 × 8</span></li>
                <li className="flex justify-between"><span>Overhead press</span><span className="text-zinc-500">3 × 10</span></li>
                <li className="flex justify-between"><span>Incline DB press</span><span className="text-zinc-500">3 × 12</span></li>
                <li className="flex justify-between"><span>Cable fly</span><span className="text-zinc-500">3 × 15</span></li>
              </ul>
            </div>
            <div className="card p-6">
              <Salad size={20} className="text-brand-green" />
              <h3 className="mt-3 font-display text-base font-bold text-white">Nutrition today</h3>
              <p className="mt-1 text-sm text-zinc-400">Target 1,850 kcal · 150g protein</p>
              <div className="mt-4 space-y-3">
                <Macro label="Calories" value="1,240 / 1,850" pct={67} color="bg-brand-orange" />
                <Macro label="Protein" value="98 / 150 g" pct={65} color="bg-brand-green" />
                <Macro label="Water" value="1.8 / 3.0 L" pct={60} color="bg-brand-blue" />
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* QR card */}
          <div className="card overflow-hidden">
            <div className="bg-brand-gradient p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                Digital Membership
              </p>
              <p className="mt-1 font-display text-xl font-bold text-white">Fadumo Ahmed</p>
              <p className="text-sm text-white/90">ID · TG-2024-04127</p>
            </div>
            <div className="grid place-items-center p-6">
              <div className="grid h-40 w-40 place-items-center rounded-2xl bg-white p-3">
                <QrCode size={130} className="text-ink-950" />
              </div>
              <p className="mt-3 text-xs text-zinc-500">Scan at any branch to check in</p>
            </div>
          </div>

          {/* Notifications */}
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-brand-orange" />
              <h3 className="font-display text-base font-bold text-white">Notifications</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { t: "Coach Lena added a new meal plan", c: "text-brand-green" },
                { t: "Membership renews in 18 days", c: "text-brand-orange" },
                { t: "Power Spin booked · Tomorrow 6:00 AM", c: "text-brand-blue" },
              ].map((n) => (
                <li key={n.t} className="flex items-start gap-2.5 text-zinc-300">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.c.replace("text-", "bg-")}`} />
                  {n.t}
                </li>
              ))}
            </ul>
          </div>

          {/* Payments */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-brand-blue" />
                <h3 className="font-display text-base font-bold text-white">Recent payments</h3>
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { d: "May · Pro membership", v: "$39", m: "EVC Plus" },
                { d: "Apr · Pro membership", v: "$39", m: "E-Dahab" },
                { d: "Mar · Personal training", v: "$60", m: "Cash" },
              ].map((p) => (
                <li key={p.d} className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-200">{p.d}</p>
                    <p className="text-xs text-zinc-500">{p.m}</p>
                  </div>
                  <span className="font-semibold text-white">{p.v}</span>
                </li>
              ))}
            </ul>
            <button className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-white/10 py-2.5 text-sm text-zinc-300 hover:bg-white/5">
              View all <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Macro({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-300">{value}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-700">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
