import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { trainers } from "@/lib/content";

export const metadata: Metadata = { title: "Trainers" };

const accentText = {
  orange: "text-brand-orange",
  green: "text-brand-green",
  blue: "text-brand-blue",
} as const;

export default function TrainersPage() {
  return (
    <>
      <PageHeader
        eyebrow="The team"
        title="Meet your coaches"
        subtitle="Certified, experienced and genuinely invested in your progress. You'll be matched with a coach when you join."
      />

      <section className="container-px py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trainers.map((t) => (
            <article key={t.name} className="group overflow-hidden rounded-2xl border border-line/10 bg-surface">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={t.photo}
                  alt={t.name}
                  fill
                  sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-bold text-foreground">{t.name}</h3>
                <p className={`text-sm font-medium ${accentText[t.accent]}`}>{t.role}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-subtle">{t.specialty}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted">{t.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
