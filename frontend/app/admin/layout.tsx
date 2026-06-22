"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarCheck, Wallet, Building2,
  Dumbbell, Lock, ArrowLeft, Menu, X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const ADMIN_PASSCODE = "taleh2026"; // demo gate — replace with Supabase Auth in production

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/admin/finance", label: "Finance", icon: Wallet },
  { href: "/admin/branches", label: "Branches", icon: Building2 },
  { href: "/admin/coaches", label: "Coaches", icon: Dumbbell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem("taleh_admin") === "1");
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!authed) {
    return (
      <section className="container-px flex min-h-screen items-center justify-center py-16">
        <div className="card w-full max-w-sm p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-orange/10">
            <Lock className="text-brand-orange" size={22} />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-foreground">Admin access</h1>
          <p className="mt-1 text-sm text-muted">Enter the management passcode.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pass === ADMIN_PASSCODE) {
                sessionStorage.setItem("taleh_admin", "1");
                setAuthed(true);
              } else setErr("Incorrect passcode.");
            }}
            className="mt-5 space-y-3"
          >
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Passcode"
              className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none"
            />
            {err ? <p className="text-xs text-red-400">{err}</p> : null}
            <button className="w-full rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark">
              Unlock
            </button>
          </form>
          <Link href="/" className="mt-4 inline-block text-[11px] text-subtle hover:text-foreground">
            ← Back to website
          </Link>
        </div>
      </section>
    );
  }

  const SidebarLinks = () => (
    <nav className="space-y-1">
      {nav.map((n) => {
        const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-brand-orange/10 text-brand-orange" : "text-muted hover:bg-line/5 hover:text-foreground"
            }`}
          >
            <n.icon size={18} /> {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line/10 bg-surface/60 p-5 lg:flex">
        <Logo />
        <p className="mt-1 pl-11 text-[11px] font-semibold uppercase tracking-widest text-subtle">Admin</p>
        <div className="mt-8 flex-1"><SidebarLinks /></div>
        <div className="space-y-1 border-t border-line/10 pt-4">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-muted hover:bg-line/5 hover:text-foreground">
            <ArrowLeft size={18} /> Back to site
          </Link>
          <button
            onClick={() => { sessionStorage.removeItem("taleh_admin"); setAuthed(false); }}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-muted hover:bg-line/5 hover:text-foreground"
          >
            <Lock size={18} /> Lock
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line/10 bg-background/80 px-5 py-3 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-line/15 text-foreground lg:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="text-sm font-semibold text-foreground">Taleh GYM — Control Center</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Mobile drawer */}
        {open ? (
          <div className="border-b border-line/10 bg-surface px-5 py-4 lg:hidden">
            <SidebarLinks />
            <div className="mt-3 border-t border-line/10 pt-3">
              <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-muted">
                <ArrowLeft size={18} /> Back to site
              </Link>
            </div>
          </div>
        ) : null}

        <div className="px-5 py-8 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
