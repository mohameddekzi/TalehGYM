import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Member Login" };

export default function LoginPage() {
  return (
    <section className="container-px flex min-h-[80vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Sign in to your member, coach or admin portal.
          </p>

          <form className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email or phone</label>
              <input
                type="text"
                placeholder="you@email.com"
                className="w-full rounded-xl border border-white/10 bg-ink-850 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-brand-orange/60 focus:outline-none"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-300">Password</label>
                <Link href="#" className="text-xs text-brand-orange hover:underline">Forgot?</Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-ink-850 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-brand-orange/60 focus:outline-none"
              />
            </div>
            <Button href="/dashboard" className="w-full">Sign in</Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            New to Taleh GYM?{" "}
            <Link href="/register" className="font-medium text-brand-green hover:underline">
              Join now
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
