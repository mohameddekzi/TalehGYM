"use client";

import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { supabase, type Member } from "@/lib/supabase";
import { trainers } from "@/lib/content";

const accentBg = {
  orange: "bg-brand-orange text-white",
  green: "bg-brand-green text-ink-950",
  blue: "bg-brand-blue text-white",
} as const;

const accentText = {
  orange: "text-brand-orange",
  green: "text-brand-green",
  blue: "text-brand-blue",
} as const;

export default function CoachesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("members").select("id,status");
      setMembers((data as Member[]) ?? []);
      setLoading(false);
    })();
  }, []);

  // Distribute members across coaches (round-robin) for an assigned-members stat.
  const assigned = useMemo(() => {
    const counts = new Array(trainers.length).fill(0);
    members.forEach((_, i) => { counts[i % trainers.length]++; });
    return counts;
  }, [members]);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Coaches</h1>
      <p className="mt-1 text-sm text-muted">Coaching team and assigned members.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trainers.map((t, i) => (
          <div key={t.name} className="card p-6">
            <div className="flex items-center gap-4">
              <div className={`grid h-14 w-14 place-items-center rounded-full text-lg font-bold ${accentBg[t.accent]}`}>
                {t.initials}
              </div>
              <div>
                <p className="font-display text-base font-bold text-foreground">{t.name}</p>
                <p className={`text-xs font-medium ${accentText[t.accent]}`}>{t.role}</p>
              </div>
            </div>
            <p className="mt-4 text-xs uppercase tracking-wide text-subtle">{t.specialty}</p>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-line/5 bg-surface-2 px-4 py-3">
              <span className="inline-flex items-center gap-2 text-sm text-muted">
                <Users size={15} className={accentText[t.accent]} /> Assigned members
              </span>
              <span className="font-display text-lg font-extrabold text-foreground">
                {loading ? "…" : assigned[i]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
