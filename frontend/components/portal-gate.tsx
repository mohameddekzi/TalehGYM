"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import type { PortalRole } from "@/lib/supabase";

export type PortalSession = { name: string; role: PortalRole; email: string };

export function getPortalSession(): PortalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("taleh_portal");
    return raw ? (JSON.parse(raw) as PortalSession) : null;
  } catch {
    return null;
  }
}

/**
 * Gates a portal page to a given role. Members and coaches sign in at /login;
 * if the session is missing or the role doesn't match, a prompt is shown.
 */
export function PortalGate({
  role,
  children,
}: {
  role: PortalRole;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<PortalSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getPortalSession());
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!session || session.role !== role) {
    return (
      <section className="container-px flex min-h-[70vh] items-center justify-center py-16">
        <div className="card w-full max-w-sm p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-orange/10">
            <Lock className="text-brand-orange" size={22} />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-foreground">
            {role === "coach" ? "Coach sign-in required" : "Member sign-in required"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Please sign in to your {role} portal to continue.
          </p>
          <Link href="/login" className="mt-6 inline-block rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white hover:bg-brand-orange-dark">
            Go to portal login
          </Link>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
