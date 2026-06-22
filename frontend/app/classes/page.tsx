import type { Metadata } from "next";
import Image from "next/image";
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
        title="Group energy, expert coaching"
        subtitle="From strength foundations to high-intensity conditioning, every class is led by a certified coach and bookable from the app."
      />

      <section className="container-px py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <article key={c.name} className="group overflow-hidden rounded-2xl border border-line/10 bg-surface">
              <div className="relative aspect-[3/2] overflow-hidden">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-ink-950/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {c.category}
                </span>
                <span className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-ink-950/70 px-2.5 py-1 text-xs font-semibold backdrop-blur ${intensityColor[c.intensity]}`}>
                  <Flame size={12} /> {c.intensity}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-bold text-foreground">{c.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.description}</p>
                <div className="mt-5 flex items-center gap-1.5 text-xs text-subtle">
                  <Clock size={14} /> {c.duration}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
