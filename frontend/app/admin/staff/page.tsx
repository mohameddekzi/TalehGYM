"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ShieldCheck, Wallet, UserCog } from "lucide-react";
import { supabase, type StaffUser, type Role } from "@/lib/supabase";

const roleMeta: Record<Role, { label: string; icon: typeof ShieldCheck; color: string; access: string }> = {
  admin: { label: "Super Admin", icon: ShieldCheck, color: "text-brand-orange", access: "Full access to every module" },
  accountant: { label: "Accountant", icon: Wallet, color: "text-brand-green", access: "Members, membership types, finance, branches" },
  staff: { label: "Staff Member", icon: UserCog, color: "text-brand-blue", access: "Members, attendance, schedule, events, groups, coaches" },
};

export default function StaffPage() {
  const [items, setItems] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("staff_users").select("*").order("created_at", { ascending: true });
    setItems((data as StaffUser[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!name.trim() || !email.trim() || !passcode.trim()) { setErr("All fields are required."); return; }
    const { data, error } = await supabase.from("staff_users")
      .insert({ name: name.trim(), email: email.trim().toLowerCase(), passcode: passcode.trim(), role })
      .select("*").single();
    if (error) { setErr(error.message.includes("duplicate") ? "That email already exists." : error.message); return; }
    if (data) setItems((x) => [...x, data as StaffUser]);
    setName(""); setEmail(""); setPasscode(""); setRole("staff");
  }

  async function remove(id: string) {
    if (!confirm("Remove this staff account?")) return;
    setItems((x) => x.filter((i) => i.id !== id));
    await supabase.from("staff_users").delete().eq("id", id);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Staff &amp; Access</h1>
      <p className="mt-1 text-sm text-muted">Create system accounts and control what each role can access.</p>

      {/* Access matrix */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {(Object.keys(roleMeta) as Role[]).map((r) => {
          const m = roleMeta[r];
          return (
            <div key={r} className="card p-5">
              <m.icon size={22} className={m.color} />
              <h3 className="mt-3 font-display text-base font-bold text-foreground">{m.label}</h3>
              <p className="mt-1 text-xs text-muted">{m.access}</p>
              <p className="mt-3 text-xs text-subtle">{items.filter((i) => i.role === r).length} account(s)</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Add form */}
        <form onSubmit={add} className="card h-fit p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
            <Plus size={16} className="text-brand-orange" /> New account
          </h3>
          <div className="mt-4 space-y-3">
            <Input label="Full name" value={name} onChange={setName} placeholder="e.g. Amina Warsame" />
            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="name@taleh.gym" />
            <Input label="Passcode" value={passcode} onChange={setPasscode} placeholder="Set a passcode" />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Role &amp; access</label>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:border-brand-orange/60 focus:outline-none">
                <option value="admin">Super Admin — full access</option>
                <option value="accountant">Accountant — finance</option>
                <option value="staff">Staff Member — front desk</option>
              </select>
            </div>
            {err ? <p className="text-xs text-red-400">{err}</p> : null}
            <button className="w-full rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark">
              Create account
            </button>
          </div>
        </form>

        {/* List */}
        <div className="card overflow-hidden lg:col-span-2">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line/10 text-xs uppercase tracking-wide text-subtle">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((u) => {
                    const m = roleMeta[u.role];
                    return (
                      <tr key={u.id} className="border-b border-line/5 last:border-0 hover:bg-line/[0.03]">
                        <td className="px-5 py-3 font-medium text-foreground">{u.name}</td>
                        <td className="px-5 py-3 text-muted">{u.email}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${m.color}`}>
                            <m.icon size={13} /> {m.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => remove(u.id)} aria-label="Remove"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-line/10 text-red-400 hover:bg-red-500/10">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
