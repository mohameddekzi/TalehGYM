"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarCheck, Wallet, Building2,
  Dumbbell, Lock, ArrowLeft, Menu, X, BadgeCheck, Boxes, CalendarDays, Ticket,
  ShieldAlert,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase, type Role, type StaffUser } from "@/lib/supabase";

type NavItem = { href: string; label: string; icon: typeof Users; roles: Role[] };

const ALL: Role[] = ["admin", "accountant", "staff"];

const nav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ALL },
  { href: "/admin/members", label: "Members", icon: Users, roles: ["admin", "accountant", "staff"] },
  { href: "/admin/membership-types", label: "Membership Types", icon: BadgeCheck, roles: ["admin", "accountant"] },
  { href: "/admin/groups", label: "Groups", icon: Boxes, roles: ["admin", "staff"] },
  { href: "/admin/schedule", label: "Class Schedule", icon: CalendarDays, roles: ["admin", "staff"] },
  { href: "/admin/events", label: "Events", icon: Ticket, roles: ["admin", "staff"] },
  { href: "/admin/attendance", label: "Attendance", icon: CalendarCheck, roles: ["admin", "staff"] },
  { href: "/admin/finance", label: "Finance", icon: Wallet, roles: ["admin", "accountant"] },
  { href: "/admin/branches", label: "Branches", icon: Building2, roles: ["admin", "accountant"] },
  { href: "/admin/coaches", label: "Coaches", icon: Dumbbell, roles: ["admin", "staff"] },
];

const roleLabel: Record<Role, string> = {
  admin: "Super Admin",
  accountant: "Accountant",
  staff: "Staff Member",
};

type Session = { name: string; role: Role };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  // login form
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("taleh_session");
    if (raw) { try { setSession(JSON.parse(raw)); } catch {} }
    setReady(true);
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { data } = await supabase
      .from("staff_users")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .eq("passcode", pass)
      .maybeSingle();
    setBusy(false);
    if (!data) { setErr("Invalid email or passcode."); return; }
    const u = data as StaffUser;
    const s: Session = { name: u.name, role: u.role };
    sessionStorage.setItem("taleh_session", JSON.stringify(s));
    setSession(s);
  }

  function logout() {
    sessionStorage.removeItem("taleh_session");
    setSession(null);
    setEmail(""); setPass("");
  }

  if (!ready) return null;

  // ── Login ──────────────────────────────────────────────
  if (!session) {
    return (
      <section className="container-px flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center"><Logo /></div>
          <div className="card p-8">
            <h1 className="font-display text-xl font-bold text-foreground">System sign-in</h1>
            <p className="mt-1 text-sm text-muted">Admin · Accountant · Staff portal.</p>
            <form onSubmit={login} className="mt-5 space-y-3">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
                className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none" />
              <input
                type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Passcode"
                className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none" />
              {err ? <p className="text-xs text-red-400">{err}</p> : null}
              <button disabled={busy} className="w-full rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark disabled:opacity-60">
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <div className="mt-5 rounded-xl border border-line/10 bg-surface-2 p-3 text-[11px] leading-relaxed text-subtle">
              <p className="font-semibold text-muted">Demo accounts</p>
              <p>admin@taleh.gym · admin123</p>
              <p>finance@taleh.gym · finance123</p>
              <p>staff@taleh.gym · staff123</p>
            </div>
            <Link href="/" className="mt-4 inline-block text-[11px] text-subtle hover:text-foreground">← Back to website</Link>
          </div>
        </div>
      </section>
    );
  }

  const role = session.role;
  const allowed = nav.filter((n) => n.roles.includes(role));
  const current = nav.find((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)));
  const hasAccess = !current || current.roles.includes(role);

  const SidebarLinks = () => (
    <nav className="space-y-1">
      {allowed.map((n) => {
        const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-brand-orange/10 text-brand-orange" : "text-muted hover:bg-line/5 hover:text-foreground"
            }`}>
            <n.icon size={18} /> {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line/10 bg-surface/60 p-5 lg:flex">
        <Logo />
        <div className="mt-1 pl-11 text-[11px] font-semibold uppercase tracking-widest text-brand-orange">{roleLabel[role]}</div>
        <div className="mt-8 flex-1"><SidebarLinks /></div>
        <div className="space-y-1 border-t border-line/10 pt-4">
          <div className="px-3.5 pb-2">
            <p className="text-sm font-medium text-foreground">{session.name}</p>
            <p className="text-xs text-subtle">{roleLabel[role]}</p>
          </div>
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-muted hover:bg-line/5 hover:text-foreground">
            <ArrowLeft size={18} /> Back to site
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-muted hover:bg-line/5 hover:text-foreground">
            <Lock size={18} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line/10 bg-background/80 px-5 py-3 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen((v) => !v)} className="grid h-9 w-9 place-items-center rounded-lg border border-line/15 text-foreground lg:hidden" aria-label="Toggle menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="text-sm font-semibold text-foreground">Taleh GYM — Control Center</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-line/5 px-3 py-1 text-xs text-muted sm:block">{session.name} · {roleLabel[role]}</span>
            <ThemeToggle />
          </div>
        </div>

        {open ? (
          <div className="border-b border-line/10 bg-surface px-5 py-4 lg:hidden">
            <SidebarLinks />
            <div className="mt-3 border-t border-line/10 pt-3">
              <button onClick={logout} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-muted">
                <Lock size={18} /> Sign out
              </button>
            </div>
          </div>
        ) : null}

        <div className="px-5 py-8 lg:px-8">
          {hasAccess ? children : (
            <div className="card mx-auto mt-10 max-w-md p-10 text-center">
              <ShieldAlert size={48} className="mx-auto text-brand-orange" />
              <h2 className="mt-4 font-display text-xl font-bold text-foreground">No access</h2>
              <p className="mt-2 text-sm text-muted">
                Your role ({roleLabel[role]}) doesn&apos;t have access to this section.
              </p>
              <Link href="/admin" className="mt-6 inline-block rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white">
                Go to dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
