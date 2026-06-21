import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { classes } from "@/lib/content";
import { Clock, Flame } from "lucide-react";

export const metadata: Metadata = { title: "Classes & Programs" };

const intensityColor = {
  Low: "text-brand-green",
  Medium: "text-brand-orange",
  High: "text-brand-blue",
} as const;

export default function ClassesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Classes & Programs"
        title={<>Group energy, <span className="text-gradient">expert coaching</span></>}
        subtitle="From strength foundations to high-intensity conditioning, every class is led by a certified coach and bookable from the app."
      />

      <section className="container-px py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <div key={c.name} className="card p-6">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-line/10 bg-line/5 px-3 py-1 text-xs font-medium text-muted">
                  {c.category}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${intensityColor[c.intensity]}`}>
                  <Flame size={13} /> {c.intensity}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">{c.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.description}</p>
              <div className="mt-5 flex items-center gap-1.5 text-xs text-subtle">
                <Clock size={14} /> {c.duration}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
