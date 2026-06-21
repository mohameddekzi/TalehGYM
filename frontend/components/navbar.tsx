"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { navLinks } from "@/lib/content";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <nav className="container-px flex h-16 items-center justify-between">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Button href="/login" variant="ghost" size="sm">
            Member Login
          </Button>
          <Button href="/register" size="sm">
            Join Now
          </Button>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-white/5 bg-ink-950/95 lg:hidden">
          <div className="container-px flex flex-col py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2">
              <Button href="/login" variant="outline" size="sm" className="flex-1">
                Login
              </Button>
              <Button href="/register" size="sm" className="flex-1">
                Join Now
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
