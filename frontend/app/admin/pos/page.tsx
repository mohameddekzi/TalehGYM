"use client";

import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Check } from "lucide-react";
import { supabase, type Product, type SaleItem } from "@/lib/supabase";
import { money } from "@/lib/format";

const METHODS = ["Cash", "EVC Plus", "E-Dahab", "Zaad", "Card"];

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [method, setMethod] = useState(METHODS[0]);
  const [done, setDone] = useState(false);
  const [cat, setCat] = useState("All");

  async function load() {
    const { data } = await supabase.from("products").select("*").gt("stock", 0).order("name");
    setProducts((data as Product[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  const cats = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const shown = cat === "All" ? products : products.filter((p) => p.category === cat);

  function addToCart(p: Product) {
    setCart((c) => {
      const ex = c.find((i) => i.id === p.id);
      if (ex) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { id: p.id, name: p.name, price: Number(p.price), qty: 1 }];
    });
  }
  function setQty(id: string, delta: number) {
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)));
  }
  function removeItem(id: string) { setCart((c) => c.filter((i) => i.id !== id)); }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  async function checkout() {
    if (cart.length === 0) return;
    await supabase.from("sales").insert({ items: cart, total, method, cashier: "Reception" });
    // decrement stock
    for (const i of cart) {
      const p = products.find((x) => x.id === i.id);
      if (p) await supabase.from("products").update({ stock: Math.max(0, p.stock - i.qty) }).eq("id", p.id);
    }
    setDone(true);
    setCart([]);
    load();
    setTimeout(() => setDone(false), 2500);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Point of Sale</h1>
      <p className="mt-1 text-sm text-muted">Sell supplements, drinks and merchandise.</p>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Products */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap gap-1.5">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${cat === c ? "bg-brand-orange text-white" : "border border-line/15 text-muted hover:text-foreground"}`}>{c}</button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((p) => (
              <button key={p.id} onClick={() => addToCart(p)} className="card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-orange/40">
                <p className="text-xs text-subtle">{p.category}</p>
                <p className="mt-1 font-medium text-foreground">{p.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-lg font-bold text-brand-orange">{money(p.price)}</span>
                  <span className="text-xs text-subtle">{p.stock} left</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="card flex h-fit flex-col p-6">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-brand-orange" />
            <h3 className="font-display text-base font-bold text-foreground">Cart</h3>
          </div>

          {done ? (
            <div className="mt-6 flex flex-col items-center py-6 text-center">
              <Check size={40} className="text-brand-green" />
              <p className="mt-2 text-sm font-medium text-foreground">Sale completed</p>
            </div>
          ) : cart.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No items yet — tap a product.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {cart.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground">{i.name}</p>
                    <p className="text-xs text-subtle">{money(i.price)} × {i.qty}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setQty(i.id, -1)} className="grid h-7 w-7 place-items-center rounded-lg border border-line/10 text-muted"><Minus size={13} /></button>
                    <span className="w-5 text-center text-foreground">{i.qty}</span>
                    <button onClick={() => setQty(i.id, 1)} className="grid h-7 w-7 place-items-center rounded-lg border border-line/10 text-muted"><Plus size={13} /></button>
                    <button onClick={() => removeItem(i.id)} className="grid h-7 w-7 place-items-center rounded-lg text-red-400"><Trash2 size={13} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 border-t border-line/10 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Total</span>
              <span className="font-display text-2xl font-extrabold text-foreground">{money(total)}</span>
            </div>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-3 w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:outline-none">
              {METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
            <button onClick={checkout} disabled={cart.length === 0} className="mt-3 w-full rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark disabled:opacity-50">
              Charge {money(total)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
