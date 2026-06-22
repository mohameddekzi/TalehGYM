"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GymEvent } from "@/lib/supabase";

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar({ events }: { events: GymEvent[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsFor = (day: number) =>
    events.filter((e) => {
      const d = new Date(e.event_date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line/15 text-foreground hover:bg-line/5" aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line/15 text-foreground hover:bg-line/5" aria-label="Next month">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="ml-1 rounded-lg border border-line/15 px-3 py-1.5 text-sm text-muted hover:bg-line/5">
            today
          </button>
        </div>
        <h3 className="font-display text-xl font-bold text-foreground">
          {cursor.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="w-[120px]" />
      </div>

      <div className="mt-5 grid grid-cols-7 border-l border-t border-line/10 text-sm">
        {WEEK.map((w) => (
          <div key={w} className="border-b border-r border-line/10 bg-surface-2 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-subtle">
            {w}
          </div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className={`min-h-[92px] border-b border-r border-line/10 p-1.5 ${day && isToday(day) ? "bg-brand-orange/5" : ""}`}>
            {day ? (
              <>
                <span className={`block text-right text-xs ${isToday(day) ? "font-bold text-brand-orange" : "text-subtle"}`}>{day}</span>
                <div className="mt-1 space-y-1">
                  {eventsFor(day).map((e) => (
                    <div key={e.id} className="truncate rounded px-1.5 py-0.5 text-[11px] font-medium text-white"
                      style={{ backgroundColor: e.color }} title={`${e.start_time ?? ""} ${e.title}`}>
                      {e.start_time ? <span className="opacity-80">{e.start_time.replace(":00", "")} </span> : null}{e.title}
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
