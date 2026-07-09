"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, AlertTriangle, DollarSign, Plus, Minus, Trash2, PackagePlus } from "lucide-react";
import { supabase, type Product } from "@/lib/supabase";
import { money } from "@/lib/format";

const CATS = ["Supplements", "Drinks", "Merchandise", "Gym Accessories", "Equipment"];

export default function InventoryPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [f, setF] = useState({ name: "", category: CATS[0], price: "", cost: "", stock: "", low_stock: "5", supplier: "" });

  async function load() {
    const { data } = await supabase.from("products").select("*").order("name");
    setItems((data as Product[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function adjust(p: Product, delta: number) {
    const stock = Math.max(0, p.stock + delta);
    setItems((x) => x.map((i) => (i.id === p.id ? { ...i, stock } : i)));
    await supabase.from("products").update({ stock }).eq("id", p.id);
  }
  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    setItems((x) => x.filter((i) => i.id !== id));
    await supabase.from("products").delete().eq("id", id);
  }
  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return;
    const { data } = await supabase.from("products").insert({
      name: f.name.trim(), category: f.category, price: Number(f.price) || 0, cost: Number(f.cost) || 0,
      stock: Number(f.stock) || 0, low_stock: Number(f.low_stock) || 5, supplier: f.supplier || null,
    }).select("*").single();
    if (data) setItems((x) => [...x, data as Product].sort((a, b) => a.name.localeCompare(b.name)));
    setF({ name: "", category: CATS[0], price: "", cost: "", stock: "", low_stock: "5", supplier: "" });
    setShowAdd(false);
  }

  const stats = useMemo(() => ({
    products: items.length,
    low: items.filter((p) => p.stock <= p.low_stock).length,
    value: items.reduce((s, p) => s + p.stock * Number(p.cost), 0),
  }), [items]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">Inventory</h1>
          <p className="mt-1 text-sm text-muted">Products, stock levels and suppliers.</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-brand-orange-dark">
          <PackagePlus size={15} /> {showAdd ? "Close" : "Add product"}
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><Boxes size={20} className="text-brand-orange" /><p className="mt-3 font-display text-3xl font-extrabold text-foreground">{stats.products}</p><p className="text-xs text-subtle">Products</p></div>
        <div className="card p-5"><AlertTriangle size={20} className="text-red-400" /><p className="mt-3 font-display text-3xl font-extrabold text-foreground">{stats.low}</p><p className="text-xs text-subtle">Low stock</p></div>
        <div className="card p-5"><DollarSign size={20} className="text-brand-green" /><p className="mt-3 font-display text-3xl font-extrabold text-foreground">{money(stats.value)}</p><p className="text-xs text-subtle">Stock value (cost)</p></div>
      </div>

      {showAdd ? (
        <form onSubmit={add} className="card mt-5 p-6">
          <h3 className="font-display text-base font-bold text-foreground">New product</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <In label="Name" v={f.name} on={(v) => setF({ ...f, name: v })} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Category</label>
              <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:outline-none">
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <In label="Price ($)" type="number" v={f.price} on={(v) => setF({ ...f, price: v })} />
            <In label="Cost ($)" type="number" v={f.cost} on={(v) => setF({ ...f, cost: v })} />
            <In label="Stock" type="number" v={f.stock} on={(v) => setF({ ...f, stock: v })} />
            <In label="Low-stock alert" type="number" v={f.low_stock} on={(v) => setF({ ...f, low_stock: v })} />
            <In label="Supplier" v={f.supplier} on={(v) => setF({ ...f, supplier: v })} />
          </div>
          <button className="mt-4 rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark">Add product</button>
        </form>
      ) : null}

      <div className="card mt-5 overflow-hidden">
        {loading ? <p className="p-8 text-center text-sm text-muted">Loading…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-subtle">
                  <th className="px-5 py-3 font-medium">Product</th><th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th><th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Supplier</th><th className="px-5 py-3 font-medium">Adjust</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-line/5 last:border-0 hover:bg-line/[0.03]">
                    <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-5 py-3 text-muted">{p.category}</td>
                    <td className="px-5 py-3 text-muted">{money(p.price)}</td>
                    <td className="px-5 py-3">
                      <span className={`font-semibold ${p.stock <= p.low_stock ? "text-red-400" : "text-foreground"}`}>{p.stock}</span>
                      {p.stock <= p.low_stock ? <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">LOW</span> : null}
                    </td>
                    <td className="px-5 py-3 text-muted">{p.supplier || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => adjust(p, 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-brand-green hover:bg-brand-green/10"><Plus size={14} /></button>
                        <button onClick={() => adjust(p, -1)} className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-brand-orange hover:bg-brand-orange/10"><Minus size={14} /></button>
                        <button onClick={() => remove(p.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-red-400 hover:bg-red-500/10"><Trash2 size={14} /></button>
                      </div>
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

function In({ label, v, on, type = "text" }: { label: string; v: string; on: (x: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      <input type={type} value={v} onChange={(e) => on(e.target.value)} className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:outline-none" />
    </div>
  );
}
