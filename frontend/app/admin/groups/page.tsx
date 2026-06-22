"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Boxes } from "lucide-react";
import { supabase, type Group } from "@/lib/supabase";

const COLORS = ["#F58220", "#16C13A", "#1E2ED1", "#EF4444", "#A855F7", "#F5B301"];

export default function GroupsPage() {
  const [items, setItems] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  async function load() {
    const { data } = await supabase.from("groups").select("*").order("created_at", { ascending: true });
    setItems((data as Group[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const { data } = await supabase.from("groups")
      .insert({ name: name.trim(), description: desc.trim() || null, color }).select("*").single();
    if (data) setItems((x) => [...x, data as Group]);
    setName(""); setDesc("");
  }
  async function remove(id: string) {
    if (!confirm("Delete this group?")) return;
    setItems((x) => x.filter((i) => i.id !== id));
    await supabase.from("groups").delete().eq("id", id);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Groups</h1>
      <p className="mt-1 text-sm text-muted">Training groups and programs members can join.</p>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <form onSubmit={add} className="card h-fit p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
            <Plus size={16} className="text-brand-orange" /> New group
          </h3>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CrossFit"
                className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Description</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Short description"
                className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none" />
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
              Add group
            </button>
          </div>
        </form>

        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((g) => (
                <div key={g.id} className="card p-5">
                  <div className="flex items-start justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ backgroundColor: g.color }}>
                      <Boxes size={20} />
                    </span>
                    <button onClick={() => remove(g.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-red-400 hover:bg-red-500/10">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <h4 className="mt-4 font-display text-lg font-bold text-foreground">{g.name}</h4>
                  <p className="mt-1 text-sm text-muted">{g.description || "—"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
