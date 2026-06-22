"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, BadgeCheck } from "lucide-react";
import { supabase, type MembershipType } from "@/lib/supabase";
import { money } from "@/lib/format";

const COLORS = ["#A855F7", "#F5B301", "#94A3B8", "#16C13A", "#1E2ED1", "#F58220", "#EF4444"];

export default function MembershipTypesPage() {
  const [items, setItems] = useState<MembershipType[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("30");
  const [color, setColor] = useState(COLORS[0]);

  async function load() {
    const { data } = await supabase.from("membership_types").select("*").order("price", { ascending: false });
    setItems((data as MembershipType[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const { data } = await supabase.from("membership_types")
      .insert({ name: name.trim(), price: Number(price) || 0, duration_days: Number(duration) || 30, color })
      .select("*").single();
    if (data) setItems((x) => [data as MembershipType, ...x]);
    setName(""); setPrice(""); setDuration("30");
  }
  async function remove(id: string) {
    if (!confirm("Delete this membership type?")) return;
    setItems((x) => x.filter((i) => i.id !== id));
    await supabase.from("membership_types").delete().eq("id", id);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Membership Types</h1>
      <p className="mt-1 text-sm text-muted">Define the plans members can subscribe to.</p>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Add form */}
        <form onSubmit={add} className="card h-fit p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
            <Plus size={16} className="text-brand-orange" /> New type
          </h3>
          <div className="mt-4 space-y-3">
            <Input label="Name" value={name} onChange={setName} placeholder="e.g. Diamond Membership" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Price ($)" value={price} onChange={setPrice} type="number" placeholder="49" />
              <Input label="Days" value={duration} onChange={setDuration} type="number" placeholder="30" />
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
              Add membership type
            </button>
          </div>
        </form>

        {/* List */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((t) => (
                <div key={t.id} className="card p-5">
                  <div className="flex items-start justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ backgroundColor: t.color }}>
                      <BadgeCheck size={20} />
                    </span>
                    <button onClick={() => remove(t.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-red-400 hover:bg-red-500/10">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <h4 className="mt-4 font-display text-lg font-bold text-foreground">{t.name}</h4>
                  <p className="mt-1 text-sm text-muted">{t.duration_days} days</p>
                  <p className="mt-2 font-display text-2xl font-extrabold text-foreground">{money(t.price)}</p>
                </div>
              ))}
            </div>
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
