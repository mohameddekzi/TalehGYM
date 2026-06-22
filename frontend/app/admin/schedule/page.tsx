"use client";

import { useEffect, useState } from "react";
import { supabase, type GymEvent } from "@/lib/supabase";
import { Calendar } from "@/components/admin/calendar";
import { dateShort } from "@/lib/format";

export default function SchedulePage() {
  const [events, setEvents] = useState<GymEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
      setEvents((data as GymEvent[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const upcoming = events.filter((e) => new Date(e.event_date) >= new Date(new Date().toDateString()));

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Class Schedule</h1>
      <p className="mt-1 text-sm text-muted">All classes and events across the calendar.</p>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2"><Calendar events={events} /></div>
        <div className="card p-6">
          <h3 className="font-display text-base font-bold text-foreground">Upcoming</h3>
          {loading ? (
            <p className="mt-4 text-sm text-muted">Loading…</p>
          ) : upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Nothing scheduled ahead.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.map((e) => (
                <li key={e.id} className="flex items-center gap-3">
                  <span className="h-9 w-1.5 rounded-full" style={{ backgroundColor: e.color }} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.title}</p>
                    <p className="text-xs text-subtle capitalize">{e.type} · {dateShort(e.event_date)}{e.start_time ? ` · ${e.start_time}` : ""}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
