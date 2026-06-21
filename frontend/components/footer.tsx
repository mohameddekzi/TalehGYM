import Link from "next/link";
import { Logo } from "./logo";
import { contact, navLinks } from "@/lib/content";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-ink-900/60">
      <div className="container-px grid gap-12 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
            Premium fitness clubs and a complete management platform — built to
            help members, coaches and operators win together.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Platform</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
            <li><Link href="/login" className="hover:text-white">Member Portal</Link></li>
            <li><Link href="/login" className="hover:text-white">Coach Portal</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">Admin Dashboard</Link></li>
            <li><Link href="/register" className="hover:text-white">Online Registration</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-sm text-zinc-400">
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="text-brand-orange" /> {contact.phone}
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="text-brand-green" /> {contact.email}
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-0.5 text-brand-blue" /> {contact.hq}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container-px flex flex-col items-center justify-between gap-3 py-5 text-xs text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Taleh GYM. All rights reserved.</p>
          <p>Fitness &amp; Wellness Management System</p>
        </div>
      </div>
    </footer>
  );
}
