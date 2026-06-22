"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Dumbbell } from "lucide-react";
import { Logo } from "@/components/logo";
import { supabase, type PortalRole, type PortalUser } from "@/lib/supabase";

export default function PortalLoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<PortalRole>("member");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { data } = await supabase
      .from("portal_users")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .eq("passcode", pass)
      .eq("role", tab)
      .maybeSingle();
    setBusy(false);
    if (!data) {
      setErr(`Invalid ${tab} email or passcode.`);
      return;
    }
    const u = data as PortalUser;
    sessionStorage.setItem("taleh_portal", JSON.stringify({ name: u.name, role: u.role, email: u.email }));
    router.push(u.role === "coach" ? "/coach" : "/dashboard");
  }

  const demo = tab === "coach"
    ? "ayaan@taleh.gym · coach123"
    : "fadumo@taleh.gym · member123";

  return (
    <section className="container-px flex min-h-[80vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Member &amp; Coach Portal</h1>
          <p className="mt-1 text-sm text-muted">Sign in to your personal Taleh GYM portal.</p>

          {/* Role tabs */}
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-line/10 bg-surface-2 p-1">
            {([
              { r: "member" as const, label: "Member", icon: User },
              { r: "coach" as const, label: "Coach", icon: Dumbbell },
            ]).map((t) => (
              <button
                key={t.r}
                onClick={() => { setTab(t.r); setErr(null); }}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  tab === t.r ? "bg-brand-orange text-white" : "text-muted hover:text-foreground"
                }`}
              >
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@taleh.gym"
                className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-muted">Passcode</label>
                <Link href="#" className="text-xs text-brand-orange hover:underline">Forgot?</Link>
              </div>
              <input
                type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••"
                className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none" />
            </div>
            {err ? <p className="text-xs text-red-400">{err}</p> : null}
            <button disabled={busy} className="w-full rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark disabled:opacity-60">
              {busy ? "Signing in…" : `Sign in as ${tab}`}
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-line/10 bg-surface-2 p-3 text-[11px] text-subtle">
            <span className="font-semibold text-muted">Demo {tab}:</span> {demo}
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            New to Taleh GYM?{" "}
            <Link href="/register" className="font-medium text-brand-green hover:underline">Join now</Link>
          </p>
          <p className="mt-2 text-center text-[11px] text-subtle">
            Staff &amp; admin? <Link href="/admin" className="text-brand-orange hover:underline">System login</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
