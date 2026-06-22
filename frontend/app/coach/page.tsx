"use client";

import { useEffect, useState } from "react";
import { Users, ClipboardList, Salad, MessageSquare, Dumbbell } from "lucide-react";
import { supabase, type Member } from "@/lib/supabase";
import { PortalGate, getPortalSession } from "@/components/portal-gate";

export default function CoachPage() {
  return (
    <PortalGate role="coach">
      <CoachDashboard />
    </PortalGate>
  );
}

function CoachDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Coach");

  useEffect(() => {
    setName(getPortalSession()?.name ?? "Coach");
    (async () => {
      const { data } = await supabase
        .from("members").select("*").eq("status", "active").order("created_at", { ascending: false });
      setMembers((data as Member[]) ?? []);
      setLoading(false);
    })();
  }, []);

  // Demo: this coach is assigned the active members
  const assigned = members;

  const kpis = [
    { label: "Assigned members", value: assigned.length, icon: Users, a: "text-brand-orange" },
    { label: "Workout plans", value: assigned.length, icon: ClipboardList, a: "text-brand-green" },
    { label: "Diet plans", value: Math.max(0, assigned.length - 1), icon: Salad, a: "text-brand-blue" },
    { label: "Unread messages", value: 3, icon: MessageSquare, a: "text-brand-orange" },
  ];

  return (
    <section className="container-px py-12">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-orange text-white">
          <Dumbbell size={22} />
        </div>
        <div>
          <p className="text-sm text-subtle">Coach portal</p>
          <h1 className="font-display text-3xl font-extrabold text-foreground">Welcome, {name}</h1>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <k.icon size={20} className={k.a} />
            <p className="mt-3 font-display text-2xl font-extrabold text-foreground">{loading ? "—" : k.value}</p>
            <p className="text-xs text-subtle">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Assigned members */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="border-b border-line/10 px-6 py-4">
            <h3 className="font-display text-base font-bold text-foreground">My members</h3>
          </div>
          {loading ? (
            <p className="p-8 text-center text-sm text-muted">Loading…</p>
          ) : assigned.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted">No members assigned yet.</p>
          ) : (
            <ul className="divide-y divide-line/5">
              {assigned.map((m) => (
                <li key={m.id} className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-line/10 text-sm font-bold text-foreground">
                      {m.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.full_name}</p>
                      <p className="text-xs text-subtle">{m.plan} · {m.goal ?? "General Fitness"}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="rounded-lg border border-line/10 px-3 py-1.5 text-xs text-muted hover:bg-line/5">Workout</button>
                    <button className="rounded-lg border border-line/10 px-3 py-1.5 text-xs text-muted hover:bg-line/5">Diet</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tools */}
        <div className="space-y-5">
          <div className="card p-6">
            <ClipboardList size={20} className="text-brand-green" />
            <h3 className="mt-3 font-display text-base font-bold text-foreground">Plan builder</h3>
            <p className="mt-1 text-sm text-muted">Create personalized workout and diet plans for your members.</p>
            <button className="mt-4 w-full rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark">
              New plan
            </button>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-brand-blue" />
              <h3 className="font-display text-base font-bold text-foreground">Messages</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>“Coach, can we move tomorrow’s session?” — Fadumo</li>
              <li>“My knee feels better 💪” — Omar</li>
              <li>“Sent my progress photos” — Sahra</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
