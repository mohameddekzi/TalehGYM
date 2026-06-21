import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { trainers } from "@/lib/content";

export const metadata: Metadata = { title: "Trainers" };

const accentText = {
  orange: "text-brand-orange",
  green: "text-brand-green",
  blue: "text-brand-blue",
} as const;

const accentBg = {
  orange: "bg-brand-orange text-white",
  green: "bg-brand-green text-ink-950",
  blue: "bg-brand-blue text-white",
} as const;

export default function TrainersPage() {
  return (
    <>
      <PageHeader
        eyebrow="The team"
        title={<>Meet your <span className="text-gradient">coaches</span></>}
        subtitle="Certified, experienced and genuinely invested in your progress. Get matched with a coach when you join."
      />

      <section className="container-px py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trainers.map((t) => (
            <div key={t.name} className="card overflow-hidden">
              <div className="grid h-48 place-items-center bg-gradient-to-br from-surface-2 to-surface">
                <div className={`grid h-24 w-24 place-items-center rounded-full text-3xl font-bold ${accentBg[t.accent]}`}>
                  {t.initials}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-bold text-foreground">{t.name}</h3>
                <p className={`text-sm font-medium ${accentText[t.accent]}`}>{t.role}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-subtle">{t.specialty}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted">{t.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
