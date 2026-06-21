"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { navLinks } from "@/lib/content";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line/5 bg-background/80 backdrop-blur-xl">
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
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Button href="/login" variant="ghost" size="sm">
            Member Login
          </Button>
          <Button href="/register" size="sm">
            Join Now
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            className="grid h-10 w-10 place-items-center rounded-lg border border-line/15 text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-line/5 bg-background/95 lg:hidden">
          <div className="container-px flex flex-col py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-line/5 hover:text-foreground"
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
