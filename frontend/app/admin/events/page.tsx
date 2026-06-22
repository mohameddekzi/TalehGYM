"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Ticket } from "lucide-react";
import { supabase, type GymEvent } from "@/lib/supabase";
import { dateShort } from "@/lib/format";

const COLORS = ["#1E2ED1", "#16C13A", "#F58220", "#EF4444", "#A855F7"];

export default function EventsPage() {
  const [items, setItems] = useState<GymEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("class");
  const [color, setColor] = useState(COLORS[0]);

  async function load() {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    setItems((data as GymEvent[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    const { data } = await supabase.from("events")
      .insert({ title: title.trim(), event_date: date, start_time: time || null, type, color })
      .select("*").single();
    if (data) setItems((x) => [...x, data as GymEvent].sort((a, b) => a.event_date.localeCompare(b.event_date)));
    setTitle(""); setDate(""); setTime("");
  }
  async function remove(id: string) {
    if (!confirm("Delete this event?")) return;
    setItems((x) => x.filter((i) => i.id !== id));
    await supabase.from("events").delete().eq("id", id);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Events & Classes</h1>
      <p className="mt-1 text-sm text-muted">Schedule events and classes — they appear on the dashboard calendar.</p>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <form onSubmit={add} className="card h-fit p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
            <Plus size={16} className="text-brand-orange" /> New event
          </h3>
          <div className="mt-4 space-y-3">
            <Input label="Title" value={title} onChange={setTitle} placeholder="e.g. Zumba Class" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date" value={date} onChange={setDate} type="date" />
              <Input label="Time" value={time} onChange={setTime} type="time" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:border-brand-orange/60 focus:outline-none">
                <option value="class">Class</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button type="button" key={c} onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-surface ${color === c ? "ring-foreground" : "ring-transparent"}`}
                    style={{ backgroundColor: c }} aria-label={c} />
                ))}
              </div>
            </div>
            <button className="w-full rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark">
              Add event
            </button>
          </div>
        </form>

        <div className="card overflow-hidden lg:col-span-2">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted">Loading…</p>
          ) : items.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted">No events yet.</p>
          ) : (
            <ul className="divide-y divide-line/5">
              {items.map((ev) => (
                <li key={ev.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ backgroundColor: ev.color }}>
                      <Ticket size={18} />
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{ev.title}</p>
                      <p className="text-xs text-subtle capitalize">
                        {ev.type} · {dateShort(ev.event_date)}{ev.start_time ? ` · ${ev.start_time}` : ""}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => remove(ev.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-red-400 hover:bg-red-500/10">
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none" />
    </div>
  );
}
