import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { branches } from "@/lib/content";
import { MapPin, Clock, Phone, Star } from "lucide-react";

export const metadata: Metadata = { title: "Branches" };

export default function BranchesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Branches"
        title={<>Find your <span className="text-gradient">Taleh GYM</span></>}
        subtitle="Two premium branches in Mogadishu. Pro and Elite members train at either location."
      />

      <section className="container-px py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((b) => (
            <div key={b.name} className="card p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
                  {b.city}
                </span>
                {b.flagship ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-2.5 py-1 text-[11px] font-semibold text-brand-green">
                    <Star size={11} fill="currentColor" /> Flagship
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-foreground">{b.name}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-muted">
                <li className="flex items-start gap-2.5">
                  <MapPin size={15} className="mt-0.5 text-brand-blue" /> {b.address}
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock size={15} className="text-brand-green" /> {b.hours}
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone size={15} className="text-brand-orange" /> {b.phone}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
